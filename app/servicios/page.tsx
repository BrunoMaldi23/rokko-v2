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
    <main className="min-h-screen bg-[#f6f8fb]">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-600">
            Servicios
          </p>

          <h1 className="mt-5 text-5xl font-black leading-tight text-slate-950">
            Soluciones de personalización para empresas y equipos.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            En ROKKO acompañamos el proceso completo: selección de prendas,
            preparación del logo, aplicación corporativa y cotización según
            volumen.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                ●
              </div>

              <h2 className="text-2xl font-black text-slate-950">
                {service.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {service.desc}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-cyan-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-600">
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
      </section>
    </main>
  );
}