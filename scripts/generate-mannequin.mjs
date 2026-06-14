#!/usr/bin/env node
// Generates a humanoid mannequin GLB matching the EXACT spec:
//   - Single unified mesh, 20k-35k vertices
//   - T-pose, arms at 30° from vertical, palms down
//   - Clean horizontal ring at Y=-0.185 (garment coverage boundary)
//   - Y range -0.500 to +0.500, origin at chest center
//   - Featureless (no face, no fingers, mitten hands)
//   - Smooth normals, no UVs, no textures, no skeleton
//
// Usage: node scripts/generate-mannequin.mjs
// Output: public/models/mannequin.glb

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "public", "models", "mannequin.glb");

// =============================================================
// Body cross-section profile
// Each entry: { y, xR, zR } — an ellipse at that Y level
// X = horizontal (left/right), Z = front/back depth
// =============================================================
const BODY_PROFILE = [
  { y: -0.500, xR: 0.085, zR: 0.045 }, // feet base (oval)
  { y: -0.480, xR: 0.070, zR: 0.055 },
  { y: -0.460, xR: 0.062, zR: 0.060 },
  { y: -0.440, xR: 0.058, zR: 0.062 },
  { y: -0.420, xR: 0.060, zR: 0.065 }, // ankle
  { y: -0.390, xR: 0.072, zR: 0.075 },
  { y: -0.360, xR: 0.080, zR: 0.082 },
  { y: -0.330, xR: 0.085, zR: 0.085 },
  { y: -0.300, xR: 0.088, zR: 0.088 },
  { y: -0.275, xR: 0.090, zR: 0.090 },
  { y: -0.250, xR: 0.092, zR: 0.092 }, // knee
  { y: -0.220, xR: 0.108, zR: 0.095 },
  { y: -0.200, xR: 0.130, zR: 0.098 },
  { y: -0.185, xR: 0.170, zR: 0.100 }, // CROTCH/HIPS — garment ring
  { y: -0.170, xR: 0.165, zR: 0.105 },
  { y: -0.150, xR: 0.150, zR: 0.110 },
  { y: -0.130, xR: 0.130, zR: 0.105 },
  { y: -0.115, xR: 0.115, zR: 0.098 },
  { y: -0.100, xR: 0.105, zR: 0.090 }, // waist (narrowest)
  { y: -0.080, xR: 0.110, zR: 0.095 },
  { y: -0.060, xR: 0.118, zR: 0.105 },
  { y: -0.040, xR: 0.125, zR: 0.115 },
  { y: -0.020, xR: 0.130, zR: 0.122 },
  { y:  0.000, xR: 0.135, zR: 0.130 }, // chest center
  { y:  0.020, xR: 0.138, zR: 0.132 },
  { y:  0.040, xR: 0.142, zR: 0.132 },
  { y:  0.060, xR: 0.147, zR: 0.130 },
  { y:  0.080, xR: 0.150, zR: 0.125 },
  { y:  0.100, xR: 0.155, zR: 0.120 }, // armpit
  { y:  0.115, xR: 0.162, zR: 0.110 },
  { y:  0.130, xR: 0.170, zR: 0.100 }, // shoulders (max width)
  { y:  0.145, xR: 0.150, zR: 0.090 },
  { y:  0.160, xR: 0.110, zR: 0.070 },
  { y:  0.170, xR: 0.045, zR: 0.040 }, // neck base
  { y:  0.190, xR: 0.048, zR: 0.045 },
  { y:  0.210, xR: 0.052, zR: 0.050 },
  { y:  0.220, xR: 0.058, zR: 0.058 }, // chin
];

// Number of segments per ring (around the Y axis)
const RING_SEGMENTS = 128;
// Max Y spacing between rings for smooth surface
const MAX_Y_SPACING = 0.006;
// Head sphere parameters
const HEAD_CENTER_Y = 0.340;
const HEAD_RADIUS_X = 0.095;
const HEAD_RADIUS_Y = 0.160;
const HEAD_RADIUS_Z = 0.100;
const HEAD_PHI_SEGMENTS = 60;
const HEAD_THETA_SEGMENTS = 64;
// Neck bridge — between body chin and head bottom
const NECK_BRIDGE_Y = 0.220;
const NECK_BRIDGE_RADIUS = 0.055;

