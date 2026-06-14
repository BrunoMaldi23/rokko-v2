export type GarmentView = "frontal" | "tres_cuatro_izq" | "tres_cuatro_der" | "espalda";

export type GarmentPosition = {
  label: string;
  left: number;
  top: number;
};

export type GarmentConfig = {
  views: GarmentView[];
  positions: Record<GarmentView, GarmentPosition[]>;
  defaultView: GarmentView;
};

type AngleConfig = {
  label: string;
  rotateY: number;
  scale?: number;
};

export const VIEW_ANGLES: Record<GarmentView, AngleConfig> = {
  frontal: { label: "Frontal", rotateY: 0 },
  tres_cuatro_izq: { label: "3/4 Izquierda", rotateY: 20, scale: 0.95 },
  tres_cuatro_der: { label: "3/4 Derecha", rotateY: -20, scale: 0.95 },
  espalda: { label: "Espalda", rotateY: 170 },
};

const GARMENT_MAP: Record<string, GarmentConfig> = {
  "t-shirt": {
    views: ["frontal", "tres_cuatro_izq", "tres_cuatro_der", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.35 },
        { label: "Pecho derecho", left: 0.6, top: 0.35 },
        { label: "Pecho centro", left: 0.38, top: 0.36 },
        { label: "Manga izquierda", left: 0.05, top: 0.42 },
        { label: "Manga derecha", left: 0.72, top: 0.42 },
      ],
      tres_cuatro_izq: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.35 },
        { label: "Pecho derecho", left: 0.55, top: 0.35 },
        { label: "Pecho centro", left: 0.40, top: 0.36 },
        { label: "Manga izquierda", left: 0.08, top: 0.38 },
        { label: "Manga derecha", left: 0.65, top: 0.42 },
      ],
      tres_cuatro_der: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.35 },
        { label: "Pecho derecho", left: 0.55, top: 0.35 },
        { label: "Pecho centro", left: 0.38, top: 0.36 },
        { label: "Manga izquierda", left: 0.12, top: 0.42 },
        { label: "Manga derecha", left: 0.68, top: 0.38 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.25 },
        { label: "Espalda centro", left: 0.38, top: 0.38 },
        { label: "Manga izquierda trasera", left: 0.08, top: 0.40 },
        { label: "Manga derecha trasera", left: 0.68, top: 0.40 },
      ],
    },
    defaultView: "frontal",
  },
  polo: {
    views: ["frontal", "tres_cuatro_izq", "tres_cuatro_der", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.38 },
        { label: "Pecho derecho", left: 0.6, top: 0.38 },
        { label: "Pecho centro", left: 0.38, top: 0.39 },
        { label: "Manga izquierda", left: 0.05, top: 0.42 },
        { label: "Manga derecha", left: 0.72, top: 0.42 },
      ],
      tres_cuatro_izq: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.38 },
        { label: "Pecho derecho", left: 0.55, top: 0.38 },
        { label: "Pecho centro", left: 0.40, top: 0.39 },
        { label: "Manga izquierda", left: 0.08, top: 0.38 },
        { label: "Manga derecha", left: 0.65, top: 0.42 },
      ],
      tres_cuatro_der: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.38 },
        { label: "Pecho derecho", left: 0.55, top: 0.38 },
        { label: "Pecho centro", left: 0.38, top: 0.39 },
        { label: "Manga izquierda", left: 0.12, top: 0.42 },
        { label: "Manga derecha", left: 0.68, top: 0.38 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.28 },
        { label: "Espalda centro", left: 0.38, top: 0.40 },
        { label: "Manga izquierda trasera", left: 0.08, top: 0.40 },
        { label: "Manga derecha trasera", left: 0.68, top: 0.40 },
      ],
    },
    defaultView: "frontal",
  },
  hoodie: {
    views: ["frontal", "tres_cuatro_izq", "tres_cuatro_der", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.40 },
        { label: "Pecho derecho", left: 0.6, top: 0.40 },
        { label: "Pecho centro", left: 0.38, top: 0.41 },
        { label: "Manga izquierda", left: 0.05, top: 0.38 },
        { label: "Manga derecha", left: 0.72, top: 0.38 },
      ],
      tres_cuatro_izq: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.40 },
        { label: "Pecho derecho", left: 0.55, top: 0.40 },
        { label: "Pecho centro", left: 0.40, top: 0.41 },
        { label: "Manga izquierda", left: 0.08, top: 0.35 },
        { label: "Manga derecha", left: 0.65, top: 0.38 },
      ],
      tres_cuatro_der: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.40 },
        { label: "Pecho derecho", left: 0.55, top: 0.40 },
        { label: "Pecho centro", left: 0.38, top: 0.41 },
        { label: "Manga izquierda", left: 0.12, top: 0.38 },
        { label: "Manga derecha", left: 0.68, top: 0.35 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.28 },
        { label: "Espalda centro", left: 0.38, top: 0.40 },
        { label: "Espalda baja", left: 0.38, top: 0.52 },
        { label: "Manga izquierda trasera", left: 0.08, top: 0.38 },
        { label: "Manga derecha trasera", left: 0.68, top: 0.38 },
      ],
    },
    defaultView: "frontal",
  },
  bomber: {
    views: ["frontal", "tres_cuatro_izq", "tres_cuatro_der", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.32 },
        { label: "Pecho derecho", left: 0.6, top: 0.32 },
        { label: "Pecho centro", left: 0.38, top: 0.33 },
        { label: "Manga izquierda", left: 0.05, top: 0.36 },
        { label: "Manga derecha", left: 0.72, top: 0.36 },
        { label: "Espalda alta", left: 0.38, top: 0.20 },
      ],
      tres_cuatro_izq: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.32 },
        { label: "Pecho derecho", left: 0.55, top: 0.32 },
        { label: "Pecho centro", left: 0.40, top: 0.33 },
        { label: "Manga izquierda", left: 0.08, top: 0.34 },
        { label: "Manga derecha", left: 0.65, top: 0.36 },
      ],
      tres_cuatro_der: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.32 },
        { label: "Pecho derecho", left: 0.55, top: 0.32 },
        { label: "Pecho centro", left: 0.38, top: 0.33 },
        { label: "Manga izquierda", left: 0.12, top: 0.36 },
        { label: "Manga derecha", left: 0.68, top: 0.34 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.22 },
        { label: "Espalda centro", left: 0.38, top: 0.35 },
        { label: "Manga izquierda trasera", left: 0.08, top: 0.36 },
        { label: "Manga derecha trasera", left: 0.68, top: 0.36 },
      ],
    },
    defaultView: "frontal",
  },
  shirt: {
    views: ["frontal", "tres_cuatro_izq", "tres_cuatro_der", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.33 },
        { label: "Pecho derecho", left: 0.6, top: 0.33 },
        { label: "Pecho centro", left: 0.38, top: 0.34 },
        { label: "Manga izquierda", left: 0.05, top: 0.38 },
        { label: "Manga derecha", left: 0.72, top: 0.38 },
      ],
      tres_cuatro_izq: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.33 },
        { label: "Pecho derecho", left: 0.55, top: 0.33 },
        { label: "Pecho centro", left: 0.40, top: 0.34 },
        { label: "Manga izquierda", left: 0.08, top: 0.36 },
        { label: "Manga derecha", left: 0.65, top: 0.38 },
      ],
      tres_cuatro_der: [
        { label: "Pecho izquierdo", left: 0.20, top: 0.33 },
        { label: "Pecho derecho", left: 0.55, top: 0.33 },
        { label: "Pecho centro", left: 0.38, top: 0.34 },
        { label: "Manga izquierda", left: 0.12, top: 0.38 },
        { label: "Manga derecha", left: 0.68, top: 0.36 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.24 },
        { label: "Espalda centro", left: 0.38, top: 0.37 },
        { label: "Manga izquierda trasera", left: 0.08, top: 0.38 },
        { label: "Manga derecha trasera", left: 0.68, top: 0.38 },
      ],
    },
    defaultView: "frontal",
  },
};

