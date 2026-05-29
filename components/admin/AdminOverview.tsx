"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { getAdminProducts } from "@/lib/adminProducts";
import { migrateOldImages } from "@/lib/storage";

export default function AdminOverview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrateLog, setMigrateLog] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    getAdminProducts().then((data) => {
      if (!mounted) return;
      setProducts(data);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const active = products.filter((product) => product.active).length;
    const categories = new Set(products.map((product) => product.category)).size;
    const wholesale = products.filter((product) => product.wholesale_price).length;

    return [
      { id: "total", label: "Productos", value: products.length, detail: "Registros en catálogo" },
      { id: "active", label: "Activos", value: active, detail: "Disponibles para cotizar" },
      { id: "categories", label: "Categorías", value: categories, detail: "Familias comerciales" },
      { id: "wholesale", label: "Mayorista", value: wholesale, detail: "Con precio por volumen" },
    ];
  }, [products]);

  const categoryRows = useMemo(() => {
    const totals = products.reduce<Record<string, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [products]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SECCIÓN DE MÉTRICAS / KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article 
            key={metric.id} 
            className="rounded-2xl border border-cyan-100/50 bg-white p-5 shadow-sm shadow-slate-100/50 transition-all duration-200 hover:shadow-md hover:shadow-slate-200/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {metric.label}
                </p>
                {loading ? (
                  <div className="mt-4 h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                    {metric.value}
                  </p>
                )}
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-100/30">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-7" />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">{metric.detail}</p>
          </article>
        ))}
      </div>

      {/* SECCIÓN DE GRÁFICOS Y ACCIONES RECOMENDADAS */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        
        {/* PANEL DE DISTRIBUCIÓN POR CATEGORÍAS */}
        <section className="rounded-2xl border border-cyan-100/50 bg-white p-6 shadow-sm shadow-slate-100/50">
          <div className="border-b border-slate-100 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-600">
              Catálogo
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Distribución por categoría
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Una vista rápida para detectar dónde está concentrada la oferta actual.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-xl border border-cyan-100/20 bg-[#f4fafd]/50 p-4 animate-pulse">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 rounded bg-slate-200" />
                      <div className="h-4 w-16 rounded bg-slate-200" />
                    </div>
                    <div className="mt-3 h-2 w-full rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            )}

            {!loading &&
              categoryRows.map(([category, total]) => {
                const percentage = products.length ? Math.round((total / products.length) * 100) : 0;

                return (
                  <div 
                    key={category} 
                    className="rounded-xl border border-cyan-100/30 bg-[#f4fafd]/40 p-4 transition-colors hover:bg-[#f4fafd]/70"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold capitalize text-slate-800">{category}</p>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-cyan-700">{total}</span>
                        <span className="text-xs font-medium text-slate-400 ml-1">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/60 border border-slate-100">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-sm transition-all duration-500" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}

            {!loading && categoryRows.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <p className="mt-3 text-sm font-medium text-slate-400">
                  No hay productos cargados para construir indicadores.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* PANEL DE OPERACIÓN DIARIA / TAREAS */}
        <section className="rounded-2xl border border-cyan-100/50 bg-white p-6 shadow-sm shadow-slate-100/50">
          <div className="border-b border-slate-100 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-600">
              Operación diaria
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Tareas recomendadas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Acciones sugeridas para mantener la plataforma optimizada.
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            {[
              "Revisar productos inactivos antes de enviar cotizaciones.",
              "Validar precios mayoristas en productos de alta rotación.",
              "Mantener datos de marca actualizados para documentos.",
              "Registrar condiciones comerciales vigentes.",
            ].map((task) => (
              <div 
                key={task} 
                className="flex items-start gap-3 rounded-xl border border-cyan-100/20 bg-[#f4fafd]/30 px-4 py-3 transition-colors hover:border-cyan-100/40"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
                <p className="text-sm font-medium leading-relaxed text-slate-600">
                  {task}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-amber-200/40 bg-amber-50/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                  Migración de imágenes
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Sube las imágenes locales (productos antiguos) a Supabase Storage.
                </p>
              </div>
              <button
                onClick={async () => {
                  setMigrating(true);
                  setMigrateLog([]);
                  const result = await migrateOldImages((msg) =>
                    setMigrateLog((prev) => [...prev, msg])
                  );
                  setMigrating(false);
                  if (result.errors.length > 0) {
                    setMigrateLog((prev) => [...prev, "Errores:", ...result.errors]);
                  }
                }}
                disabled={migrating}
                className="shrink-0 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {migrating ? "Migrando..." : "Migrar imágenes"}
              </button>
            </div>
            {migrateLog.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-amber-200/30 bg-white/80 p-3 text-xs text-slate-600">
                {migrateLog.map((line, i) => (
                  <p key={i} className={line.startsWith("Error") ? "text-red-600" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}