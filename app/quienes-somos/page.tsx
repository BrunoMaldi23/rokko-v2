import Header from "@/components/Header";

export default function QuienesSomosPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-600">
            Quiénes somos
          </p>

          <h1 className="mt-5 text-5xl font-black leading-tight text-slate-950">
            ROKKO · La imagen de tu empresa comienza aquí.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Somos una marca especializada en vestuario corporativo, técnico e
            industrial, enfocada en entregar prendas de calidad, funcionales y
            pensadas para representar profesionalmente a cada equipo de trabajo.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Imagen corporativa
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Soluciones de vestuario que refuerzan presencia, identidad y orden
              visual en empresas, equipos y operaciones.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Calidad técnica
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Prendas funcionales, cómodas y preparadas para uso diario,
              terreno, oficina y líneas operativas.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Personalización
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Bordado y estampado corporativo para que cada prenda represente
              correctamente la identidad de tu empresa.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}