function detectGarmentType(name: string, shortName: string): string {
  const s = `${shortName} ${name}`.toLowerCase();
  const normalized = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/pantalon|cargo/.test(normalized)) return "pantalon-cargo";
  if (/blusa/.test(normalized)) return "blusa";
  if (/camisa|shirt/.test(normalized)) return "camisa";
  if (/micropolar/.test(normalized) && /mujer/.test(normalized)) return "micropolar-mujer";
  if (/micropolar/.test(normalized)) return "micropolar-hombre";
  if (/parka/.test(normalized) && /sin gorro/.test(normalized)) return "parka-desmontable-sin-gorro";
  if (/parka/.test(normalized) && /desmontable|puno/.test(normalized)) return "parka-desmontable";
  if (/parka/.test(normalized)) return "parka-hombre";
  if (/softshell/.test(normalized) && /termic|termico|premium/.test(normalized) && /mujer/.test(normalized)) return "softshell-termico-mujer";
  if (/softshell/.test(normalized) && /termic|termico|premium/.test(normalized)) return "softshell-termico-hombre";
  if (/softshell/.test(normalized) && /mujer/.test(normalized)) return "softshell-basico-mujer";
  if (/softshell/.test(normalized)) return "softshell-basico-hombre";
  if (/poleron/.test(normalized) && /polo|unisex/.test(normalized)) return "poleron-polo-unisex";
  if (/poleron|hoodie|sudader/.test(normalized)) return "poleron-cuello-redondo";
  if (/manga larga/.test(normalized)) return "t-shirt manga larga";
  if (/bomber/.test(s)) return "bomber";
  if (/hoodie|poler[oó]n|sudader/.test(s)) return "hoodie";
  if (/polo/.test(s)) return "polo";
  if (/shirt|camisa/.test(s)) return "shirt";
  return "t-shirt";
}

