"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Canvas, Image as FabricImage } from "fabric";
import { getGarmentConfig, type GarmentView } from "@/lib/garmentMap";

type Props = {
  productImageUrl: string;
  productName: string;
  productShortName: string;
  logoSrc: string | null;
  onLogoUpload: (file: File) => void;
  onPositionChange?: (pos: { left: number; top: number; scaleX: number; scaleY: number }) => void;
  initialPosition?: { left: number; top: number; scaleX: number; scaleY: number };
  activePosition?: string;
  onActivePositionChange?: (label: string) => void;
};

const CANVAS_W = 600;
const CANVAS_H = 660;

let canvasInitCounter = 0;

export default function LogoEditor({
  productImageUrl,
  productName,
  productShortName,
  logoSrc,
  onLogoUpload,
  onPositionChange,
  initialPosition,
  activePosition,
  onActivePositionChange,
}: Props) {
  const garmentConfig = useMemo(() => getGarmentConfig(productName, productShortName), [productName, productShortName]);
  const [view, setView] = useState<GarmentView>(garmentConfig.defaultView);

  const canvasEl = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const logoObjRef = useRef<FabricImage | null>(null);
  const [ready, setReady] = useState(false);
  const [logoScale, setLogoScale] = useState(0.25);
  const [imgError, setImgError] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const initKey = useRef(0);

  // --- Canvas init: fixed size, never re-created ---
  useEffect(() => {
    if (!canvasEl.current) return;
    const key = ++canvasInitCounter;
    initKey.current = key;

    const c = new Canvas(canvasEl.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: "transparent",
      selection: false,
      preserveObjectStacking: true,
    });
    canvasRef.current = c;
    setReady(true);

    return () => {
      initKey.current = -1;
      logoObjRef.current = null;
      c.dispose();
      canvasRef.current = null;
    };
  }, []);

  // --- Responsive CSS scale + Fabric calcOffset ---
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => {
      const parentW = el.parentElement?.clientWidth || CANVAS_W;
      const factor = Math.min(parentW / CANVAS_W, 1);
      setScaleFactor(factor);
      if (canvasRef.current) canvasRef.current.calcOffset();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.parentElement!);
    return () => ro.disconnect();
  }, []);

  // --- Recalc canvas offset when ready (needed after resize for correct mouse events) ---
  useEffect(() => {
    if (!ready || !canvasRef.current || !wrapperRef.current) return;
    canvasRef.current.calcOffset();
    const parentW = wrapperRef.current.parentElement?.clientWidth || CANVAS_W;
    setScaleFactor(Math.min(parentW / CANVAS_W, 1));
  }, [ready]);

  // --- Logo image (only when logoSrc changes) ---
  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const key = initKey.current;
    const c = canvasRef.current;

    if (logoObjRef.current) {
      c.remove(logoObjRef.current);
      logoObjRef.current.dispose();
      logoObjRef.current = null;
    }

    if (!logoSrc) {
      c.renderAll();
      return;
    }

    FabricImage.fromURL(logoSrc, { crossOrigin: "anonymous" })
      .then((logo) => {
        if (key !== initKey.current || !canvasRef.current) {
          logo.dispose();
          return;
        }
        const s = initialPosition?.scaleX ?? logoScale;
        logo.set({
          left: initialPosition?.left ?? CANVAS_W * 0.38,
          top: initialPosition?.top ?? CANVAS_H * 0.36,
          scaleX: s,
          scaleY: s,
          cornerColor: "#b8614a",
          cornerStrokeColor: "#b8614a",
          cornerSize: 12,
          transparentCorners: false,
          borderColor: "#b8614a",
          padding: 6,
          borderScaleFactor: 1.5,
        });
        c.add(logo);
        c.setActiveObject(logo);
        logoObjRef.current = logo;
        c.renderAll();
      })
      .catch(() => {});
  }, [logoSrc, ready]);

  // --- Logo modify handler ---
  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const c = canvasRef.current;
    const handler = () => {
      const obj = logoObjRef.current;
      if (!obj) return;
      const s = obj.scaleX || 1;
      setLogoScale(s);
      onPositionChange?.({ left: obj.left || 0, top: obj.top || 0, scaleX: s, scaleY: s });
    };
    c.on("object:modified", handler);
    return () => { c.off("object:modified", handler); };
  }, [ready, onPositionChange]);

  // --- Logo slider ---
  const handleScale = useCallback((val: number) => {
    setLogoScale(val);
    if (!canvasRef.current || !logoObjRef.current) return;
    const logo = logoObjRef.current;
    logo.set({ scaleX: val, scaleY: val });
    logo.setCoords();
    canvasRef.current.renderAll();
    onPositionChange?.({ left: logo.left || 0, top: logo.top || 0, scaleX: val, scaleY: val });
  }, [onPositionChange]);

  // --- Preset position ---
  const handlePreset = useCallback((label: string, leftPct: number, topPct: number) => {
    if (!canvasRef.current || !logoObjRef.current) return;
    const logo = logoObjRef.current;
    logo.set({ left: CANVAS_W * leftPct, top: CANVAS_H * topPct });
    logo.setCoords();
    canvasRef.current.renderAll();
    onPositionChange?.({ left: logo.left || 0, top: logo.top || 0, scaleX: logo.scaleX || 1, scaleY: logo.scaleY || 1 });
    onActivePositionChange?.(label);
  }, [onPositionChange, onActivePositionChange]);

  const inputRef = useRef<HTMLInputElement>(null);
  const positions = garmentConfig.positions[view];
  const availableViews = garmentConfig.views;

  return (
    <div className="space-y-4 w-full">
      {/* View toggle */}
      <div className="flex items-center gap-2">
        {availableViews.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => { setView(v); const p = garmentConfig.positions[v][0]; handlePreset(p.label, p.left, p.top); }}
            className={`rounded-lg px-4 py-1.5 text-[11px] font-bold transition-all ${
              view === v ? "bg-accent text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:border-accent"
            }`}
          >
            {v === "frontal" ? "Frontal" : "Espalda"}
          </button>
        ))}
      </div>

      {/* Canvas wrapper: product image as <img> background, Fabric overlay on top */}
      <div className="mx-auto" style={{ maxWidth: CANVAS_W }}>
        <div
          ref={wrapperRef}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner"
          style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
        >
          {/* Product image as regular <img> (always works) */}
          {!imgError ? (
            <img
              src={productImageUrl}
              alt="Prenda"
              className="absolute inset-0 w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <p className="text-xs font-medium text-slate-400">Imagen no disponible</p>
            </div>
          )}

          {/* Fabric canvas on top (transparent, only logo) */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `scale(${scaleFactor})`,
              width: CANVAS_W,
              height: CANVAS_H,
            }}
          >
            <canvas ref={canvasEl} />
          </div>
        </div>
      </div>

      {/* Logo controls */}
      {logoSrc && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {positions.map((pos) => (
              <button
                key={pos.label}
                type="button"
                onClick={() => handlePreset(pos.label, pos.left, pos.top)}
                className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all ${
                  activePosition === pos.label
                    ? "border-accent bg-accent text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-accent hover:text-accent"
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[11px] font-bold text-slate-400 shrink-0">Tamaño</label>
            <input
              type="range"
              min={0.05}
              max={0.5}
              step={0.01}
              value={logoScale}
              onChange={(e) => handleScale(Number(e.target.value))}
              className="w-full accent-accent h-1.5 cursor-pointer"
            />
            <span className="text-[11px] font-bold text-slate-600 w-8 text-right tabular-nums">{Math.round(logoScale * 100)}%</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onLogoUpload(f); }} />
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
          <span className="text-[11px] font-medium text-slate-400">Arrastra y redimensiona sobre la prenda</span>
        )}
      </div>
    </div>
  );
}
