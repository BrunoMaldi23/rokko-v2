export type UVIsland = {
  u: [number, number];
  v: [number, number];
};

export type UVMappingConfig = {
  torsoFront: UVIsland;
  torsoBack: UVIsland;
  sleeveLeft: UVIsland;
  sleeveRight: UVIsland;
};

export const GARMENT_UV_MAPS: Record<string, UVMappingConfig> = {
  polera: {
    torsoFront: { u: [0.05, 0.95], v: [0.10, 0.90] },
    torsoBack: { u: [0.05, 0.95], v: [0.10, 0.90] },
    sleeveLeft: { u: [0.00, 0.15], v: [0.40, 0.60] },
    sleeveRight: { u: [0.85, 1.00], v: [0.40, 0.60] },
  },
  polo: {
    torsoFront: { u: [0.05, 0.95], v: [0.05, 0.92] },
    torsoBack: { u: [0.05, 0.95], v: [0.05, 0.92] },
    sleeveLeft: { u: [0.00, 0.15], v: [0.35, 0.55] },
    sleeveRight: { u: [0.85, 1.00], v: [0.35, 0.55] },
  },
  hoodie: {
    torsoFront: { u: [0.08, 0.92], v: [0.08, 0.88] },
    torsoBack: { u: [0.08, 0.92], v: [0.08, 0.88] },
    sleeveLeft: { u: [0.00, 0.18], v: [0.30, 0.60] },
    sleeveRight: { u: [0.82, 1.00], v: [0.30, 0.60] },
  },
  bomber: {
    torsoFront: { u: [0.05, 0.95], v: [0.12, 0.88] },
    torsoBack: { u: [0.05, 0.95], v: [0.12, 0.88] },
    sleeveLeft: { u: [0.00, 0.15], v: [0.35, 0.55] },
    sleeveRight: { u: [0.85, 1.00], v: [0.35, 0.55] },
  },
};

export function getUVConfig(garmentType: string): UVMappingConfig {
  return GARMENT_UV_MAPS[garmentType] ?? GARMENT_UV_MAPS.polera;
}
