import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@rokko.cl";

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

  const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
  const isAdmin = role === "admin" || data.user.email === adminEmail;
  if (!isAdmin) {
    return { error: json({ error: "Permisos insuficientes." }, 403) };
  }

  return { clients };
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const body = await request.json();
  const type = String(body.type || "");
  const settings = body.settings || {};

  if (type === "brand") {
    const { error } = await guard.clients.adminClient
      .from("brand_settings")
      .upsert(
        {
          id: 1,
          name: String(settings.name || ""),
          phone: String(settings.phone || ""),
          email: String(settings.email || ""),
          city: String(settings.city || ""),
          footer: String(settings.footer || ""),
          bank_name: String(settings.bank_name || ""),
          bank_account_type: String(settings.bank_account_type || ""),
          bank_account_number: String(settings.bank_account_number || ""),
          bank_account_holder: String(settings.bank_account_holder || ""),
          bank_account_rut: String(settings.bank_account_rut || ""),
          bank_account_email: String(settings.bank_account_email || ""),
          payment_notes: String(settings.payment_notes || ""),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  if (type === "commercial") {
    const { error } = await guard.clients.adminClient
      .from("commercial_settings")
      .upsert(
        {
          id: 1,
          discount: Number(settings.discount || 0),
          wholesale_min: Number(settings.wholesale_min || 0),
          vat: Number(settings.vat || 19),
          validity: Number(settings.validity || 7),
          terms: String(settings.terms || ""),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: "Tipo de configuracion invalido." }, 400);
}
