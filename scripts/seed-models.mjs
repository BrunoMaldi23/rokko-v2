/**
 * seed-models.mjs
 *
 * Sube los modelos GLB locales al bucket product-models de Supabase
 * y crea registros en la tabla product_models.
 *
 * Uso:
 *   1. Configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 *   2. node scripts/seed-models.mjs
 *
 * Requisitos:
 *   - Supabase service_role key (con permisos para storage + insert)
 *   - Migration 007 ejecutada en Supabase SQL Editor
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Cargar .env.local manualmente
const envPath = join(root, ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(`
  ⚠️  Faltan variables de entorno.
  Agrega a .env.local:
    SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
  
  La service_role key la encuentras en:
  Supabase Dashboard → Project Settings → API → service_role key
  `);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const MODEL_BUCKET = "product-models";
const MANNEQUIN_PATH = join(root, "public", "models", "mannequin.glb");
const PRODUCTS_DIR = join(root, "public", "models", "productos");
const MANIFEST_PATH = join(root, "public", "models", "productos-manifest.json");

async function uploadFile(filePath, storagePath) {
  const fileBuffer = readFileSync(filePath);
  const ext = filePath.endsWith(".gltf") ? "model/gltf+json" : "model/gltf-binary";

  const { error } = await supabase.storage
    .from(MODEL_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: ext,
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    // Si el bucket no existe, intentar crearlo
    if (error.message?.includes("bucket")) {
      console.log("  → Creando bucket product-models...");
      const { error: bucketError } = await supabase.storage.createBucket(MODEL_BUCKET, {
        public: true,
      });
      if (bucketError) {
        throw new Error(`No se pudo crear el bucket: ${bucketError.message}`);
      }
      // Reintentar upload
      const { error: retryError } = await supabase.storage
        .from(MODEL_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: ext,
          upsert: true,
          cacheControl: "3600",
        });
      if (retryError) throw retryError;
    } else {
      throw error;
    }
  }

  const { data: urlData } = supabase.storage.from(MODEL_BUCKET).getPublicUrl(storagePath);
  return urlData.publicUrl;
}

async function seedMannequin() {
  console.log("\n📦 Maniquí base (mannequin.glb)");
  if (!existsSync(MANNEQUIN_PATH)) {
    console.log("  ⚠️  No encontrado. S altando.");
    return null;
  }

  const storagePath = "models/mannequin.glb";
  console.log(`  → Subiendo a ${MODEL_BUCKET}/${storagePath}...`);
  const publicUrl = await uploadFile(MANNEQUIN_PATH, storagePath);
  console.log(`  → URL pública: ${publicUrl}`);

  return {
    name: "Maniquí base",
    category: "base",
    model_url: publicUrl,
    file_path: storagePath,
    scale: 0.85,
    position_y: -0.3,
    rotation_y: 0,
    base_model: true,
  };
}

async function seedProductModels() {
  console.log("\n📦 Modelos de producto (desde manifest)");
  if (!existsSync(MANIFEST_PATH)) {
    console.log("  ⚠️  Manifest no encontrado. Saltando.");
    return [];
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
  const results = [];

  for (const entry of manifest) {
    const localPath = join(root, "public", entry.model_url);
    if (!existsSync(localPath)) {
      console.log(`  ⚠️  No encontrado: ${entry.model_url}`);
      continue;
    }

    const storagePath = entry.file_path;
    console.log(`  → ${entry.name}...`);

    try {
      const publicUrl = await uploadFile(localPath, storagePath);
      results.push({
        name: entry.name,
        category: entry.category,
        product_id: entry.product_id || null,
        model_url: publicUrl,
        file_path: storagePath,
        scale: entry.scale || 1,
        position_y: entry.position_y || 0,
        rotation_y: entry.rotation_y || 0,
        base_model: false,
      });
      console.log(`    ✓ ${publicUrl}`);
    } catch (err) {
      console.error(`    ✗ Error: ${err.message}`);
    }
  }

  return results;
}

async function insertRecords(records) {
  console.log("\n💾 Insertando registros en product_models...");

  if (records.length === 0) {
    console.log("  No hay registros para insertar.");
    return;
  }

  // Eliminar registros previos de seed (base_model=true o file_path existente)
  const paths = records.map((r) => r.file_path);
  const { error: delError } = await supabase
    .from("product_models")
    .delete()
    .in("file_path", paths);

  if (delError) {
    console.log(`  ⚠️  No se pudo limpiar registros previos: ${delError.message}`);
  }

  const { error } = await supabase.from("product_models").insert(records);
  if (error) {
    console.error(`  ✗ Error insertando: ${error.message}`);
    return;
  }

  console.log(`  ✓ ${records.length} registros insertados.`);
}

async function main() {
  console.log("🚀 Seed de modelos 3D para Rokko Cotizador\n");
  console.log(`URL: ${supabaseUrl}`);

  const mannequin = await seedMannequin();
  const products = await seedProductModels();

  const allRecords = [mannequin, ...products].filter(Boolean);
  await insertRecords(allRecords);

  console.log("\n✅ Seed completado.");
  console.log(`   Total: ${allRecords.length} modelos`);

  if (mannequin) {
    console.log("\n📝 Actualiza Visualizador3D con esta URL del maniquí base:");
    console.log(`   ${mannequin.model_url}`);
  }
}

main().catch(console.error);
