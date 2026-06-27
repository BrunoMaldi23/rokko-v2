import { serverSupabase as supabase, hasSupabaseConfig } from "@/lib/serverSupabase";
import type { ProductCategory } from "@/types/category";

export const fallbackProductCategories: ProductCategory[] = [
  {
    slug: "poleras",
    label: "Poleras",
    description: "Prendas livianas para equipos comerciales y uso diario.",
    code: "PL",
    sort_order: 10,
    active: true,
  },
  {
    slug: "camisas",
    label: "Camisas / Blusas",
    description: "Camisas, blusas y prendas ejecutivas para identidad corporativa.",
    code: "CB",
    sort_order: 20,
    active: true,
  },
  {
    slug: "polerones",
    label: "Polerones",
    description: "Abrigo corporativo comodo, resistente y personalizable.",
    code: "PR",
    sort_order: 30,
    active: true,
  },
  {
    slug: "cortaviento",
    label: "Cortaviento",
    description: "Capas livianas para exterior, activaciones y equipos en terreno.",
    code: "CV",
    sort_order: 40,
    active: true,
  },
  {
    slug: "polar",
    label: "Polar",
    description: "Abrigo suave y practico para dotaciones, invierno y uso diario.",
    code: "PO",
    sort_order: 50,
    active: true,
  },
  {
    slug: "parkas",
    label: "Parkas",
    description: "Modelos termicos, impermeables y tecnicos para exterior.",
    code: "PK",
    sort_order: 60,
    active: true,
  },
  {
    slug: "pantalones",
    label: "Pantalones",
    description: "Lineas funcionales para operacion, oficina y terreno.",
    code: "PT",
    sort_order: 70,
    active: true,
  },
];

export function makeCategorySlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCategoryList(categories: ProductCategory[]) {
  const source = categories.length > 0 ? categories : fallbackProductCategories;
  return [...source].sort((a, b) => {
    const order = Number(a.sort_order || 0) - Number(b.sort_order || 0);
    if (order !== 0) return order;
    return a.label.localeCompare(b.label, "es");
  });
}

export async function getProductCategories(options: { activeOnly?: boolean } = {}) {
  if (!hasSupabaseConfig || !supabase) {
    return normalizeCategoryList(
      options.activeOnly
        ? fallbackProductCategories.filter((category) => category.active)
        : fallbackProductCategories,
    );
  }

  let query = supabase
    .from("product_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (options.activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error) {
    return normalizeCategoryList(
      options.activeOnly
        ? fallbackProductCategories.filter((category) => category.active)
        : fallbackProductCategories,
    );
  }

  return normalizeCategoryList((data || []) as ProductCategory[]);
}
