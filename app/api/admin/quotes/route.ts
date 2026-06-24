import { createClient } from "@supabase/supabase-js";
import { ADMIN_PERMISSION_ERROR, isAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getClients() {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return null;
  }

  return {
    authClient: createClient(supabaseUrl, supabaseAnonKey),
    adminClient: createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
  };
}

async function requireAdmin(request: Request) {
  const clients = getClients();
  if (!clients) {
    return { error: json({ error: "Supabase admin no configurado." }, 500) };
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { error: json({ error: "Sesion requerida." }, 401) };
  }

  const { data, error } = await clients.authClient.auth.getUser(token);
  if (error || !data.user) {
    return { error: json({ error: "Sesion invalida." }, 401) };
  }

  if (!isAdminUser(data.user)) {
    return { error: json({ error: ADMIN_PERMISSION_ERROR }, 403) };
  }

  return { clients };
}

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const { data, error } = await guard.clients.adminClient
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);
  return json({ quotes: data || [] });
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const body = await request.json();
  const id = Number(body.id);
  if (!id) return json({ error: "Cotizacion requerida." }, 400);

  const updates: Record<string, unknown> = {};
  if (typeof body.status === "string") updates.status = body.status;
  if (typeof body.admin_notes === "string") updates.admin_notes = body.admin_notes;
  if (Array.isArray(body.items)) updates.items = body.items;
  if (typeof body.total === "number" && Number.isFinite(body.total)) updates.total = body.total;

  if (Object.keys(updates).length === 0) {
    return json({ error: "No hay cambios para guardar." }, 400);
  }

  const { data, error } = await guard.clients.adminClient
    .from("quotes")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return json({ error: error.message }, 400);
  return json({ quote: data });
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) return json({ error: "Cotizacion requerida." }, 400);

  const { error } = await guard.clients.adminClient
    .from("quotes")
    .delete()
    .eq("id", id);

  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}
