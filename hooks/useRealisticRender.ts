import { useEffect, useRef, useState } from "react";
import { MOCKUP_CANVAS_HEIGHT, MOCKUP_CANVAS_WIDTH } from "@/canvas/fabricEditor";
import { renderRealisticMockup } from "@/canvas/realisticRenderer";
import type {
  DecorationMethod,
  MockupSnapshot,
  ResolvedPositionConfig,
} from "@/types/mockup.types";
import type { FabricEditorSnapshot } from "@/canvas/fabricEditor";

type UseRealisticRenderParams = {
  editorSnapshot: () => FabricEditorSnapshot | null;
  position: ResolvedPositionConfig;
  method: DecorationMethod;
  revision: number;
  enabled: boolean;
};

export function useRealisticRender({
  editorSnapshot,
  position,
  method,
  revision,
  enabled,
}: UseRealisticRenderParams) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const versionRef = useRef(0);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState<MockupSnapshot | null>(null);
  const [renderedVersion, setRenderedVersion] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const fabricSnapshot = editorSnapshot();
    if (!canvas || !fabricSnapshot) return;

    const version = versionRef.current + 1;
    versionRef.current = version;
    const timeout = window.setTimeout(() => {
      const fullSnapshot: MockupSnapshot = {
        canvasWidth: MOCKUP_CANVAS_WIDTH,
        canvasHeight: MOCKUP_CANVAS_HEIGHT,
        logoSource: fabricSnapshot.logoSource,
        transform: fabricSnapshot.transform,
        method,
        position,
        garmentCacheKey: position.garmentImage,
        exportScale: 1,
      };

      setSnapshot(fullSnapshot);
      setRendering(true);
      setError("");
      void renderRealisticMockup(canvas, fullSnapshot)
        .then(() => {
          if (versionRef.current === version) setRenderedVersion(version);
        })
        .catch((unknownError: unknown) => {
          if (versionRef.current !== version) return;
          setError(
            unknownError instanceof Error
              ? unknownError.message
              : "No se pudo renderizar el mockup.",
          );
        })
        .finally(() => {
          if (versionRef.current === version) setRendering(false);
        });
    }, 150);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [editorSnapshot, enabled, method, position, revision]);

  return {
    canvasRef,
    rendering,
    error,
    snapshot,
    renderedVersion,
  };
}
