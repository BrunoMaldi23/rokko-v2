import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { deleteProductImages } from "@/lib/storage";
import type { Product } from "@/types/product";
import { normalizeProductModelUrl } from "@/lib/baseModels";
import { normalizePriceTiers } from "@/lib/pricing";

type AdminProductInput = Partial<Omit<Product, "id">>;

async function adminProductRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data } = await supabase.auth.getSession();
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

function normalizeProductInput(product: AdminProductInput) {
  const name = product.name || product.short_name || "Producto Rokko";

  return {
    slug: product.slug || makeSlug(name) || `producto-${Date.now()}`,
    category: product.category || "poleras",
    name,
    short_name: product.short_name || name,
    description: product.description ?? null,
    extract: product.extract ?? null,
    image: product.image ?? null,
    color_images: product.color_images ?? {},
    model_3d_url: product.model_3d_url ?? null,
    model_3d_scale: product.model_3d_scale ?? 1,
    model_3d_position_y: product.model_3d_position_y ?? 0,
    model_3d_rotation_y: product.model_3d_rotation_y ?? 0,
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
  };
}

function normalizeLoadedProductModel(product: Product): Product {
  return {
    ...product,
    model_3d_url: normalizeProductModelUrl(product.model_3d_url, [
      product.category,
      product.slug,
      product.short_name,
      product.name,
    ]),
  };
}

export async function getAdminProducts() {
  if (!hasSupabaseConfig || !supabase) {
    console.warn("Supabase no esta configurado.");
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("price", { ascending: true });

  if (error) {
    console.error("Error cargando productos admin:", error.message);
    return [];
  }

  return ((data || []) as Product[]).map(normalizeLoadedProductModel);
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

  const payload = {
    slug: product.slug,
    category: product.category,
    name: product.name,
    short_name: product.short_name,
    description: product.description,
    extract: product.extract,
    image: product.image,
    color_images: product.color_images ?? {},
    model_3d_url: product.model_3d_url ?? null,
    model_3d_scale: product.model_3d_scale ?? 1,
    model_3d_position_y: product.model_3d_position_y ?? 0,
    model_3d_rotation_y: product.model_3d_rotation_y ?? 0,
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
