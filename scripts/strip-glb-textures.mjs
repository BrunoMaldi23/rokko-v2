/**
 * strip-glb-textures.mjs
 *
 * Removes embedded textures (images, samplers, texture references)
 * from all .glb files under public/models/.
 *
 * This is safe because we override materials at runtime.
 *
 * Usage: node scripts/strip-glb-textures.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");

function findGlbFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...findGlbFiles(full));
    } else if (e.name.endsWith(".glb")) {
      results.push(full);
    }
  }
  return results;
}

function stripTextures(filePath) {
  const buf = readFileSync(filePath);
  const jsonLen = buf.readUInt32LE(12);
  let rawJson = buf.toString("utf8", 20, 20 + jsonLen);
  // Some exporters pad with null bytes (0x00) instead of spaces
  const nullIdx = rawJson.indexOf("\0");
  if (nullIdx !== -1) rawJson = rawJson.slice(0, nullIdx);
  const json = JSON.parse(rawJson);

  // Skip if no images
  if (!json.images || json.images.length === 0) {
    return false;
  }

  const padding = (4 - (jsonLen % 4)) % 4;
  const binDataStart = 20 + jsonLen + padding + 8;

  // Find the first image buffer view to know where mesh data ends
  const imageBvIndices = json.images.map((img) => img.bufferView).filter((i) => i !== undefined);
  if (imageBvIndices.length === 0) return false;

  const firstImageBvIdx = Math.min(...imageBvIndices);
  const meshEnd = json.bufferViews[firstImageBvIdx].byteOffset;

  // Keep only buffer views before the first image
  json.bufferViews = json.bufferViews.slice(0, firstImageBvIdx);

  // Remove images, textures, samplers
  delete json.images;
  delete json.textures;
  delete json.samplers;

  // Remove texture references from materials
  if (json.materials) {
    json.materials.forEach((m) => {
      if (m.pbrMetallicRoughness) {
        delete m.pbrMetallicRoughness.baseColorTexture;
        delete m.pbrMetallicRoughness.metallicRoughnessTexture;
      }
      delete m.normalTexture;
      delete m.emissiveTexture;
      delete m.occlusionTexture;
      // Remove any extensions that reference textures
      if (m.extensions) {
        for (const key of Object.keys(m.extensions)) {
          const ext = m.extensions[key];
          for (const prop of Object.keys(ext)) {
            if (ext[prop] && typeof ext[prop] === "object" && "index" in ext[prop]) {
              delete ext[prop];
            }
          }
          if (Object.keys(ext).length === 0) delete m.extensions[key];
        }
        if (Object.keys(m.extensions).length === 0) delete m.extensions;
      }
    });
  }

  json.buffers[0].byteLength = meshEnd;

  // Extract only mesh data
  const meshData = buf.slice(binDataStart, binDataStart + meshEnd);

  // Write new GLB
  const fixedJson = Buffer.from(JSON.stringify(json));
  const jp = (4 - (fixedJson.length % 4)) % 4;
  const paddedJson = Buffer.alloc(fixedJson.length + jp, 0x20);
  fixedJson.copy(paddedJson);

  const totalLen = 12 + 8 + paddedJson.length + 8 + meshData.length;

  const hdr = Buffer.alloc(12);
  hdr.write("glTF");
  hdr.writeUInt32LE(2, 4);
  hdr.writeUInt32LE(totalLen, 8);

  const jhdr = Buffer.alloc(8);
  jhdr.writeUInt32LE(paddedJson.length, 0);
  jhdr.writeUInt32LE(0x4e4f534a, 4);

  const bhdr = Buffer.alloc(8);
  bhdr.writeUInt32LE(meshData.length, 0);
  bhdr.writeUInt32LE(0x004e4942, 4);

  writeFileSync(filePath, Buffer.concat([hdr, jhdr, paddedJson, bhdr, meshData]));
  return true;
}

const allGlbs = findGlbFiles(join(root, "public", "models"));
let cleaned = 0;
let skipped = 0;

for (const filePath of allGlbs) {
  const wasStripped = stripTextures(filePath);
  const size = statSync(filePath).size;
  const kb = (size / 1024).toFixed(0);
  if (wasStripped) {
    console.log(`✓ ${filePath.replace(root + "/", "")} → ${kb}KB (textures removed)`);
    cleaned++;
  } else {
    console.log(`- ${filePath.replace(root + "/", "")} → ${kb}KB (no textures)`);
    skipped++;
  }
}

console.log(`\n✅ Done: ${cleaned} cleaned, ${skipped} already clean`);
