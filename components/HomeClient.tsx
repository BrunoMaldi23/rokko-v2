"use client";

import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";

const categories = [
  {
    name: "Poleras",
    slug: "poleras",
    code: "PL",
    desc: "Prendas livianas para equipos comerciales y uso diario.",
    tint: "bg-accent-soft text-accent",
  },
  {
    name: "Polerones",
    slug: "polerones",
    code: "PR",
    desc: "Abrigo corporativo comodo, resistente y personalizable.",
    tint: "bg-surface-2 text-brand-dark",
  },
  {
    name: "Parkas",
    slug: "parkas",
    code: "PK",
    desc: "Modelos termicos, impermeables y tecnicos para exterior.",
    tint: "bg-accent-soft text-accent-deep",
  },
  {
    name: "Pantalones",
    slug: "pantalones",
    code: "PT",
    desc: "Lineas funcionales para operacion, oficina y terreno.",
    tint: "bg-surface-2 text-muted",
  },
];

const colorMap: Record<string, string> = {
  blanco: "#ffffff",
  negro: "#111111",
  "azul marino": "#1e3a5f",
  azul: "#2563eb",
  "azul rey": "#1d4ed8",
  rojo: "#dc2626",
  verde: "#16a34a",
  gris: "#6b7280",
  naranja: "#ea580c",
  beige: "#d8c3a5",
  burdeo: "#7f1d1d",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function colorHex(name: string): string {
  return colorMap[normalize(name)] || "#94a3b8";
}

type HomeClientProps = {
  initialProducts: Product[];
};

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeRow, setActiveRow] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const normalizedProducts = useMemo(
    () =>
      initialProducts.map((p) => ({
        product: p,
        haystack: normalize(
          `${p.name} ${p.short_name} ${p.description || ""} ${p.extract || ""} ${p.colors
            .map(normalize)
            .join(" ")} ${p.technologies
            .map(normalize)
            .join(" ")} ${p.category}`
        ),
      })),
    [initialProducts]
  );

  const deferredSearch = useDeferredValue(search);
  const isSearching = search !== deferredSearch;

  const results = useMemo(() => {
    const q = normalize(deferredSearch);
    if (!q || q.length < 2) return [];

    return normalizedProducts
      .filter(({ haystack }) => haystack.includes(q))
      .slice(0, 6)
      .map(({ product }) => product);
  }, [deferredSearch, normalizedProducts]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setSearchError("");
      setShowResults(true);
      setActiveRow(-1);
    },
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveRow((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveRow((prev) => (prev > 0 ? prev - 1 : -1));
    }

    if (e.key === "Enter" && activeRow >= 0) {
      e.preventDefault();
      router.push(`/cotizar/${results[activeRow].category}`);
      setShowResults(false);
    }

    if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = normalize(search);

    if (!q || q.length < 2) {
      setSearchError("Escribe al menos 2 caracteres.");
      return;
    }

    if (results.length > 0) {
      router.push(`/cotizar/${results[0].category}`);
    } else {
      setSearchError("No encontramos productos con ese termino.");
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-bg text-text">
      <section className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-5 py-14 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-px bg-border" />
        <div className="pointer-events-none absolute left-4 top-10 h-80 w-80 rounded-full bg-accent/8 blur-[90px]" />
        <div className="pointer-events-none absolute right-16 bottom-10 h-72 w-72 rounded-full bg-accent-soft/50 blur-[100px]" />

        <div className="relative grid w-full items-center gap-12 rounded-[2rem] border border-white/80 bg-white/70 px-5 py-10 shadow-[0_24px_80px_rgba(45,52,54,0.08)] backdrop-blur-xl sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-14">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/90 px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.32em] text-accent">
              Catalogo corporativo 2026
            </span>
          </div>

          <h1 className="mt-6 text-5xl font-black leading-[0.98] text-text sm:text-6xl">
            Eleva la identidad de tu{" "}
            <span className="text-accent">empresa</span>.
          </h1>

          <p className="mt-6 max-w-md text-sm font-medium leading-7 text-muted">
            Selecciona una linea de vestuario corporativo y arma una cotizacion clara, visual y lista para tu equipo.
          </p>

          <div className="relative z-30 mt-7 max-w-lg">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(45,52,54,0.08)]"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={() => search.length >= 2 && setShowResults(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Busca por nombre, color o tecnologia..."
                  className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-text outline-none placeholder:text-muted/60"
                />

                <button
                  type="submit"
                  aria-label="Buscar"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-white transition hover:bg-accent active:scale-[0.96]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />
                  </svg>
                </button>
              </div>
            </form>

            {searchError && (
              <p className="mt-2 text-xs font-bold text-red-600">{searchError}</p>
            )}

            {showResults && search.length >= 2 && (
              <div
                ref={resultsRef}
                className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_70px_rgba(45,52,54,0.16)]"
              >
                {isSearching ? (
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded-md bg-surface-2" />
                    <div className="h-3 w-1/2 animate-pulse rounded-md bg-surface-2" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="max-h-[300px] divide-y divide-border overflow-y-auto">
                    {results.map((p, index) => (
                      <Link
                        key={p.id}
                        href={`/cotizar/${p.category}`}
                        onClick={() => setShowResults(false)}
                        className={`block px-4 py-3 transition ${
                          index === activeRow ? "bg-surface-2" : "hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">{p.name}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              {p.colors.slice(0, 6).map((c) => (
                                <span
                                  key={c}
                                  className="h-3 w-3 rounded-full border border-black/10"
                                  style={{ backgroundColor: colorHex(c) }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="shrink-0 text-xs font-black text-accent">
                            ${p.price.toLocaleString("es-CL")}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-sm font-bold text-muted">
                    No hay resultados para &quot;{search}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
            {[
              ["Descuentos", "Por volumen"],
              ["Estampado", "Logo incluido"],
              ["Despacho", "A todo el pais"],
            ].map(([title, caption]) => (
              <div key={title}>
                <p className="text-sm font-black text-text">{title}</p>
                <p className="mt-1 text-[11px] font-medium text-muted">{caption}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/cotizar/${category.slug}`}
              className="group min-h-[132px] rounded-[20px] border border-border bg-white p-5 shadow-[0_12px_32px_rgba(45,52,54,0.06)] transition hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-[0_18px_45px_rgba(45,52,54,0.11)]"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black ${category.tint}`}>
                {category.code}
              </div>

              <h2 className="mt-4 text-base font-black text-text">{category.name}</h2>
              <p className="mt-2 max-w-[260px] text-[11px] font-medium leading-5 text-muted">{category.desc}</p>

              <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-accent">
                Explorar
                <span className="transition group-hover:translate-x-1">-&gt;</span>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </section>
    </main>
  );
}
