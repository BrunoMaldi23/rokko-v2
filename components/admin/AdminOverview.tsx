"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { getAdminProducts } from "@/lib/adminProducts";

export default function AdminOverview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  const data = useMemo(() => {
    const total = products.length;
    const active = products.filter((product) => product.active).length;
    const inactive = total - active;

    const wholesale = products.filter((product) =>
      Boolean(product.wholesale_price),
    ).length;

    const withoutWholesale = total - wholesale;

    const categoriesMap = products.reduce<Record<string, number>>(
      (acc, product) => {
        const category = product.category || "sin categoría";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {},
    );

    const categories = Object.entries(categoriesMap).sort(
      (a, b) => b[1] - a[1],
    );

    const catalogHealth = total ? Math.round((active / total) * 100) : 0;
    const commercialHealth = total ? Math.round((wholesale / total) * 100) : 0;

    const mainCategory = categories[0];

    return {
      total,
      active,
      inactive,
      wholesale,
      withoutWholesale,
      categories,
      categoryCount: categories.length,
      catalogHealth,
      commercialHealth,
      mainCategory,
    };
  }, [products]);

  const metrics = [
    {
      label: "Productos",
      value: data.total,
      detail: "Registros totales",
    },
    {
      label: "Activos",
      value: data.active,
      detail: "Disponibles para cotizar",
    },
    {
      label: "Categorías",
      value: data.categoryCount,
      detail: "Familias comerciales",
    },
    {
      label: "Mayorista",
      value: data.wholesale,
      detail: "Con precio por volumen",
    },
  ];

  const priorities = [
    {
      title: "Productos inactivos",
      value: data.inactive,
      detail:
        data.inactive > 0
          ? "Revisar si deben activarse, ocultarse o actualizar información."
          : "Todo el catálogo está activo.",
      status: data.inactive > 0 ? "Revisar" : "Correcto",
      danger: data.inactive > 0,
    },
    {
      title: "Sin precio mayorista",
      value: data.withoutWholesale,
      detail:
        data.withoutWholesale > 0
          ? "Productos sin condición comercial por volumen."
          : "Todos los productos tienen precio mayorista.",
      status: data.withoutWholesale > 0 ? "Pendiente" : "Correcto",
      danger: data.withoutWholesale > 0,
    },
    {
      title: "Categoría dominante",
      value: data.mainCategory ? data.mainCategory[1] : 0,
      detail: data.mainCategory
        ? `${capitalize(data.mainCategory[0])} concentra la mayor parte del catálogo.`
        : "Aún no hay productos cargados.",
      status: "Dato",
      danger: false,
    },
  ];

  return (
    <div className="space-y-4 pb-8 text-[#071827] [html[data-theme='dark']_&]:text-[#f8fafc]">
      {/* RESUMEN SUPERIOR */}
      <section className="grid gap-4 xl:grid-cols-[1fr_1.35fr]">
        <article className="rounded-2xl border border-[#bfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] p-5 shadow-[0_10px_30px_rgba(8,115,129,0.06)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
            Estado general
          </p>

          <h2 className="mt-1 text-[24px] font-black leading-tight tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
            Resumen operativo
          </h2>

          <p className="mt-2 max-w-[560px] text-[12px] font-bold leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
            Vista ejecutiva del catálogo, disponibilidad comercial y puntos que
            requieren revisión antes de vender o publicar nuevas prendas.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <HealthBox
              label="Catálogo activo"
              value={`${data.catalogHealth}%`}
              detail={`${data.active} de ${data.total} productos`}
            />

            <HealthBox
              label="Preparación comercial"
              value={`${data.commercialHealth}%`}
              detail={`${data.wholesale} con precio mayorista`}
            />
          </div>
        </article>

        {/* KPI CARDS CENTRADAS */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={loading ? "..." : metric.value}
              detail={metric.detail}
            />
          ))}
        </section>
      </section>

      {/* CUERPO PRINCIPAL */}
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        {/* CATEGORÍAS */}
        <article className="rounded-2xl border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f2fbfd_100%)] p-5 shadow-[0_10px_28px_rgba(8,115,129,0.05)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between gap-4 border-b border-[#cfe8ee] pb-4 [html[data-theme='dark']_&]:border-[#243542]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Catálogo
              </p>

              <h3 className="mt-1 text-[20px] font-black leading-tight tracking-[-0.04em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                Distribución por categoría
              </h3>

              <p className="mt-1 text-[12px] font-bold text-[#475569] [html[data-theme='dark']_&]:text-[#94a3b8]">
                Familias comerciales con mayor peso dentro del catálogo.
              </p>
            </div>

            <span className="rounded-full border border-[#bfe8ee] bg-[#eefbfd] px-3 py-1 text-[11px] font-black text-[#0f5f6d] [html[data-theme='dark']_&]:border-[#00b8c8]/25 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
              {data.categoryCount} categorías
            </span>
          </div>

          <div className="mt-4 grid gap-2">
            {loading &&
              [1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-[54px] animate-pulse rounded-xl bg-[#edf8fb] [html[data-theme='dark']_&]:bg-[#162530]"
                />
              ))}

            {!loading &&
              data.categories.map(([category, total], index) => {
                const percentage = data.total
                  ? Math.round((total / data.total) * 100)
                  : 0;

                return (
                  <div
                    key={category}
                    className="rounded-xl border border-[#c7e8ee] bg-[#f4fbfd] px-4 py-3 transition hover:border-[#7dd3df] hover:bg-[#f8fdfe] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:hover:border-[#00b8c8]/50 [html[data-theme='dark']_&]:hover:bg-[#14242e]"
                  >
                    <div className="grid grid-cols-[34px_1fr_auto] items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c7e8ee] bg-white text-[11px] font-black text-[#0ea5b7] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#00b8c8]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-[13px] font-black capitalize text-[#071827] [html[data-theme='dark']_&]:text-white">
                            {category}
                          </p>

                          <p className="shrink-0 text-[12px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                            {total}
                            <span className="ml-1 text-[11px] font-black text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                              ({percentage}%)
                            </span>
                          </p>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#d5e9ee] [html[data-theme='dark']_&]:bg-[#243542]">
                          <div
                            className="h-full rounded-full bg-[#21b7c7] [html[data-theme='dark']_&]:bg-[#00b8c8]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      <span className="hidden rounded-lg bg-[#e6f8fb] px-2 py-1 text-[10px] font-black text-[#0f5f6d] sm:inline-flex [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </article>

        {/* PRIORIDADES */}
        <div className="grid gap-4">
          <article className="rounded-2xl border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f3fbfd_100%)] p-5 shadow-[0_10px_28px_rgba(8,115,129,0.05)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
            <div className="border-b border-[#cfe8ee] pb-4 [html[data-theme='dark']_&]:border-[#243542]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Prioridades
              </p>

              <h3 className="mt-1 text-[20px] font-black leading-tight tracking-[-0.04em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                Qué revisar ahora
              </h3>

              <p className="mt-1 text-[12px] font-bold text-[#475569] [html[data-theme='dark']_&]:text-[#94a3b8]">
                Alertas útiles para mantener el catálogo listo.
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              {priorities.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#c7e8ee] bg-[#f7fcfd] px-4 py-3 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[11.5px] font-bold leading-5 text-[#475569] [html[data-theme='dark']_&]:text-[#94a3b8]">
                        {item.detail}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[20px] font-black leading-none text-[#071827] [html[data-theme='dark']_&]:text-white">
                        {item.value}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${
                          item.danger
                            ? "bg-red-50 text-red-600 [html[data-theme='dark']_&]:bg-red-500/15 [html[data-theme='dark']_&]:text-red-300"
                            : "bg-[#e6f8fb] text-[#0f5f6d] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f1fbfd_100%)] p-5 shadow-[0_10px_28px_rgba(8,115,129,0.05)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
              Lectura rápida
            </p>

            <h3 className="mt-1 text-[20px] font-black leading-tight tracking-[-0.04em] text-[#071827] [html[data-theme='dark']_&]:text-white">
              Estado recomendado
            </h3>

            <div className="mt-4 space-y-3">
              <ChecklistItem
                active={data.catalogHealth >= 90}
                text="Catálogo con alta disponibilidad de productos activos."
              />

              <ChecklistItem
                active={data.commercialHealth >= 80}
                text="Condiciones mayoristas suficientemente configuradas."
              />

              <ChecklistItem
                active={data.categoryCount > 0}
                text="Categorías comerciales creadas y ordenadas."
              />

              <ChecklistItem
                active={data.total > 0}
                text="Base de productos cargada para operar el cotizador."
              />
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <article className="flex min-h-[167px] items-center justify-center rounded-2xl border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f2fbfd_100%)] px-4 py-4 text-center shadow-[0_8px_22px_rgba(8,115,129,0.05)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
      <div className="flex w-full flex-col items-center justify-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
          {label}
        </p>

        <p className="mt-2 text-[40px] font-black leading-none tracking-[-0.055em] text-[#071827] [html[data-theme='dark']_&]:text-white">
          {value}
        </p>

        <p className="mt-2 max-w-[130px] text-[12px] font-black leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
          {detail}
        </p>
      </div>
    </article>
  );
}

function HealthBox({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#bfe8ee] bg-[#f6fcfe] px-4 py-3 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]/70">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#475569] [html[data-theme='dark']_&]:text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 text-[29px] font-black leading-none tracking-[-0.05em] text-[#071827] [html[data-theme='dark']_&]:text-white">
        {value}
      </p>

      <p className="mt-1.5 text-[10.5px] font-black text-[#475569] [html[data-theme='dark']_&]:text-[#cbd5e1]">
        {detail}
      </p>
    </div>
  );
}

function ChecklistItem({ active, text }: { active: boolean; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          active
            ? "bg-[#21b7c7] text-white [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827]"
            : "bg-amber-100 text-amber-700 [html[data-theme='dark']_&]:bg-amber-500/15 [html[data-theme='dark']_&]:text-amber-300"
        }`}
      >
        {active ? (
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>

      <p className="text-[12px] font-black leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
        {text}
      </p>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}