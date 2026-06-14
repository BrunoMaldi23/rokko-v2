export function normalizeKey(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function findColorImages(
  colorImages: Record<string, string[]> | null | undefined,
  color: string
): string[] | null {
  if (!colorImages || !color) return null;
  const target = normalizeKey(color);
  if (colorImages[color]?.length) return colorImages[color];
  if (colorImages[target]?.length) return colorImages[target];
  for (const key of Object.keys(colorImages)) {
    if (normalizeKey(key) === target && colorImages[key]?.length) {
      return colorImages[key];
    }
  }
  return null;
}
