import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { deleteProductImages } from "@/lib/storage";
import type { Product } from "@/types/product";

type AdminProductInput = Partial<Omit<Product, "id">>;

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
    price: Number(product.price || 0),
    wholesale_price: product.wholesale_price ?? null,
    wholesale_from: product.wholesale_from ?? null,
    sizes: product.sizes || [],
    colors: product.colors || [],
    composition: product.composition ?? null,
    weight: product.weight ?? null,
    technologies: product.technologies || [],
    certifications: product.certifications || [],
    active: product.active ?? true,
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

  return (data || []) as Product[];
}

export async function createAdminProduct(product: AdminProductInput) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data, error } = await supabase
    .from("products")
    .insert(normalizeProductInput(product))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}

export async function updateAdminProduct(product: Product) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({
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
      sizes: product.sizes,
      colors: product.colors,
      composition: product.composition,
      weight: product.weight,
      technologies: product.technologies,
      certifications: product.certifications,
      active: product.active,
    })
    .eq("id", product.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}

export async function deleteAdminProduct(id: string) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }
  await deleteProductImages(id);
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(
      "Supabase no elimino ninguna fila. Revisa las policies/RLS de DELETE para la tabla products."
    );
  }
  return data as Pick<Product, "id">;
}

export async function toggleAdminProductStatus(id: string, active: boolean) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({ active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}
