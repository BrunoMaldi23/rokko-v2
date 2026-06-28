import type { ProductCategory } from "@/types/category";
import type { Product } from "@/types/product";
import { parseImageField } from "@/lib/storage";

export const emptyDraft: Partial<ProductCategory> = {
  label: "",
  slug: "",
  description: "",
  code: "",
  sort_order: 0,
  active: true,
};

export function productTitle(product: Product) {
  return product.short_name || product.name;
}

export function countByCategory(products: Product[]) {
  return products.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
}

export function sortCategories(categories: ProductCategory[]) {
  return [...categories].sort(
    (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0),
  );
}

export function categoryCode(category?: ProductCategory | null) {
  if (!category) return "—";

  return (
    category.code ||
    category.label
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  );
}

export function getProductImage(product: Product) {
  const directImages = Array.isArray(product.images) ? product.images : [];
  const parsedImages = parseImageField(product.image);

  return [...directImages, ...parsedImages].find(Boolean) || "/rokko.png";
}