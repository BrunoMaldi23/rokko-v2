"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Canvas, Image as FabricImage, FabricText } from "fabric";
import { getGarmentConfig, VIEW_ANGLES } from "@/lib/garmentMap";
import type { GarmentView } from "@/lib/garmentMap";

type Props = {
  productImageUrl: string;
  productName: string;
  productShortName: string;
  logoSrc: string | null;
  garmentColor?: string;
  onLogoUpload: (file: File) => void;
  onPositionChange?: (pos: {
    left: number;
    top: number;
    scaleX: number;
    scaleY: number;
  }) => void;
  initialPosition?: {
    left: number;
    top: number;
    scaleX: number;
    scaleY: number;
  };
  activePosition?: string;
  onActivePositionChange?: (label: string) => void;
  onCanvasReady?: (canvas: Canvas) => void;
  onRemoveLogo?: () => void;
  onColorChange?: (hex: string) => void;
  // FIX: these two props were declared in the parent but not passed here
  skipTint?: boolean;
};

const CANVAS_W = 600;
const CANVAS_H = 660;

let canvasInitCounter = 0;

export default function FabricEditor({
  productImageUrl,
  productName,
  productShortName,
  logoSrc,
  garmentColor,
  onLogoUpload,
  onPositionChange,
  initialPosition,
  activePosition,
  onActivePositionChange,
  onCanvasReady,
  onRemoveLogo,
  onColorChange,
}: Props) {
  const garmentConfig = useMemo(
    () => getGarmentConfig(productName, productShortName),
    [productName, productShortName]
  );
  const [view, setView] = useState<GarmentView>(garmentConfig.defaultView);

  const canvasEl = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const logoObjRef = useRef<FabricImage | null>(null);
  const [ready, setReady] = useState(false);
  const [logoScale, setLogoScale] = useState(0.25);
  const [imgError, setImgError] = useState(false);
  // FIX: track actual rendered size so logo coords stay in sync with visual
  const [containerSize, setContainerSize] = useState({ w: CANVAS_W, h: CANVAS_H });
  const [animating, setAnimating] = useState(false);
  const initKey = useRef(0);
  const [activeTool, setActiveTool] = useState<"select" | "text" | "color">("select");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");

  // --- Canvas init ---
  useEffect(() => {
    if (!canvasEl.current) return;
    const key = ++canvasInitCounter;
    initKey.current = key;

    const c = new Canvas(canvasEl.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: "transparent",
      selection: true,
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

  // --- Expose canvas to parent ---
  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    onCanvasReady?.(canvasRef.current);
  }, [ready, onCanvasReady]);

  // FIX: measure the actual rendered container size so we can map
  // logo positions correctly regardless of CSS scale applied to wrapper.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width || CANVAS_W, h: rect.height || CANVAS_H });
      if (canvasRef.current) canvasRef.current.calcOffset();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // FIX: scaleFactor now derived from actual container vs canvas logical size.
  // The CSS transform wrapping the canvas must use this same value so pointer
  // events land on the right pixel.
  const scaleFactor = Math.min(containerSize.w / CANVAS_W, 1);

  // --- Logo image ---
  // FIX: Fabric v6 changed the signature of fromURL.
  // Old: FabricImage.fromURL(src, options)  ← options was second arg (image options)
  // New: FabricImage.fromURL(src, callbacks?, fabricOptions?)
  // crossOrigin must be passed as the third argument (fabricOptions).
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

    // Fabric v6 correct signature: fromURL(url, options?, fabricImageOptions?)
    FabricImage.fromURL(
      logoSrc,
      {}, // callbacks / options (empty)
      { crossOrigin: "anonymous" } // ← FIX: was second arg, must be third in v6
    )
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
          cornerColor: "#0090a0",
          cornerStrokeColor: "#0090a0",
          cornerSize: 12,
          transparentCorners: false,
          borderColor: "#0090a0",
          padding: 6,
          borderScaleFactor: 1.5,
        });
        c.add(logo);
        c.setActiveObject(logo);
        logoObjRef.current = logo;
        c.renderAll();
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      onPositionChange?.({
        left: obj.left || 0,
        top: obj.top || 0,
        scaleX: s,
        scaleY: s,
      });
    };
    c.on("object:modified", handler);
    return () => {
      c.off("object:modified", handler);
    };
  }, [ready, onPositionChange]);

  // --- Add text ---
  const handleAddText = useCallback(() => {
    if (!canvasRef.current || !textInput.trim()) return;
    const text = new FabricText(textInput, {
      left: CANVAS_W * 0.5,
      top: CANVAS_H * 0.5,
      fontFamily: "Arial",
      fontSize: 36,
      fill: textColor,
      originX: "center",
      originY: "center",
      cornerColor: "#0090a0",
      cornerStrokeColor: "#0090a0",
      cornerSize: 12,
      transparentCorners: false,
      borderColor: "#0090a0",
      padding: 6,
      borderScaleFactor: 1.5,
    });
    canvasRef.current.add(text);
    canvasRef.current.setActiveObject(text);
    canvasRef.current.renderAll();
    setTextInput("");
  }, [textInput, textColor]);

  // --- Logo slider ---
  const handleScale = useCallback(
    (val: number) => {
      setLogoScale(val);
      if (!canvasRef.current || !logoObjRef.current) return;
      const logo = logoObjRef.current;
      logo.set({ scaleX: val, scaleY: val });
      logo.setCoords();
      canvasRef.current.renderAll();
      onPositionChange?.({
        left: logo.left || 0,
        top: logo.top || 0,
        scaleX: val,
        scaleY: val,
      });
    },
    [onPositionChange]
  );

  // --- Preset position ---
  const handlePreset = useCallback(
    (label: string, leftPct: number, topPct: number) => {
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
    },
    [onPositionChange, onActivePositionChange]
  );

  // --- View change ---
  const handleViewChange = useCallback(
    (v: GarmentView) => {
      setAnimating(true);
      setView(v);
      const p = garmentConfig.positions[v][0];
      handlePreset(p.label, p.left, p.top);
      setTimeout(() => setAnimating(false), 400);
    },
    [garmentConfig, handlePreset]
  );

  // --- Delete selected ---
  const handleDeleteSelected = useCallback(() => {
    if (!canvasRef.current) return;
    const active = canvasRef.current.getActiveObject();
    if (active) {
      canvasRef.current.remove(active);
      canvasRef.current.discardActiveObject();
      canvasRef.current.renderAll();
    }
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const positions = garmentConfig.positions[view];
  const viewAngle = VIEW_ANGLES[view];
  const availableViews = garmentConfig.views;

  const allViews: GarmentView[] = [
    "frontal",
    "tres_cuatro_izq",
    "tres_cuatro_der",
    "espalda",
  ];
  const sortedViews = allViews.filter((v) => availableViews.includes(v));

  return (
    <div className="space-y-4 w-full">
      {/* View selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sortedViews.map((v) => {
          const angle = VIEW_ANGLES[v];
          return (
            <button
              key={v}
              type="button"
              onClick={() => handleViewChange(v)}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                view === v
                  ? "bg-accent text-white shadow-md shadow-accent/20 scale-105"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-accent hover:text-accent hover:shadow-sm"
              }`}
            >
              {v === "frontal" && (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 3L3 8v8l9 5 9-5V8l-9-5z" /><path d="M12 3v18" /><path d="M3 8l9 5 9-5" />
                </svg>
              )}
              {v === "tres_cuatro_izq" && (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 3L3 8v8l5 2.8" /><path d="M12 3v18" /><path d="M3 8l5 2.8" />
                </svg>
              )}
              {v === "tres_cuatro_der" && (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 3l9 5v8l-5 2.8" /><path d="M12 3v18" /><path d="M21 8l-5 2.8" />
                </svg>
              )}
              {v === "espalda" && (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 21l9-5V8l-9-5-9 5v8l9 5z" /><path d="M12 3v18" /><path d="M21 8l-9 5-9-5" />
                </svg>
              )}
              {angle.label}
            </button>
          );
        })}
      </div>

      {/* Main viewer */}
      {/* FIX: wrapperRef now placed on the visible container so ResizeObserver
          measures the real rendered width, not the raw canvas size. */}
      <div ref={wrapperRef} className="mx-auto w-full" style={{ maxWidth: CANVAS_W }}>
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg"
          style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
        >
          {/* Product image — 2.5D transform for view angles */}
          <div className="absolute inset-0" style={{ perspective: "1000px" }}>
            <div
              className="w-full h-full transition-transform duration-500 ease-out"
              style={{
                transform: `rotateY(${viewAngle.rotateY}deg) scale(${viewAngle.scale || 1})`,
                transformStyle: "preserve-3d",
              }}
            >
              {!imgError ? (
                <img
                  src={productImageUrl}
                  alt="Prenda"
                  className="w-full h-full object-contain"
                  onError={() => setImgError(true)}
                  draggable={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-100">
                  <p className="text-xs font-medium text-slate-400">Imagen no disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* FIX: Fabric canvas overlay.
              The canvas is always 600×660 internally. We scale it down with CSS
              transform so it visually fits the container. The key fix is that
              we derive scaleFactor from the ACTUAL container size (via
              ResizeObserver on wrapperRef) instead of parentElement.clientWidth,
              which was unreliable inside flex/grid layouts.

              We do NOT apply rotateY here — the logo stays flat on the image,
              which is correct for the 2D editor. The 3D scene handles depth. */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div
              className="origin-top-left"
              style={{
                transform: `scale(${scaleFactor})`,
                width: CANVAS_W,
                height: CANVAS_H,
              }}
            >
              <canvas ref={canvasEl} className="pointer-events-auto" />
            </div>
          </div>

          {/* View badge */}
          <div className="absolute top-3 left-3 z-20 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
            {viewAngle.label}
          </div>
        </div>
      </div>

      {/* Tool bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTool("select")}
          className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
            activeTool === "select"
              ? "bg-accent text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          Seleccionar
        </button>
        <button
          type="button"
          onClick={() => setActiveTool("text")}
          className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
            activeTool === "text"
              ? "bg-accent text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          Texto
        </button>
        <button
          type="button"
          onClick={handleDeleteSelected}
          className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-100 transition-all"
        >
          Eliminar selección
        </button>
      </div>

      {/* Text input panel */}
      {activeTool === "text" && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddText();
            }}
            placeholder="Escribe tu texto..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-accent focus:outline-none"
          />
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-lg border border-slate-200"
          />
          <button
            type="button"
            onClick={handleAddText}
            disabled={!textInput.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-[11px] font-bold text-white hover:bg-accent/90 disabled:opacity-40 transition-all"
          >
            Agregar
          </button>
        </div>
      )}

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
            <label className="text-[11px] font-bold text-slate-400 shrink-0">
              Tamaño
            </label>
            <input
              type="range"
              min={0.05}
              max={0.5}
              step={0.01}
              value={logoScale}
              onChange={(e) => handleScale(Number(e.target.value))}
              className="w-full accent-accent h-1.5 cursor-pointer"
            />
            <span className="text-[11px] font-bold text-slate-600 w-8 text-right tabular-nums">
              {Math.round(logoScale * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Upload + remove */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
          <span className="text-[11px] font-medium text-slate-400">
            Arrastra y redimensiona sobre la prenda
          </span>
        )}
        {logoSrc && onRemoveLogo && (
          <button
            type="button"
            onClick={onRemoveLogo}
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 transition-all hover:bg-red-100"
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}