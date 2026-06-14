import Image from "next/image";
import Link from "next/link";

const values = [
  {
    number: "01",
    title: "Calidad visible",
    desc: "Prendas elegidas para verse bien y resistir el uso diario.",
  },
  {
    number: "02",
    title: "Marca presente",
    desc: "Logo, color y terminaciones alineadas con tu identidad.",
  },
  {
    number: "03",
    title: "Compra simple",
    desc: "Cotiza por linea, color y volumen con acompanamiento claro.",
  },
];

const metrics = [
  { label: "Experiencia", value: "+8" },
  { label: "Empresas", value: "+120" },
  { label: "Prendas", value: "+25K" },
];

export default function QuienesSomosPage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <section className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-accent/10 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-10 left-0 h-72 w-72 rounded-full bg-accent-soft/70 blur-[100px]" />

        <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/86 shadow-[0_24px_80px_rgba(45,52,54,0.08)] backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
            <div className="px-6 py-9 sm:px-10 lg:px-12 lg:py-12">
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white px-4 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.32em] text-accent">
                  Quienes somos
                </span>
              </div>

              <h1 className="mt-7 max-w-2xl text-4xl font-black leading-[1.02] text-text sm:text-5xl">
                La imagen de tu equipo empieza en una{" "}
                <span className="text-accent">prenda bien elegida</span>.
              </h1>

              <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-muted">
                En ROKKO vestimos empresas que necesitan presencia, orden y confianza desde el primer contacto.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-full bg-brand-dark px-7 py-4 text-sm font-black text-white transition hover:bg-accent hover:shadow-lg hover:shadow-accent/20"
                >
                  Ver catalogo
                </Link>
                <Link
                  href="/servicios"
                  className="rounded-full border border-brand-dark/15 bg-surface-2 px-7 py-4 text-sm font-black text-brand-dark transition hover:border-accent hover:bg-accent-soft hover:text-accent-deep"
                >
                  Servicios
                </Link>
              </div>

              <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-2xl font-black text-accent">{metric.value}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="relative min-h-[400px] overflow-hidden bg-[#0f1416] p-6 text-white lg:min-h-full">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(0,144,160,0.22),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
              <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-accent/55 to-transparent" />
              <div className="absolute inset-x-10 bottom-10 h-24 rounded-full bg-accent/12 blur-[54px]" />

              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <div className="relative">
                  <div className="absolute inset-8 rounded-full bg-accent/15 blur-3xl" />
                  <Image
                    src="/brand/rokko-mark.png"
                    alt="ROKKO Vestuario Corporativo"
                    width={360}
                    height={430}
                    priority
                    className="relative h-auto w-[230px] object-contain drop-shadow-[0_22px_36px_rgba(0,0,0,0.35)] sm:w-[260px]"
                  />
                </div>

                <div className="mt-5 h-px w-28 bg-accent" />
                <p className="mt-5 max-w-[250px] text-sm font-bold leading-7 text-white/78">
                  Presencia corporativa limpia, fuerte y lista para salir a terreno.
                </p>
              </div>
            </aside>
          </div>
        </div>

        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_12px_32px_rgba(45,52,54,0.05)] transition hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-[0_18px_45px_rgba(45,52,54,0.09)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.28em] text-accent">{value.number}</span>
                <span className="h-px w-12 bg-border" />
              </div>
              <h2 className="text-xl font-black text-text">{value.title}</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-muted">{value.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
