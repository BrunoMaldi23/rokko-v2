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
    <main className="relative min-h-screen bg-[#eef3f5] text-[#071827] rokko-dark:bg-[#0b1319] rokko-dark:text-[#f8fafc]">
      {/* ─── Page background ─── */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,#f8fcfd_0%,#f3f8fa_42%,#edf8fa_100%)] rokko-dark:bg-[linear-gradient(180deg,#0b1319_0%,#101c25_48%,#0d171f_100%)]" />

      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        {/* ─── Header ─── */}
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#c9d8df] bg-white/82 px-4 py-1.5 shadow-[0_10px_28px_rgba(45,52,54,0.06)] backdrop-blur-md rokko-dark:border-[#243542] rokko-dark:bg-[#111b22]/82">
            <span className="h-2 w-2 rounded-full bg-[#20b8c7] animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#087381] rokko-dark:text-[#67d5df]">
              Cotizador ROKKO
            </p>
          </div>

          <h1 className="mt-5 text-4xl font-black leading-none tracking-tight text-[#071827] capitalize md:text-5xl lg:text-6xl rokko-dark:text-[#f8fafc]">
            {categoria}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-[#526879] rokko-dark:text-[#cbd5e1]">
            <span>{products.length} producto{products.length !== 1 ? "s" : ""}</span>
            <span className="h-1 w-1 rounded-full bg-[#20b8c7]/45" />
            <span>Personaliza colores, tallas y logo</span>
          </div>

          <nav className="mt-6 flex flex-wrap items-center gap-2" aria-label="Categorias del cotizador">
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#c9d8df] bg-white px-3.5 text-xs font-black uppercase tracking-[0.12em] text-[#526879] shadow-sm transition hover:border-[#20b8c7]/45 hover:text-[#087381] rokko-dark:border-[#243542] rokko-dark:bg-[#121f2a] rokko-dark:text-[#cbd5e1] rokko-dark:hover:border-[#20b8c7]/60 rokko-dark:hover:text-[#67d5df]"
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
                      ? "border-[#20b8c7] bg-[#20b8c7] text-white rokko-dark:border-[#67d5df] rokko-dark:bg-[#128896]"
                      : "border-[#c9d8df] bg-white text-[#526879] hover:border-[#20b8c7]/45 hover:text-[#087381] rokko-dark:border-[#243542] rokko-dark:bg-[#121f2a] rokko-dark:text-[#cbd5e1] rokko-dark:hover:border-[#20b8c7]/60 rokko-dark:hover:text-[#67d5df]"
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
