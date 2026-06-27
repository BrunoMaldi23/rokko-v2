import type {
  ExportFormat,
  MockupSnapshot,
  RealisticRenderRequest,
  RealisticRenderResponse,
} from "@/types/mockup.types";

let renderWorker: Worker | null = null;
let requestSequence = 0;

function getWorker() {
  if (typeof window === "undefined") return null;
  if (!renderWorker) {
    renderWorker = new Worker(new URL("../workers/displacement.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return renderWorker;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar una imagen del mockup."));
    image.src = src;
  });
}

function fitImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * ratio;
  const drawHeight = image.naturalHeight * ratio;
  const left = (width - drawWidth) / 2;
  const top = (height - drawHeight) / 2;
  ctx.drawImage(image, left, top, drawWidth, drawHeight);
}

function luminance(data: Uint8ClampedArray, index: number) {
  return data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
}

function averageLogoLuminance(imageData: ImageData) {
  let total = 0;
  let count = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] < 10) continue;
    total += luminance(imageData.data, i);
    count += 1;
  }
  return count ? total / count : 180;
}

function drawThreadTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
) {
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1, scale);
  for (let y = -height; y < height * 1.4; y += 7 * scale) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + width * 0.18);
    ctx.stroke();
  }
  ctx.restore();
}

function scaleSnapshot(snapshot: MockupSnapshot, scale: number): MockupSnapshot {
  return {
    ...snapshot,
    canvasWidth: Math.round(snapshot.canvasWidth * scale),
    canvasHeight: Math.round(snapshot.canvasHeight * scale),
    exportScale: scale,
    transform: {
      ...snapshot.transform,
      left: snapshot.transform.left * scale,
      top: snapshot.transform.top * scale,
      width: snapshot.transform.width * scale,
      height: snapshot.transform.height * scale,
    },
  };
}

function zoneForSnapshot(snapshot: MockupSnapshot) {
  const zone = snapshot.position.relativeDisplacementZone;
  return {
    x: Math.round(zone.x * snapshot.canvasWidth),
    y: Math.round(zone.y * snapshot.canvasHeight),
    width: Math.round(zone.width * snapshot.canvasWidth),
    height: Math.round(zone.height * snapshot.canvasHeight),
  };
}

function requestWorkerRender(request: RealisticRenderRequest) {
  return new Promise<RealisticRenderResponse>((resolve, reject) => {
    const worker = getWorker();
    if (!worker) {
      reject(new Error("Worker no disponible."));
      return;
    }

    const onMessage = (event: MessageEvent<RealisticRenderResponse>) => {
      if (event.data.requestId !== request.requestId) return;
      cleanup();
      resolve(event.data);
    };
    const onError = (event: ErrorEvent) => {
      cleanup();
      reject(event.error instanceof Error ? event.error : new Error(event.message));
    };
    const cleanup = () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage(request);
  });
}

async function renderToCanvas(canvas: HTMLCanvasElement, snapshot: MockupSnapshot) {
  const width = snapshot.canvasWidth;
  const height = snapshot.canvasHeight;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas final no disponible.");

  const garment = await loadImage(snapshot.position.garmentImage);
  const logo = await loadImage(snapshot.logoSource);

  ctx.clearRect(0, 0, width, height);
  fitImage(ctx, garment, width, height);
  const garmentImageData = ctx.getImageData(0, 0, width, height);

  const logoCanvas = document.createElement("canvas");
  logoCanvas.width = width;
  logoCanvas.height = height;
  const logoCtx = logoCanvas.getContext("2d", { willReadFrequently: true });
  if (!logoCtx) throw new Error("Canvas de logo no disponible.");

  const { transform } = snapshot;
  const drawWidth = transform.width * transform.scaleX;
  const drawHeight = transform.height * transform.scaleY;
  logoCtx.save();
  logoCtx.translate(transform.left, transform.top);
  logoCtx.rotate((transform.angle * Math.PI) / 180);
  logoCtx.globalAlpha = transform.opacity;
  logoCtx.drawImage(logo, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  if (snapshot.method === "bordado") {
    logoCtx.globalCompositeOperation = "source-atop";
    drawThreadTexture(logoCtx, width, height, snapshot.exportScale);
  }
  logoCtx.restore();

  const logoImageData = logoCtx.getImageData(0, 0, width, height);
  const smallLogoFactor = Math.min(drawWidth, drawHeight) < 50 * snapshot.exportScale ? 0.55 : 1;
  const requestId = ++requestSequence;
  const response = await requestWorkerRender({
    requestId,
    width,
    height,
    garment: garmentImageData,
    logoLayer: logoImageData,
    method: snapshot.method,
    strength: (snapshot.position.blendStrengthOverride || 35) * smallLogoFactor,
    shadeBlend: snapshot.position.blendFactorOverride || 0.6,
    zone: zoneForSnapshot(snapshot),
    cacheKey: `${snapshot.garmentCacheKey}:${snapshot.position.id}:${width}x${height}`,
    logoAverageLuminance: averageLogoLuminance(logoImageData),
  });

  ctx.clearRect(0, 0, width, height);
  fitImage(ctx, garment, width, height);

  const processedCanvas = document.createElement("canvas");
  processedCanvas.width = width;
  processedCanvas.height = height;
  const processedCtx = processedCanvas.getContext("2d");
  if (!processedCtx) throw new Error("Canvas procesado no disponible.");
  processedCtx.putImageData(response.logoLayer, 0, 0);

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = width;
  shadowCanvas.height = height;
  const shadowCtx = shadowCanvas.getContext("2d");
  if (!shadowCtx) throw new Error("Canvas de sombra no disponible.");
  shadowCtx.putImageData(response.shadowLayer, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(shadowCanvas, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = snapshot.method === "bordado" ? 0.92 : 0.96;
  ctx.globalCompositeOperation = response.blendMode;
  ctx.drawImage(processedCanvas, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = snapshot.method === "bordado" ? 0.18 : 0.08;
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(processedCanvas, 0, 0);
  ctx.restore();
}

export async function renderRealisticMockup(
  canvas: HTMLCanvasElement,
  snapshot: MockupSnapshot,
) {
  await renderToCanvas(canvas, snapshot);
}

export async function exportMockup(
  snapshot: MockupSnapshot,
  format: ExportFormat,
  fileName: string,
) {
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
  const exportCanvas = document.createElement("canvas");
  await renderToCanvas(exportCanvas, scaleSnapshot(snapshot, scale));
  const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
  exportCanvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${fileName}.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    mimeType,
    format === "jpg" ? 0.92 : undefined,
  );
}
