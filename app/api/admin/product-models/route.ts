import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_PERMISSION_ERROR, isAdminUser } from "@/lib/adminAuth";
import type { ProductModel } from "@/types/productModel";

export const dynamic = "force-dynamic";

const MODEL_BUCKET = "product-models";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type ProductModelPayload = Partial<Omit<ProductModel, "id" | "created_at" | "base_model">>;

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

function cleanModelPayload(input: ProductModelPayload) {
  return {
    name: String(input.name || "").trim(),
    category: String(input.category || "poleras").trim() || "poleras",
    product_id: input.product_id || null,
    model_url: String(input.model_url || "").trim(),
    file_path: String(input.file_path || "").trim(),
    scale: Number(input.scale || 1),
    position_y: Number(input.position_y || 0),
    rotation_y: Number(input.rotation_y || 0),
  };
}

async function syncProductModelAssignment(adminClient: SupabaseClient, model: ProductModel) {
  if (!model.product_id) return null;

  const { error } = await adminClient
    .from("products")
    .update({
      model_3d_url: model.model_url,
      model_3d_scale: Number(model.scale || 1),
      model_3d_position_y: Number(model.position_y || 0),
      model_3d_rotation_y: Number(model.rotation_y || 0),
    })
    .eq("id", model.product_id);

  return error;
}

async function uploadModelFile(request: Request, adminClient: SupabaseClient) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return json({ error: "Archivo 3D requerido." }, 400);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "glb";
  if (!["glb", "gltf"].includes(ext)) {
    return json({ error: "Solo se permiten archivos .glb o .gltf." }, 400);
  }

  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "modelo";
  const fileName = `${Date.now()}-${safeBase}.${ext}`;
  const filePath = `models/${fileName}`;
  const contentType = ext === "glb" ? "model/gltf-binary" : "model/gltf+json";

  const { error } = await adminClient.storage
    .from(MODEL_BUCKET)
    .upload(filePath, await file.arrayBuffer(), {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });

  if (error) return json({ error: error.message }, 400);

  const { data } = adminClient.storage.from(MODEL_BUCKET).getPublicUrl(filePath);
  return json({ publicUrl: data.publicUrl, filePath });
}

export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    return uploadModelFile(request, guard.clients.adminClient);
  }

  const payload = cleanModelPayload(await request.json());
  if (!payload.name || !payload.model_url || !payload.file_path) {
    return json({ error: "Nombre, URL y ruta del modelo son requeridos." }, 400);
  }

  const { data, error } = await guard.clients.adminClient
    .from("product_models")
    .insert(payload)
    .select("*")
    .single();

  if (error) return json({ error: error.message }, 400);

  const syncError = await syncProductModelAssignment(guard.clients.adminClient, data as ProductModel);
  if (syncError) return json({ error: syncError.message }, 400);

  return json({ model: data }, 201);
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const body = await request.json();
  const id = String(body.id || "");
  const payload = cleanModelPayload(body.model || body);

  if (!id) return json({ error: "Modelo requerido." }, 400);
  if (!payload.name) return json({ error: "Nombre del modelo requerido." }, 400);

  const { data, error, count } = await guard.clients.adminClient
    .from("product_models")
    .update(payload, { count: "exact" })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return json({ error: error.message }, 400);
  if (count === 0 || !data) return json({ error: "No se encontro el modelo para actualizar." }, 404);

  const syncError = await syncProductModelAssignment(guard.clients.adminClient, data as ProductModel);
  if (syncError) return json({ error: syncError.message }, 400);

  return json({ model: data });
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  if (!id) return json({ error: "Modelo requerido." }, 400);

  const { data: existing, error: selectError } = await guard.clients.adminClient
    .from("product_models")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (selectError) return json({ error: selectError.message }, 400);
  if (!existing) return json({ error: "No se encontro el modelo para eliminar." }, 404);

  const model = existing as ProductModel;
  const { error } = await guard.clients.adminClient
    .from("product_models")
    .delete()
    .eq("id", id);

  if (error) return json({ error: error.message }, 400);

  if (model.file_path) {
    const { error: removeError } = await guard.clients.adminClient.storage
      .from(MODEL_BUCKET)
      .remove([model.file_path]);
    if (removeError) return json({ error: removeError.message }, 400);
  }

  if (model.product_id) {
    const { error: productError } = await guard.clients.adminClient
      .from("products")
      .update({
        model_3d_url: null,
        model_3d_scale: 1,
        model_3d_position_y: 0,
        model_3d_rotation_y: 0,
      })
      .eq("id", model.product_id);
    if (productError) return json({ error: productError.message }, 400);
  }

  return json({ ok: true });
}
