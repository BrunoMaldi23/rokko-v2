import { supabase } from "./supabaseClient";

export type QuoteItem = {
  product: string;
  productId: string;
  color: string;
  logo: string;
  application: string;
  logoPosition: string;
  sizes: Record<string, number>;
  totalUnits: number;
  unitPrice: number;
  subtotal: number;
};

export type QuoteRecord = {
  id: number;
  folio: string;
  client_empresa: string;
  client_rut: string;
  client_contacto: string;
  client_correo: string;
  client_telefono: string;
  client_observaciones: string;
  admin_notes: string;
  items: QuoteItem[];
  total: number;
  status: string;
  created_at: string;
};

function generateFolio(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `COT-${y}${m}-${seq}`;
}

export async function saveQuote(data: {
  client_empresa: string;
  client_rut: string;
  client_contacto: string;
  client_correo: string;
  client_telefono: string;
  client_observaciones: string;
  items: QuoteItem[];
  total: number;
}): Promise<{ folio: string } | null> {
  if (!supabase) return null;

  const folio = generateFolio();

  const { error } = await supabase.from("quotes").insert({
    folio,
    client_empresa: data.client_empresa,
    client_rut: data.client_rut,
    client_contacto: data.client_contacto,
    client_correo: data.client_correo,
    client_telefono: data.client_telefono,
    client_observaciones: data.client_observaciones,
    items: data.items,
    total: data.total,
    status: "pendiente",
  });

  if (error) {
    console.error("Error saving quote:", JSON.stringify(error, null, 2));
    return null;
  }

  return { folio };
}

export async function fetchQuotes(): Promise<QuoteRecord[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as QuoteRecord[]) || [];
}

export async function updateQuoteStatus(
  id: number,
  status: string
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", id);
  return !error;
}

export async function updateQuoteNotes(
  id: number,
  admin_notes: string
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("quotes")
    .update({ admin_notes })
    .eq("id", id);
  return !error;
}

export async function updateQuoteFull(
  id: number,
  updates: { status?: string; admin_notes?: string }
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("quotes")
    .update(updates)
    .eq("id", id);
  return !error;
}

export async function deleteQuote(id: number): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  return !error;
}
