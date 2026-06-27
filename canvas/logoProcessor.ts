import { Canvg } from "canvg";
import type { LogoUploadResult, ProcessedLogo } from "@/types/mockup.types";

const allowedMimeTypes = new Set([
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);
const allowedExtensions = new Set(["svg", "png", "jpg", "jpeg"]);

function extensionOf(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo del logo."));
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer el SVG."));
    reader.readAsText(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar el logo como imagen."));
    image.src = src;
  });
}

function hasComplexSvgFeatures(svgText: string) {
  return /<(linearGradient|radialGradient|filter|clipPath|mask|pattern)\b/i.test(svgText);
}

async function svgToDataUrl(svgText: string) {
  const blob = new Blob([svgText], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, image.naturalWidth || 512);
    canvas.height = Math.max(1, image.naturalHeight || 256);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no disponible para rasterizar SVG.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function complexSvgToDataUrl(svgText: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible para procesar SVG complejo.");
  const renderer = await Canvg.from(ctx, svgText, {
    ignoreMouse: true,
    ignoreAnimation: true,
  });
  await renderer.render();
  return trimTransparentCanvas(canvas).toDataURL("image/png");
}

function trimTransparentCanvas(source: HTMLCanvasElement) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;
  const image = ctx.getImageData(0, 0, source.width, source.height);
  let minX = source.width;
  let minY = source.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const alpha = image.data[(y * source.width + x) * 4 + 3];
      if (alpha > 4) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (minX > maxX || minY > maxY) return source;
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const target = document.createElement("canvas");
  target.width = width;
  target.height = height;
  const targetCtx = target.getContext("2d");
  targetCtx?.drawImage(source, minX, minY, width, height, 0, 0, width, height);
  return target;
}

function colorDistance(
  data: Uint8ClampedArray,
  index: number,
  color: [number, number, number],
) {
  const dr = data[index] - color[0];
  const dg = data[index + 1] - color[1];
  const db = data[index + 2] - color[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function detectCornerBackground(data: Uint8ClampedArray, width: number, height: number): [number, number, number] {
  const points = [
    0,
    (width - 1) * 4,
    ((height - 1) * width) * 4,
    ((height - 1) * width + width - 1) * 4,
  ];
  const totals = points.reduce(
    (acc, index) => [acc[0] + data[index], acc[1] + data[index + 1], acc[2] + data[index + 2]],
    [0, 0, 0],
  );
  return [totals[0] / points.length, totals[1] / points.length, totals[2] / points.length];
}

function featherAlpha(data: Uint8ClampedArray, width: number, height: number) {
  const alpha = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i += 1) alpha[i] = data[i * 4 + 3];

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const current = alpha[i];
      if (current === 0 || current === 255) continue;
      const sum =
        alpha[i] +
        alpha[i - 1] +
        alpha[i + 1] +
        alpha[i - width] +
        alpha[i + width] +
        alpha[i - width - 1] +
        alpha[i - width + 1] +
        alpha[i + width - 1] +
        alpha[i + width + 1];
      data[i * 4 + 3] = Math.round(sum / 9);
    }
  }
}

async function normalizeLogoSource(source: string, fileName: string): Promise<ProcessedLogo> {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, image.naturalWidth);
  canvas.height = Math.max(1, image.naturalHeight);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas no disponible para normalizar logo.");
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let hasTransparency = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) {
      hasTransparency = true;
      break;
    }
  }

  let backgroundRemoved = false;
  if (!hasTransparency) {
    const bg = detectCornerBackground(data, canvas.width, canvas.height);
    let matchingCorners = 0;
    const corners = [
      0,
      (canvas.width - 1) * 4,
      ((canvas.height - 1) * canvas.width) * 4,
      ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4,
    ];
    for (const corner of corners) {
      if (colorDistance(data, corner, bg) < 28) matchingCorners += 1;
    }

    if (matchingCorners >= 3) {
      for (let i = 0; i < data.length; i += 4) {
        const distance = colorDistance(data, i, bg);
        if (distance < 34) data[i + 3] = 0;
        else if (distance < 58) data[i + 3] = Math.round(((distance - 34) / 24) * 255);
      }
      featherAlpha(data, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
      backgroundRemoved = true;
      hasTransparency = true;
    }
  }

  const trimmed = trimTransparentCanvas(canvas);
  return {
    source: trimmed.toDataURL("image/png"),
    fileName,
    width: trimmed.width,
    height: trimmed.height,
    hasTransparency,
    backgroundRemoved,
  };
}

export async function processLogoFile(file: File): Promise<LogoUploadResult> {
  const extension = extensionOf(file.name);
  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.type)) {
    return {
      ok: false,
      message: "Formato no permitido. Sube un logo SVG, PNG, JPG o JPEG.",
    };
  }

  try {
    if (extension === "svg" || file.type === "image/svg+xml") {
      const svgText = await readAsText(file);
      const source = hasComplexSvgFeatures(svgText)
        ? await complexSvgToDataUrl(svgText)
        : await svgToDataUrl(svgText);
      return { ok: true, logo: await normalizeLogoSource(source, file.name) };
    }

    const source = await readAsDataUrl(file);
    return { ok: true, logo: await normalizeLogoSource(source, file.name) };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo procesar el logo seleccionado.",
    };
  }
}
