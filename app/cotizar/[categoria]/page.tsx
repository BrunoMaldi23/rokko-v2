import QuoteBuilder from "@/components/QuoteBuilder";
import { getProductCategories } from "@/lib/productCategories";
import { getProductsByCategory } from "@/lib/products";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CotizarCategoria({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const [products, categories] = await Promise.all([
    getProductsByCategory(categoria),
    getProductCategories({ activeOnly: true }),
  ]);

  return (
    <main className="relative min-h-screen bg-bg text-text">
      {/* ─── Page background ─── */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,#f8fcfd_0%,#f3f8fa_42%,#edf8fa_100%)]" />

      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        {/* ─── Header ─── */}
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-white/82 px-4 py-1.5 shadow-[0_10px_28px_rgba(45,52,54,0.06)] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
              Cotizador ROKKO
            </p>
          </div>

          <h1 className="mt-5 text-4xl font-black leading-none tracking-tight text-text capitalize md:text-5xl lg:text-6xl">
            {categoria}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-muted">
            <span>{products.length} producto{products.length !== 1 ? "s" : ""}</span>
            <span className="h-1 w-1 rounded-full bg-accent/45" />
            <span>Personaliza colores, tallas y logo</span>
          </div>

          <nav className="mt-6 flex flex-wrap items-center gap-2" aria-label="Categorias del cotizador">
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3.5 text-xs font-black uppercase tracking-[0.12em] text-muted shadow-sm transition hover:border-accent/45 hover:text-accent-deep"
            >
              Inicio
            </Link>
            {categories.map((category) => {
              const active = category.slug === categoria;
              return (
                <Link
                  key={category.slug}
                  href={`/cotizar/${category.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-10 items-center rounded-xl border px-3.5 text-xs font-black uppercase tracking-[0.12em] shadow-sm transition ${
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-white text-muted hover:border-accent/45 hover:text-accent-deep"
                  }`}
                >
                  {category.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ─── Products ─── */}
        <div className="mt-10">
          <QuoteBuilder initialProducts={products} />
        </div>
      </div>
    </main>
  );
}
