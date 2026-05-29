import Header from "@/components/Header";

const careItems = [
  "Lavar con agua fría.",
  "No usar blanqueador.",
  "No usar secadora.",
  "Planchar a temperatura baja.",
  "No lavar en seco.",
  "Lavar la prenda del revés para proteger el logo.",
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

export default function MedidasCuidadosPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-4xl">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/60 bg-white/90 px-5 py-2 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-700">
                Medidas y cuidados
              </p>
            </div>
          </div>

          <h1 className="mt-8 animate-fade-in-up animate-delay-100 text-4xl font-black leading-tight text-slate-950 md:text-5xl">
            Guía para elegir tallas y cuidar tus prendas corporativas.
          </h1>

          <p className="mt-6 animate-fade-in-up animate-delay-200 max-w-2xl text-base leading-8 text-slate-600">
            Una correcta selección de talla y cuidado de lavado ayuda a mantener
            la presentación, color, forma y durabilidad de cada prenda.
          </p>
        </div>

        <div className="mt-12 grid animate-fade-in-up animate-delay-200 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Tabla referencial de tallas
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Medidas aproximadas para poleras manga corta 100% algodón.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Talla</th>
                    <th className="px-5 py-4">Pecho</th>
                    <th className="px-5 py-4">Cadera</th>
                    <th className="px-5 py-4">Largo total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sizeRows.map((row) => (
                    <tr key={row[0]} className="transition-colors hover:bg-cyan-50/50">
                      <td className="px-5 py-4 font-black text-slate-950">
                        {row[0]}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{row[1]}</td>
                      <td className="px-5 py-4 text-slate-600">{row[2]}</td>
                      <td className="px-5 py-4 text-slate-600">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Cuidados de prenda
            </h2>

            <div className="mt-6 space-y-3">
              {careItems.map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-cyan-50/80"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-[10px] font-black text-cyan-700">
                    {i + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-8 grid animate-fade-in-up animate-delay-300 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-7 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
            <h3 className="text-xl font-black text-slate-950">
              Antes de cotizar
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Revisa cantidades por talla para evitar cambios posteriores en la
              orden.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-7 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
            <h3 className="text-xl font-black text-slate-950">
              Sobre el logo
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              El logo debe ser evaluado antes de producir. Si no tiene calidad
              suficiente, puede requerir vectorización.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-7 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
            <h3 className="text-xl font-black text-slate-950">
              Disponibilidad
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Colores y tallas pueden variar según stock disponible al momento
              de confirmar el pedido.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
