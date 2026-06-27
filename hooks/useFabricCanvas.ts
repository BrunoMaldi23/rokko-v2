import { useCallback, useEffect, useRef, useState } from "react";
import {
  createFabricEditor,
  getEditorSnapshot,
  setGarmentBackground,
  setLogoPosition,
  setLogoScale,
  setLogoSource,
  subscribeToEditorChanges,
  type FabricEditor,
  type FabricEditorSnapshot,
} from "@/canvas/fabricEditor";
import type { ResolvedPositionConfig } from "@/types/mockup.types";

export function useFabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorRef = useRef<FabricEditor | null>(null);
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement || editorRef.current) return;

    const editor = createFabricEditor(canvasElement);
    editorRef.current = editor;
    setReady(true);
    const unsubscribe = subscribeToEditorChanges(editor, () =>
      setRevision((current) => current + 1),
    );

    return () => {
      unsubscribe();
      editor.canvas.dispose();
      editorRef.current = null;
    };
  }, []);

  const loadGarment = useCallback(async (imageUrl: string) => {
    const editor = editorRef.current;
    if (!editor || !imageUrl) return;
    await setGarmentBackground(editor, imageUrl);
    setRevision((current) => current + 1);
  }, []);

  const loadLogo = useCallback(async (source: string, position: ResolvedPositionConfig) => {
    const editor = editorRef.current;
    if (!editor || !source) return;
    await setLogoSource(editor, source, position);
    setRevision((current) => current + 1);
  }, []);

  const applyPosition = useCallback((position: ResolvedPositionConfig, scale: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    setLogoPosition(editor, position, scale);
    setRevision((current) => current + 1);
  }, []);

  const applyScale = useCallback((position: ResolvedPositionConfig, scale: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    setLogoScale(editor, position, scale);
    setRevision((current) => current + 1);
  }, []);

  const getSnapshot = useCallback((): FabricEditorSnapshot | null => {
    const editor = editorRef.current;
    if (!editor) return null;
    return getEditorSnapshot(editor);
  }, []);

  return {
    canvasRef,
    ready,
    revision,
    loadGarment,
    loadLogo,
    applyPosition,
    applyScale,
    getSnapshot,
  };
}
