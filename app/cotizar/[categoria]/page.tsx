import QuoteBuilder from "@/components/QuoteBuilder";
import { getProductsByCategory } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CotizarCategoria({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const products = await getProductsByCategory(categoria);

  return (
    <main className="relative min-h-screen">
      {/* ─── Organic background shapes ─── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-accent/3 blur-[100px]" />
        <div className="absolute left-1/3 top-1/3 h-[200px] w-[200px] rounded-full bg-accent/4 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* ─── Header ─── */}
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-accent/10 bg-white/70 px-4 py-1.5 shadow-xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
              Cotizador ROKKO
            </p>
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-neutral-900 capitalize md:text-5xl lg:text-6xl">
            {categoria}
          </h1>

          <div className="mt-3 flex items-center gap-3 text-sm text-neutral-400">
            <span>{products.length} producto{products.length !== 1 ? "s" : ""}</span>
            <span className="h-1 w-1 rounded-full bg-neutral-300" />
            <span>Personaliza colores, tallas y logo</span>
          </div>
        </div>

        {/* ─── Products ─── */}
        <div className="mt-10">
          <QuoteBuilder initialProducts={products} />
        </div>
      </div>
    </main>
  );
}
