import { serverSupabase as supabase, hasSupabaseConfig } from "@/lib/serverSupabase";
import type { Product } from "@/types/product";

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

  return (data || []) as Product[];
}