import {
  clearSupabaseAuthStorage,
  hasSupabaseConfig,
  isInvalidRefreshTokenError,
  supabase,
} from "@/lib/supabaseClient";
import { deleteProductImages } from "@/lib/storage";
import type { Product } from "@/types/product";
import { normalizePriceTiers } from "@/lib/pricing";

type AdminProductInput = Partial<Omit<Product, "id">>;

async function adminProductRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!supabase) {
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
  if (!token) {
    throw new Error("Sesion requerida.");
  }

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

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeCardSummary(value: string | null | undefined, maxLength = 86) {
  const clean = (value || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean || null;
  const sliced = clean.slice(0, maxLength + 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 48 ? sliced.slice(0, lastSpace) : clean.slice(0, maxLength)).trim()}...`;
}

function normalizeProductInput(product: AdminProductInput) {
  const name = product.name || product.short_name || "Producto Rokko";
  const description = product.description?.trim() || null;

  return {
    slug: product.slug || makeSlug(name) || `producto-${Date.now()}`,
    category: product.category || "poleras",
    name,
    short_name: product.short_name || name,
    description,
    extract: makeCardSummary(product.extract || description || name),
    image: product.image ?? null,
    color_images: product.color_images ?? {},
    price: Number(product.price || 0),
    wholesale_price: product.wholesale_price ?? null,
    wholesale_from: product.wholesale_from ?? null,
    price_tiers: normalizePriceTiers(product.price_tiers),
    sizes: product.sizes || [],
    colors: product.colors || [],
    composition: product.composition ?? null,
    weight: product.weight ?? null,
    technologies: product.technologies || [],
    certifications: product.certifications || [],
    active: product.active ?? true,
    sort_order: Number(product.sort_order || 0),
    mockup_calibrations: product.mockup_calibrations ?? {},
  };
}

export async function getAdminProducts() {
  if (!hasSupabaseConfig || !supabase) {
    console.warn("Supabase no esta configurado.");
    return [];
  }

  let { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("price", { ascending: true });

  if (error && /sort_order/i.test(error.message)) {
    const retry = await supabase
      .from("products")
      .select("*")
      .order("category", { ascending: true })
      .order("price", { ascending: true });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error("Error cargando productos admin:", error.message);
    return [];
  }

  return ((data || []) as Product[]);
}

export async function createAdminProduct(product: AdminProductInput) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const data = await adminProductRequest<{ product: Product }>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(normalizeProductInput(product)),
  });

  return data.product;
}

export async function updateAdminProduct(product: Product) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const description = product.description?.trim() || null;
  const payload = {
    slug: product.slug,
    category: product.category,
    name: product.name,
    short_name: product.short_name,
    description,
    extract: makeCardSummary(product.extract || description || product.name),
    image: product.image,
    color_images: product.color_images ?? {},
    price: product.price,
    wholesale_price: product.wholesale_price,
    wholesale_from: product.wholesale_from,
    price_tiers: normalizePriceTiers(product.price_tiers),
    sizes: product.sizes,
    colors: product.colors,
    composition: product.composition,
    weight: product.weight,
    technologies: product.technologies,
    certifications: product.certifications,
    active: product.active,
    sort_order: Number(product.sort_order || 0),
    mockup_calibrations: product.mockup_calibrations ?? {},
  };

  const data = await adminProductRequest<{ product: Product }>("/api/admin/products", {
    method: "PATCH",
    body: JSON.stringify({ id: product.id, product: payload }),
  });

  return data.product;
}

export async function deleteAdminProduct(id: string) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }
  await deleteProductImages(id);
  const data = await adminProductRequest<{ product: Pick<Product, "id"> }>(
    `/api/admin/products?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  return data.product;
}

export async function toggleAdminProductStatus(id: string, active: boolean) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const data = await adminProductRequest<{ product: Product }>("/api/admin/products", {
    method: "PATCH",
    body: JSON.stringify({ id, product: { active } }),
  });

  return data.product;
}
