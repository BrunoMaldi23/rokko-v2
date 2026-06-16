const careItems = [
  {
    icon: "M19 14l-7 7m0 0l-7-7m7 7V3",
    label: "Lavar con agua fría",
    desc: "No sobrepasar los 30°C para conservar colores y tela.",
  },
  {
    icon: "M18.36 6.64a9 9 0 1 1-12.73 0",
    label: "No usar blanqueador",
    desc: "El cloro daña las fibras y decolora los estampados.",
  },
  {
    icon: "M21 16H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h13l-2 4 2 4H8",
    label: "No usar secadora",
    desc: "El calor excesivo encoge las prendas y daña los logos.",
  },
  {
    icon: "M11 4a7 7 0 0 0-7 7v4a7 7 0 0 0 7 7",
    label: "Planchar a baja temperatura",
    desc: "Máximo 110°C. No planchar directamente sobre el logo.",
  },
  {
    icon: "M3 3l18 18M21 3l-18 18",
    label: "No lavar en seco",
    desc: "Los solventes químicos pueden dañar estampados y bordados.",
  },
  {
    icon: "M12 2v20M2 12h20",
    label: "Lavar del revés",
    desc: "Protege el logo y reduce la fricción directa sobre la prenda.",
  },
];

const sizeRows = [
  ["S", "106–110 cm", "106–110 cm", "70 cm"],
  ["M", "111–115 cm", "111–115 cm", "73 cm"],
  ["L", "116–120 cm", "116–120 cm", "76 cm"],
  ["XL", "121–125 cm", "121–125 cm", "80 cm"],
  ["2XL", "126–130 cm", "126–130 cm", "84 cm"],
  ["3XL", "131–135 cm", "131–135 cm", "88 cm"],
  ["4XL", "136–140 cm", "136–140 cm", "92 cm"],
];

const tips = [
  {
    title: "Antes de cotizar",
    desc: "Revisa bien las cantidades por talla. Una vez confirmada la orden no podemos modificar cantidades ni tallas.",
  },
  {
    title: "Sobre el logo",
    desc: "Evalúa la calidad de tu logo antes de producir. Si no tiene la resolución suficiente, podemos vectorizarlo por ti.",
  },
  {
    title: "Disponibilidad",
    desc: "Colores y tallas pueden variar según stock al momento de la confirmación. Te informaremos antes de producir.",
  },
  {
    title: "Tiempos de producción",
    desc: "El proceso completo toma entre 10 y 15 días hábiles, dependiendo del volumen y tipo de aplicación.",
  },
];

export default function MedidasCuidadosPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-4xl">
          <div className="animate-fade-in-up">
            <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-border bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm sm:px-5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>

              <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-accent sm:text-xs sm:tracking-[0.35em]">
                Medidas y cuidados
              </p>
            </div>
          </div>

          <h1 className="mt-7 animate-fade-in-up animate-delay-100 max-w-full text-3xl font-black leading-tight text-[#1e1e1e] sm:mt-8 sm:text-4xl md:text-5xl">
            Guía para elegir tallas y cuidar tus prendas corporativas.
          </h1>

          <p className="mt-5 animate-fade-in-up animate-delay-200 max-w-2xl text-sm leading-7 text-muted sm:mt-6 sm:text-base sm:leading-8">
            Una correcta selección de talla y cuidado de lavado ayuda a mantener
            la presentación, color, forma y durabilidad de cada prenda.
          </p>
        </div>

        <div className="mt-10 grid w-full min-w-0 animate-fade-in-up animate-delay-200 gap-6 lg:mt-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <section className="w-full min-w-0 overflow-hidden rounded-3xl border border-border bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
            <h2 className="text-xl font-black text-[#1e1e1e] sm:text-2xl">
              Tabla referencial de tallas
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              Medidas aproximadas para poleras manga corta 100% algodón.
            </p>

            {/* MOBILE Y TABLET: CARDS */}
            <div className="mt-6 grid w-full gap-3 lg:hidden">
              {sizeRows.map((row) => (
                <article
                  key={row[0]}
                  className="w-full min-w-0 rounded-2xl border border-border bg-surface-2/70 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                      Talla
                    </span>

                    <span className="shrink-0 rounded-full bg-white px-4 py-1.5 text-base font-black text-[#1e1e1e] shadow-sm">
                      {row[0]}
                    </span>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                      <span className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                        Pecho
                      </span>
                      <span className="min-w-0 text-right text-sm font-semibold text-[#1e1e1e]">
                        {row[1]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                      <span className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                        Cadera
                      </span>
                      <span className="min-w-0 text-right text-sm font-semibold text-[#1e1e1e]">
                        {row[2]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                      <span className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                        Largo total
                      </span>
                      <span className="min-w-0 text-right text-sm font-semibold text-[#1e1e1e]">
                        {row[3]}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* DESKTOP: TABLA */}
            <div className="mt-6 hidden w-full overflow-hidden rounded-2xl border border-border lg:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="bg-surface-2 text-xs uppercase tracking-[0.16em] text-muted">
                  <tr>
                    <th className="w-[18%] px-4 py-4">Talla</th>
                    <th className="w-[27%] px-4 py-4">Pecho</th>
                    <th className="w-[27%] px-4 py-4">Cadera</th>
                    <th className="w-[28%] px-4 py-4">Largo total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border bg-white/70">
                  {sizeRows.map((row) => (
                    <tr
                      key={row[0]}
                      className="transition-colors hover:bg-accent-soft/50"
                    >
                      <td className="px-4 py-4 font-black text-[#1e1e1e]">
                        {row[0]}
                      </td>
                      <td className="px-4 py-4 text-muted">{row[1]}</td>
                      <td className="px-4 py-4 text-muted">{row[2]}</td>
                      <td className="px-4 py-4 text-muted">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-5 text-muted">
              * Estas medidas son referenciales y pueden variar ±2 cm según el
              modelo y la tela.
            </p>
          </section>

          <aside className="w-full min-w-0 overflow-hidden rounded-3xl border border-border bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
            <h2 className="text-xl font-black text-[#1e1e1e] sm:text-2xl">
              Cuidados de prenda
            </h2>

            <p className="mt-2 max-w-full text-sm leading-6 text-muted">
              Sigue estas recomendaciones para alargar la vida de tus prendas
              corporativas.
            </p>

            <div className="mt-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {careItems.map((item) => (
                <article
                  key={item.label}
                  className="group flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-2xl bg-surface-2/80 px-4 py-3 transition-colors hover:bg-accent-soft/80"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-colors group-hover:bg-white">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={item.icon} />
                    </svg>
                  </span>

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="whitespace-normal break-words text-sm font-bold leading-5 text-[#1e1e1e]">
                      {item.label}
                    </p>

                    <p className="mt-1 whitespace-normal break-words text-xs leading-5 text-muted">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-8 grid w-full min-w-0 animate-fade-in-up animate-delay-300 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {tips.map((t) => (
            <article
              key={t.title}
              className="w-full min-w-0 rounded-3xl border border-border bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md sm:p-6"
            >
              <h3 className="whitespace-normal break-words text-base font-black text-[#1e1e1e]">
                {t.title}
              </h3>

              <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-muted">
                {t.desc}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}