

const careItems = [
  { icon: "M19 14l-7 7m0 0l-7-7m7 7V3", label: "Lavar con agua fría", desc: "No sobrepasar los 30°C para conservar colores y tela." },
  { icon: "M18.36 6.64a9 9 0 1 1-12.73 0", label: "No usar blanqueador", desc: "El cloro daña las fibras y decolora los estampados." },
  { icon: "M21 16H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h13l-2 4 2 4H8", label: "No usar secadora", desc: "El calor excesivo encoge las prendas y daña los logos." },
  { icon: "M11 4a7 7 0 0 0-7 7v4a7 7 0 0 0 7 7", label: "Planchar a baja temperatura", desc: "Máximo 110°C. No planchar directamente sobre el logo." },
  { icon: "M3 3l18 18M21 3l-18 18", label: "No lavar en seco", desc: "Los solventes químicos pueden dañar estampados y bordados." },
  { icon: "M12 2v20M2 12h20", label: "Lavar del revés", desc: "Protege el logo y reduce la fricción directa sobre la prenda." },
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
  { title: "Antes de cotizar", desc: "Revisa bien las cantidades por talla. Una vez confirmada la orden no podemos modificar cantidades ni tallas." },
  { title: "Sobre el logo", desc: "Evalúa la calidad de tu logo antes de producir. Si no tiene la resolución suficiente, podemos vectorizarlo por ti." },
  { title: "Disponibilidad", desc: "Colores y tallas pueden variar según stock al momento de la confirmación. Te informaremos antes de producir." },
  { title: "Tiempos de producción", desc: "El proceso completo toma entre 10 y 15 días hábiles, dependiendo del volumen y tipo de aplicación." },
];

export default function MedidasCuidadosPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-4xl">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/90 px-5 py-2 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">Medidas y cuidados</p>
            </div>
          </div>

          <h1 className="mt-8 animate-fade-in-up animate-delay-100 text-4xl font-black leading-tight text-[#1e1e1e] md:text-5xl">
            Guía para elegir tallas y cuidar tus prendas corporativas.
          </h1>
          <p className="mt-6 animate-fade-in-up animate-delay-200 max-w-2xl text-base leading-8 text-muted">
            Una correcta selección de talla y cuidado de lavado ayuda a mantener la presentación, color, forma y durabilidad de cada prenda.
          </p>
        </div>

        <div className="mt-12 grid animate-fade-in-up animate-delay-200 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="text-2xl font-black text-[#1e1e1e]">Tabla referencial de tallas</h2>
            <p className="mt-2 text-sm text-muted">Medidas aproximadas para poleras manga corta 100% algodón.</p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2 text-xs uppercase tracking-[0.2em] text-muted">
                  <tr>
                    <th className="px-5 py-4">Talla</th>
                    <th className="px-5 py-4">Pecho</th>
                    <th className="px-5 py-4">Cadera</th>
                    <th className="px-5 py-4">Largo total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sizeRows.map((row) => (
                    <tr key={row[0]} className="transition-colors hover:bg-accent-soft/50">
                      <td className="px-5 py-4 font-black text-[#1e1e1e]">{row[0]}</td>
                      <td className="px-5 py-4 text-muted">{row[1]}</td>
                      <td className="px-5 py-4 text-muted">{row[2]}</td>
                      <td className="px-5 py-4 text-muted">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-muted">
              * Estas medidas son referenciales y pueden variar ±2 cm según el modelo y la tela.
            </p>
          </div>

          <aside className="rounded-3xl border border-border bg-white/80 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="text-2xl font-black text-[#1e1e1e]">Cuidados de prenda</h2>
            <p className="mt-2 text-sm text-muted">Sigue estas recomendaciones para alargar la vida de tus prendas corporativas.</p>
            <div className="mt-6 space-y-3">
              {careItems.map((item, i) => (
                <div key={item.label} className="group flex items-start gap-3 rounded-2xl bg-surface-2/80 px-4 py-3 transition-colors hover:bg-accent-soft/80">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-colors group-hover:bg-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#1e1e1e]">{item.label}</p>
                    <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-8 grid animate-fade-in-up animate-delay-300 gap-6 md:grid-cols-4">
          {tips.map((t) => (
            <div key={t.title} className="rounded-3xl border border-border bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
              <h3 className="text-base font-black text-[#1e1e1e]">{t.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
