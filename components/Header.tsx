"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/medidas-cuidados", label: "Medidas y cuidados" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5ddd4] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-5 transition active:scale-95">
          <div className="rounded-2xl bg-brand-dark px-4 py-2 shadow-sm transition hover:shadow-md">
            <Image src="/rokko.png" alt="ROKKO" width={160} height={50} priority />
          </div>

          <div className="hidden border-l border-[#e5ddd4] pl-5 md:block">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-accent">
              Sistema de Cotización
            </p>
            <p className="text-sm text-muted">
              Vestuario corporativo profesional
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted transition hover:bg-accent-soft hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex items-center justify-center rounded-xl p-2 text-muted transition hover:bg-accent-soft hover:text-accent md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          menuOpen ? "max-h-80 border-t border-[#e5ddd4]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-bold text-muted transition hover:bg-accent-soft hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
