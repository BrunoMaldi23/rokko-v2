import {
  clearSupabaseAuthStorage,
  hasSupabaseConfig,
  isInvalidRefreshTokenError,
  supabase,
} from "@/lib/supabaseClient";
import type { ProductCategory } from "@/types/category";
import { makeCategorySlug, normalizeCategoryList } from "@/lib/productCategories";

type CategoryInput = Partial<ProductCategory>;

async function adminCategoryRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data } = await supabase.auth.getSession().catch((error: unknown) => {
    if (isInvalidRefreshTokenError(error)) {
      clearSupabaseAuthStorage();
      throw new Error("Sesion expirada. Vuelve a iniciar sesion.");
    }
    throw error;
  });
  const token = data.session?.access_token;
  if (!token) throw new Error("Sesion requerida.");

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string" ? payload.error : "Error en API admin.",
    );
  }

  return payload as T;
}

export function normalizeCategoryInput(category: CategoryInput) {
  const label = category.label?.trim() || "Nueva categoria";
  const slug = makeCategorySlug(category.slug || label);

  return {
    slug,
    label,
    description: category.description?.trim() || "",
    code: (category.code?.trim() || label.slice(0, 2)).slice(0, 4).toUpperCase(),
    sort_order: Number(category.sort_order || 0),
    active: category.active ?? true,
  };
}

export async function fetchAdminCategories() {
  const payload = await adminCategoryRequest<{ categories: ProductCategory[] }>(
    "/api/admin/categories",
  );
  return normalizeCategoryList(payload.categories || []);
}

export async function createAdminCategory(category: CategoryInput) {
  const payload = await adminCategoryRequest<{ category: ProductCategory }>(
    "/api/admin/categories",
    {
      method: "POST",
      body: JSON.stringify(normalizeCategoryInput(category)),
    },
  );
  return payload.category;
}

export async function updateAdminCategory(category: ProductCategory) {
  const payload = await adminCategoryRequest<{ category: ProductCategory }>(
    "/api/admin/categories",
    {
      method: "PATCH",
      body: JSON.stringify({
        id: category.id,
        slug: category.slug,
        category: normalizeCategoryInput(category),
      }),
    },
  );
  return payload.category;
}

export async function deleteAdminCategory(id: string) {
  const payload = await adminCategoryRequest<{ category: Pick<ProductCategory, "id"> }>(
    `/api/admin/categories?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  return payload.category;
}

export async function assignProductsToCategory(productIds: string[], categorySlug: string) {
  const payload = await adminCategoryRequest<{ updated: number }>(
    "/api/admin/categories/assign-products",
    {
      method: "PATCH",
      body: JSON.stringify({ productIds, categorySlug }),
    },
  );
  return payload.updated;
}
