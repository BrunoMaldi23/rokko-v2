import { supabase } from "./supabaseClient";
import { adminFetch } from "./adminQuotes";

export type BrandSettings = {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  footer: string;
  bank_name: string;
  bank_account_type: string;
  bank_account_number: string;
  bank_account_holder: string;
  bank_account_rut: string;
  bank_account_email: string;
  payment_notes: string;
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
  try {
    await adminFetch("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ type: "brand", settings }),
    });
    return true;
  } catch (error) {
    console.error("saveBrandSettings error:", error);
    return false;
  }
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
  try {
    await adminFetch("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ type: "commercial", settings }),
    });
    return true;
  } catch (error) {
    console.error("saveCommercialSettings error:", error);
    return false;
  }
}
