"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  Briefcase,
  Package,
  Search,
  ShieldCheck,
  Shield,
  Shirt,
  Snowflake,
  Sparkles,
  Thermometer,
  Truck,
  Wind,
  Wrench,
} from "lucide-react";
import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import type { ProductCategory } from "@/types/category";

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

type AccentConfig = {
  icon: React.ElementType;
  tag: string;
  accent: string;
  iconBg: string;
  iconBgDark: string;
};

const CATEGORY_STYLES: Record<string, Partial<AccentConfig>> = {
  polera: {
    icon: Shirt,
    tag: "Diario",
    accent: "#00b8c8",
    iconBg: "#e6f9fa",
    iconBgDark: "rgba(0,184,200,0.15)",
  },
  camisa: {
    icon: Briefcase,
    tag: "Ejecutivo",
    accent: "#5B6ED8",
    iconBg: "#eef0fd",
    iconBgDark: "rgba(91,110,216,0.15)",
  },
  blusa: {
    icon: Briefcase,
    tag: "Ejecutivo",
    accent: "#5B6ED8",
    iconBg: "#eef0fd",
    iconBgDark: "rgba(91,110,216,0.15)",
  },
  poleron: {
    icon: Package,
    tag: "Abrigo",
    accent: "#12967a",
    iconBg: "#e4f7f1",
    iconBgDark: "rgba(18,150,122,0.15)",
  },
  cortaviento: {
    icon: Wind,
    tag: "Exterior",
    accent: "#0b8f7c",
    iconBg: "#e2f5f1",
    iconBgDark: "rgba(11,143,124,0.15)",
  },
  polar: {
    icon: Thermometer,
    tag: "Térmico",
    accent: "#ea580c",
    iconBg: "#fdf2e0",
    iconBgDark: "rgba(234,88,12,0.15)",
  },
  parka: {
    icon: Snowflake,
    tag: "Invierno",
    accent: "#1b6fb5",
    iconBg: "#e8f2fc",
    iconBgDark: "rgba(27,111,181,0.15)",
  },
  pantalon: {
    icon: Wrench,
    tag: "Operación",
    accent: "#087381",
    iconBg: "#e6f9fa",
    iconBgDark: "rgba(8,115,129,0.15)",
  },
  softshell: {
    icon: Shield,
    tag: "Técnico",
    accent: "#6d3fbe",
    iconBg: "#f0ebfc",
    iconBgDark: "rgba(109,63,190,0.15)",
  },
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getCategoryAccent(category: ProductCategory): AccentConfig {
  const key = normalize(`${category.slug} ${category.label}`);
  const foundKey = Object.keys(CATEGORY_STYLES).find((k) => key.includes(k));

  return (CATEGORY_STYLES[foundKey ?? ""] ?? {
    icon: Sparkles,
    tag: "Corporativo",
    accent: "#b0357a",
    iconBg: "#fceef6",
    iconBgDark: "rgba(176,53,122,0.15)",
  }) as AccentConfig;
}

const InfoCard = React.memo(function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe9ed] bg-white/85 p-4 shadow-[0_8px_22px_rgba(15,31,43,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#b9e6eb] rokko-dark:border-[#1e2d38] rokko-dark:bg-[#162430] rokko-dark:hover:border-[#00b8c8]/50">
      <Icon className="mb-2 h-[18px] w-[18px] text-[#087381] rokko-dark:text-[#00b8c8]" />
      <p className="text-[13px] font-black tracking-[-0.02em] text-[#0f1f2b] rokko-dark:text-[#f8fafc]">
        {title}
      </p>
      <p className="mt-0.5 text-[11px] font-medium leading-[1.4] text-[#6f8594] rokko-dark:text-[#94a3b8]">
        {text}
      </p>
    </div>
  );
});

