"use client";

import {
  BadgeAlert,
  Clock,
  Droplets,
  FileCheck2,
  Palette,
  Ruler,
  Shirt,
  Sparkles,
  Thermometer,
  RefreshCw,
} from "lucide-react";

const careItems = [
  {
    icon: Droplets,
    label: "Lavar con agua fría",
    desc: "No sobrepasar los 30 grados para conservar color, forma y tela.",
  },
  {
    icon: BadgeAlert,
    label: "No usar blanqueador",
    desc: "El cloro daña fibras, logos y terminaciones.",
  },
  {
    icon: Thermometer,
    label: "Evitar secadora",
    desc: "El calor excesivo puede encoger prendas y afectar aplicaciones.",
  },
  {
    icon: Shirt,
    label: "Planchar a baja temperatura",
    desc: "No planchar directamente sobre bordados o estampados.",
  },
  {
    icon: RefreshCw,
    label: "Lavar del revés",
    desc: "Reduce fricción directa y protege la identidad aplicada.",
  },
];

const sizeRows = [
  ["S", "106-110 cm", "106-110 cm", "70 cm"],
  ["M", "111-115 cm", "111-115 cm", "73 cm"],
  ["L", "116-120 cm", "116-120 cm", "76 cm"],
  ["XL", "121-125 cm", "121-125 cm", "80 cm"],
  ["2XL", "126-130 cm", "126-130 cm", "84 cm"],
  ["3XL", "131-135 cm", "131-135 cm", "88 cm"],
  ["4XL", "136-140 cm", "136-140 cm", "92 cm"],
];

const tips = [
  {
    icon: FileCheck2,
    title: "Antes de confirmar",
    desc: "Valida cantidades por talla con tu equipo. Luego de aprobar producción, los cambios pueden afectar plazo y costo.",
  },
  {
    icon: Sparkles,
    title: "Calidad del logo",
    desc: "Usa archivos vectoriales cuando sea posible. Si solo tienes imagen, revisamos si sirve para producir.",
  },
  {
    icon: Palette,
    title: "Stock y colores",
    desc: "La disponibilidad puede variar al momento de confirmar. Te avisaremos antes de producir.",
  },
  {
    icon: Clock,
    title: "Plazos",
    desc: "El proceso completo suele tomar entre 10 y 15 días hábiles según volumen y técnica.",
  },
];

