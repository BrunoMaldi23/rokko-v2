const oldRange = (oldMin, oldMax, newMin, newMax) => {
  const oldSpan = oldMax - oldMin;
  const newSpan = newMax - newMin;
  return (oldVal) => newMin + (oldVal - oldMin) / oldSpan * newSpan;
};

const mapY = oldRange(-0.477, 0.473, 0, 1.708);
const mapX = oldRange(-0.513, 0.513, -0.760, 0.760);

const decals = {
  "Pecho izquierdo":  { p: [-0.075, 0.14, -0.245], r: [0, Math.PI, 0], s: [0.09, 0.09, 0.25] },
  "Pecho derecho":    { p: [0.075, 0.14, -0.245], r: [0, Math.PI, 0], s: [0.09, 0.09, 0.25] },
  "Pecho centro":     { p: [0, 0.10, -0.245], r: [0, Math.PI, 0], s: [0.13, 0.13, 0.28] },
  "Manga izquierda":  { p: [-0.155, 0.11, -0.11], r: [0, Math.PI + 0.7, 0], s: [0.065, 0.065, 0.2] },
  "Manga derecha":    { p: [0.155, 0.11, -0.11], r: [0, Math.PI - 0.7, 0], s: [0.065, 0.065, 0.2] },
  "Espalda alta":     { p: [0, 0.15, 0.24], r: [0, 0, 0], s: [0.13, 0.13, 0.28] },
  "Espalda centro":   { p: [0, 0.04, 0.245], r: [0, 0, 0], s: [0.16, 0.16, 0.28] },
  "Espalda baja":     { p: [0, -0.14, 0.22], r: [0, 0, 0], s: [0.12, 0.12, 0.24] },
  "Manga izquierda trasera": { p: [-0.155, 0.10, 0.08], r: [0, -0.7, 0], s: [0.065, 0.065, 0.2] },
  "Manga derecha trasera":   { p: [0.155, 0.10, 0.08], r: [0, 0.7, 0], s: [0.065, 0.065, 0.2] },
};

console.log("Mapped decal coords for new mannequin:");
for (const [label, d] of Object.entries(decals)) {
  const nx = parseFloat(mapX(d.p[0]).toFixed(4));
  const ny = parseFloat(mapY(d.p[1]).toFixed(4));
  const nz = d.p[2] < 0 ? -0.075 : 0.165;
  const sx = parseFloat((d.s[0] * (0.760/0.513)).toFixed(4));
  const sy = parseFloat((d.s[1] * (1.708/0.950)).toFixed(4));
  const sz = d.s[2];
  console.log(`  ["${label}"]: { position: [${nx}, ${ny}, ${nz}], rotation: [${d.r[0].toFixed(1)}, ${d.r[1].toFixed(1)}, ${d.r[2].toFixed(1)}], scale: [${sx}, ${sy}, ${sz}] },`);
}
