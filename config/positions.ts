import type {
  GarmentView,
  MockupPositionId,
  ProductMockupCalibrationMap,
  PositionConfig,
  ResolvedPositionConfig,
} from "@/types/mockup.types";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 860;

export const MOCKUP_POSITIONS: PositionConfig[] = [
  {
    id: "pecho_izquierdo",
    label: "Pecho izquierdo",
    garmentView: "frente",
    defaultX: 0.42,
    defaultY: 0.39,
    maxWidthRatio: 0.16,
    displacementZone: { x: 230, y: 230, width: 180, height: 245 },
    blendStrengthOverride: 30,
    blendFactorOverride: 0.56,
  },
  {
    id: "pecho_derecho",
    label: "Pecho derecho",
    garmentView: "frente",
    defaultX: 0.58,
    defaultY: 0.39,
    maxWidthRatio: 0.16,
    displacementZone: { x: 310, y: 230, width: 180, height: 245 },
    blendStrengthOverride: 30,
    blendFactorOverride: 0.56,
  },
  {
    id: "pecho_centro",
    label: "Pecho centro",
    garmentView: "frente",
    defaultX: 0.5,
    defaultY: 0.42,
    maxWidthRatio: 0.23,
    displacementZone: { x: 230, y: 240, width: 260, height: 255 },
    blendStrengthOverride: 35,
    blendFactorOverride: 0.6,
  },
  {
    id: "manga_izquierda",
    label: "Manga izquierda",
    garmentView: "manga",
    defaultX: 0.27,
    defaultY: 0.39,
    maxWidthRatio: 0.13,
    displacementZone: { x: 115, y: 230, width: 160, height: 240 },
    blendStrengthOverride: 26,
    blendFactorOverride: 0.52,
  },
  {
    id: "manga_derecha",
    label: "Manga derecha",
    garmentView: "manga",
    defaultX: 0.73,
    defaultY: 0.39,
    maxWidthRatio: 0.13,
    displacementZone: { x: 445, y: 230, width: 160, height: 240 },
    blendStrengthOverride: 26,
    blendFactorOverride: 0.52,
  },
  {
    id: "espalda_centro",
    label: "Espalda centro",
    garmentView: "espalda",
    defaultX: 0.5,
    defaultY: 0.36,
    maxWidthRatio: 0.3,
    displacementZone: { x: 180, y: 170, width: 360, height: 300 },
    blendStrengthOverride: 36,
    blendFactorOverride: 0.62,
  },
];

const defaultRotationByPosition: Record<MockupPositionId, number> = {
  pecho_izquierdo: -1,
  pecho_centro: 0,
  pecho_derecho: 1,
  manga_izquierda: -8,
  manga_derecha: 8,
  espalda_centro: 0,
};

function imageForView(
  view: GarmentView,
  images: { front: string; back?: string; leftSleeve?: string },
) {
  if (view === "espalda") return images.back || images.front;
  if (view === "manga") return images.leftSleeve || images.front;
  return images.front;
}

function toRelativeZone(zone: PositionConfig["displacementZone"]) {
  return {
    x: zone.x / CANVAS_WIDTH,
    y: zone.y / CANVAS_HEIGHT,
    width: zone.width / CANVAS_WIDTH,
    height: zone.height / CANVAS_HEIGHT,
  };
}

export function createMockupPositions(images: {
  front: string;
  back?: string;
  leftSleeve?: string;
}, calibrations?: ProductMockupCalibrationMap | null): ResolvedPositionConfig[] {
  return MOCKUP_POSITIONS.map((position) => ({
    ...position,
    defaultX: calibrations?.[position.id]?.defaultX ?? position.defaultX,
    defaultY: calibrations?.[position.id]?.defaultY ?? position.defaultY,
    maxWidthRatio: calibrations?.[position.id]?.maxWidthRatio ?? position.maxWidthRatio,
    garmentImage: imageForView(position.garmentView, images),
    defaultRotation:
      calibrations?.[position.id]?.defaultRotation ??
      defaultRotationByPosition[position.id],
    relativeDisplacementZone: toRelativeZone(position.displacementZone),
  }));
}

export function findMockupPosition(
  positions: ResolvedPositionConfig[],
  id: MockupPositionId,
): ResolvedPositionConfig {
  return positions.find((position) => position.id === id) || positions[0];
}
