import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-5 transition active:scale-95">
          <div className="rounded-2xl bg-slate-950 px-4 py-2 shadow-sm transition hover:shadow-md">
            <Image
              src="/rokko.png"
              alt="ROKKO"
              width={160}
              height={50}
              priority
            />
          </div>

          <div className="hidden border-l border-slate-200 pl-5 md:block">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-600">
              Sistema de Cotización
            </p>
            <p className="text-sm text-slate-500">
              Vestuario corporativo profesional
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-cyan-700"
          >
            Inicio
          </Link>

          <Link
            href="/quienes-somos"
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-cyan-700"
          >
            Quiénes somos
          </Link>

          <Link
            href="/servicios"
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-cyan-700"
          >
            Servicios
          </Link>

          <Link
            href="/medidas-cuidados"
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-cyan-700"
          >
            Medidas y cuidados
          </Link>
        </nav>
      </div>
    </header>
  );
}
