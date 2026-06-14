import fs from "node:fs";
import path from "node:path";
import draco3d from "draco3d";

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, "public", "models", "base");
const OUT_DIR = path.join(ROOT, "public", "models", "base-draco");

const targets = process.argv.slice(2);
const files = (targets.length ? targets : fs.readdirSync(BASE_DIR))
  .filter((file) => file.endsWith(".glb") && file !== "polera-base.glb");

fs.mkdirSync(OUT_DIR, { recursive: true });

const encoderModule = await draco3d.createEncoderModule({});

function align4(n) {
  return n + ((4 - (n % 4)) % 4);
}

function paddedBuffer(buffer, padByte = 0) {
  const out = Buffer.alloc(align4(buffer.length), padByte);
  buffer.copy(out, 0);
  return out;
}

function readGlb(filePath) {
  const bytes = fs.readFileSync(filePath);
  if (bytes.toString("ascii", 0, 4) !== "glTF") {
    throw new Error(`${filePath} is not a GLB`);
  }

  let offset = 12;
  let json = null;
  let bin = null;
  while (offset < bytes.length) {
    const length = bytes.readUInt32LE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    offset += 8;
    const chunk = bytes.subarray(offset, offset + length);
    if (type === "JSON") json = JSON.parse(chunk.toString("utf8").trim());
    if (type === "BIN\u0000") bin = chunk;
    offset += align4(length);
  }
  if (!json || !bin) throw new Error(`${filePath} must contain JSON and BIN chunks`);
  return { json, bin };
}

function componentArray(componentType) {
  switch (componentType) {
    case 5120: return Int8Array;
    case 5121: return Uint8Array;
    case 5122: return Int16Array;
    case 5123: return Uint16Array;
    case 5125: return Uint32Array;
    case 5126: return Float32Array;
    default: throw new Error(`Unsupported componentType ${componentType}`);
  }
}

function numComponents(type) {
  return ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 })[type] || 1;
}

function readAccessor(json, bin, accessorIndex) {
  const accessor = json.accessors[accessorIndex];
  const view = json.bufferViews[accessor.bufferView];
  const ArrayType = componentArray(accessor.componentType);
  const components = numComponents(accessor.type);
  const byteOffset = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const count = accessor.count * components;

  if (view.byteStride && view.byteStride !== ArrayType.BYTES_PER_ELEMENT * components) {
    throw new Error("Interleaved bufferViews are not supported by this compressor");
  }

  return new ArrayType(
    bin.buffer,
    bin.byteOffset + byteOffset,
    count
  );
}

function encodePrimitive(json, bin, primitive) {
  const positionAccessor = primitive.attributes.POSITION;
  const normalAccessor = primitive.attributes.NORMAL;
  const uvAccessor = primitive.attributes.TEXCOORD_0;

  if (positionAccessor == null || primitive.indices == null) {
    throw new Error("Primitive must have POSITION and indices");
  }

  const positions = readAccessor(json, bin, positionAccessor);
  const normals = normalAccessor == null ? null : readAccessor(json, bin, normalAccessor);
  const uvs = uvAccessor == null ? null : readAccessor(json, bin, uvAccessor);
  const indicesRaw = readAccessor(json, bin, primitive.indices);
  const indices = indicesRaw instanceof Uint32Array ? indicesRaw : new Uint32Array(indicesRaw);

  const numFaces = indices.length / 3;
  const numPoints = json.accessors[positionAccessor].count;

  const encoder = new encoderModule.Encoder();
  const meshBuilder = new encoderModule.MeshBuilder();
  const mesh = new encoderModule.Mesh();

  meshBuilder.AddFacesToMesh(mesh, numFaces, indices);

  const attrMap = {};
  attrMap.POSITION = meshBuilder.AddFloatAttributeToMesh(mesh, encoderModule.POSITION, numPoints, 3, positions);
  if (normals) attrMap.NORMAL = meshBuilder.AddFloatAttributeToMesh(mesh, encoderModule.NORMAL, numPoints, 3, normals);
  if (uvs) attrMap.TEXCOORD_0 = meshBuilder.AddFloatAttributeToMesh(mesh, encoderModule.TEX_COORD, numPoints, 2, uvs);

  encoder.SetSpeedOptions(5, 5);
  encoder.SetEncodingMethod(encoderModule.MESH_EDGEBREAKER_ENCODING);
  encoder.SetAttributeQuantization(encoderModule.POSITION, 14);
  encoder.SetAttributeQuantization(encoderModule.NORMAL, 10);
  encoder.SetAttributeQuantization(encoderModule.TEX_COORD, 12);

  const encodedData = new encoderModule.DracoInt8Array();
  const encodedLen = encoder.EncodeMeshToDracoBuffer(mesh, encodedData);
  if (encodedLen <= 0) throw new Error("Draco encoding failed");

  const compressed = Buffer.alloc(encodedLen);
  for (let i = 0; i < encodedLen; i++) compressed[i] = encodedData.GetValue(i);

  encoderModule.destroy(encodedData);
  encoderModule.destroy(mesh);
  encoderModule.destroy(meshBuilder);
  encoderModule.destroy(encoder);

  return { compressed, attrMap };
}

