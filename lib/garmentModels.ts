import type { Product } from "@/types/product";

/**
 * Mapea carpeta de origen en Escritorio/rok -> slug de categoría en la DB.
 * Los GLBs se generaron con el patrón: "categoria_nombrearchivo.glb"
 */
const CATEGORY_TO_PREFIX: Record<string, string> = {
  polera: "polera",
  "poleron-cuello-redondo": "poleron cuello redondo",
  "poleron-polo-unisex": "poleron POLO unisex",
  micropolar: "micropolar",
  parkas: "parkas",
};

/**
 * Normaliza un nombre para comparación: minúsculas, sin tildes, sin caracteres especiales.
 */
function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Busca el GLB generado para un producto.
 * Primero revisa model_3d_url (DB), luego busca por naming pattern.
 */
export function getProductModelUrl(product: Product): string | null {
  if (product.model_3d_url) return product.model_3d_url;

  const prefix = CATEGORY_TO_PREFIX[product.slug];
  if (!prefix) return null;

  // Busca el GLB que matchee con el short_name del producto
  const baseUrl = `/models/productos/`;
  // No podemos hacer server-side file enumeration, así que devolvemos null
  // y se usa FittedGarment como fallback.
  return null;
}

/**
 * Devuelve la URL del GLB y parámetros de calibración.
 */
export function getModelProps(product: Product): {
  modelUrl?: string;
  modelScale?: number;
  modelPositionY?: number;
  modelRotationY?: number;
} {
  const modelUrl = product.model_3d_url || undefined;
  return {
    modelUrl,
    modelScale: product.model_3d_scale ?? undefined,
    modelPositionY: product.model_3d_position_y ?? undefined,
    modelRotationY: product.model_3d_rotation_y ?? undefined,
  };
}
