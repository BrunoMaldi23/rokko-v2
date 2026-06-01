import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";

const values = [
  { number: "01", title: "Calidad textil", desc: "Seleccionamos prendas con estándares que garantizan durabilidad, confort y terminaciones impecables." },
  { number: "02", title: "Imagen que suma", desc: "Vestuario corporativo que fortalece la identidad de tu equipo y comunica profesionalismo." },
  { number: "03", title: "Acompañamiento total", desc: "Te guiamos desde la selección hasta la entrega, asegurando que cada detalle esté cubierto." },
];

const team = [
  { label: "Años de experiencia", value: "+8" },
  { label: "Empresas vestidas", value: "+120" },
  { label: "Prendas entregadas", value: "+25.000" },
];

export default function QuienesSomosPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Header />

      <section className="relative mx-auto max-w-7xl px-6 py-14">
        <div className="pointer-events-none absolute -right-32 -top-32 -z-10 h-[420px] w-[420px] animate-float rounded-full bg-gradient-to-br from-accent/15 to-accent-soft/50 blur-3xl" />

        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#e5ddd4] bg-white/90 px-5 py-2 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">Quiénes somos</p>
          </div>
        </div>

        <div className="relative mt-8 grid items-center gap-12 lg:grid-cols-[1fr_400px]">
          <div className="animate-fade-in-up">
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-[#1e1e1e] md:text-5xl">
              Vestuario corporativo con <span className="text-accent">imagen, calidad</span> y propósito.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
              En ROKKO creemos que la ropa de trabajo es mucho más que un uniforme: es la primera impresión que tu empresa proyecta.
              Por eso trabajamos con marcas que cumplen altos estándares de tela, costura y confección, asegurando que cada prenda
              represente fielmente los valores de tu equipo.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/" className="rounded-full bg-brand-dark px-7 py-4 text-sm font-bold text-white transition-all hover:bg-accent hover:shadow-lg hover:shadow-accent/25">
                Ver categorías
              </Link>
              <Link href="/servicios" className="rounded-full border border-slate-300 bg-white/80 px-7 py-4 text-sm font-bold text-slate-700 backdrop-blur-sm transition-all hover:border-accent hover:text-accent hover:shadow-md">
                Servicios
              </Link>
            </div>
          </div>

          <div className="animate-fade-in-up animate-delay-200">
            <div className="rounded-[2rem] border border-[#e5ddd4] bg-white/80 p-5 shadow-xl backdrop-blur-sm">
              <div className="rounded-[1.5rem] border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-7 text-white shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    <Image src="/rokko.png" alt="ROKKO" width={160} height={55} className="h-auto w-[160px] brightness-0 invert" priority />
                  </div>
                </div>
                <p className="mt-7 max-w-sm text-sm leading-7 text-slate-300">
                  La imagen de tu empresa comienza aquí.
                </p>
                <div className="mt-7 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                    <p className="text-2xl font-black text-[#e5ddd4]">B2B</p>
                    <p className="mt-1 text-xs text-muted/70">Empresas</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                    <p className="text-2xl font-black text-[#e5ddd4]">+15</p>
                    <p className="mt-1 text-xs text-muted/70">Volumen</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                    <p className="text-2xl font-black text-[#e5ddd4]">2</p>
                    <p className="mt-1 text-xs text-muted/70">Aplicaciones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-20 grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <article key={v.title} className="group animate-fade-in-up rounded-[2rem] border border-[#e5ddd4] bg-white/80 p-7 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-accent hover:shadow-xl hover:shadow-accent/10"
              style={{ animationDelay: `${(i + 2) * 120}ms` }}>
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-accent">{v.number}</span>
                <span className="h-px w-14 bg-gradient-to-r from-[#e5ddd4] to-transparent" />
              </div>
              <h2 className="text-2xl font-black text-[#1e1e1e] transition-colors group-hover:text-accent">{v.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{v.desc}</p>
            </article>
          ))}
        </div>

        <div className="relative mt-20 animate-fade-in-up animate-delay-300">
          <div className="rounded-[2rem] border border-[#e5ddd4] bg-gradient-to-br from-white to-accent-soft/30 p-8 shadow-sm backdrop-blur-sm">
            <h2 className="text-2xl font-black text-[#1e1e1e] text-center">ROKKO en números</h2>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {team.map((t) => (
                <div key={t.label} className="text-center">
                  <p className="text-4xl font-black text-accent">{t.value}</p>
                  <p className="mt-2 text-sm text-muted">{t.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