function writeGlb(json, bin, outPath) {
  const jsonBytes = paddedBuffer(Buffer.from(JSON.stringify(json)), 0x20);
  const binBytes = paddedBuffer(bin, 0);
  const totalLength = 12 + 8 + jsonBytes.length + 8 + binBytes.length;
  const out = Buffer.alloc(totalLength);

  out.write("glTF", 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(totalLength, 8);
  out.writeUInt32LE(jsonBytes.length, 12);
  out.write("JSON", 16);
  jsonBytes.copy(out, 20);
  const binHeader = 20 + jsonBytes.length;
  out.writeUInt32LE(binBytes.length, binHeader);
  out.write("BIN\u0000", binHeader + 4);
  binBytes.copy(out, binHeader + 8);
  fs.writeFileSync(outPath, out);
}

for (const file of files) {
  const input = path.join(BASE_DIR, file);
  const output = path.join(OUT_DIR, file);
  const { json, bin } = readGlb(input);

  if (json.extensionsUsed?.includes("KHR_draco_mesh_compression")) {
    fs.copyFileSync(input, output);
    console.log(`${file}: already draco`);
    continue;
  }

  if ((json.meshes?.length || 0) !== 1 || (json.meshes[0].primitives?.length || 0) !== 1) {
    throw new Error(`${file}: expected one mesh with one primitive`);
  }

  const primitive = json.meshes[0].primitives[0];
  const { compressed, attrMap } = encodePrimitive(json, bin, primitive);

  json.extensionsUsed = Array.from(new Set([...(json.extensionsUsed || []), "KHR_draco_mesh_compression"]));
  json.extensionsRequired = Array.from(new Set([...(json.extensionsRequired || []), "KHR_draco_mesh_compression"]));

  const oldAccessors = json.accessors;
  const keepAccessorIndexes = [
    primitive.attributes.POSITION,
    primitive.attributes.NORMAL,
    primitive.attributes.TEXCOORD_0,
    primitive.indices,
  ].filter((value) => value != null);

  const accessorMap = new Map();
  json.accessors = keepAccessorIndexes.map((oldIndex, newIndex) => {
    accessorMap.set(oldIndex, newIndex);
    const accessor = { ...oldAccessors[oldIndex] };
    delete accessor.bufferView;
    delete accessor.byteOffset;
    return accessor;
  });

  primitive.attributes = Object.fromEntries(
    Object.entries(primitive.attributes).map(([semantic, oldIndex]) => [semantic, accessorMap.get(oldIndex)])
  );
  primitive.indices = accessorMap.get(primitive.indices);
  primitive.extensions = {
    ...(primitive.extensions || {}),
    KHR_draco_mesh_compression: {
      bufferView: 0,
      attributes: attrMap,
    },
  };

  json.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: compressed.length }];
  json.buffers = [{ byteLength: align4(compressed.length) }];

  writeGlb(json, compressed, output);
  console.log(`${file}: ${(fs.statSync(input).size / 1048576).toFixed(2)} MB -> ${(fs.statSync(output).size / 1048576).toFixed(2)} MB`);
}
