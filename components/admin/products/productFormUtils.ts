import type { Product } from "@/types/product";
import { parseImageField } from "@/lib/storage";

export const sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

export const colorOptions = [
  { name: "blanco", hex: "#ffffff" },
  { name: "negro", hex: "#111111" },
  { name: "azul marino", hex: "#1e3a5f" },
  { name: "azul rey", hex: "#1d4ed8" },
  { name: "rojo", hex: "#dc2626" },
  { name: "verde", hex: "#16a34a" },
  { name: "gris", hex: "#9ca3af" },
  { name: "gris oscuro", hex: "#4b5563" },
  { name: "naranja", hex: "#ea580c" },
  { name: "amarillo", hex: "#eab308" },
  { name: "beige", hex: "#d8c3a5" },
  { name: "burdeo", hex: "#7f1d1d" },
];

export const technologyOptions = [
  "Antipilling",
  "Estabilidad dimensional",
  "Solidez de color",
  "Protección UPF+",
  "Secado rápido",
  "Respirable",
];

export const certificationOptions = [
  "OEKO-TEX",
  "WRAP",
  "BSCI",
  "ISO 9001",
  "Global Recycled Standard",
  "Fair Wear",
];

export const fabricOptions = [
  "100% algodón",
  "80% algodón, 20% poliéster",
  "65% poliéster, 35% algodón",
  "100% poliéster",
  "Softshell técnico",
  "Dry-fit",
  "Polar",
  "Gabardina",
];

export type ArrayField = keyof Pick<
  Product,
  "sizes" | "colors" | "technologies" | "certifications"
>;

export function getProductImages(product?: Partial<Product> | null) {
  const directImages = Array.isArray(product?.images) ? product.images : [];
  const parsedImages = parseImageField(product?.image);

  return Array.from(new Set([...directImages, ...parsedImages])).filter(
    Boolean,
  );
}

export function serializeImages(images: string[]) {
  const cleanImages = images.map((image) => image.trim()).filter(Boolean);

  if (cleanImages.length === 0) return "";
  if (cleanImages.length === 1) return cleanImages[0];

  return JSON.stringify(cleanImages);
}

export function formatMoney(value?: number | null) {
  if (!value) return "—";

  return `$${value.toLocaleString("es-CL")}`;
}

export function getStableUploadId(product: Partial<Product>) {
  const rawValue =
    product.id ||
    product.slug ||
    product.short_name ||
    product.name ||
    "producto-temporal";

  return rawValue
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatList(value: unknown) {
  return Array.isArray(value) ? value.join(", ") : "";
}