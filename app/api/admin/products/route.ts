import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/types/product";
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

async function ensureCategoryExists(
  adminClient: NonNullable<ReturnType<typeof getClients>>["adminClient"],
  category: unknown,
) {
  const categorySlug = String(category || "").trim();
  if (!categorySlug) {
    return "Categoria requerida.";
  }

  const { data, error } = await adminClient
    .from("product_categories")
    .select("slug")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (error) return error.message;
  if (!data) return "La categoria seleccionada no existe.";
  return null;
}

export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const product = await request.json();

  const categoryError = await ensureCategoryExists(
    guard.clients.adminClient,
    product.category,
  );
  if (categoryError) return json({ error: categoryError }, 400);

  const { data, error } = await guard.clients.adminClient
    .from("products")
    .insert(product)
    .select("*")
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ product: data });
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const body = await request.json();
  const id = String(body.id || "");
  const product = body.product as Partial<Product> | undefined;

  if (!id || !product) {
    return json({ error: "Producto e id son requeridos." }, 400);
  }

  if (product.category !== undefined) {
    const categoryError = await ensureCategoryExists(
      guard.clients.adminClient,
      product.category,
    );
    if (categoryError) return json({ error: categoryError }, 400);
  }

  const { data, error, count } = await guard.clients.adminClient
    .from("products")
    .update(product, { count: "exact" })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (count === 0 || !data) {
    return json({ error: "No se encontro el producto para actualizar." }, 404);
  }

  return json({ product: data });
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  if (!id) return json({ error: "Id requerido." }, 400);

  const { data, error, count } = await guard.clients.adminClient
    .from("products")
    .delete({ count: "exact" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (count === 0 || !data) {
    return json({ error: "No se encontro el producto para eliminar." }, 404);
  }

  return json({ product: data });
}
