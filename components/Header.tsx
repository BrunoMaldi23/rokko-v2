"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/medidas-cuidados", label: "Medidas y cuidados" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* BLOQUE IZQUIERDO: Logo totalmente libre sin contenedores */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex shrink-0 items-center transition active:scale-[0.98]">
            {/* Controlamos el tamaño del logo directamente con un contenedor invisible */}
            <div className="relative h-14 w-44">
              <Image
                src="/brand/rokko-navbar.png"
                alt="ROKKO"
                fill
                priority
                quality={100}
                sizes="176px"
                className="object-contain object-left"
              />
            </div>
          </Link>
          
          {/* Separador y texto complementario perfectamente alineados */}
          <span className="hidden h-6 w-px bg-border md:block" />
          <span className="hidden select-none text-[11px] font-black uppercase leading-none tracking-widest text-muted md:block">
            Cotizador corporativo
          </span>
        </div>

        {/* BLOQUE DERECHO: Navegación */}
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-md px-4 py-2 text-sm font-bold transition-colors ${
                  active
                    ? "text-accent-ink"
                    : "text-muted hover:bg-surface-2/70 hover:text-text"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-accent-ink" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* BOTÓN MÓVIL */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          menuOpen ? "max-h-64 border-t border-neutral-100 bg-white" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  active
                    ? "bg-accent-soft text-accent-ink"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