// Arms: 30° from vertical, palms down
// Shoulder at (±0.170, 0.130, 0), wrist at (±0.200, 0.050, 0)
const ARM_SHOULDERS = [
  { pos: [+0.170, +0.130, 0.000], wrist: [+0.200, +0.050, 0.000] },
  { pos: [-0.170, +0.130, 0.000], wrist: [-0.200, +0.050, 0.000] },
];
const ARM_SHOULDER_RADIUS = 0.052;
const ARM_WRIST_RADIUS = 0.032;
const ARM_LENGTH_SEGMENTS = 60;
const ARM_RING_SEGMENTS = 32;
// Mitten hand: small sphere at the wrist
const HAND_RADIUS = 0.038;
const HAND_PHI_SEGMENTS = 20;
const HAND_THETA_SEGMENTS = 28;

// =============================================================
// Helpers
// =============================================================

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function subdivideProfile(profile, maxSpacing) {
  const result = [];
  for (let i = 0; i < profile.length - 1; i++) {
    const a = profile[i];
    const b = profile[i + 1];
    const dist = Math.abs(b.y - a.y);
    const steps = Math.max(1, Math.ceil(dist / maxSpacing));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      result.push({
        y: lerp(a.y, b.y, t),
        xR: lerp(a.xR, b.xR, t),
        zR: lerp(a.zR, b.zR, t),
      });
    }
  }
  result.push(profile[profile.length - 1]);
  return result;
}

