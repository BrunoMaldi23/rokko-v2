"use client";

import { useEffect, useState } from "react";

export type DebugFlags = {
  mannequin: boolean;
  decal: boolean;
  contactShadows: boolean;
  environment: boolean;
  shaderInjection: boolean;
  fabricSync: boolean;
};

const ALL_ENABLED: DebugFlags = {
  mannequin: true,
  decal: true,
  contactShadows: true,
  environment: true,
  shaderInjection: true,
  fabricSync: true,
};

const KEY_MAP: Record<string, keyof DebugFlags> = {
  Mannequin: "mannequin",
  Decal: "decal",
  ContactShadows: "contactShadows",
  Environment: "environment",
  ShaderInjection: "shaderInjection",
  FabricSync: "fabricSync",
  All: "mannequin", // fallback key, only used when computing "all off"
};

function readFromSearchParams(): DebugFlags {
  if (typeof window === "undefined") return ALL_ENABLED;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("disable");
  if (!raw) return ALL_ENABLED;
  const disabled = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (disabled.includes("All")) {
    return {
      mannequin: false,
      decal: false,
      contactShadows: false,
      environment: false,
      shaderInjection: false,
      fabricSync: false,
    };
  }
  const flags = { ...ALL_ENABLED };
  for (const item of disabled) {
    const key = KEY_MAP[item];
    if (key) flags[key] = false;
  }
  return flags;
}

let cached: DebugFlags | null = null;

export function useDebugFlags(): DebugFlags {
  const [flags, setFlags] = useState<DebugFlags>(() => {
    if (cached) return cached;
    const initial = readFromSearchParams();
    cached = initial;
    return initial;
  });

  useEffect(() => {
    const onPop = () => {
      const next = readFromSearchParams();
      cached = next;
      setFlags(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return flags;
}
