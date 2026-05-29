import Header from "@/components/Header";

const services = [
  {
    title: "Bordado corporativo",
    desc: "Aplicación profesional de logos en prendas corporativas, ideal para una imagen duradera, elegante y de alta presencia.",
  },
  {
    title: "Estampado textil",
    desc: "Personalización versátil para logos, nombres, áreas o diseños especiales sobre diferentes tipos de prendas.",
  },
  {
    title: "Vectorización de logo",
    desc: "Preparación y mejora de archivos gráficos para lograr una correcta aplicación en bordado o estampado.",
  },
  {
    title: "Asesoría de vestuario",
    desc: "Apoyo en la selección de prendas según rubro, uso diario, terreno, clima, imagen corporativa y presupuesto.",
  },
  {
    title: "Cotización por volumen",
    desc: "Configuración de pedidos por tallas, colores, cantidades y aplicación de descuentos comerciales según volumen.",
  },
  {
    title: "Imagen corporativa",
    desc: "Soluciones pensadas para uniformar equipos de trabajo manteniendo una presentación profesional y coherente.",
  },
];

export default function ServiciosPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Header />

      <section className="relative mx-auto max-w-7xl px-6 py-14">
        <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-[360px] w-[360px] animate-float rounded-full bg-gradient-to-br from-cyan-400/10 to-cyan-200/5 blur-3xl" />

        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/60 bg-white/90 px-5 py-2 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-700">
              Servicios
            </p>
          </div>
        </div>

        <div className="mt-8 max-w-4xl animate-fade-in-up animate-delay-100">
          <h1 className="text-4xl font-black leading-tight text-slate-950 md:text-5xl">
            Soluciones de <span className="text-cyan-700">personalización</span> para empresas y equipos.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
            En ROKKO acompañamos el proceso completo: selección de prendas,
            preparación del logo, aplicación corporativa y cotización según
            volumen.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <article
              key={service.title}
              className="group animate-fade-in-up rounded-3xl border border-slate-200/80 bg-white/80 p-7 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/10"
              style={{ animationDelay: `${(i + 2) * 100}ms` }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:from-cyan-100 group-hover:to-cyan-200/50">
                <svg className="h-5 w-5 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-xl font-black text-slate-950 transition-colors group-hover:text-cyan-700">
                {service.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {service.desc}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 animate-fade-in-up animate-delay-300">
          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-200/50 bg-gradient-to-br from-white to-cyan-50/30 p-8 shadow-sm backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />

            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-700">
              Recomendación ROKKO
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950">
              Para mejores resultados, envía tu logo en alta calidad.
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Idealmente en formato vectorial. Si solo tienes JPG o PNG, se puede
              evaluar su calidad y preparar una versión optimizada para bordado o
              estampado.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
