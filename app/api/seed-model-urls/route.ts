import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CATEGORY_MAP: Record<string, string> = {
  polera: "polera",
  "poleron-cuello-redondo": "poleron cuello redondo",
  "poleron-polo-unisex": "poleron POLO unisex",
  micropolar: "micropolar",
  parkas: "parkas",
};

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, short_name, name, category, model_3d_url")
    .is("model_3d_url", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;
  const results: { name: string; url: string | null; error?: string }[] = [];

  for (const product of products) {
    const prefix = CATEGORY_MAP[product.slug];
    if (!prefix) {
      results.push({ name: product.short_name || product.name, url: null, error: "no category mapping" });
      continue;
    }

    const cleanName = (product.short_name || product.name || "").trim();
    if (!cleanName) {
      results.push({ name: product.id, url: null, error: "no name" });
      continue;
    }

    const modelUrl = `/models/productos/${prefix}_${cleanName}.glb`;

    const { error: updateError } = await supabase
      .from("products")
      .update({ model_3d_url: modelUrl })
      .eq("id", product.id);

    if (updateError) {
      results.push({ name: cleanName, url: modelUrl, error: updateError.message });
    } else {
      results.push({ name: cleanName, url: modelUrl });
      updated++;
    }
  }

  return NextResponse.json({ updated, results });
}