export function detectGarmentTypeLabel(name: string, shortName: string): string {
  return detectGarmentType(name, shortName);
}

export function getGarmentConfig(name: string, shortName: string): GarmentConfig {
  const type = detectGarmentType(name, shortName);
  return GARMENT_MAP[type] || GARMENT_MAP["t-shirt"];
}

// ---- 3D Decal coordinates per garment type ----
export type DecalCoords = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

export const GARMENT_3D_MAP: Record<string, Record<string, DecalCoords>> = {
  "t-shirt": {
    "Pecho izquierdo": { position: [-0.111, 1.109, -0.075], rotation: [0, Math.PI, 0], scale: [0.133, 0.162, 0.25] },
    "Pecho derecho": { position: [0.111, 1.109, -0.075], rotation: [0, Math.PI, 0], scale: [0.133, 0.162, 0.25] },
    "Pecho centro": { position: [0, 1.037, -0.075], rotation: [0, Math.PI, 0], scale: [0.193, 0.234, 0.28] },
    "Manga izquierda": { position: [-0.230, 1.055, -0.075], rotation: [0, Math.PI + 0.7, 0], scale: [0.096, 0.117, 0.2] },
    "Manga derecha": { position: [0.230, 1.055, -0.075], rotation: [0, Math.PI - 0.7, 0], scale: [0.096, 0.117, 0.2] },
    "Espalda alta": { position: [0, 1.127, 0.165], rotation: [0, 0, 0], scale: [0.193, 0.234, 0.28] },
    "Espalda centro": { position: [0, 0.930, 0.165], rotation: [0, 0, 0], scale: [0.237, 0.288, 0.28] },
    "Espalda baja": { position: [0, 0.606, 0.165], rotation: [0, 0, 0], scale: [0.178, 0.216, 0.24] },
    "Manga izquierda trasera": { position: [-0.230, 1.037, 0.165], rotation: [0, -0.7, 0], scale: [0.096, 0.117, 0.2] },
    "Manga derecha trasera": { position: [0.230, 1.037, 0.165], rotation: [0, 0.7, 0], scale: [0.096, 0.117, 0.2] },
  },
  polo: {},
  hoodie: {},
  bomber: {},
  shirt: {},
};

for (const type of [
  "polo",
  "hoodie",
  "bomber",
  "shirt",
  "camisa",
  "blusa",
  "poleron-cuello-redondo",
  "poleron-polo-unisex",
  "parka-hombre",
  "parka-desmontable",
  "parka-desmontable-sin-gorro",
  "softshell-basico-hombre",
  "softshell-basico-mujer",
  "softshell-termico-hombre",
  "softshell-termico-mujer",
  "micropolar-hombre",
  "micropolar-mujer",
  "pantalon-cargo",
] as const) {
  GARMENT_3D_MAP[type] = GARMENT_3D_MAP["t-shirt"];
}
export function getDecalCoords(garmentType: string, positionLabel: string): DecalCoords | null {
  const typeMap = GARMENT_3D_MAP[garmentType] || GARMENT_3D_MAP["t-shirt"];
  return typeMap[positionLabel] || null;
}

export function getDecalPositionLabels(garmentType: string): string[] {
  const typeMap = GARMENT_3D_MAP[garmentType] || GARMENT_3D_MAP["t-shirt"];
  return Object.keys(typeMap);
}
