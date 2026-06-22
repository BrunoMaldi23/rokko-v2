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
      { id: "total", label: "Productos", value: products.length, detail: "Registros en catalogo" },
      { id: "active", label: "Activos", value: active, detail: "Disponibles para cotizar" },
      { id: "categories", label: "Categorias", value: categories, detail: "Familias comerciales" },
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
    <div className="animate-fade-in space-y-6">
      <section className="admin-panel-strong overflow-hidden rounded-lg">
        <div className="grid gap-6 bg-gradient-to-r from-accent-soft/80 via-white to-white p-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="admin-eyebrow">Estado general</p>
            <h2 className="mt-2 text-2xl font-black text-text">Operacion del cotizador</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Vista rapida del catalogo, disponibilidad comercial y tareas que mantienen el sistema listo para vender.
            </p>
          </div>
          <div className="rounded-lg border border-accent/20 bg-white/75 px-4 py-3 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Salud catalogo</p>
            <p className="mt-1 text-2xl font-black text-accent">
              {products.length ? Math.round((metrics[1].value / products.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.id} className="admin-panel-strong rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">
                  {metric.label}
                </p>
                {loading ? (
                  <div className="mt-4 h-9 w-16 animate-pulse rounded-lg bg-surface-2" />
                ) : (
                  <p className="mt-2 text-4xl font-black tracking-tight text-text">
                    {metric.value}
                  </p>
                )}
              </div>
              <span className="admin-icon-tile">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-7" />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-muted">{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="admin-panel-strong rounded-lg p-6">
          <div className="border-b border-border pb-4">
            <p className="admin-eyebrow">Catalogo</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-text">
              Distribucion por categoria
            </h2>
            <p className="mt-1 text-sm text-muted">
              Detecta donde esta concentrada la oferta actual.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="animate-pulse rounded-lg border border-border bg-surface-2/50 p-4">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 rounded bg-border" />
                      <div className="h-4 w-16 rounded bg-border" />
                    </div>
                    <div className="mt-3 h-2 w-full rounded bg-border" />
                  </div>
                ))}
              </div>
            )}

            {!loading &&
              categoryRows.map(([category, total]) => {
                const percentage = products.length ? Math.round((total / products.length) * 100) : 0;

                return (
                  <div key={category} className="rounded-lg border border-border bg-surface-2/45 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-black capitalize text-text">{category}</p>
                      <div className="text-right">
                        <span className="text-sm font-black text-accent">{total}</span>
                        <span className="ml-1 text-xs font-semibold text-muted">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-light to-accent transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <section className="admin-panel rounded-lg p-6">
          <div className="border-b border-border pb-4">
            <p className="admin-eyebrow">Operacion diaria</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-text">
              Tareas recomendadas
            </h2>
            <p className="mt-1 text-sm text-muted">
              Acciones sugeridas para mantener la plataforma optimizada.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {[
              "Revisar productos inactivos antes de enviar cotizaciones.",
              "Validar precios mayoristas en productos de alta rotacion.",
              "Mantener datos de marca actualizados para documentos.",
              "Registrar condiciones comerciales vigentes.",
            ].map((task) => (
              <div key={task} className="flex items-start gap-3 rounded-lg border border-border bg-white/70 px-4 py-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <p className="text-sm font-medium leading-relaxed text-muted">{task}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-amber-200/70 bg-amber-50/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">
                  Migracion de imagenes
                </p>
                <p className="mt-1 text-sm text-muted">
                  Sube imagenes locales antiguas a Supabase Storage.
                </p>
              </div>
              <button
                onClick={async () => {
                  setMigrating(true);
                  setMigrateLog([]);
                  const result = await migrateOldImages((msg) =>
                    setMigrateLog((prev) => [...prev, msg]),
                  );
                  setMigrating(false);
                  if (result.errors.length > 0) {
                    setMigrateLog((prev) => [...prev, "Errores:", ...result.errors]);
                  }
                }}
                disabled={migrating}
                className="rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {migrating ? "Migrando..." : "Migrar"}
              </button>
            </div>
            {migrateLog.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-amber-200/50 bg-white/80 p-3 text-xs text-muted">
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
