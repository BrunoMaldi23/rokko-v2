"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const categories = [
  {
    name: "Poleras",
    emoji: "\uD83D\uDE55",
    slug: "poleras",
    desc: "Algodón premium y dry-fit de alto rendimiento.",
    aliases: ["polera", "poleras", "camiseta", "camisetas", "remera", "remeras"],
  },
  {
    name: "Polerones",
    emoji: "\uD83E\uDDE5",
    slug: "polerones",
    desc: "Abrigo corporativo con costuras reforzadas.",
    aliases: ["poleron", "polerones", "hoodie", "hoodies", "sudadera", "sweater"],
  },
  {
    name: "Parkas",
    emoji: "\uD83E\uDD7C",
    slug: "parkas",
    desc: "Modelos impermeables, térmicos y técnicos.",
    aliases: ["parka", "parkas", "chaqueta", "chaquetas", "cortaviento", "cortavientos"],
  },
  {
    name: "Pantalones",
    emoji: "\uD83D\uDC56",
    slug: "pantalones",
    desc: "Líneas de carga funcionales y cortes formales.",
    aliases: ["pantalon", "pantalones", "cargo", "cargos", "jeans"],
  },
];

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");

  const aliases = useMemo(
    () =>
      categories.flatMap((category) =>
        category.aliases.map((alias) => ({
          alias,
          name: category.name,
          slug: category.slug,
        }))
      ),
    []
  );

  function normalize(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const query = normalize(search);
    if (!query) {
      setSearchError("Escribe una categoría para buscar.");
      return;
    }

    const match = aliases.find(({ alias, name }) => {
      const normalizedAlias = normalize(alias);
      const normalizedName = normalize(name);

      return (
        query === normalizedAlias ||
        query === normalizedName ||
        normalizedAlias.includes(query) ||
        query.includes(normalizedAlias)
      );
    });

    if (!match) {
      setSearchError("Prueba con poleras, polerones, parkas o pantalones.");
      return;
    }

    router.push(`/cotizar/${match.slug}`);
  }

  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <Header />

      <section className="relative flex flex-1 items-center justify-center px-6 py-4 lg:py-0">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr] lg:items-center xl:gap-14">
            <div className="space-y-5 animate-fade-in lg:max-w-md">
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/60 bg-white/90 px-5 py-2 shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-700">
                  Catálogo Corporativo 2026
                </p>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:leading-[1.15]">
                Eleva la identidad de tu{" "}
                <span className="text-cyan-700">
                  empresa
                </span>
              </h1>

              <p className="text-sm leading-relaxed text-slate-600">
                Explora nuestra línea de vestuario corporativo profesional. Selecciona una categoría para configurar tu cotización con precios mayoristas automatizados e impresión de logos incluidos.
              </p>

              <div className="pt-1 relative">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSearchError("");
                    }}
                    placeholder="¿Qué prenda buscas? Ej: Parkas..."
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-3.5 pr-12 text-sm text-slate-800 outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  />
                  <button
                    type="submit"
                    aria-label="Buscar categoría"
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-950 text-white transition-all hover:bg-cyan-700 active:scale-95"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5-5M10 18a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                  </button>
                </form>
                {searchError && (
                  <p className="absolute left-1 top-full mt-1 text-[11px] font-semibold text-red-500">{searchError}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-200/60 pt-5">
                <div>
                  <p className="text-base font-bold text-slate-950">Descuentos</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Por volumen</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-950">Estampado</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Logo incluido</p>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-950">Despacho</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">A todo el país</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:max-h-[80vh]">
              {categories.map((category, i) => (
                <Link
                  key={category.slug}
                  href={`/cotizar/${category.slug}`}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/10"
                  style={{ animationDelay: `${(i + 1) * 80}ms` }}
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-gradient-to-br from-cyan-50 to-cyan-100/50 text-xl transition-all duration-300 group-hover:scale-105 group-hover:from-cyan-100 group-hover:to-cyan-200/50">
                      {category.emoji}
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-950 transition-colors group-hover:text-cyan-700">
                      {category.name}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                      {category.desc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 transition-colors">
                    <span>Explorar</span>
                    <svg
                      className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