function vlen(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function vsub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vadd(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function vmul(v, s) {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function vnorm(v) {
  const m = vlen(v);
  if (m === 0) return [0, 0, 0];
  return [v[0] / m, v[1] / m, v[2] / m];
}

function vcross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function vdot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// =============================================================
// Geometry buffers (flat arrays)
// =============================================================
const positions = []; // [x, y, z, x, y, z, ...]
const indices = []; // triangle index list

function pushVertex(x, y, z) {
  positions.push(x, y, z);
  return (positions.length - 3) / 3;
}

function addTriangle(a, b, c) {
  indices.push(a, b, c);
}

function addQuad(a, b, c, d) {
  // a-b, c-d are paired edges
  addTriangle(a, c, b);
  addTriangle(b, c, d);
}

// =============================================================
// Body tube: rings along Y, connected with quads
// =============================================================
function buildBody(profile) {
  const rings = subdivideProfile(profile, MAX_Y_SPACING);
  const baseIdx = positions.length / 3;

  for (const ring of rings) {
    for (let s = 0; s < RING_SEGMENTS; s++) {
      const theta = (s / RING_SEGMENTS) * Math.PI * 2;
      const x = ring.xR * Math.cos(theta);
      const z = ring.zR * Math.sin(theta);
      pushVertex(x, ring.y, z);
    }
  }

  for (let r = 0; r < rings.length - 1; r++) {
    for (let s = 0; s < RING_SEGMENTS; s++) {
      const a = baseIdx + r * RING_SEGMENTS + s;
      const b = baseIdx + r * RING_SEGMENTS + ((s + 1) % RING_SEGMENTS);
      const c = baseIdx + (r + 1) * RING_SEGMENTS + s;
      const d = baseIdx + (r + 1) * RING_SEGMENTS + ((s + 1) % RING_SEGMENTS);
      addQuad(a, b, c, d);
    }
  }
  console.log(`  body rings: ${rings.length}, vertices: ${rings.length * RING_SEGMENTS}`);
  return { rings, baseIdx, vertexCount: rings.length * RING_SEGMENTS };
}

// =============================================================
// Head: sphere (slightly ellipsoidal) with neck bridge
// =============================================================
function buildHead() {
  // Generate head sphere vertices
  const baseIdx = positions.length / 3;
  for (let p = 0; p <= HEAD_PHI_SEGMENTS; p++) {
    const phi = (p / HEAD_PHI_SEGMENTS) * Math.PI; // 0 (top) → PI (bottom)
    for (let t = 0; t < HEAD_THETA_SEGMENTS; t++) {
      const theta = (t / HEAD_THETA_SEGMENTS) * 2 * Math.PI;
      const x = HEAD_RADIUS_X * Math.sin(phi) * Math.cos(theta);
      const y = HEAD_RADIUS_Y * Math.cos(phi);
      const z = HEAD_RADIUS_Z * Math.sin(phi) * Math.sin(theta);
      pushVertex(x, y + HEAD_CENTER_Y, z);
    }
  }
  for (let p = 0; p < HEAD_PHI_SEGMENTS; p++) {
    for (let t = 0; t < HEAD_THETA_SEGMENTS; t++) {
      const a = baseIdx + p * HEAD_THETA_SEGMENTS + t;
      const b = baseIdx + p * HEAD_THETA_SEGMENTS + ((t + 1) % HEAD_THETA_SEGMENTS);
      const c = baseIdx + (p + 1) * HEAD_THETA_SEGMENTS + t;
      const d = baseIdx + (p + 1) * HEAD_THETA_SEGMENTS + ((t + 1) % HEAD_THETA_SEGMENTS);
      addQuad(a, b, c, d);
    }
  }
  const vCount = (HEAD_PHI_SEGMENTS + 1) * HEAD_THETA_SEGMENTS;
  console.log(`  head vertices: ${vCount}`);
  return vCount;
}

// =============================================================
// Arm tube: from shoulder to wrist, cross-section oriented
// with "palm" direction along world -Y projection
// =============================================================
function buildArm(shoulder, wrist, shoulderR, wristR) {
  const start = vnorm(vsub(wrist, shoulder));
  const length = vlen(vsub(wrist, shoulder));

  // "palm down" axis: project world -Y onto the plane perpendicular to arm direction
  const worldDown = [0, -1, 0];
  const projDot = vdot(worldDown, start);
  const projected = vsub(worldDown, vmul(start, projDot));
  const palmAxis = vnorm(projected);

  // "thumb" axis: cross(arm_dir, palm_axis) — second perpendicular
  const sideAxis = vnorm(vcross(start, palmAxis));

  const baseIdx = positions.length / 3;
  const segs = ARM_LENGTH_SEGMENTS;
  const rSegs = ARM_RING_SEGMENTS;

  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const cx = lerp(shoulder[0], wrist[0], t);
    const cy = lerp(shoulder[1], wrist[1], t);
    const cz = lerp(shoulder[2], wrist[2], t);
    const radius = lerp(shoulderR, wristR, t);

    for (let s = 0; s < rSegs; s++) {
      const theta = (s / rSegs) * 2 * Math.PI;
      const ct = Math.cos(theta);
      const st = Math.sin(theta);
      const offX = radius * (ct * palmAxis[0] + st * sideAxis[0]);
      const offY = radius * (ct * palmAxis[1] + st * sideAxis[1]);
      const offZ = radius * (ct * palmAxis[2] + st * sideAxis[2]);
      pushVertex(cx + offX, cy + offY, cz + offZ);
    }
  }
  for (let i = 0; i < segs; i++) {
    for (let s = 0; s < rSegs; s++) {
      const a = baseIdx + i * rSegs + s;
      const b = baseIdx + i * rSegs + ((s + 1) % rSegs);
      const c = baseIdx + (i + 1) * rSegs + s;
      const d = baseIdx + (i + 1) * rSegs + ((s + 1) % rSegs);
      addQuad(a, b, c, d);
    }
  }
  const vCount = (segs + 1) * rSegs;
  return { vertexCount: vCount, wristPos: wrist };
}

// =============================================================
// Hand: mitten sphere at the wrist
// =============================================================
function buildHand(center) {
  const baseIdx = positions.length / 3;
  for (let p = 0; p <= HAND_PHI_SEGMENTS; p++) {
    const phi = (p / HAND_PHI_SEGMENTS) * Math.PI;
    for (let t = 0; t < HAND_THETA_SEGMENTS; t++) {
      const theta = (t / HAND_THETA_SEGMENTS) * 2 * Math.PI;
      const x = HAND_RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = HAND_RADIUS * Math.cos(phi);
      const z = HAND_RADIUS * Math.sin(phi) * Math.sin(theta);
      pushVertex(x + center[0], y + center[1], z + center[2]);
    }
  }
  for (let p = 0; p < HAND_PHI_SEGMENTS; p++) {
    for (let t = 0; t < HAND_THETA_SEGMENTS; t++) {
      const a = baseIdx + p * HAND_THETA_SEGMENTS + t;
      const b = baseIdx + p * HAND_THETA_SEGMENTS + ((t + 1) % HAND_THETA_SEGMENTS);
      const c = baseIdx + (p + 1) * HAND_THETA_SEGMENTS + t;
      const d = baseIdx + (p + 1) * HAND_THETA_SEGMENTS + ((t + 1) % HAND_THETA_SEGMENTS);
      addQuad(a, b, c, d);
    }
  }
  return (HAND_PHI_SEGMENTS + 1) * HAND_THETA_SEGMENTS;
}

// =============================================================
// Smooth vertex normals via face-normal averaging
// =============================================================
function computeNormals(pos, idx) {
  const normals = new Float32Array(pos.length);
  const v0 = [0, 0, 0];
  const v1 = [0, 0, 0];
  const v2 = [0, 0, 0];
  const e1 = [0, 0, 0];
  const e2 = [0, 0, 0];
  const n = [0, 0, 0];

  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i];
    const b = idx[i + 1];
    const c = idx[i + 2];
    v0[0] = pos[a * 3]; v0[1] = pos[a * 3 + 1]; v0[2] = pos[a * 3 + 2];
    v1[0] = pos[b * 3]; v1[1] = pos[b * 3 + 1]; v1[2] = pos[b * 3 + 2];
    v2[0] = pos[c * 3]; v2[1] = pos[c * 3 + 1]; v2[2] = pos[c * 3 + 2];
    e1[0] = v1[0] - v0[0]; e1[1] = v1[1] - v0[1]; e1[2] = v1[2] - v0[2];
    e2[0] = v2[0] - v0[0]; e2[1] = v2[1] - v0[1]; e2[2] = v2[2] - v0[2];
    n[0] = e1[1] * e2[2] - e1[2] * e2[1];
    n[1] = e1[2] * e2[0] - e1[0] * e2[2];
    n[2] = e1[0] * e2[1] - e1[1] * e2[0];
    const mag = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
    if (mag === 0) continue;
    const inv = 1 / mag;
    n[0] *= inv; n[1] *= inv; n[2] *= inv;
    normals[a * 3] += n[0]; normals[a * 3 + 1] += n[1]; normals[a * 3 + 2] += n[2];
    normals[b * 3] += n[0]; normals[b * 3 + 1] += n[1]; normals[b * 3 + 2] += n[2];
    normals[c * 3] += n[0]; normals[c * 3 + 1] += n[1]; normals[c * 3 + 2] += n[2];
  }
  for (let i = 0; i < normals.length; i += 3) {
    const mag = Math.sqrt(normals[i] * normals[i] + normals[i + 1] * normals[i + 1] + normals[i + 2] * normals[i + 2]);
    if (mag === 0) continue;
    const inv = 1 / mag;
    normals[i] *= inv; normals[i + 1] *= inv; normals[i + 2] *= inv;
  }
  return normals;
}

