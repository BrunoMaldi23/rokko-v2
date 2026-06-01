import Link from "next/link";
import Header from "@/components/Header";

const services = [
  {
    title: "Bordado corporativo",
    desc: "Aplicación profesional de logos en prendas corporativas, ideal para una imagen duradera, elegante y de alta presencia.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    title: "Estampado textil",
    desc: "Personalización versátil para logos, nombres, áreas o diseños especiales sobre diferentes tipos de prendas.",
    icon: "M4 16l8-8 4 4 4-4 4 4M4 20h16M4 4h16",
  },
  {
    title: "Vectorización de logo",
    desc: "Preparación y mejora de archivos gráficos para lograr una correcta aplicación en bordado o estampado.",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  },
  {
    title: "Asesoría de vestuario",
    desc: "Apoyo en la selección de prendas según rubro, uso diario, terreno, clima, imagen corporativa y presupuesto.",
    icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  },
  {
    title: "Cotización por volumen",
    desc: "Configuración de pedidos por tallas, colores, cantidades y aplicación de descuentos comerciales según volumen.",
    icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  {
    title: "Imagen corporativa",
    desc: "Soluciones pensadas para uniformar equipos de trabajo manteniendo una presentación profesional y coherente.",
    icon: "M3 3h18v18H3z M9 9h6v6H9z M21 9h-3 M21 15h-3 M3 9h3 M3 15h3",
  },
];

const steps = [
  { step: "01", title: "Selecciona", desc: "Elige las prendas y cantidades desde nuestro catálogo corporativo." },
  { step: "02", title: "Personaliza", desc: "Sube tu logo, elige colores, tallas y aplicación (bordado o estampado)." },
  { step: "03", title: "Cotiza", desc: "Recibe tu cotización al instante con precios mayoristas por volumen." },
  { step: "04", title: "Confirma", desc: "Aprobamos el diseño, producimos y coordinamos el despacho." },
];

export default function ServiciosPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Header />

      <section className="relative mx-auto max-w-7xl px-6 py-14">
        <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-[360px] w-[360px] animate-float rounded-full bg-gradient-to-br from-accent/10 to-accent-soft/50 blur-3xl" />

        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#e5ddd4] bg-white/90 px-5 py-2 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">Servicios</p>
          </div>
        </div>

        <div className="mt-8 max-w-4xl animate-fade-in-up animate-delay-100">
          <h1 className="text-4xl font-black leading-tight text-[#1e1e1e] md:text-5xl">
            Soluciones de <span className="text-accent">personalización</span> para empresas y equipos.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            En ROKKO acompañamos el proceso completo: selección de prendas, preparación del logo, aplicación corporativa y cotización según volumen.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <article key={service.title} className="group animate-fade-in-up rounded-3xl border border-[#e5ddd4] bg-white/80 p-7 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-accent hover:shadow-xl hover:shadow-accent/10"
              style={{ animationDelay: `${(i + 2) * 100}ms` }}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-soft to-accent-soft/50 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:from-accent-soft group-hover:to-accent-soft">
                <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d={service.icon} />
                </svg>
              </div>
              <h2 className="text-xl font-black text-[#1e1e1e] transition-colors group-hover:text-accent">{service.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{service.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 animate-fade-in-up animate-delay-300">
          <h2 className="text-center text-2xl font-black text-[#1e1e1e]">¿Cómo funciona?</h2>
          <p className="mt-2 text-center text-sm text-muted">De la selección al despacho en 4 pasos simples.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-lg font-black text-white shadow-md shadow-accent/20">
                  {s.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute left-[calc(50%+40px)] top-7 h-px w-[calc(100%-80px)] bg-gradient-to-r from-accent/40 to-transparent" />
                )}
                <h3 className="mt-4 text-sm font-black text-[#1e1e1e]">{s.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 animate-fade-in-up animate-delay-300">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#e5ddd4] bg-gradient-to-br from-white to-accent-soft/30 p-8 shadow-sm backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
            <p className="text-xs font-black uppercase tracking-[0.35em] text-accent">Recomendación ROKKO</p>
            <h2 className="mt-3 text-3xl font-black text-[#1e1e1e]">Para mejores resultados, envía tu logo en alta calidad.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              Idealmente en formato vectorial (.ai, .eps, .svg). Si solo tienes JPG o PNG, podemos evaluar su calidad
              y preparar una versión optimizada para bordado o estampado. Mientras más nítido sea tu logo, mejor será el resultado final.
            </p>
            <Link href="/" className="mt-6 inline-flex rounded-full bg-brand-dark px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-accent hover:shadow-lg hover:shadow-accent/25">
              Comenzar cotización
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
