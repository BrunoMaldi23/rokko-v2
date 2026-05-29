import Header from "@/components/Header";
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
    <main className="min-h-screen overflow-hidden">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/60 bg-white/90 px-5 py-2 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-700">
              Cotizador ROKKO
            </p>
          </div>

          <h1 className="mt-4 text-4xl font-black text-slate-950 capitalize md:text-5xl">
            {categoria}
          </h1>
        </div>

        <QuoteBuilder initialProducts={products} />
      </div>
    </main>
  );
}
