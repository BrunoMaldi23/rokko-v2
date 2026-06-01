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

      {/* blur decorative */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] -translate-y-1/4 translate-x-1/4 rounded-full bg-gradient-to-br from-accent/10 to-accent-soft/50 blur-[120px]" />

      <section className="relative flex flex-1 items-center justify-center px-6 py-4 lg:py-0">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr] lg:items-center xl:gap-14">
            <div className="space-y-5 animate-fade-in lg:max-w-md">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#e5ddd4] bg-white/90 px-5 py-2 shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-accent">
                  Catálogo Corporativo 2026
                </p>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-[#1e1e1e] sm:text-5xl lg:leading-[1.15]">
                Eleva la identidad de tu{" "}
                <span className="text-accent">
                  empresa
                </span>
              </h1>

              <p className="text-sm leading-relaxed text-muted">
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
                    className="w-full rounded-2xl border border-[#e5ddd4] bg-white/90 px-5 py-3.5 pr-12 text-sm text-[#1e1e1e] outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-muted focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
                  />
                  <button
                    type="submit"
                    aria-label="Buscar categoría"
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-brand-dark text-white transition-all hover:bg-accent active:scale-95"
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

              <div className="grid grid-cols-3 gap-4 border-t border-[#e5ddd4] pt-5">
                <div>
                  <p className="text-base font-bold text-[#1e1e1e]">Descuentos</p>
                  <p className="text-[11px] font-medium text-muted mt-0.5">Por volumen</p>
                </div>
                <div>
                  <p className="text-base font-bold text-[#1e1e1e]">Estampado</p>
                  <p className="text-[11px] font-medium text-muted mt-0.5">Logo incluido</p>
                </div>
                <div>
                  <p className="text-base font-bold text-[#1e1e1e]">Despacho</p>
                  <p className="text-[11px] font-medium text-muted mt-0.5">A todo el país</p>
                </div>
              </div>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:max-h-[80vh]">
              {categories.map((category, i) => (
                <Link
                  key={category.slug}
                  href={`/cotizar/${category.slug}`}
                  className="group relative flex flex-col justify-between rounded-3xl border border-[#e5ddd4] bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl hover:shadow-accent/10"
                  style={{ animationDelay: `${(i + 1) * 80}ms` }}
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5ddd4] bg-gradient-to-br from-accent-soft to-[#ecd5cc] text-xl transition-all duration-300 group-hover:scale-105 group-hover:from-[#ecd5cc] group-hover:to-[#e0c0b5]">
                      {category.emoji}
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-[#1e1e1e] transition-colors group-hover:text-accent">
                      {category.name}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      {category.desc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent transition-colors">
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
