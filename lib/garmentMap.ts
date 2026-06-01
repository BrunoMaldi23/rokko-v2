export type GarmentView = "frontal" | "espalda";

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

const GARMENT_MAP: Record<string, GarmentConfig> = {
  "t-shirt": {
    views: ["frontal", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.35 },
        { label: "Pecho derecho", left: 0.6, top: 0.35 },
        { label: "Pecho centro", left: 0.38, top: 0.36 },
        { label: "Manga izquierda", left: 0.05, top: 0.42 },
        { label: "Manga derecha", left: 0.72, top: 0.42 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.25 },
        { label: "Espalda centro", left: 0.38, top: 0.38 },
      ],
    },
    defaultView: "frontal",
  },
  "polo": {
    views: ["frontal", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.38 },
        { label: "Pecho derecho", left: 0.6, top: 0.38 },
        { label: "Pecho centro", left: 0.38, top: 0.39 },
        { label: "Manga izquierda", left: 0.05, top: 0.42 },
        { label: "Manga derecha", left: 0.72, top: 0.42 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.28 },
        { label: "Espalda centro", left: 0.38, top: 0.40 },
      ],
    },
    defaultView: "frontal",
  },
  "hoodie": {
    views: ["frontal", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.40 },
        { label: "Pecho derecho", left: 0.6, top: 0.40 },
        { label: "Pecho centro", left: 0.38, top: 0.41 },
        { label: "Manga izquierda", left: 0.05, top: 0.38 },
        { label: "Manga derecha", left: 0.72, top: 0.38 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.28 },
        { label: "Espalda centro", left: 0.38, top: 0.40 },
        { label: "Espalda baja", left: 0.38, top: 0.52 },
        { label: "Manga izquierda trasera", left: 0.05, top: 0.38 },
        { label: "Manga derecha trasera", left: 0.72, top: 0.38 },
      ],
    },
    defaultView: "frontal",
  },
  "bomber": {
    views: ["frontal", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.32 },
        { label: "Pecho derecho", left: 0.6, top: 0.32 },
        { label: "Pecho centro", left: 0.38, top: 0.33 },
        { label: "Manga izquierda", left: 0.05, top: 0.36 },
        { label: "Manga derecha", left: 0.72, top: 0.36 },
        { label: "Espalda alta", left: 0.38, top: 0.20 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.22 },
        { label: "Espalda centro", left: 0.38, top: 0.35 },
        { label: "Manga izquierda trasera", left: 0.05, top: 0.36 },
        { label: "Manga derecha trasera", left: 0.72, top: 0.36 },
      ],
    },
    defaultView: "frontal",
  },
  "shirt": {
    views: ["frontal", "espalda"],
    positions: {
      frontal: [
        { label: "Pecho izquierdo", left: 0.15, top: 0.33 },
        { label: "Pecho derecho", left: 0.6, top: 0.33 },
        { label: "Pecho centro", left: 0.38, top: 0.34 },
        { label: "Manga izquierda", left: 0.05, top: 0.38 },
        { label: "Manga derecha", left: 0.72, top: 0.38 },
      ],
      espalda: [
        { label: "Espalda alta", left: 0.38, top: 0.24 },
        { label: "Espalda centro", left: 0.38, top: 0.37 },
      ],
    },
    defaultView: "frontal",
  },
};

function detectGarmentType(name: string, shortName: string): string {
  const s = `${shortName} ${name}`.toLowerCase();
  if (/bomber/.test(s)) return "bomber";
  if (/hoodie|poler[oó]n|sudader/.test(s)) return "hoodie";
  if (/polo/.test(s)) return "polo";
  if (/shirt|camisa/.test(s)) return "shirt";
  return "t-shirt";
}

export function getGarmentConfig(name: string, shortName: string): GarmentConfig {
  const type = detectGarmentType(name, shortName);
  return GARMENT_MAP[type] || GARMENT_MAP["t-shirt"];
}
