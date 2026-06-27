"use client";

import type { PointerEvent } from "react";
import { useMemo, useRef, useState } from "react";
import type { BlendMode, MockupPositionId, PositionConfig } from "@/types/mockup.types";

type Point = { x: number; y: number };
type Box = { x: number; y: number; width: number; height: number };

const sampleLogo =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120"><rect width="320" height="120" rx="18" fill="white" fill-opacity=".88"/><text x="160" y="73" text-anchor="middle" font-family="Arial" font-size="54" font-weight="900" fill="#087181">ROKKO</text></svg>`,
  );

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function CalibrationTool() {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [naturalSize, setNaturalSize] = useState({ width: 720, height: 860 });
  const [box, setBox] = useState<Box>({ x: 180, y: 170, width: 260, height: 240 });
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [positionId, setPositionId] = useState<MockupPositionId>("pecho_centro");
  const [strength, setStrength] = useState(35);
  const [blendFactor, setBlendFactor] = useState(0.6);
  const [blendMode, setBlendMode] = useState<BlendMode>("multiply");

  const json = useMemo(() => {
    const config: PositionConfig & { calibratedBlendMode: BlendMode } = {
      id: positionId,
      label:
        positionId === "pecho_izquierdo"
          ? "Pecho izquierdo"
          : positionId === "pecho_derecho"
            ? "Pecho derecho"
            : positionId === "pecho_centro"
              ? "Pecho centro"
              : positionId === "manga_izquierda"
                ? "Manga izquierda"
                : positionId === "manga_derecha"
                  ? "Manga derecha"
                  : "Espalda centro",
      garmentView:
        positionId === "espalda_centro"
          ? "espalda"
          : positionId === "manga_izquierda" || positionId === "manga_derecha"
            ? "manga"
            : "frente",
      defaultX: clamp((box.x + box.width / 2) / naturalSize.width, 0, 1),
      defaultY: clamp((box.y + box.height / 2) / naturalSize.height, 0, 1),
      maxWidthRatio: clamp(box.width / naturalSize.width, 0.05, 0.6),
      displacementZone: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
      },
      blendStrengthOverride: strength,
      blendFactorOverride: blendFactor,
      calibratedBlendMode: blendMode,
    };
    return JSON.stringify(config, null, 2);
  }, [blendFactor, blendMode, box, naturalSize, positionId, strength]);

  if (process.env.NODE_ENV !== "development") return null;

  function handleImage(file: File | undefined) {
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
  }

  function pointFromEvent(event: PointerEvent<HTMLDivElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * naturalSize.width, 0, naturalSize.width),
      y: clamp(((event.clientY - rect.top) / rect.height) * naturalSize.height, 0, naturalSize.height),
    };
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const point = pointFromEvent(event);
    setDragStart(point);
    setBox({ x: point.x, y: point.y, width: 1, height: 1 });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart) return;
    const point = pointFromEvent(event);
    setBox({
      x: Math.min(dragStart.x, point.x),
      y: Math.min(dragStart.y, point.y),
      width: Math.max(1, Math.abs(point.x - dragStart.x)),
      height: Math.max(1, Math.abs(point.y - dragStart.y)),
    });
  }

  return (
    <details className="mt-5 rounded-2xl border border-dashed border-[#46b9c8]/50 bg-[#f3f8fa] p-4">
      <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.18em] text-[#087181]">
        Calibracion interna
      </summary>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <label className="mb-3 inline-flex h-9 cursor-pointer items-center rounded-xl border border-[#dce8eb] bg-white px-3 text-xs font-black text-[#3f5258]">
            <input
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={(event) => handleImage(event.target.files?.[0])}
            />
            Cargar prenda
          </label>
          <div
            className="relative aspect-[720/860] overflow-hidden rounded-xl border border-[#dce8eb] bg-white"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragStart(null)}
          >
            {imageUrl ? (
              <img
                ref={imageRef}
                src={imageUrl}
                alt=""
                className="h-full w-full object-contain"
                onLoad={(event) =>
                  setNaturalSize({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-bold text-[#3f5258]">
                Carga una imagen para calibrar.
              </div>
            )}
            <div
              className="absolute border-2 border-[#46b9c8] bg-[#46b9c8]/16"
              style={{
                left: `${(box.x / naturalSize.width) * 100}%`,
                top: `${(box.y / naturalSize.height) * 100}%`,
                width: `${(box.width / naturalSize.width) * 100}%`,
                height: `${(box.height / naturalSize.height) * 100}%`,
              }}
            />
            <img
              src={sampleLogo}
              alt=""
              className="pointer-events-none absolute opacity-80 mix-blend-multiply"
              style={{
                left: `${((box.x + box.width / 2) / naturalSize.width) * 100}%`,
                top: `${((box.y + box.height / 2) / naturalSize.height) * 100}%`,
                width: `${(box.width / naturalSize.width) * 100}%`,
                transform: "translate(-50%, -50%)",
                filter: `contrast(${1 + blendFactor * 0.45}) saturate(${1 + strength / 220})`,
                mixBlendMode: blendMode,
              }}
            />
          </div>
        </div>
        <div className="space-y-3">
          <select
            value={positionId}
            onChange={(event) => setPositionId(event.target.value as MockupPositionId)}
            className="admin-control"
          >
            <option value="pecho_izquierdo">Pecho izquierdo</option>
            <option value="pecho_centro">Pecho centro</option>
            <option value="pecho_derecho">Pecho derecho</option>
            <option value="manga_izquierda">Manga izquierda</option>
            <option value="manga_derecha">Manga derecha</option>
            <option value="espalda_centro">Espalda centro</option>
          </select>
          <label className="block text-xs font-bold text-[#3f5258]">
            Strength {strength}
            <input
              type="range"
              min="0"
              max="100"
              value={strength}
              onChange={(event) => setStrength(Number(event.target.value))}
              className="mt-1 w-full accent-[#46b9c8]"
            />
          </label>
          <label className="block text-xs font-bold text-[#3f5258]">
            Blend {blendFactor.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={blendFactor}
              onChange={(event) => setBlendFactor(Number(event.target.value))}
              className="mt-1 w-full accent-[#46b9c8]"
            />
          </label>
          <select
            value={blendMode}
            onChange={(event) => setBlendMode(event.target.value as BlendMode)}
            className="admin-control"
          >
            <option value="multiply">multiply</option>
            <option value="soft-light">soft-light</option>
            <option value="screen">screen</option>
          </select>
          <pre className="max-h-72 overflow-auto rounded-xl bg-[#2d3436] p-3 text-[10px] font-bold text-white">
            {json}
          </pre>
        </div>
      </div>
    </details>
  );
}
