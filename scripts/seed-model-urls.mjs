/**
 * Seed script: asigna model_3d_url a productos en Supabase,
 * apuntando a los GLBs 3D generados en public/models/productos/
 *
 * USO:
 *   set NODE_PWD=... && node scripts/seed-model-urls.mjs
 *   (o con las env vars en .env.local)
 *
 * Necesita: NEXT_PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY (o SUPABASE_ANON_KEY)
 */

const { createClient } = await import("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan env vars: NEXT_PUBLIC_SUPABASE_URL y SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

// Mapeo: slug de categoria → GLB generado
// El GLB está en public/models/productos/<slug>_<short_name>.glb
const CATEGORY_MAP = {
  polera: "polera",
  "poleron-cuello-redondo": "poleron cuello redondo",
  "poleron-polo-unisex": "poleron POLO unisex",
  micropolar: "micropolar",
  parkas: "parkas",
};

async function main() {
  console.log("Fetching products...");
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, short_name, category, model_3d_url");

  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }

  let updated = 0;
  for (const product of products) {
    if (product.model_3d_url) {
      console.log(`SKIP ${product.short_name}: already has model_3d_url`);
      continue;
    }

    const prefix = CATEGORY_MAP[product.slug];
    if (!prefix) {
      console.log(`SKIP ${product.short_name}: no category mapping for slug="${product.slug}"`);
      continue;
    }

    // Construir la URL del GLB local
    const cleanName = (product.short_name || product.name || "").trim();
    if (!cleanName) {
      console.log(`SKIP ${product.id}: no name`);
      continue;
    }

    // Buscar el GLB existente
    const glbName = `${prefix}_${cleanName}.glb`;
    const modelUrl = `/models/productos/${glbName}`;

    const { error: updateError } = await supabase
      .from("products")
      .update({ model_3d_url: modelUrl })
      .eq("id", product.id);

    if (updateError) {
      console.error(`ERROR updating ${product.short_name}:`, updateError);
    } else {
      console.log(`OK ${product.short_name} → ${modelUrl}`);
      updated++;
    }
  }

  console.log(`\nDone. Updated ${updated} products.`);
}

main().catch(console.error);
