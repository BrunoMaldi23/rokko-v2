import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import type { ProductModel } from "@/types/productModel";
import { BASE_MODEL_MAP } from "@/lib/baseModels";

const MODEL_BUCKET = "product-models";

export type ProductModelInput = Omit<ProductModel, "id" | "created_at">;

const BASE_MODEL_LABELS: Record<string, string> = {
  "t-shirt": "Polera manga corta base",
  "t-shirt manga larga": "Polera manga larga base",
  polo: "Polera polo base",
  "poleron-cuello-redondo": "Poleron cuello redondo base",
  "poleron-polo-unisex": "Poleron polo unisex base",
  hoodie: "Hoodie base",
  "parka-hombre": "Parka hombre base",
  "parka-desmontable": "Parka desmontable con puno base",
  "parka-desmontable-sin-gorro": "Parka desmontable sin gorro base",
  "softshell-basico-hombre": "Softshell basico hombre base",
  "softshell-basico-mujer": "Softshell basico mujer base",
  "softshell-termico-hombre": "Softshell termico hombre base",
  "softshell-termico-mujer": "Softshell termico mujer base",
  "micropolar-hombre": "Micropolar hombre base",
  "micropolar-mujer": "Micropolar mujer base",
  micropolar: "Micropolar base",
  shirt: "Camisa base",
  camisa: "Camisa base",
  blusa: "Blusa base",
  "pantalon-cargo": "Pantalon cargo base",
  pantalon: "Pantalon base",
};

function categoryForGarmentType(type: string) {
  if (/poleron|hoodie/.test(type)) return "polerones";
  if (/parka|softshell/.test(type)) return "parkas";
  if (/pantalon/.test(type)) return "pantalones";
  if (/micropolar/.test(type)) return "micropolar";
  if (/camisa|shirt|blusa/.test(type)) return "camisas";
  return "poleras";
}

function defaultRotationForGarmentType(type: string) {
  void type;
  return 0;
}

const LOCAL_BASE_MODELS: ProductModel[] = Object.entries(BASE_MODEL_MAP).map(([type, url]) => ({
  id: `local-base-${type}`,
  name: BASE_MODEL_LABELS[type] || `${type} base`,
  category: categoryForGarmentType(type),
  product_id: null,
  model_url: url,
  file_path: url.replace(/^\/+/, ""),
  scale: 1,
  position_y: 0,
  rotation_y: defaultRotationForGarmentType(type),
  base_model: true,
  created_at: null,
}));

export async function getProductModels() {
  if (!hasSupabaseConfig || !supabase) return LOCAL_BASE_MODELS;

  const { data, error } = await supabase
    .from("product_models")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando modelos 3D:", error.message);
    return LOCAL_BASE_MODELS;
  }

  return [...LOCAL_BASE_MODELS, ...((data || []) as ProductModel[])];
}

export async function uploadProductModelFile(file: File) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "glb";
  if (!["glb", "gltf"].includes(ext)) {
    throw new Error("Solo se permiten archivos .glb o .gltf.");
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

  const { error } = await supabase.storage
    .from(MODEL_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: ext === "glb" ? "model/gltf-binary" : "model/gltf+json",
    });

  if (error) throw error;

  const { data } = supabase.storage.from(MODEL_BUCKET).getPublicUrl(filePath);
  return { publicUrl: data.publicUrl, filePath };
}

export async function createProductModel(input: ProductModelInput) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const payload = {
    name: input.name,
    category: input.category || "poleras",
    product_id: input.product_id || null,
    model_url: input.model_url,
    file_path: input.file_path,
    scale: Number(input.scale || 1),
    position_y: Number(input.position_y || 0),
    rotation_y: Number(input.rotation_y || 0),
  };

  const { data, error } = await supabase
    .from("product_models")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  await syncProductModelAssignment(data as ProductModel);
  return data as ProductModel;
}

export async function updateProductModel(model: ProductModel) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data, error } = await supabase
    .from("product_models")
    .update({
      name: model.name,
      category: model.category,
      product_id: model.product_id || null,
      scale: Number(model.scale || 1),
      position_y: Number(model.position_y || 0),
      rotation_y: Number(model.rotation_y || 0),
    })
    .eq("id", model.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  await syncProductModelAssignment(data as ProductModel);
  return data as ProductModel;
}

export async function deleteProductModel(model: ProductModel) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { error } = await supabase.from("product_models").delete().eq("id", model.id);
  if (error) throw new Error(error.message);

  if (model.file_path) {
    const { error: removeError } = await supabase.storage.from(MODEL_BUCKET).remove([model.file_path]);
    if (removeError) console.error("Error eliminando archivo 3D:", removeError.message);
  }

  if (model.product_id) {
    await supabase
      .from("products")
      .update({ model_3d_url: null, model_3d_scale: 1, model_3d_position_y: 0, model_3d_rotation_y: 0 })
      .eq("id", model.product_id);
  }
}

export async function syncProductModelAssignment(model: ProductModel) {
  if (!hasSupabaseConfig || !supabase || !model.product_id) return;

  const { error } = await supabase
    .from("products")
    .update({
      model_3d_url: model.model_url,
      model_3d_scale: Number(model.scale || 1),
      model_3d_position_y: Number(model.position_y || 0),
      model_3d_rotation_y: Number(model.rotation_y || 0),
    })
    .eq("id", model.product_id);

  if (error) throw new Error(error.message);
}