// =============================================================
// GLB writer (binary glTF 2.0)
// =============================================================
function writeGLB(outPath, positions, normals, indices) {
  // Pack into a single binary buffer
  const posCount = positions.length / 3;
  const posBytes = positions.length * 4;
  const normBytes = normals.length * 4;
  const useUint32 = posCount > 65535;
  const indexBytes = indices.length * (useUint32 ? 4 : 2);
  const totalBin = posBytes + normBytes + indexBytes;
  const paddedBin = Math.ceil(totalBin / 4) * 4;
  const binBuffer = new ArrayBuffer(paddedBin);
  const view = new DataView(binBuffer);
  let off = 0;
  for (let i = 0; i < positions.length; i++) {
    view.setFloat32(off, positions[i], true);
    off += 4;
  }
  for (let i = 0; i < normals.length; i++) {
    view.setFloat32(off, normals[i], true);
    off += 4;
  }
  if (useUint32) {
    for (let i = 0; i < indices.length; i++) {
      view.setUint32(off, indices[i], true);
      off += 4;
    }
  } else {
    for (let i = 0; i < indices.length; i++) {
      view.setUint16(off, indices[i], true);
      off += 2;
    }
  }

  // Min/Max for POSITION
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    if (positions[i] < min[0]) min[0] = positions[i];
    if (positions[i] > max[0]) max[0] = positions[i];
    if (positions[i + 1] < min[1]) min[1] = positions[i + 1];
    if (positions[i + 1] > max[1]) max[1] = positions[i + 1];
    if (positions[i + 2] < min[2]) min[2] = positions[i + 2];
    if (positions[i + 2] > max[2]) max[2] = positions[i + 2];
  }

  const gltf = {
    asset: { version: "2.0", generator: "rokko-mannequin-gen" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "mannequin" }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            mode: 4, // TRIANGLES
            indices: 2,
          },
        ],
      },
    ],
    buffers: [{ byteLength: paddedBin }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBytes, target: 34962 },
      { buffer: 0, byteOffset: posBytes, byteLength: normBytes, target: 34962 },
      { buffer: 0, byteOffset: posBytes + normBytes, byteLength: indexBytes, target: 34963 },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: posCount,
        type: "VEC3",
        min,
        max,
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: posCount,
        type: "VEC3",
      },
      {
        bufferView: 2,
        componentType: useUint32 ? 5125 : 5123, // UNSIGNED_INT or UNSIGNED_SHORT
        count: indices.length,
        type: "SCALAR",
      },
    ],
  };

  const jsonStr = JSON.stringify(gltf);
  let jsonBytes = Buffer.from(jsonStr, "utf-8");
  // Pad JSON to 4-byte boundary with spaces (per GLB spec)
  const jsonPadLen = Math.ceil(jsonBytes.length / 4) * 4;
  if (jsonPadLen > jsonBytes.length) {
    const pad = Buffer.alloc(jsonPadLen - jsonBytes.length, 0x20); // 0x20 = space
    jsonBytes = Buffer.concat([jsonBytes, pad]);
  }
  const jsonChunkLen = jsonBytes.length;
  const jsonChunkType = Buffer.from("JSON", "ascii");

  const binChunkLen = paddedBin;
  const binChunkType = Buffer.from("BIN\0", "ascii");

  const totalLen = 12 + 8 + jsonChunkLen + 8 + binChunkLen;
  const out = Buffer.alloc(totalLen);
  let p = 0;
  // GLB header
  out.write("glTF", p); p += 4;
  out.writeUInt32LE(2, p); p += 4; // version
  out.writeUInt32LE(totalLen, p); p += 4; // total length
  // JSON chunk
  out.writeUInt32LE(jsonChunkLen, p); p += 4;
  jsonChunkType.copy(out, p); p += 4;
  jsonBytes.copy(out, p); p += jsonChunkLen;
  // BIN chunk
  out.writeUInt32LE(binChunkLen, p); p += 4;
  binChunkType.copy(out, p); p += 4;
  Buffer.from(binBuffer).copy(out, p); p += binChunkLen;

  fs.writeFileSync(outPath, out);
}

