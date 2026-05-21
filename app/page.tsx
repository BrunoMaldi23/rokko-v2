import Link from "next/link";
import Header from "@/components/Header";

const categories = [
  { name: "Poleras", emoji: "👕", slug: "poleras" },
  { name: "Polerones", emoji: "🧥", slug: "polerones" },
  { name: "Parkas", emoji: "🥼", slug: "parkas" },
  { name: "Pantalones", emoji: "👖", slug: "pantalones" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Header />

      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-14">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-white px-5 py-2 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-cyan-500" />
              <p className="text-sm font-semibold tracking-wide text-slate-700">
                ROKKO · La imagen de tu empresa comienza aquí
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/cotizar/${category.slug}`}
                className="group rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-4xl transition group-hover:bg-cyan-100">
                  {category.emoji}
                </div>

                <h3 className="mt-6 text-2xl font-black text-slate-950">
                  {category.name}
                </h3>

                <div className="mt-6 text-sm font-bold text-cyan-700">
                  Cotizar →
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute right-[-120px] top-[-120px] -z-10 h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[-100px] -z-10 h-[320px] w-[320px] rounded-full bg-cyan-300/10 blur-3xl" />
      </section>
    </main>
  );
}