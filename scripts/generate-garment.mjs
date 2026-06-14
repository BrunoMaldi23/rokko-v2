/**
 * generate-garment.mjs
 * Generates a procedural t-shirt GLB with proper UV mapping.
 * Run: node scripts/generate-garment.mjs
 *
 * Requires: three (already in project)
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// Inline minimal GLB generator (no external deps beyond three)
const THREE = await import("three");

function createTShirtGeometry() {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const SEGS_W = 24;
  const SEGS_H = 32;

  // Body profile: a simplified torso cross-section extruded along Y
  const BODY_MIN_Y = -0.48;
  const BODY_MAX_Y = 0.40;
  const BODY_RADIUS = 0.15;
  const NECK_Y = 0.36;
  const NECK_RADIUS = 0.045;

  function addVertex(x, y, z, u, v) {
    const idx = positions.length / 3;
    positions.push(x, y, z);
    // Approximate normal: outward from center axis
    const nx = x;
    const nz = z;
    const len = Math.sqrt(nx * nx + nz * nz) || 1;
    normals.push(nx / len, 0, nz / len);
    uvs.push(u, v);
    return idx;
  }

  // Generate body vertices (front half only for t-shirt front view)
  for (let j = 0; j <= SEGS_H; j++) {
    const v = j / SEGS_H;
    const y = BODY_MIN_Y + v * (BODY_MAX_Y - BODY_MIN_Y);

    // Taper radius: wider at chest, narrower at waist and neck
    let radius = BODY_RADIUS;
    if (y > 0.2) {
      // Shoulder to neck taper
      const t = (y - 0.2) / (BODY_MAX_Y - 0.2);
      radius = BODY_RADIUS * (1 - t * 0.65);
    } else if (y < -0.2) {
      // Hip to hem taper
      const t = (-0.2 - y) / (-0.2 - BODY_MIN_Y);
      radius = BODY_RADIUS * (1 - t * 0.15);
    }

    for (let i = 0; i <= SEGS_W; i++) {
      const u = i / SEGS_W;
      const angle = Math.PI * 0.15 + u * Math.PI * 0.7; // front-facing arc
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      addVertex(x, y, z, u, 1 - v);
    }
  }

  // Generate indices
  for (let j = 0; j < SEGS_H; j++) {
    for (let i = 0; i < SEGS_W; i++) {
      const a = j * (SEGS_W + 1) + i;
      const b = a + 1;
      const c = (j + 1) * (SEGS_W + 1) + i;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // Add sleeve caps (left and right)
  function addSleeve(sign) {
    const SLEEVE_SEGS = 12;
    const sleeveRadius = 0.03;
    const baseX = sign * (BODY_RADIUS * 0.85);
    const baseY = 0.25;
    const baseZ = 0;

    const sleeveStart = positions.length / 3;

    for (let j = 0; j <= SLEEVE_SEGS; j++) {
      const v = j / SLEEVE_SEGS;
      const armLen = v * 0.2;
      const sx = baseX + sign * armLen;
      const sy = baseY - v * 0.05;
      const taper = sleeveRadius * (1 - v * 0.3);

      for (let i = 0; i <= 8; i++) {
        const u = i / 8;
        const angle = -Math.PI * 0.5 + u * Math.PI;
        const x = sx;
        const y = sy + Math.cos(angle) * taper;
        const z = baseZ + Math.sin(angle) * taper;
        addVertex(x, y, z, u, 1 - v);
      }
    }

    const sleeveW = 8;
    for (let j = 0; j < SLEEVE_SEGS; j++) {
      for (let i = 0; i < sleeveW; i++) {
        const a = sleeveStart + j * (sleeveW + 1) + i;
        const b = a + 1;
        const c = sleeveStart + (j + 1) * (sleeveW + 1) + i;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
  }

  addSleeve(-1); // left
  addSleeve(1);  // right

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeBoundingSphere();
  return geo;
}

// Convert to GLB binary
function geometryToGLB(geometry) {
  const posAttr = geometry.getAttribute("position");
  const normAttr = geometry.getAttribute("normal");
  const uvAttr = geometry.getAttribute("uv");
  const indexAttr = geometry.getIndex();

  const vertexCount = posAttr.count;
  const indexCount = indexAttr ? indexAttr.count : 0;

  // Build buffer data
  const posBytes = new Float32Array(posAttr.array);
  const normBytes = new Float32Array(normAttr.array);
  const uvBytes = new Float32Array(uvAttr.array);
  const indexBytes = indexAttr
    ? new Uint16Array(indexAttr.array)
    : null;

  // GLB structure: JSON chunk + Binary chunk
  const gltf = {
    asset: { version: "2.0", generator: "rokko-garment-gen" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "tshirt" }],
    meshes: [
      {
        primitives: [
          {
            attributes: {
              POSITION: 0,
              NORMAL: 1,
              TEXCOORD_0: 2,
            },
            indices: indexBytes ? 3 : undefined,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        name: "garment_material",
        pbrMetallicRoughness: {
          baseColorFactor: [1, 1, 1, 1],
          metallicFactor: 0,
          roughnessFactor: 0.85,
        },
        doubleSided: true,
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: vertexCount,
        type: "VEC3",
        max: [
          Math.max(...Array.from(posAttr.array).filter((_, i) => i % 3 === 0)),
          Math.max(...Array.from(posAttr.array).filter((_, i) => i % 3 === 1)),
          Math.max(...Array.from(posAttr.array).filter((_, i) => i % 3 === 2)),
        ],
        min: [
          Math.min(...Array.from(posAttr.array).filter((_, i) => i % 3 === 0)),
          Math.min(...Array.from(posAttr.array).filter((_, i) => i % 3 === 1)),
          Math.min(...Array.from(posAttr.array).filter((_, i) => i % 3 === 2)),
        ],
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: vertexCount,
        type: "VEC3",
      },
      {
        bufferView: 2,
        componentType: 5126,
        count: vertexCount,
        type: "VEC2",
      },
      ...(indexBytes
        ? [
            {
              bufferView: 3,
              componentType: 5123, // UNSIGNED_SHORT
              count: indexCount,
              type: "SCALAR",
            },
          ]
        : []),
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBytes.byteLength, target: 34962 },
      {
        buffer: 0,
        byteOffset: posBytes.byteLength,
        byteLength: normBytes.byteLength,
        target: 34962,
      },
      {
        buffer: 0,
        byteOffset: posBytes.byteLength + normBytes.byteLength,
        byteLength: uvBytes.byteLength,
        target: 34962,
      },
      ...(indexBytes
        ? [
            {
              buffer: 0,
              byteOffset:
                posBytes.byteLength + normBytes.byteLength + uvBytes.byteLength,
              byteLength: indexBytes.byteLength,
              target: 34963,
            },
          ]
        : []),
    ],
    buffers: [
      {
        byteLength:
          posBytes.byteLength +
          normBytes.byteLength +
          uvBytes.byteLength +
          (indexBytes ? indexBytes.byteLength : 0),
      },
    ],
  };

  // Serialize JSON
  const jsonStr = JSON.stringify(gltf);
  const jsonPad = (4 - (jsonStr.length % 4)) % 4;
  const jsonChunkLen = jsonStr.length + jsonPad;

  // Binary data
  const binData = Buffer.concat([
    Buffer.from(posBytes.buffer),
    Buffer.from(normBytes.buffer),
    Buffer.from(uvBytes.buffer),
    ...(indexBytes ? [Buffer.from(indexBytes.buffer)] : []),
  ]);
  const binPad = (4 - (binData.length % 4)) % 4;
  const binChunkLen = binData.length + binPad;

  // GLB header
  const totalLength = 12 + 8 + jsonChunkLen + 8 + binChunkLen;
  const buf = Buffer.alloc(totalLength);

  // Header
  buf.writeUInt32LE(0x46546c67, 0); // magic: glTF
  buf.writeUInt32LE(2, 4); // version
  buf.writeUInt32LE(totalLength, 8); // total length

  // JSON chunk
  buf.writeUInt32LE(jsonChunkLen, 12);
  buf.writeUInt32LE(0x4e4f534a, 16); // type: JSON
  buf.write(jsonStr, 20, "utf8");
  for (let i = 0; i < jsonPad; i++) buf[20 + jsonStr.length + i] = 0x20;

  // Binary chunk
  const binOffset = 20 + jsonChunkLen;
  buf.writeUInt32LE(binChunkLen, binOffset);
  buf.writeUInt32LE(0x004e4942, binOffset + 4); // type: BIN
  binData.copy(buf, binOffset + 8);
  for (let i = 0; i < binPad; i++) buf[binOffset + 8 + binData.length + i] = 0;

  return buf;
}

// Main
const outDir = join(process.cwd(), "public", "garments");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const geo = createTShirtGeometry();
const glb = geometryToGLB(geo);
const outPath = join(outDir, "polera_manga_corta.glb");
writeFileSync(outPath, glb);

console.log(`[OK] Generated ${outPath}`);
console.log(`     Vertices: ${geo.getAttribute("position").count}`);
console.log(`     Triangles: ${geo.getIndex().count / 3}`);
console.log(`     File size: ${(glb.length / 1024).toFixed(1)} KB`);