export default function MedidasCuidadosPage() {
  return (
    <main className="min-h-[calc(100dvh-80px)] overflow-hidden bg-[#f4f7f9] font-sans text-[#071827] transition-colors duration-300 rokko-dark:bg-[#0b1319] rokko-dark:text-[#f8fafc]">
      {/* HERO TITLE */}
      <section className="relative mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-[#00b8c8]/10 blur-3xl rokko-dark:bg-[#00b8c8]/8" />
        <div className="pointer-events-none absolute right-0 top-16 h-44 w-44 rounded-full bg-[#087381]/10 blur-3xl rokko-dark:bg-[#087381]/10" />

        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#b5e9ed] bg-[#087381]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#087381] rokko-dark:border-[#087381]/40 rokko-dark:bg-[#087381]/15 rokko-dark:text-[#00b8c8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#087381] rokko-dark:bg-[#00b8c8]" />
            Guías de talla y cuidado
          </p>

          <h1 className="mt-4 max-w-[900px] text-[36px] font-black leading-[1.1] tracking-[-0.04em] text-[#051321] sm:text-[44px] lg:text-[48px] rokko-dark:text-[#f8fafc]">
            Elige la talla correcta y{" "}
            <span className="relative inline-block text-[#087381] rokko-dark:text-[#00b8c8]">
              cuida mejor tus prendas.
              <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-[#00b8c8]/20 rokko-dark:bg-[#00b8c8]/35" />
            </span>
          </h1>
        </div>
      </section>

      {/* BLOQUE PRINCIPAL */}
      <section className="mx-auto max-w-[1100px] px-5 pb-10 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_48px_-12px_rgba(7,24,39,0.07)] transition-colors duration-300 rokko-dark:border-[#243542] rokko-dark:bg-[#111b22] rokko-dark:shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
          <div className="relative z-10 grid lg:grid-cols-[1.15fr_0.85fr]">
            {/* LADO IZQUIERDO: TABLA DE TALLAS */}
            <article className="border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:border-slate-200 lg:p-10 rokko-dark:border-[#243542]">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087381]/10 text-[#087381] rokko-dark:bg-[#00b8c8]/15 rokko-dark:text-[#00b8c8]">
                  <Ruler className="h-5 w-5" />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#087381] rokko-dark:text-[#00b8c8]">
                    Medidas referenciales
                  </span>

                  <h2 className="mt-1 text-[24px] font-black tracking-[-0.03em] text-[#051321] rokko-dark:text-[#f8fafc]">
                    Tabla de tallas
                  </h2>

                  <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-slate-500 rokko-dark:text-[#94a3b8]">
                    Medidas aproximadas para poleras manga corta 100% algodón.
                  </p>
                </div>
              </div>

              {/* TABLA */}
              <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white transition-colors duration-300 rokko-dark:border-[#243542] rokko-dark:bg-[#0b1319]">
                <table className="w-full min-w-[500px] border-collapse text-left text-[13px]">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 rokko-dark:border-[#243542] rokko-dark:bg-[#162530] rokko-dark:text-[#cbd5e1]">
                    <tr>
                      <th className="px-4 py-3.5 font-bold">Talla</th>
                      <th className="px-4 py-3.5">Pecho</th>
                      <th className="px-4 py-3.5">Cadera</th>
                      <th className="px-4 py-3.5">Largo total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 rokko-dark:divide-[#243542]">
                    {sizeRows.map((row, index) => (
                      <tr
                        key={row[0]}
                        className={`transition-colors duration-150 hover:bg-slate-50/80 rokko-dark:hover:bg-[#1c2e3d] ${
                          index % 2 === 0
                            ? "bg-white rokko-dark:bg-[#0b1319]"
                            : "bg-slate-50/30 rokko-dark:bg-[#111b22]"
                        }`}
                      >
                        <td className="px-4 py-3.5 text-[14px] font-black text-[#051321] rokko-dark:text-[#f8fafc]">
                          {row[0]}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-600 rokko-dark:text-[#94a3b8]">
                          {row[1]}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-600 rokko-dark:text-[#94a3b8]">
                          {row[2]}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700 rokko-dark:text-[#cbd5e1]">
                          {row[3]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-[11px] font-medium leading-relaxed text-slate-400 rokko-dark:text-[#718394]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 rokko-dark:bg-[#00b8c8]/50" />
                Estas medidas son referenciales y pueden variar ±2 cm según el
                modelo y la tela.
              </p>
            </article>

            {/* LADO DERECHO: CUIDADOS */}
            <aside className="flex flex-col justify-between bg-slate-50/50 p-6 transition-colors duration-300 sm:p-8 lg:p-10 rokko-dark:bg-[#0f1a22]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#087381] rokko-dark:text-[#00b8c8]">
                  Conservación
                </span>

                <h2 className="mt-1 text-[24px] font-black leading-tight tracking-[-0.03em] text-[#051321] rokko-dark:text-[#f8fafc]">
                  Cuidados del textil
                </h2>

                <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-slate-500 rokko-dark:text-[#94a3b8]">
                  Sigue estas recomendaciones para cuidar el color, estampados y
                  logos corporativos.
                </p>

                <div className="mt-6 space-y-3">
                  {careItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <article
                        key={item.label}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(7,24,39,0.02)] transition-all duration-200 hover:border-slate-300 rokko-dark:border-[#243542] rokko-dark:bg-[#111b22] rokko-dark:shadow-[0_8px_22px_rgba(0,0,0,0.22)] rokko-dark:hover:border-[#00b8c8]/50 rokko-dark:hover:bg-[#14242e]"
                      >
                        <div className="flex gap-3.5">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#087381]/10 text-[#087381] rokko-dark:bg-[#00b8c8]/15 rokko-dark:text-[#00b8c8]">
                            <Icon className="h-[18px] w-[18px]" />
                          </span>

                          <div>
                            <h4 className="text-[13px] font-bold text-[#051321] rokko-dark:text-[#f8fafc]">
                              {item.label}
                            </h4>

                            <p className="mt-0.5 text-[11px] font-semibold leading-relaxed text-slate-400 rokko-dark:text-[#94a3b8]">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* TIPS FINALES */}
      <section className="mx-auto max-w-[1100px] px-5 pb-16 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-10 rokko-dark:border-[#1e2d38]">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#b5e9ed] bg-[#087381]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#087381] rokko-dark:border-[#087381]/40 rokko-dark:bg-[#087381]/15 rokko-dark:text-[#00b8c8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#087381] rokko-dark:bg-[#00b8c8]" />
              Antes de producir
            </span>

            <h2 className="mt-2 text-[28px] font-black tracking-[-0.04em] text-[#051321] sm:text-[32px] rokko-dark:text-[#f8fafc]">
              Consideraciones de tu pedido
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tips.map((tip) => {
              const Icon = tip.icon;

              return (
                <article
                  key={tip.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_16px_rgba(7,24,39,0.02)] transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_12px_24px_rgba(7,24,39,0.05)] rokko-dark:border-[#243542] rokko-dark:bg-[#111b22] rokko-dark:shadow-[0_14px_34px_rgba(0,0,0,0.24)] rokko-dark:hover:border-[#00b8c8]/50 rokko-dark:hover:bg-[#14242e] rokko-dark:hover:shadow-[0_22px_46px_rgba(0,0,0,0.36)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#087381]/10 text-[#087381] transition-colors duration-200 group-hover:bg-[#071827] group-hover:text-white rokko-dark:bg-[#00b8c8]/15 rokko-dark:text-[#00b8c8] rokko-dark:group-hover:bg-[#00b8c8] rokko-dark:group-hover:text-[#071827]">
                    <Icon className="h-4 w-4" />
                  </span>

                  <h3 className="mt-4 text-[15px] font-bold tracking-tight text-[#051321] rokko-dark:text-[#f8fafc]">
                    {tip.title}
                  </h3>

                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-slate-400 rokko-dark:text-[#94a3b8]">
                    {tip.desc}
                  </p>

                  <div className="mt-4 h-0.5 w-8 bg-[#00b8c8] transition-all duration-300 group-hover:w-12" />
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}