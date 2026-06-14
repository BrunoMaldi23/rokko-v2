"use client";

import React, { useEffect, useState } from "react";

type ModelViewerProps = {
  src: string;
  alt: string;
};

export default function ModelViewerElement({ src, alt }: ModelViewerProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (customElements.get("model-viewer")) {
      setReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-rokko-model-viewer="true"]'
    );

    const onLoad = () => setReady(true);

    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      if (customElements.get("model-viewer")) setReady(true);
      return () => existing.removeEventListener("load", onLoad);
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/vendor/model-viewer.min.js";
    script.dataset.rokkoModelViewer = "true";
    script.addEventListener("load", onLoad, { once: true });
    document.head.appendChild(script);

    return () => script.removeEventListener("load", onLoad);
  }, []);

  if (!ready) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center text-xs font-bold text-slate-400">
        Cargando modelo 3D...
      </div>
    );
  }

  return React.createElement("model-viewer", {
    src,
    alt,
    "camera-controls": true,
    "auto-rotate": true,
    "shadow-intensity": "0.9",
    "environment-image": "neutral",
    exposure: "1",
    "touch-action": "pan-y",
    "camera-orbit": "0deg 75deg 220%",
    "min-camera-orbit": "auto auto 120%",
    "max-camera-orbit": "auto auto 450%",
    "field-of-view": "28deg",
    loading: "eager",
    reveal: "auto",
    style: {
      width: "100%",
      height: "100%",
      minHeight: "400px",
      display: "block",
      background: "transparent",
      ["--poster-color" as string]: "transparent",
    },
  });
}
