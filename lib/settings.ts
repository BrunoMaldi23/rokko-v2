import { supabase } from "./supabaseClient";

export type BrandSettings = {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  footer: string;
};

export type CommercialSettings = {
  id: number;
  discount: number;
  wholesale_min: number;
  vat: number;
  validity: number;
  terms: string;
};

export async function fetchBrandSettings(): Promise<BrandSettings | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("brand_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data;
}

export async function saveBrandSettings(
  settings: Omit<BrandSettings, "id">
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("brand_settings")
    .upsert({ id: 1, ...settings }, { onConflict: "id" });
  if (error) console.error("saveBrandSettings error:", error);
  return !error;
}

export async function fetchCommercialSettings(): Promise<CommercialSettings | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("commercial_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data;
}

export async function saveCommercialSettings(
  settings: Omit<CommercialSettings, "id">
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("commercial_settings")
    .upsert({ id: 1, ...settings }, { onConflict: "id" });
  if (error) console.error("saveCommercialSettings error:", error);
  return !error;
}
