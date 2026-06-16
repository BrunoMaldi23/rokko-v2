import { serverSupabase as supabase, hasSupabaseConfig } from "@/lib/serverSupabase";
import type { Product } from "@/types/product";
import { normalizeProductModelUrl } from "@/lib/baseModels";

function normalizeProductModel(product: Product): Product {
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

export async function getAllProducts() {
  if (!hasSupabaseConfig || !supabase) {
    console.warn("Supabase no está configurado. Revisa .env.local");
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error obteniendo productos:", error.message);
    return [];
  }

  return ((data || []) as Product[]).map(normalizeProductModel);
}

export async function getProductsByCategory(category: string) {
  if (!hasSupabaseConfig || !supabase) {
    console.warn("Supabase no está configurado. Revisa .env.local");
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("Error obteniendo productos:", error.message);
    return [];
  }

  return ((data || []) as Product[]).map(normalizeProductModel);
}
