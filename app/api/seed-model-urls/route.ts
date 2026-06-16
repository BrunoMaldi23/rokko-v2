import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDetectedBaseModelUrl } from "@/lib/baseModels";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, short_name, name, category, model_3d_url")
    .or("model_3d_url.is.null,model_3d_url.like./models/productos/%,model_3d_url.like.%/models/productos/%");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;
  const results: { name: string; url: string | null; error?: string }[] = [];

  for (const product of products) {
    if (!(product.short_name || product.name || "").trim()) {
      results.push({ name: product.id, url: null, error: "no name" });
      continue;
    }

    const modelUrl = getDetectedBaseModelUrl([
      product.category,
      product.slug,
      product.short_name,
      product.name,
    ]);

    if (!modelUrl) {
      results.push({ name: product.short_name || product.name, url: null, error: "no base model mapping" });
      continue;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ model_3d_url: modelUrl })
      .eq("id", product.id);

    if (updateError) {
      results.push({ name: product.short_name || product.name, url: modelUrl, error: updateError.message });
    } else {
      results.push({ name: product.short_name || product.name, url: modelUrl });
      updated++;
    }
  }

  return NextResponse.json({ updated, results });
}
