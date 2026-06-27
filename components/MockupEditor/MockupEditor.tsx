"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createDefaultLogoSource,
  MOCKUP_CANVAS_HEIGHT,
  MOCKUP_CANVAS_WIDTH,
} from "@/canvas/fabricEditor";
import { createMockupPositions, findMockupPosition } from "@/config/positions";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useLogoUpload } from "@/hooks/useLogoUpload";
import { useRealisticRender } from "@/hooks/useRealisticRender";
import type {
  DecorationMethod,
  MockupPositionId,
  ProductMockupCalibration,
  ProductMockupCalibrationMap,
} from "@/types/mockup.types";
import ExportButton from "./ExportButton";
import LogoUploader from "./LogoUploader";
import PositionSelector from "./PositionSelector";

type MockupEditorProps = {
  productName: string;
  currentImage: string;
  galleryImages: string[];
  colorSelector?: ReactNode;
  calibrations?: ProductMockupCalibrationMap | null;
  calibrationMode?: boolean;
  onSaveCalibration?: (calibration: ProductMockupCalibration) => void;
};

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "mockup-rokko";
}

export default function MockupEditor({
  productName,
  currentImage,
  galleryImages,
  colorSelector,
  calibrations,
  calibrationMode = false,
  onSaveCalibration,
}: MockupEditorProps) {
  const [method, setMethod] = useState<DecorationMethod>("bordado");
  const [positionId, setPositionId] = useState<MockupPositionId>("pecho_izquierdo");
  const [logoScale, setLogoScale] = useState(0.82);
  const [logoSource, setLogoSource] = useState("");
  const [logoName, setLogoName] = useState("Logo ROKKO");
  const previewRef = useRef<HTMLDivElement | null>(null);
  const logoUpload = useLogoUpload();

  const positions = useMemo(
    () =>
      createMockupPositions({
        front: currentImage,
        back: galleryImages[1] || currentImage,
        leftSleeve: galleryImages[2] || currentImage,
      }, calibrations),
    [calibrations, currentImage, galleryImages],
  );
  const position = findMockupPosition(positions, positionId);
  const fabric = useFabricCanvas();
  const {
    applyPosition,
    applyScale,
    canvasRef,
    getSnapshot,
    loadGarment,
    loadLogo,
    ready,
    revision,
  } = fabric;
  const realistic = useRealisticRender({
    editorSnapshot: getSnapshot,
    position,
    method,
    revision,
    enabled: ready && Boolean(currentImage),
  });

  useEffect(() => {
    if (!ready || logoSource) return;
    setLogoSource(createDefaultLogoSource());
  }, [ready, logoSource]);

  useEffect(() => {
    if (!ready || !position.garmentImage) return;
    void loadGarment(position.garmentImage);
  }, [loadGarment, position.garmentImage, ready]);

  useEffect(() => {
    if (!ready || !logoSource) return;
    void loadLogo(logoSource, position);
  }, [loadLogo, logoSource, position, ready]);

  useEffect(() => {
    if (!ready) return;
    applyPosition(position, logoScale);
  }, [applyPosition, position, positionId, ready]);

  useEffect(() => {
    if (!ready) return;
    applyScale(position, logoScale);
  }, [applyScale, logoScale, position, ready]);

  function saveCalibration() {
    const snapshot = getSnapshot();
    if (!snapshot || !onSaveCalibration) return;
    const width = snapshot.transform.width * snapshot.transform.scaleX;
    onSaveCalibration({
      positionId,
      defaultX: snapshot.transform.left / MOCKUP_CANVAS_WIDTH,
      defaultY: snapshot.transform.top / MOCKUP_CANVAS_HEIGHT,
      maxWidthRatio: width / MOCKUP_CANVAS_WIDTH,
      defaultRotation: snapshot.transform.angle,
      updatedAt: new Date().toISOString(),
    });
  }

  function keepPreviewInView() {
    window.setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 80);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#0b7280]/18 bg-[#eef6f8] shadow-[0_18px_48px_rgba(45,52,54,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#2d3436] via-[#0b7280] to-[#46b9c8] px-4 py-4 text-white">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#baf3f8]">
            Mockup realista
          </span>
          <p className="mt-1 text-xs font-semibold text-white/72">
            Color de prenda y logo aplicado en una sola vista editable.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-white/18 bg-white/12 p-0.5 shadow-inner shadow-black/10">
          {(["bordado", "estampado"] as DecorationMethod[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMethod(item)}
              className={`h-8 rounded-lg px-3.5 text-xs font-black capitalize transition ${
                method === item
                  ? "bg-white text-[#0b7280] shadow-sm"
                  : "text-white/78 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 p-4">
        <div
          ref={previewRef}
          className="min-w-0 rounded-xl border border-[#dce8eb] bg-gradient-to-b from-white via-[#f7fbfc] to-[#dff3f6] p-3 shadow-inner shadow-[#0b7280]/5"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3f5258]">
              Vista prenda + logo
            </span>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#087181]">
              2 en 1
            </span>
          </div>
          <div className="mx-auto w-full max-w-[460px] overflow-hidden rounded-xl border border-white bg-white shadow-[0_18px_42px_rgba(45,52,54,0.10)]">
            <canvas ref={canvasRef} className="block h-auto w-full" />
          </div>
          {realistic.rendering && (
            <span className="mt-2 inline-flex rounded-full bg-[#e4f7fa] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#087181]">
              Preparando exportacion
            </span>
          )}
          {realistic.error && (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              {realistic.error}
            </div>
          )}
        </div>
      </div>

      <canvas ref={realistic.canvasRef} className="hidden" aria-hidden="true" />

      {colorSelector && (
        <div className="border-t border-[#dce8eb] bg-[#f7fbfc] px-4 py-4">
          {colorSelector}
        </div>
      )}

      <div className="grid gap-4 bg-[#2d3436] px-4 py-4 text-white">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#79d8e3]">
            Ubicacion del logo
          </span>
          <PositionSelector
            positions={positions}
            value={positionId}
            onChange={setPositionId}
          />
        </div>

        <div className="grid gap-3">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#3f5258]">
              <span className="text-white/70">Tamano relativo</span>
              <span className="font-mono text-[#79d8e3]">{Math.round(logoScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={logoScale}
              onChange={(event) => setLogoScale(Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/18 accent-[#46b9c8]"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr]">
            <LogoUploader
              processing={logoUpload.processing}
              onLogo={async (file) => {
                const logo = await logoUpload.uploadLogo(file);
                if (logo) {
                  setLogoSource(logo.source);
                  setLogoName(logo.fileName);
                  keepPreviewInView();
                }
                return logo;
              }}
            />
            <ExportButton
              snapshot={realistic.snapshot}
              fileName={`${safeFileName(productName)}-${safeFileName(logoName)}`}
            />
          </div>
          {calibrationMode && (
            <button
              type="button"
              onClick={saveCalibration}
              className="h-10 rounded-xl border border-[#79d8e3]/30 bg-[#79d8e3] px-4 text-xs font-black text-[#0b3c43] transition hover:bg-white"
            >
              Guardar posicion actual para esta prenda
            </button>
          )}
          {(logoUpload.error || logoUpload.logo?.backgroundRemoved) && (
            <p className={`text-xs font-bold ${logoUpload.error ? "text-red-200" : "text-[#79d8e3]"}`}>
              {logoUpload.error ||
                "Fondo solido detectado y removido para mejorar el montaje."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
