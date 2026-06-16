const BASE = "/models/base";

export const BASE_MODEL_MAP: Record<string, string> = {
  "t-shirt": `${BASE}/polera-base.glb`,
  "t-shirt manga larga": `${BASE}/polera-base.glb`,
  polo: `${BASE}/polera-base.glb`,
  "poleron-cuello-redondo": `${BASE}/poleron-cuello-redondo-base.glb`,
  "poleron-polo-unisex": `${BASE}/poleron-polo-unisex-base.glb`,
  hoodie: `${BASE}/poleron-cuello-redondo-base.glb`,
  "parka-hombre": `${BASE}/parka-hombre-base.glb`,
  "parka-desmontable": `${BASE}/parka-hombre-desmontable-puno-base.glb`,
  "parka-desmontable-sin-gorro": `${BASE}/parka-hombre-desmontable-puno-sin-gorro-base.glb`,
  "softshell-basico-hombre": `${BASE}/softshell-basico-hombre-base.glb`,
  "softshell-basico-mujer": `${BASE}/softshell-basico-mujer-base.glb`,
  "softshell-termico-hombre": `${BASE}/softshell-termico-premium-hombre-base.glb`,
  "softshell-termico-mujer": `${BASE}/softshell-termico-premium-mujer-cerrado-base.glb`,
  "micropolar-hombre": `${BASE}/micropolar-hombre-base.glb`,
  "micropolar-mujer": `${BASE}/micropolar-mujer-base.glb`,
  micropolar: `${BASE}/micropolar-hombre-base.glb`,
  shirt: `${BASE}/camisa-base.glb`,
  camisa: `${BASE}/camisa-base.glb`,
  blusa: `${BASE}/blusa-base.glb`,
  "pantalon-cargo": `${BASE}/pantalon-cargo-base.glb`,
  pantalon: `${BASE}/pantalon-cargo-base.glb`,
};

export function getBaseModelUrl(garmentType: string): string | null {
  return BASE_MODEL_MAP[garmentType] || null;
}

export function isLegacyProductModelUrl(modelUrl: string | null | undefined): boolean {
  if (!modelUrl) return false;

  try {
    const pathname = /^https?:\/\//i.test(modelUrl)
      ? new URL(modelUrl).pathname
      : modelUrl;

    return /(?:^|\/)models\/productos\//i.test(pathname);
  } catch {
    return /(?:^|\/)models\/productos\//i.test(modelUrl);
  }
}

export function normalizeProductModelUrl(
  modelUrl: string | null | undefined,
  parts: Array<string | null | undefined>,
): string | null {
  const fallbackUrl = getDetectedBaseModelUrl(parts);
  if (!modelUrl || isLegacyProductModelUrl(modelUrl)) return fallbackUrl;
  return modelUrl;
}

function normalizeModelText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectBaseGarmentType(parts: Array<string | null | undefined>): string {
  const normalized = normalizeModelText(parts.filter(Boolean).join(" "));

  if (/pantalon|cargo/.test(normalized)) return "pantalon-cargo";
  if (/blusa/.test(normalized)) return "blusa";
  if (/camisa|shirt/.test(normalized)) return "camisa";
  if (/micropolar/.test(normalized) && /mujer/.test(normalized)) return "micropolar-mujer";
  if (/micropolar/.test(normalized)) return "micropolar-hombre";

  // Softshell lives under "parkas" in the catalog, so detect it before generic parka.
  if (/softshell/.test(normalized) && /termic|termico|premium/.test(normalized) && /mujer/.test(normalized)) return "softshell-termico-mujer";
  if (/softshell/.test(normalized) && /termic|termico|premium/.test(normalized)) return "softshell-termico-hombre";
  if (/softshell/.test(normalized) && /mujer/.test(normalized)) return "softshell-basico-mujer";
  if (/softshell/.test(normalized)) return "softshell-basico-hombre";

  if (/parka/.test(normalized) && /sin gorro/.test(normalized)) return "parka-desmontable-sin-gorro";
  if (/parka/.test(normalized) && /desmontable|puno|gorro/.test(normalized)) return "parka-desmontable";
  if (/parka/.test(normalized)) return "parka-hombre";
  if (/poleron/.test(normalized) && /polo|unisex/.test(normalized)) return "poleron-polo-unisex";
  if (/poleron|hoodie|sudader/.test(normalized)) return "poleron-cuello-redondo";
  if (/polo/.test(normalized)) return "polo";
  if (/manga larga/.test(normalized)) return "t-shirt manga larga";

  return "t-shirt";
}

export function getDetectedBaseModelUrl(parts: Array<string | null | undefined>): string | null {
  return getBaseModelUrl(detectBaseGarmentType(parts));
}
