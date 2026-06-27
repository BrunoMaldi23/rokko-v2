"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, AArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/quienes-somos", label: "Quienes somos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/medidas-cuidados", label: "Guias de talla" },
  { href: "/contacto", label: "Contacto" },
];

const fontScales = [
  { key: "normal", label: "Normal", badge: "A" },
  { key: "large", label: "Grande", badge: "A+" },
  { key: "xlarge", label: "Muy Grande", badge: "A++" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontScaleIndex, setFontScaleIndex] = useState<number>(0);
  const pathname = usePathname();

  // ─── INICIALIZACIÓN ASÍNCRONA (EVITA CASCADING RENDERS EN SSR) ──────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Cálculos de valores en el cliente
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    const savedScale = localStorage.getItem("fontScale") || "normal";
    const index = fontScales.findIndex(f => f.key === savedScale);
    const safeIndex = index !== -1 ? index : 0;

    // 2. Modificación directa del DOM (Sincrónico con el efecto)
    if (isDark) {
      document.documentElement.classList.add("rokko-dark");
    } else {
      document.documentElement.classList.remove("rokko-dark");
    }
    document.documentElement.setAttribute("data-font-scale", fontScales[safeIndex].key);

    // 3. Diferir la actualización del estado de React a la siguiente macro-tarea.
    // Esto evita el error "Calling setState synchronously within an effect" por completo.
    setTimeout(() => {
      setDarkMode(!!isDark);
      setFontScaleIndex(safeIndex);
    }, 0);
  }, []);

  // ─── HANDLERS DE INTERACCIÓN ───────────────────────────────────────────────
  const toggleDarkMode = () => {
    const currentDark = document.documentElement.classList.contains("rokko-dark");
    const nextDark = !currentDark;
    
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("rokko-dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("rokko-dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleFontSize = () => {
    const nextIndex = (fontScaleIndex + 1) % fontScales.length;
    setFontScaleIndex(nextIndex);
    
    const nextScaleKey = fontScales[nextIndex].key;
    document.documentElement.setAttribute("data-font-scale", nextScaleKey);
    localStorage.setItem("fontScale", nextScaleKey);
  };

  if (pathname?.startsWith("/admin")) return null;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        
        {/* BRAND / LOGO */}
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center transition active:scale-[0.98]"
            aria-label="Ir al inicio"
          >
            <div className="relative h-12 w-40">
              <Image
                src="/brand/rokko-navbar.png"
                alt="ROKKO"
                fill
                priority
                quality={100}
                sizes="160px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          <span className="hidden h-6 w-px shrink-0 bg-border md:block" />

          <span className="hidden shrink-0 select-none text-[12px] font-black uppercase leading-none tracking-[0.16em] text-muted md:block">
            Cotizador corporativo
          </span>
        </div>

        {/* NAV DESKTOP + ACCESIBILIDAD */}
        <div className="hidden items-center gap-5 md:flex">
          <nav className="flex items-center gap-1.5">
            {links.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-md px-3.5 py-2 text-[15px] font-bold transition-colors ${
                    active
                      ? "text-accent-deep"
                      : "text-muted hover:bg-surface-2 hover:text-text"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <span className="h-6 w-px bg-border" />

          {/* ACCESIBILIDAD TOOLBAR */}
          <div className="flex items-center gap-2">
            {/* Control Tamaño Letra */}
            <button
              type="button"
              onClick={toggleFontSize}
              title="Cambiar tamaño de texto"
              aria-label="Ajustar tamaño de fuente"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-text"
            >
              <AArrowUp className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-black text-white">
                {fontScales[fontScaleIndex]?.badge || "A"}
              </span>
            </button>

            {/* Alternador Modo Oscuro */}
            <button
              type="button"
              onClick={toggleDarkMode}
              title={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
              aria-label="Cambiar tema visual"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-text"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* BOTÓN MENÚ MÓVIL */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      <div
        className={`overflow-hidden bg-surface/96 shadow-[0_18px_40px_rgba(15,35,48,0.08)] backdrop-blur-xl transition-all duration-300 md:hidden ${
          menuOpen ? "max-h-[420px] border-t border-border" : "max-h-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border/60 bg-surface-2/40 px-6 py-3">
          <span className="text-[11px] font-black uppercase tracking-[0.1em] text-muted">Accesibilidad</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleFontSize}
              className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-bold text-text border border-border"
            >
              <AArrowUp className="h-4 w-4 text-muted" />
              {fontScales[fontScaleIndex]?.label || "Normal"}
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-border text-text"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`rounded-xl px-4 py-2.5 text-base font-bold transition-colors ${
                  active
                    ? "bg-accent-soft text-accent-deep"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}