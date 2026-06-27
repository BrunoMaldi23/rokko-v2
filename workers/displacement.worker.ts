import type {
  AbsoluteBox,
  BlendMode,
  RealisticRenderRequest,
  RealisticRenderResponse,
} from "@/types/mockup.types";

type CachedMap = {
  minLum: number;
  maxLum: number;
  averageLum: number;
  zone: AbsoluteBox;
};

const mapCache = new Map<string, CachedMap>();

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function luminance(data: Uint8ClampedArray, index: number) {
  return data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
}

function sampleBilinear(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  channel: number,
) {
  const x0 = clamp(Math.floor(x), 0, width - 1);
  const y0 = clamp(Math.floor(y), 0, height - 1);
  const x1 = clamp(x0 + 1, 0, width - 1);
  const y1 = clamp(y0 + 1, 0, height - 1);
  const tx = clamp(x - x0, 0, 1);
  const ty = clamp(y - y0, 0, 1);

  const i00 = (y0 * width + x0) * 4 + channel;
  const i10 = (y0 * width + x1) * 4 + channel;
  const i01 = (y1 * width + x0) * 4 + channel;
  const i11 = (y1 * width + x1) * 4 + channel;

  const top = data[i00] * (1 - tx) + data[i10] * tx;
  const bottom = data[i01] * (1 - tx) + data[i11] * tx;
  return top * (1 - ty) + bottom * ty;
}

function getMap(request: RealisticRenderRequest): CachedMap {
  const cached = mapCache.get(request.cacheKey);
  if (cached) return cached;

  const { width, height, garment, zone } = request;
  const data = garment.data;
  const zoneX = clamp(Math.round(zone.x), 0, width - 1);
  const zoneY = clamp(Math.round(zone.y), 0, height - 1);
  const zoneW = clamp(Math.round(zone.width), 1, width - zoneX);
  const zoneH = clamp(Math.round(zone.height), 1, height - zoneY);
  let minLum = 255;
  let maxLum = 0;
  let totalLum = 0;
  let lumCount = 0;

  for (let y = zoneY; y < zoneY + zoneH; y += 1) {
    for (let x = zoneX; x < zoneX + zoneW; x += 1) {
      const lum = luminance(data, (y * width + x) * 4);
      minLum = Math.min(minLum, lum);
      maxLum = Math.max(maxLum, lum);
      totalLum += lum;
      lumCount += 1;
    }
  }

  const result = {
    minLum,
    maxLum,
    averageLum: lumCount ? totalLum / lumCount : 180,
    zone: { x: zoneX, y: zoneY, width: zoneW, height: zoneH },
  };
  mapCache.set(request.cacheKey, result);
  return result;
}

function createShadowLayer(width: number, height: number, logoLayer: ImageData) {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return new ImageData(width, height);
  const logoCanvas = new OffscreenCanvas(width, height);
  const logoCtx = logoCanvas.getContext("2d");
  if (!logoCtx) return new ImageData(width, height);

  logoCtx.putImageData(logoLayer, 0, 0);
  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;
  ctx.globalAlpha = 0.42;
  ctx.drawImage(logoCanvas, 0, 0);
  ctx.restore();
  return ctx.getImageData(0, 0, width, height);
}

function detectBlendMode(garmentLum: number, logoLum: number): BlendMode {
  const garmentNormalized = garmentLum / 255;
  const logoNormalized = logoLum / 255;
  if (garmentNormalized < 0.3 && logoNormalized < 0.3) return "screen";
  return garmentNormalized < 0.4 ? "soft-light" : "multiply";
}

function processLogoLayer(request: RealisticRenderRequest): RealisticRenderResponse {
  const { width, height, garment, logoLayer, method, strength, shadeBlend } = request;
  const map = getMap(request);
  const garmentData = garment.data;
  const logoData = logoLayer.data;
  const output = new ImageData(width, height);
  const out = output.data;
  const lumRange = Math.max(1, map.maxLum - map.minLum);
  const textureStrength = method === "bordado" ? strength * 0.56 : strength;
  const effectiveShade = method === "bordado" ? shadeBlend * 0.75 : shadeBlend;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const alpha = logoData[i + 3];
      if (alpha < 10) continue;

      const lum = luminance(garmentData, i);
      const normalized = clamp((lum - map.minLum) / lumRange, 0, 1);
      const offset = (normalized - 0.5) * textureStrength;
      const sx = clamp(x + offset, 0, width - 1);
      const sy = clamp(y + offset * 0.45, 0, height - 1);
      const shade = 1 + (normalized - 0.5) * effectiveShade * 2;
      const stitch = method === "bordado" ? 0.91 : 1;

      out[i] = clamp(sampleBilinear(logoData, width, height, sx, sy, 0) * shade * stitch, 0, 255);
      out[i + 1] = clamp(sampleBilinear(logoData, width, height, sx, sy, 1) * shade * stitch, 0, 255);
      out[i + 2] = clamp(sampleBilinear(logoData, width, height, sx, sy, 2) * shade * stitch, 0, 255);
      out[i + 3] = sampleBilinear(logoData, width, height, sx, sy, 3);
    }
  }

  return {
    requestId: request.requestId,
    logoLayer: output,
    shadowLayer: createShadowLayer(width, height, output),
    averageLuminance: map.averageLum,
    blendMode: detectBlendMode(map.averageLum, request.logoAverageLuminance),
    cacheKey: request.cacheKey,
  };
}

self.onmessage = (event: MessageEvent<RealisticRenderRequest>) => {
  self.postMessage(processLogoLayer(event.data));
};
