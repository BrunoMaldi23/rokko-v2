import { serverSupabase as supabase, hasSupabaseConfig } from "@/lib/serverSupabase";
import type { Product } from "@/types/product";

export async function getAllProducts() {
  if (!hasSupabaseConfig || !supabase) {
    console.warn("Supabase no está configurado. Revisa .env.local");
    return [];
  }

  let { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error && /sort_order/i.test(error.message)) {
    const retry = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error("Error obteniendo productos:", error.message);
    return [];
  }

  return ((data || []) as Product[]);
}

export async function getProductsByCategory(category: string) {
  if (!hasSupabaseConfig || !supabase) {
    console.warn("Supabase no está configurado. Revisa .env.local");
    return [];
  }

  let { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("price", { ascending: true });

  if (error && /sort_order/i.test(error.message)) {
    const retry = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .eq("active", true)
      .order("price", { ascending: true });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error("Error obteniendo productos:", error.message);
    return [];
  }

  return ((data || []) as Product[]);
}
