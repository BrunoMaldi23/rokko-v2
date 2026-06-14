"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { Canvas } from "fabric";

type SyncOptions = {
  fabricCanvas: Canvas | null;
  fps?: number;
};

type SyncResult = {
  canvasElement: HTMLCanvasElement | null;
  flush: () => void;
  ready: boolean;
  /** Increments on each sync so consumers can recreate textures */
  version: number;
};

export function useFabricToThreeSync({
  fabricCanvas,
  fps = 30,
}: SyncOptions): SyncResult {
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);
  const targetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const lastSyncRef = useRef(0);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.createElement("canvas");
    el.width = 1024;
    el.height = 1024;
    targetCanvasRef.current = el;
    setReady(true);
  }, []);

  const syncFrame = useCallback(() => {
    const target = targetCanvasRef.current;
    if (!fabricCanvas || !target) return;

    const now = performance.now();
    const interval = 1000 / fps;
    if (now - lastSyncRef.current < interval) {
      rafRef.current = requestAnimationFrame(syncFrame);
      return;
    }

    const fabricEl = fabricCanvas.lowerCanvasEl;
    if (!fabricEl) return;
    if (fabricEl.width !== target.width || fabricEl.height !== target.height) {
      target.width = fabricEl.width;
      target.height = fabricEl.height;
    }

    const ctx = target.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(fabricEl, 0, 0);

    lastSyncRef.current = now;
    console.log("[FabricSync] synced canvas", fabricEl.width, "x", fabricEl.height);
    setVersion(v => v + 1);
  }, [fabricCanvas, fps]);

  useEffect(() => {
    if (!fabricCanvas) return;

    // Immediate sync to capture current canvas state
    syncFrame();

    const markDirty = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(syncFrame);
    };

    fabricCanvas.on("object:modified", markDirty);
    fabricCanvas.on("object:added", markDirty);
    fabricCanvas.on("object:removed", markDirty);
    fabricCanvas.on("path:created", markDirty);
    fabricCanvas.on("after:render", markDirty);

    return () => {
      fabricCanvas.off("object:modified", markDirty);
      fabricCanvas.off("object:added", markDirty);
      fabricCanvas.off("object:removed", markDirty);
      fabricCanvas.off("path:created", markDirty);
      fabricCanvas.off("after:render", markDirty);
      cancelAnimationFrame(rafRef.current);
    };
  }, [fabricCanvas, syncFrame]);

  const flush = useCallback(() => {
    lastSyncRef.current = 0;
    syncFrame();
  }, [syncFrame]);

  return {
    canvasElement: targetCanvasRef.current,
    flush,
    ready,
    version,
  };
}
