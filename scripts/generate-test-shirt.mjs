import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.onloadend = null;
      this.result = null;
    }

    async readAsArrayBuffer(blob) {
      this.result = await blob.arrayBuffer();
      this.onloadend?.({ target: this });
    }
  };
}

const outPath = process.argv[2];
if (!outPath) throw new Error("Missing output path");

const scene = new THREE.Scene();
scene.name = "rokko-polera-negra-test";

const fabric = new THREE.MeshStandardMaterial({
  name: "Tela negra",
  color: "#070707",
  roughness: 0.72,
  metalness: 0,
  side: THREE.DoubleSide,
});

const detail = new THREE.MeshStandardMaterial({
  name: "Costuras gris oscuro",
  color: "#2a2a2a",
  roughness: 0.85,
  metalness: 0,
  side: THREE.DoubleSide,
});

const printMaterial = new THREE.MeshStandardMaterial({
  name: "Logo guia gris",
  color: "#1f2937",
  roughness: 0.8,
  metalness: 0,
  side: THREE.DoubleSide,
});

function makeShirtBody() {
  const shape = new THREE.Shape();

  // Frente de polera: cuerpo y mangas en una silueta continua.
  shape.moveTo(-0.30, 0.72);
  shape.lineTo(-0.48, 0.62);
  shape.lineTo(-0.86, 0.47);
  shape.lineTo(-0.75, 0.16);
  shape.lineTo(-0.54, 0.22);
  shape.lineTo(-0.44, -0.72);
  shape.lineTo(0.44, -0.72);
  shape.lineTo(0.54, 0.22);
  shape.lineTo(0.75, 0.16);
  shape.lineTo(0.86, 0.47);
  shape.lineTo(0.48, 0.62);
  shape.lineTo(0.30, 0.72);
  shape.quadraticCurveTo(0.18, 0.60, 0.00, 0.60);
  shape.quadraticCurveTo(-0.18, 0.60, -0.30, 0.72);

  // Cuello recortado.
  const neck = new THREE.Path();
  neck.absellipse(0, 0.62, 0.19, 0.11, 0, Math.PI * 2, true);
  shape.holes.push(neck);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.10,
    bevelEnabled: true,
    bevelSize: 0.018,
    bevelThickness: 0.014,
    bevelSegments: 5,
    curveSegments: 32,
  });
  geometry.center();
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, fabric);
  mesh.name = "polera-negra-cuerpo";
  return mesh;
}

function addTube(name, points, radius = 0.012) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const geometry = new THREE.TubeGeometry(curve, 24, radius, 8, false);
  const mesh = new THREE.Mesh(geometry, detail);
  mesh.name = name;
  scene.add(mesh);
  return mesh;
}

function addHem(name, x, y, width, rotation = 0) {
  const geometry = new THREE.BoxGeometry(width, 0.028, 0.018);
  const mesh = new THREE.Mesh(geometry, detail);
  mesh.name = name;
  mesh.position.set(x, y, 0.074);
  mesh.rotation.z = rotation;
  scene.add(mesh);
  return mesh;
}

const body = makeShirtBody();
body.position.z = 0;
scene.add(body);

// Costuras y terminaciones, levemente delante del frente.
addTube("cuello-costura", [
  [-0.21, 0.62, 0.083],
  [-0.13, 0.52, 0.088],
  [0.00, 0.49, 0.090],
  [0.13, 0.52, 0.088],
  [0.21, 0.62, 0.083],
], 0.014);

addTube("hombro-izquierdo", [
  [-0.29, 0.64, 0.083],
  [-0.45, 0.55, 0.087],
  [-0.66, 0.44, 0.088],
], 0.009);

addTube("hombro-derecho", [
  [0.29, 0.64, 0.083],
  [0.45, 0.55, 0.087],
  [0.66, 0.44, 0.088],
], 0.009);

addHem("basta-inferior", 0, -0.70, 0.84, 0);
addHem("puño-izquierdo", -0.76, 0.31, 0.28, -0.22);
addHem("puño-derecho", 0.76, 0.31, 0.28, 0.22);

// Marca tenue en el pecho para notar que hay frente y profundidad.
const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.09), printMaterial);
logo.name = "parche-pecho-guia";
logo.position.set(0, 0.10, 0.091);
scene.add(logo);

const group = new THREE.Group();
group.name = "polera-negra-test";
for (const child of [...scene.children]) {
  group.add(child);
}
scene.add(group);

const box = new THREE.Box3().setFromObject(group);
const center = box.getCenter(new THREE.Vector3());
group.position.sub(center);

const size = box.getSize(new THREE.Vector3());
const maxDim = Math.max(size.x, size.y, size.z);
group.scale.setScalar(1.65 / maxDim);
group.rotation.y = Math.PI;

const exporter = new GLTFExporter();
const arrayBuffer = await exporter.parseAsync(scene, {
  binary: true,
  trs: false,
  onlyVisible: true,
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
console.log(`Wrote ${outPath}`);
