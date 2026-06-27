import {
  Canvas,
  FabricImage,
  type FabricObject,
} from "fabric";
import type { LogoTransform, ResolvedPositionConfig } from "@/types/mockup.types";

export const MOCKUP_CANVAS_WIDTH = 460;
export const MOCKUP_CANVAS_HEIGHT = 550;

export type FabricEditor = {
  canvas: Canvas;
  logo: FabricObject | null;
  garment: FabricImage | null;
  logoSource: string;
};

export type FabricEditorSnapshot = {
  logoSource: string;
  transform: LogoTransform;
};

export function createDefaultLogoSource() {
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#087181";
  ctx.font = "900 72px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ROKKO", canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL("image/png");
}

function configureLogoObject(object: FabricObject) {
  object.set({
    originX: "center",
    originY: "center",
    cornerColor: "#46b9c8",
    cornerStrokeColor: "#0b7280",
    borderColor: "#0b7280",
    transparentCorners: false,
    cornerSize: 11,
    padding: 6,
  });
}

export function createFabricEditor(canvasElement: HTMLCanvasElement): FabricEditor {
  const canvas = new Canvas(canvasElement, {
    backgroundColor: "rgba(255,255,255,0)",
    preserveObjectStacking: true,
    selection: false,
    width: MOCKUP_CANVAS_WIDTH,
    height: MOCKUP_CANVAS_HEIGHT,
  });

  return {
    canvas,
    logo: null,
    garment: null,
    logoSource: createDefaultLogoSource(),
  };
}

export async function setGarmentBackground(editor: FabricEditor, imageUrl: string) {
  if (editor.garment) {
    editor.canvas.remove(editor.garment);
    editor.garment = null;
  }

  const image = await FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" });
  const canvasWidth = editor.canvas.getWidth();
  const canvasHeight = editor.canvas.getHeight();
  const sourceWidth = image.width || canvasWidth;
  const sourceHeight = image.height || canvasHeight;
  const scale = Math.min(canvasWidth / sourceWidth, canvasHeight / sourceHeight) * 0.92;

  image.set({
    left: canvasWidth / 2,
    top: canvasHeight / 2,
    originX: "center",
    originY: "center",
    scaleX: scale,
    scaleY: scale,
    selectable: false,
    evented: false,
  });

  editor.garment = image;
  editor.canvas.add(image);
  editor.canvas.sendObjectToBack(image);
  editor.canvas.requestRenderAll();
}

export async function setLogoSource(
  editor: FabricEditor,
  source: string,
  position: ResolvedPositionConfig,
) {
  if (editor.logo) {
    editor.canvas.remove(editor.logo);
    editor.logo = null;
  }

  const image = await FabricImage.fromURL(source, { crossOrigin: "anonymous" });
  configureLogoObject(image);
  editor.logo = image;
  editor.logoSource = source;
  editor.canvas.add(image);
  setLogoPosition(editor, position, 1);
}

export function setLogoPosition(
  editor: FabricEditor,
  position: ResolvedPositionConfig,
  scaleMultiplier: number,
) {
  if (!editor.logo) return;
  const canvasWidth = editor.canvas.getWidth();
  const canvasHeight = editor.canvas.getHeight();
  const objectWidth = editor.logo.width || 1;
  const targetWidth = canvasWidth * position.maxWidthRatio * Math.min(scaleMultiplier, 1);
  const scale = targetWidth / objectWidth;

  editor.logo.set({
    left: canvasWidth * position.defaultX,
    top: canvasHeight * position.defaultY,
    angle: position.defaultRotation,
    scaleX: scale,
    scaleY: scale,
    opacity: 1,
  });
  editor.canvas.setActiveObject(editor.logo);
  editor.canvas.requestRenderAll();
}

export function setLogoScale(
  editor: FabricEditor,
  position: ResolvedPositionConfig,
  scaleMultiplier: number,
) {
  if (!editor.logo) return;
  const objectWidth = editor.logo.width || 1;
  const targetWidth =
    editor.canvas.getWidth() * position.maxWidthRatio * Math.min(scaleMultiplier, 1);
  const scale = targetWidth / objectWidth;
  editor.logo.set({ scaleX: scale, scaleY: scale });
  editor.canvas.requestRenderAll();
}

export function getEditorSnapshot(editor: FabricEditor): FabricEditorSnapshot | null {
  if (!editor.logo) return null;
  return {
    logoSource: editor.logoSource,
    transform: {
      left: editor.logo.left || 0,
      top: editor.logo.top || 0,
      width: editor.logo.width || 1,
      height: editor.logo.height || 1,
      scaleX: editor.logo.scaleX || 1,
      scaleY: editor.logo.scaleY || 1,
      angle: editor.logo.angle || 0,
      opacity: editor.logo.opacity ?? 1,
    },
  };
}

export function subscribeToEditorChanges(
  editor: FabricEditor,
  callback: () => void,
) {
  const handler = () => callback();
  editor.canvas.on("object:moving", handler);
  editor.canvas.on("object:scaling", handler);
  editor.canvas.on("object:rotating", handler);
  editor.canvas.on("object:modified", handler);

  return () => {
    editor.canvas.off("object:moving", handler);
    editor.canvas.off("object:scaling", handler);
    editor.canvas.off("object:rotating", handler);
    editor.canvas.off("object:modified", handler);
  };
}
