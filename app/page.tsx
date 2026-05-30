"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const categories = [
  {
    name: "Poleras",
    emoji: "👕",
    slug: "poleras",
    desc: "Algodón premium y dry-fit de alto rendimiento.",
    aliases: ["polera", "poleras", "camiseta", "camisetas", "remera", "remeras"],
  },
  {
    name: "Polerones",
    emoji: "🧥",
    slug: "polerones",
    desc: "Abrigo corporativo con costuras reforzadas.",
    aliases: ["poleron", "polerones", "hoodie", "hoodies", "sudadera", "sweater"],
  },
  {
    name: "Parkas",
    emoji: "🥼",
    slug: "parkas",
    desc: "Modelos impermeables, térmicos y técnicos.",
    aliases: ["parka", "parkas", "chaqueta", "chaquetas", "cortaviento", "cortavientos"],
  },
  {
    name: "Pantalones",
    emoji: "👖",
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
    <main 
      className="flex min-h-screen flex-col overflow-hidden text-white" 
      /* DEGRADADO EN BASE A CIAN CORPORATIVO PERO SUAVIZADO Y ATENUADO */
      style={{
        background: "linear-gradient(135deg, #001a54 0%, #003b82 30%, #0077b6 60%, #00b4d8 85%, #e0f7fa 100%)"
      }}
    >
      <Header />

      <section className="relative flex flex-1 items-center justify-center px-6 py-4 lg:py-0">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr] lg:items-center xl:gap-14">
            <div className="space-y-5 animate-fade-in lg:max-w-md">
              
              {/* BADGE CRISTALIZADO EN TONOS CIAN FINOS */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">
                  Catálogo Corporativo 2026
                </p>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:leading-[1.15]">
                Eleva la identidad de tu{" "}
                {/* GRADIENTE DE TEXTO QUE ENCAJA PERFECTO CON LA MARCA */}
                <span className="inline-block bg-gradient-to-r from-cyan-200 via-cyan-100 to-white bg-clip-text text-transparent pb-1">
                  empresa
                </span>
              </h1>

              <p className="text-sm leading-relaxed text-white/80">
                Explora nuestra línea de vestuario corporativo profesional. Selecciona una categoría para configurar tu cotización con precios mayoristas automatizados e impresión de logos incluidos.
              </p>

              <div className="pt-1 relative">
                <form onSubmit={handleSearch} className="relative shadow-sm shadow-slate-100">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSearchError("");
                    }}
                    placeholder="¿Qué prenda buscas? Ej: Parkas..."
                    className="w-full rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 pr-12 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5"
                  />
                  <button
                    type="submit"
                    aria-label="Buscar categoría"
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-cyan-500 text-white transition-all hover:bg-cyan-600 active:scale-95"
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

              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
                <div>
                  <p className="text-base font-bold text-white">Descuentos</p>
                  <p className="text-[11px] font-medium text-white/70 mt-0.5">Por volumen</p>
                </div>
                <div>
                  <p className="text-base font-bold text-white">Estampado</p>
                  <p className="text-[11px] font-medium text-white/70 mt-0.5">Logo incluido</p>
                </div>
                <div>
                  <p className="text-base font-bold text-white">Despacho</p>
                  <p className="text-[11px] font-medium text-white/70 mt-0.5">A todo el país</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:max-h-[80vh]">
              {categories.map((category, i) => (
                <Link
                  key={category.slug}
                  href={`/cotizar/${category.slug}`}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/60 hover:shadow-md hover:shadow-cyan-500/5"
                  style={{ animationDelay: `${(i + 1) * 80}ms` }}
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-xl transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-100/50 group-hover:bg-cyan-50/50">
                      {category.emoji}
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-800 transition-colors group-hover:text-cyan-600">
                      {category.name}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {category.desc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 transition-colors">
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