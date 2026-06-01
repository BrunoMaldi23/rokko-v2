"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Canvas, Image as FabricImage, Rect } from "fabric";

const PRESET_POSITIONS = [
  { label: "Pecho izquierdo", left: 0.15, top: 0.35 },
  { label: "Pecho derecho", left: 0.58, top: 0.35 },
  { label: "Pecho centro", left: 0.38, top: 0.36 },
  { label: "Espalda alta", left: 0.38, top: 0.24 },
  { label: "Manga izquierda", left: 0.06, top: 0.38 },
  { label: "Manga derecha", left: 0.7, top: 0.38 },
];

type Props = {
  productImageUrl: string;
  logoSrc: string | null;
  onLogoUpload: (file: File) => void;
  onPositionChange?: (pos: { left: number; top: number; scaleX: number; scaleY: number }) => void;
  initialPosition?: { left: number; top: number; scaleX: number; scaleY: number };
  activePosition?: string;
  onActivePositionChange?: (label: string) => void;
};

export default function LogoEditor({
  productImageUrl,
  logoSrc,
  onLogoUpload,
  onPositionChange,
  initialPosition,
  activePosition,
  onActivePositionChange,
}: Props) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const logoObjRef = useRef<FabricImage | null>(null);
  const [ready, setReady] = useState(false);

  const CANVAS_W = 420;
  const CANVAS_H = 420;

  useEffect(() => {
    if (!canvasEl.current) return;
    const c = new Canvas(canvasEl.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: "#f1f5f9",
      selection: false,
    });
    canvasRef.current = c;
    setReady(true);
    return () => {
      c.dispose();
      canvasRef.current = null;
      logoObjRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const c = canvasRef.current;
    FabricImage.fromURL(productImageUrl, { crossOrigin: "anonymous" }).then((img) => {
      const scale = Math.min(CANVAS_W / img.width!, CANVAS_H / img.height!);
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (CANVAS_W - img.width! * scale) / 2,
        top: (CANVAS_H - img.height! * scale) / 2,
        selectable: false,
        evented: false,
      });
      c.backgroundImage?.dispose();
      c.backgroundImage = img;
      c.renderAll();
    });
  }, [productImageUrl, ready]);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const c = canvasRef.current;

    if (logoObjRef.current) {
      c.remove(logoObjRef.current);
      logoObjRef.current = null;
    }

    if (!logoSrc) {
      c.renderAll();
      return;
    }

    FabricImage.fromURL(logoSrc, { crossOrigin: "anonymous" }).then((logo) => {
      logo.set({
        left: initialPosition?.left ?? CANVAS_W * 0.38,
        top: initialPosition?.top ?? CANVAS_H * 0.36,
        scaleX: initialPosition?.scaleX ?? 0.25,
        scaleY: initialPosition?.scaleY ?? 0.25,
        cornerColor: "#b8614a",
        cornerStrokeColor: "#b8614a",
        cornerSize: 10,
        transparentCorners: false,
        borderColor: "#b8614a",
        padding: 4,
      });
      c.add(logo);
      c.setActiveObject(logo);
      logoObjRef.current = logo;
      c.renderAll();
    });
  }, [logoSrc, ready]);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const c = canvasRef.current;

    const handler = () => {
      const obj = logoObjRef.current;
      if (!obj) return;
      onPositionChange?.({
        left: obj.left || 0,
        top: obj.top || 0,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1,
      });
    };

    c.on("object:modified", handler);
    return () => { c.off("object:modified", handler); };
  }, [ready, onPositionChange]);

  const handlePreset = useCallback((label: string, leftPct: number, topPct: number) => {
    if (!canvasRef.current || !logoObjRef.current) return;
    const logo = logoObjRef.current;
    logo.set({
      left: CANVAS_W * leftPct,
      top: CANVAS_H * topPct,
    });
    logo.setCoords();
    canvasRef.current.renderAll();
    onPositionChange?.({
      left: logo.left || 0,
      top: logo.top || 0,
      scaleX: logo.scaleX || 1,
      scaleY: logo.scaleY || 1,
    });
    onActivePositionChange?.(label);
  }, [onPositionChange, onActivePositionChange]);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative mx-auto flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner"
        style={{ maxWidth: CANVAS_W }}
      >
        <canvas ref={canvasEl} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onLogoUpload(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent/90 active:scale-95"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          {logoSrc ? "Cambiar logo" : "Subir logo"}
        </button>

        {logoSrc && (
          <>
            <span className="text-[11px] text-slate-400">|</span>
            <span className="text-[11px] font-medium text-slate-400">Arrastra y redimensiona sobre la prenda</span>
          </>
        )}
      </div>

      {logoSrc && (
        <div className="flex flex-wrap gap-1.5">
          {PRESET_POSITIONS.map((pos) => (
            <button
              key={pos.label}
              type="button"
              onClick={() => handlePreset(pos.label, pos.left, pos.top)}
              className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all ${
                activePosition === pos.label
                  ? "border-accent bg-accent text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-accent hover:text-accent"
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