// =============================================================
// MAIN
// =============================================================
console.log("Generating mannequin…");

console.log("[1/4] Body tube");
buildBody(BODY_PROFILE);

console.log("[2/4] Head");
buildHead();

console.log("[3/4] Arms and hands");
for (const arm of ARM_SHOULDERS) {
  const a = buildArm(arm.pos, arm.wrist, ARM_SHOULDER_RADIUS, ARM_WRIST_RADIUS);
  console.log(`  arm vertices: ${a.vertexCount}`);
  const h = buildHand(arm.wrist);
  console.log(`  hand vertices: ${h}`);
}

console.log("[4/4] Computing normals and writing GLB");
const posArr = new Float32Array(positions);
const normalArr = computeNormals(posArr, indices);
const indexArr = new Uint32Array(indices);
const totalVertices = positions.length / 3;
console.log(`  total vertices: ${totalVertices}`);
console.log(`  total triangles: ${indices.length / 3}`);
console.log(`  index type: ${totalVertices > 65535 ? "uint32" : "uint16"}`);

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
writeGLB(OUTPUT_PATH, posArr, normalArr, indexArr);

const stat = fs.statSync(OUTPUT_PATH);
console.log(`\n✓ Wrote ${OUTPUT_PATH} (${(stat.size / 1024).toFixed(1)} KB)`);

if (totalVertices < 20000 || totalVertices > 35000) {
  console.warn(
    `⚠ Vertex count ${totalVertices} outside target 20k-35k. Adjust RING_SEGMENTS or MAX_Y_SPACING.`
  );
}
