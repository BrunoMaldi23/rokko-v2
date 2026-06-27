export type MockupPositionId =
  | "pecho_izquierdo"
  | "pecho_centro"
  | "pecho_derecho"
  | "manga_izquierda"
  | "manga_derecha"
  | "espalda_centro";

export type GarmentView = "frente" | "espalda" | "manga";

export type DecorationMethod = "bordado" | "estampado";

export type ExportFormat = "png" | "jpg";

export type BlendMode = "multiply" | "soft-light" | "screen";

export type AbsoluteBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PositionConfig = {
  id: MockupPositionId;
  label: string;
  garmentView: GarmentView;
  defaultX: number;
  defaultY: number;
  maxWidthRatio: number;
  displacementZone: AbsoluteBox;
  blendStrengthOverride?: number;
  blendFactorOverride?: number;
};

export type ResolvedPositionConfig = PositionConfig & {
  garmentImage: string;
  defaultRotation: number;
  relativeDisplacementZone: AbsoluteBox;
};

export type LogoTransform = {
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  opacity: number;
};

export type ProcessedLogo = {
  source: string;
  fileName: string;
  width: number;
  height: number;
  hasTransparency: boolean;
  backgroundRemoved: boolean;
};

export type MockupSnapshot = {
  canvasWidth: number;
  canvasHeight: number;
  logoSource: string;
  transform: LogoTransform;
  method: DecorationMethod;
  position: ResolvedPositionConfig;
  garmentCacheKey: string;
  exportScale: number;
};

export type RealisticRenderRequest = {
  requestId: number;
  width: number;
  height: number;
  garment: ImageData;
  logoLayer: ImageData;
  method: DecorationMethod;
  strength: number;
  shadeBlend: number;
  zone: AbsoluteBox;
  cacheKey: string;
  logoAverageLuminance: number;
};

export type RealisticRenderResponse = {
  requestId: number;
  logoLayer: ImageData;
  shadowLayer: ImageData;
  averageLuminance: number;
  blendMode: BlendMode;
  cacheKey: string;
};

export type LogoUploadResult =
  | { ok: true; logo: ProcessedLogo }
  | { ok: false; message: string };

export type ProductMockupCalibration = {
  positionId: MockupPositionId;
  defaultX: number;
  defaultY: number;
  maxWidthRatio: number;
  defaultRotation: number;
  updatedAt: string;
};

export type ProductMockupCalibrationMap = Partial<
  Record<MockupPositionId, ProductMockupCalibration>
>;
