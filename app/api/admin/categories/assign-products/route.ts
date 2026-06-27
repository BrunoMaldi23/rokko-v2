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
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) return null;

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
  if (!token) return { error: json({ error: "Sesion requerida." }, 401) };

  const { data, error } = await clients.authClient.auth.getUser(token);
  if (error || !data.user) {
    return { error: json({ error: "Sesion invalida." }, 401) };
  }

  if (!isAdminUser(data.user)) {
    return { error: json({ error: ADMIN_PERMISSION_ERROR }, 403) };
  }

  return { clients };
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const body = await request.json();
  const productIds = Array.isArray(body.productIds)
    ? body.productIds.filter((id: unknown): id is string => typeof id === "string")
    : [];
  const categorySlug = String(body.categorySlug || "");

  if (!productIds.length || !categorySlug) {
    return json({ error: "Productos y categoria son requeridos." }, 400);
  }

  const { data: category, error: categoryError } = await guard.clients.adminClient
    .from("product_categories")
    .select("slug")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (categoryError) return json({ error: categoryError.message }, 500);
  if (!category) return json({ error: "Categoria no encontrada." }, 404);

  const { error, count } = await guard.clients.adminClient
    .from("products")
    .update({ category: categorySlug }, { count: "exact" })
    .in("id", productIds);

  if (error) return json({ error: error.message }, 500);
  return json({ updated: count || 0 });
}
