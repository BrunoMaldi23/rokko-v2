import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import type { ProductModel } from "@/types/productModel";

const MODEL_BUCKET = "product-models";

export type ProductModelInput = Omit<ProductModel, "id" | "created_at">;

export async function getProductModels() {
  if (!hasSupabaseConfig || !supabase) return [];

  const { data, error } = await supabase
    .from("product_models")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando modelos 3D:", error.message);
    return [];
  }

  return (data || []) as ProductModel[];
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
