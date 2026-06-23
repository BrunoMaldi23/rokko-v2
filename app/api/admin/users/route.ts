import { createClient } from "@supabase/supabase-js";
import type { AdminUserAttributes, User } from "@supabase/supabase-js";
import { ADMIN_PERMISSION_ERROR, isAdminUser, readAuthRole } from "@/lib/adminAuth";

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

function readRole(user: User) {
  return readAuthRole(user);
}

function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: readRole(user),
    name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "",
    created_at: user.created_at,
    confirmed_at: user.confirmed_at,
    last_sign_in_at: user.last_sign_in_at,
    banned_until: user.banned_until,
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

  return { clients, user: data.user };
}

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const { data, error } = await guard.clients.adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) return json({ error: error.message }, 500);
  return json({ users: data.users.map(publicUser) });
}

export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  const role = String(body.role || "admin");

  if (!email || password.length < 8) {
    return json({ error: "Email y contrasena de al menos 8 caracteres son requeridos." }, 400);
  }

  const { data, error } = await guard.clients.adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
    app_metadata: { role },
  });

  if (error) return json({ error: error.message }, 400);
  return json({ user: publicUser(data.user) }, 201);
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const body = await request.json();
  const id = String(body.id || "");
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  const role = String(body.role || "admin");

  if (!id || !email) {
    return json({ error: "Usuario y email son requeridos." }, 400);
  }

  const updates: AdminUserAttributes = {
    email,
    user_metadata: { name, role },
    app_metadata: { role },
  };

  if (password) {
    if (password.length < 8) {
      return json({ error: "La nueva contrasena debe tener al menos 8 caracteres." }, 400);
    }
    updates.password = password;
  }

  const { data, error } = await guard.clients.adminClient.auth.admin.updateUserById(id, updates);
  if (error) return json({ error: error.message }, 400);
  return json({ user: publicUser(data.user) });
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "Usuario requerido." }, 400);
  if (id === guard.user.id) {
    return json({ error: "No puedes eliminar tu propio usuario activo." }, 400);
  }

  const { error } = await guard.clients.adminClient.auth.admin.deleteUser(id);
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}
