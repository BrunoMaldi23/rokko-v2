import { supabase } from "./supabaseClient";
import type { QuoteRecord } from "./quotes";

export async function adminFetch(path: string, init: RequestInit = {}) {
  const { data } = supabase ? await supabase.auth.getSession() : { data: null };
  const token = data?.session?.access_token;

  if (!token) {
    throw new Error("Sesion admin requerida.");
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
    throw new Error(payload?.error || "Error en solicitud admin.");
  }

  return payload;
}

export async function fetchAdminQuotes(): Promise<QuoteRecord[]> {
  const payload = await adminFetch("/api/admin/quotes");
  return (payload.quotes as QuoteRecord[]) || [];
}

export async function updateAdminQuoteFull(
  id: number,
  updates: { status?: string; admin_notes?: string },
): Promise<boolean> {
  await adminFetch("/api/admin/quotes", {
    method: "PATCH",
    body: JSON.stringify({ id, ...updates }),
  });
  return true;
}

export async function deleteAdminQuote(id: number): Promise<boolean> {
  await adminFetch(`/api/admin/quotes?id=${id}`, {
    method: "DELETE",
  });
  return true;
}
