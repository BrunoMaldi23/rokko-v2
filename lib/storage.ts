import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";

const BUCKET = "product-images";

export function parseImageField(image: string | null | undefined): string[] {
  if (!image) return [];
  if (image.startsWith("[")) {
    try {
      const parsed = JSON.parse(image);
      return Array.isArray(parsed)
        ? parsed.filter((u): u is string => typeof u === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [image];
}

function extractStoragePath(publicUrl: string): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped}/storage/v1/object/public/${BUCKET}/(.+)$`);
  const match = publicUrl.match(pattern);
  return match ? match[1] : null;
}

export async function uploadImage(
  file: File,
  productId: string
): Promise<string> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta configurado.");
  }
  const ext = file.name.split(".").pop() || "png";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `products/${productId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function deleteStorageImages(urls: string[]): Promise<void> {
  if (!hasSupabaseConfig || !supabase) return;

  const paths = urls
    .map(extractStoragePath)
    .filter((p): p is string => p !== null);

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw error;
}

export async function deleteProductImages(productId: string): Promise<void> {
  if (!hasSupabaseConfig || !supabase) return;

  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(`products/${productId}`);

  if (listError) {
    const msg = listError.message || "";
    if (msg.includes("not found") || msg.includes("does not exist")) return;
    throw listError;
  }

  if (!files || files.length === 0) return;

  const paths = files.map((f) => `products/${productId}/${f.name}`);
  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(paths);

  if (removeError) throw removeError;
}

interface MigrationResult {
  success: number;
  failed: number;
  errors: string[];
}

export async function migrateOldImages(
  onProgress?: (msg: string) => void
): Promise<MigrationResult> {
  const result: MigrationResult = { success: 0, failed: 0, errors: [] };

  if (!hasSupabaseConfig || !supabase) {
    result.errors.push("Supabase no esta configurado.");
    return result;
  }

  const log = (msg: string) => { if (onProgress) onProgress(msg); };

  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    result.errors.push(error.message);
    return result;
  }

  if (!products || products.length === 0) {
    log("No hay productos en catalogo.");
    return result;
  }

  let migrated = 0;
  let skipped = 0;

  for (const product of products) {
    const images = parseImageField(product.image);
    if (images.length === 0) continue;

    const alreadyMigrated = images.every(
      (img) => img.startsWith("http://") || img.startsWith("https://")
    );
    if (alreadyMigrated) { skipped++; continue; }

    log(`Migrando: ${product.short_name || product.name}...`);
    const newUrls: string[] = [];

    for (const imageUrl of images) {
      if (imageUrl.startsWith("http")) {
        newUrls.push(imageUrl);
        continue;
      }
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const fileName = imageUrl.split("/").pop() || "image.png";
        const file = new File([blob], fileName, { type: blob.type });
        const publicUrl = await uploadImage(file, product.id);
        newUrls.push(publicUrl);
        migrated++;
      } catch (err) {
        result.failed++;
        result.errors.push(
          `${product.short_name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    if (newUrls.length > 0) {
      const imageField = newUrls.length === 1 ? newUrls[0] : JSON.stringify(newUrls);
      const { error: updateError } = await supabase
        .from("products")
        .update({ image: imageField })
        .eq("id", product.id);
      if (updateError) {
        result.errors.push(`Error actualizando ${product.short_name}: ${updateError.message}`);
      }
    }
  }

  log(`Migracion completada: ${migrated} imagenes migradas, ${skipped} productos ya en Storage, ${result.failed} fallos.`);
  return result;
}
