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

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const { data, error } = await guard.clients.adminClient
    .from("product_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json({ categories: data || [] });
}

export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const category = await request.json();
  const { data, error } = await guard.clients.adminClient
    .from("product_categories")
    .insert(category)
    .select("*")
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ category: data });
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const body = await request.json();
  const id = String(body.id || "");
  const slug = String(body.slug || "");
  const category = body.category;

  if ((!id && !slug) || !category) {
    return json({ error: "Categoria e identificador son requeridos." }, 400);
  }

  const { data: previous, error: previousError } = await guard.clients.adminClient
    .from("product_categories")
    .select("slug")
    .match(id ? { id } : { slug })
    .maybeSingle();

  if (previousError) return json({ error: previousError.message }, 500);

  let query = guard.clients.adminClient
    .from("product_categories")
    .update(category, { count: "exact" });

  query = id ? query.eq("id", id) : query.eq("slug", slug);

  const { data, error, count } = await query.select("*").maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (count === 0 || !data) {
    return json({ error: "No se encontro la categoria." }, 404);
  }

  if (previous?.slug && category.slug && previous.slug !== category.slug) {
    const { error: productError } = await guard.clients.adminClient
      .from("products")
      .update({ category: category.slug })
      .eq("category", previous.slug);

    if (productError) return json({ error: productError.message }, 500);
  }

  return json({ category: data });
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  if (!id) return json({ error: "Id requerido." }, 400);

  const { data: category, error: categoryError } = await guard.clients.adminClient
    .from("product_categories")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (categoryError) return json({ error: categoryError.message }, 500);
  if (!category) return json({ error: "No se encontro la categoria." }, 404);

  const { count: productsCount, error: productError } = await guard.clients.adminClient
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category", category.slug);

  if (productError) return json({ error: productError.message }, 500);
  if (productsCount && productsCount > 0) {
    return json(
      { error: "No puedes eliminar una categoria con productos asignados." },
      409,
    );
  }

  const { data, error, count } = await guard.clients.adminClient
    .from("product_categories")
    .delete({ count: "exact" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (count === 0 || !data) {
    return json({ error: "No se encontro la categoria." }, 404);
  }

  return json({ category: data });
}