const CategoryRow = React.memo(function CategoryRow({
  category,
  index,
}: {
  category: ProductCategory;
  index: number;
}) {
  const cfg = getCategoryAccent(category);
  const Icon = cfg.icon;
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/cotizar/${category.slug}`}
      className="group relative grid min-h-[53px] grid-cols-[34px_42px_1fr_30px] items-center gap-3 overflow-hidden rounded-[16px] border border-[#ccdce3] bg-[#fbfdfe] px-4 py-2 shadow-[0_4px_12px_rgba(15,31,43,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#80d9e0] hover:bg-white hover:shadow-[0_10px_26px_rgba(8,115,129,0.09)] rokko-dark:border-[#243542] rokko-dark:bg-[#162530] rokko-dark:hover:border-[#00b8c8] rokko-dark:hover:bg-[#1c2e3d]"
    >
      <span
        className="absolute bottom-0 left-0 top-0 w-[3px]"
        style={{ background: cfg.accent }}
        aria-hidden="true"
      />

      <span className="pl-1 font-mono text-[11px] font-bold text-[#7f96a5] rokko-dark:text-[#526675]">
        {num}
      </span>

      <span
        className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105 bg-[var(--bg-light)] rokko-dark:bg-[var(--bg-dark)]"
        style={
          {
            "--bg-light": cfg.iconBg,
            "--bg-dark": cfg.iconBgDark,
          } as React.CSSProperties
        }
      >
        <Icon className="h-[17px] w-[17px]" style={{ color: cfg.accent }} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className="text-[8.2px] font-black uppercase tracking-[0.2em]"
          style={{ color: cfg.accent }}
        >
          {cfg.tag}
        </span>

        <span className="mt-0.5 truncate text-[13px] font-black tracking-[-0.02em] text-[#0f1f2b] rokko-dark:text-[#f1f5f9]">
          {category.label}
        </span>
      </span>

      <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[#dbe7ec] bg-white transition group-hover:border-[#80d9e0] rokko-dark:border-[#243542] rokko-dark:bg-[#1c2e3d] rokko-dark:group-hover:border-[#00b8c8]">
        <ArrowRight
          className="h-3.5 w-3.5 text-[#8fa4b1] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#087381] rokko-dark:text-[#526675] rokko-dark:group-hover:text-[#00b8c8]"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
});

type HomeClientProps = {
  initialProducts: Product[];
  initialCategories: ProductCategory[];
};

export default function HomeClient({
  initialProducts,
  initialCategories,
}: HomeClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeRow, setActiveRow] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const normalizedProducts = useMemo(() => {
    return initialProducts.map((product) => ({
      product,
      haystack: normalize(
        `${product.name} ${product.short_name ?? ""} ${
          product.description ?? ""
        } ${product.extract ?? ""} ${product.colors.join(" ")} ${product.technologies.join(
          " ",
        )} ${product.category}`,
      ),
    }));
  }, [initialProducts]);

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

  const activeCategories = useMemo(() => {
    return initialCategories.filter((c) => c.active !== false);
  }, [initialCategories]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setSearchError("");
    setShowResults(true);
    setActiveRow(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showResults || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveRow((current) => Math.min(current + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveRow((current) => Math.max(current - 1, -1));
    } else if (e.key === "Enter" && activeRow >= 0) {
      e.preventDefault();
      router.push(
        `/cotizar/${results[activeRow].category}?search=${encodeURIComponent(
          results[activeRow].name,
        )}`,
      );
      setShowResults(false);
    } else if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const q = normalize(search);

    if (!q || q.length < 2) {
      setSearchError("Escribe al menos 2 caracteres.");
      return;
    }

    if (results.length > 0) {
      router.push(
        `/cotizar/${results[0].category}?search=${encodeURIComponent(search)}`,
      );
    } else {
      setSearchError("No encontramos productos con ese término.");
    }
  }

  return (
    <main className="flex min-h-[calc(100dvh-80px)] w-full items-center justify-center bg-[#eef3f5] px-4 py-5 transition-colors duration-300 sm:px-6 lg:px-8 rokko-dark:bg-[#0b1319]">
      <div className="relative grid w-full max-w-[1200px] overflow-hidden rounded-[1.9rem] border border-[#dce7ec] bg-white shadow-[0_24px_62px_rgba(15,31,43,0.11)] lg:h-[680px] lg:grid-cols-[1.02fr_0.98fr] rokko-dark:border-[#1e2d38] rokko-dark:bg-[var(--color-card-bg)] rokko-dark:shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
        <div
          className="pointer-events-none absolute bottom-9 left-1/2 top-9 z-20 hidden w-px -translate-x-1/2 bg-[#d8e5ea] lg:block rokko-dark:bg-[#1e2d38]"
          aria-hidden="true"
        >
          <span className="absolute left-1/2 top-1/2 h-10 w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00b8c8] shadow-[0_0_18px_rgba(0,184,200,0.55)]" />
        </div>

        {/* IZQUIERDA */}
        <div className="relative flex flex-col justify-center bg-[var(--color-card-bg)] px-7 py-9 sm:px-9 lg:h-full lg:px-10 xl:px-[48px]">
          <div className="pointer-events-none absolute -left-28 top-16 h-60 w-60 rounded-full bg-[#00b8c8]/10 blur-3xl rokko-dark:bg-[#00b8c8]/5" />
          <div className="pointer-events-none absolute bottom-10 right-12 h-48 w-48 rounded-full bg-[#087381]/8 blur-3xl rokko-dark:bg-[#087381]/4" />

          <div className="relative z-10">
            <div className="mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-[#b5e9ed] bg-[#e6f9fa] px-4 py-1.5 rokko-dark:border-[#087381]/40 rokko-dark:bg-[#087381]/15">
              <span className="h-2 w-2 rounded-full bg-[#087381] rokko-dark:bg-[#00b8c8]" />
              <span className="text-[9.5px] font-black uppercase tracking-[0.22em] text-[#087381] rokko-dark:text-[#00b8c8]">
                Catálogo corporativo 2026
              </span>
            </div>

            <h1 className="max-w-[500px] text-[38px] font-black leading-[0.95] tracking-[-0.06em] text-[#071827] sm:text-[46px] xl:text-[50px] rokko-dark:text-[#f8fafc]">
              Uniformes
              <br />
              listos para
              <br />
              <span className="text-[#087381] rokko-dark:text-[#00b8c8]">
                cotizar.
              </span>
            </h1>

            <p className="mt-5 max-w-[530px] text-[13px] font-medium leading-7 text-[#637988] rokko-dark:text-[#94a3b8]">
              Explora líneas de vestuario, revisa categorías y arma una
              solicitud clara para tu equipo de forma rápida y profesional.
            </p>

            <div className="relative z-30 mt-6 max-w-[550px]">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 rounded-2xl border border-[#dce7ec] bg-white px-4 py-2.5 shadow-[0_10px_28px_rgba(15,31,43,0.05)] transition focus-within:border-[#00b8c8] focus-within:ring-4 focus-within:ring-[#00b8c8]/10 rokko-dark:border-[#243542] rokko-dark:bg-[#121f2a] rokko-dark:focus-within:border-[#00b8c8]"
              >
                <Search className="h-[18px] w-[18px] shrink-0 text-[#9ab2be] rokko-dark:text-[#526675]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={() => search.length >= 2 && setShowResults(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Busca por prenda, color o tecnología..."
                  className="h-10 min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-[#1a3040] outline-none placeholder:text-[#9ab2be] rokko-dark:text-[#f1f5f9] rokko-dark:placeholder:text-[#526675]"
                />
                <button
                  type="submit"
                  className="flex h-10 shrink-0 items-center rounded-xl bg-[#071827] px-5 text-[12.5px] font-black tracking-[-0.01em] text-white transition hover:bg-[#087381] rokko-dark:bg-[#00b8c8] rokko-dark:text-[#0f1a22] rokko-dark:hover:bg-[#0aa2b0]"
                >
                  Buscar
                </button>
              </form>

              {searchError && (
                <p className="mt-2 text-[12px] font-bold text-amber-500">
                  {searchError}
                </p>
              )}

              {showResults && search.length >= 2 && (
                <div
                  ref={resultsRef}
                  className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#dde8ec] bg-white shadow-[0_20px_55px_rgba(15,31,43,0.14)] rokko-dark:border-[#243542] rokko-dark:bg-[#121f2a]"
                >
                  {isSearching ? (
                    <div className="space-y-2 p-5">
                      <div className="h-4 w-3/4 animate-pulse rounded-md bg-[#f0f4f6] rokko-dark:bg-[#1c2e3d]" />
                      <div className="h-3 w-1/2 animate-pulse rounded-md bg-[#f0f4f6] rokko-dark:bg-[#1c2e3d]" />
                    </div>
                  ) : results.length > 0 ? (
                    <div className="max-h-[220px] divide-y divide-[#eef3f5] overflow-y-auto custom-scrollbar rokko-dark:divide-[#1c2e3d]">
                      {results.map((product, idx) => (
                        <Link
                          key={product.id}
                          href={`/cotizar/${
                            product.category
                          }?search=${encodeURIComponent(product.name)}`}
                          onClick={() => setShowResults(false)}
                          className={`block px-5 py-3.5 transition ${
                            idx === activeRow
                              ? "bg-[#f0f9fa] rokko-dark:bg-[#087381]/15"
                              : "hover:bg-[#f7fcfd] rokko-dark:hover:bg-[#162530]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate text-[13.5px] font-black text-[#0f1f2b] rokko-dark:text-[#f1f5f9]">
                                {product.name}
                              </p>
                              <div className="mt-1.5 flex items-center gap-1.5">
                                {product.colors.slice(0, 6).map((color) => (
                                  <span
                                    key={color}
                                    className="h-2.5 w-2.5 rounded-full border border-black/10 rokko-dark:border-white/10"
                                    style={{
                                      backgroundColor:
                                        colorMap[normalize(color)] ?? "#94a3b8",
                                    }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>

                            <span className="shrink-0 text-[13px] font-black text-[#087381] rokko-dark:text-[#00b8c8]">
                              ${product.price.toLocaleString("es-CL")}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-5 text-[13px] font-semibold text-[#6b8090] rokko-dark:text-[#526675]">
                      No hay resultados para &quot;{search}&quot;.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoCard
                icon={ShieldCheck}
                title="Control"
                text="Precios visibles"
              />
              <Award className="hidden" />
              <InfoCard
                icon={Award}
                title="Marca"
                text="Bordado o estampado"
              />
              <InfoCard icon={Truck} title="Despacho" text="Envío nacional" />
            </div>
          </div>
        </div>

        <div className="mx-6 h-px bg-[#d8e5ea] lg:hidden rokko-dark:bg-[#1e2d38]" />

        {/* DERECHA */}
        <div className="relative flex min-h-0 flex-col bg-[var(--color-card-bg)] px-8 py-8 sm:px-9 lg:h-full lg:px-10 xl:px-11">
          <div className="mb-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9.5px] font-black uppercase tracking-[0.24em] text-[#00b8c8]">
                  Líneas disponibles
                </p>
                <h2 className="mt-1.5 text-[26px] font-black leading-none tracking-[-0.045em] text-[#071827] sm:text-[28px] rokko-dark:text-[#f8fafc]">
                  Catálogo corporativo
                </h2>
              </div>

              <span className="mt-0.5 shrink-0 rounded-full border border-[#b5e9ed] bg-[#e6f9fa] px-3.5 py-1.5 text-[10.5px] font-black text-[#087381] rokko-dark:border-[#087381]/40 rokko-dark:bg-[#087381]/15 rokko-dark:text-[#00b8c8]">
                {activeCategories.length} activas
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-[#e2eaed] bg-[#f8fbfc] p-3.5 rokko-dark:border-[#1e2d38] rokko-dark:bg-[#0b1319]">
            <div className="flex h-full flex-col justify-between gap-[7px]">
              {activeCategories.map((category, idx) => (
                <CategoryRow
                  key={category.slug}
                  category={category}
                  index={idx}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}