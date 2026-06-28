"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { AdminTab } from "./AdminSidebar";

type AdminTheme = "light" | "dark";

type AdminTopbarProps = {
  activeTab: AdminTab;
  userName?: string;
  userEmail?: string;
  onQuickAction?: () => void;
  onSearch?: (query: string) => void;
};

const pageMeta: Record<
  AdminTab,
  {
    eyebrow: string;
    title: string;
    description: string;
    actionLabel: string;
    searchPlaceholder: string;
  }
> = {
  resumen: {
    eyebrow: "Estado general",
    title: "Resumen operativo",
    description: "Vista rápida del catálogo, disponibilidad y salud comercial.",
    actionLabel: "Actualizar",
    searchPlaceholder: "Buscar en el panel...",
  },
  productos: {
    eyebrow: "Catálogo",
    title: "Productos",
    description: "Administra prendas, stock, imágenes y disponibilidad.",
    actionLabel: "Nuevo producto",
    searchPlaceholder: "Buscar producto o código...",
  },
  categorias: {
    eyebrow: "Organización",
    title: "Categorías",
    description: "Gestiona familias comerciales y estructura del catálogo.",
    actionLabel: "Nueva categoría",
    searchPlaceholder: "Buscar categoría...",
  },
  comercial: {
    eyebrow: "Reglas comerciales",
    title: "Comercial",
    description: "Configura precios, condiciones mayoristas y márgenes.",
    actionLabel: "Nueva regla",
    searchPlaceholder: "Buscar regla comercial...",
  },
  cotizaciones: {
    eyebrow: "Pipeline comercial",
    title: "Cotizaciones",
    description: "Revisa solicitudes, estados y oportunidades comerciales.",
    actionLabel: "Nueva cotización",
    searchPlaceholder: "Buscar cotización o cliente...",
  },
  branding: {
    eyebrow: "Identidad",
    title: "Marca",
    description: "Administra datos corporativos y configuración visual.",
    actionLabel: "Editar marca",
    searchPlaceholder: "Buscar configuración...",
  },
  usuarios: {
    eyebrow: "Accesos",
    title: "Usuarios",
    description: "Controla cuentas administrativas y permisos internos.",
    actionLabel: "Nuevo usuario",
    searchPlaceholder: "Buscar usuario o email...",
  },
};

function getInitialTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("rokko-admin-theme");

  if (stored === "light" || stored === "dark") return stored;

  return "light";
}

function applyTheme(theme: AdminTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelector("[data-admin]")?.setAttribute("data-theme", theme);
}

function getInitials(name: string) {
  const cleanName = name.trim();

  if (!cleanName) return "A";

  const parts = cleanName.split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function getTabIcon(tab: AdminTab): ReactNode {
  switch (tab) {
    case "resumen":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M12 17V5" />
          <path d="M6 17v-3" />
        </svg>
      );

    case "productos":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );

    case "categorias":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="7" height="7" rx="1.5" />
          <rect x="14" y="4" width="7" height="7" rx="1.5" />
          <rect x="3" y="15" width="7" height="5" rx="1.5" />
          <rect x="14" y="15" width="7" height="5" rx="1.5" />
        </svg>
      );

    case "comercial":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );

    case "cotizaciones":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );

    case "branding":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 3 4 7l8 4 8-4-8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 17 8 4 8-4" />
        </svg>
      );

    case "usuarios":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    default:
      return null;
  }
}

export function AdminTopbar({
  activeTab,
  userName = "Administrador",
  userEmail = "admin@rokko.cl",
  onQuickAction,
  onSearch,
}: AdminTopbarProps) {
  const [theme, setTheme] = useState<AdminTheme>(() => getInitialTheme());
  const [search, setSearch] = useState("");

  const meta = pageMeta[activeTab];
  const initials = useMemo(() => getInitials(userName), [userName]);

  useEffect(() => {
    applyTheme(theme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("rokko-admin-theme", theme);
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }

  function handleSubmitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanSearch = search.trim();

    if (!cleanSearch) return;

    onSearch?.(cleanSearch);
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--adm-border-default)] bg-[var(--adm-bg-topbar)] shadow-[var(--adm-shadow-panel)]">
      <div className="flex min-h-[82px] w-full items-center justify-between gap-5 px-6 py-4 lg:px-8 xl:px-10">
        {/* LADO IZQUIERDO */}
        <section className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--adm-teal-500)] text-white shadow-[0_12px_22px_rgba(32,184,199,0.18)]">
            {getTabIcon(activeTab)}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--adm-teal-500)]">
              {meta.eyebrow}
            </p>

            <h1 className="mt-1 truncate text-[1.55rem] font-black leading-none tracking-[-0.055em] text-[var(--adm-text-heading)]">
              {meta.title}
            </h1>

            <p className="mt-1.5 hidden truncate text-[12px] font-semibold text-[var(--adm-text-secondary)] sm:block">
              {meta.description}
            </p>
          </div>
        </section>

        {/* LADO DERECHO */}
        <section className="flex shrink-0 items-center justify-end gap-2">
          {/* BUSCADOR */}
          <form
            onSubmit={handleSubmitSearch}
            className="hidden h-11 w-[280px] items-center gap-2 rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] px-4 shadow-sm transition focus-within:border-[var(--adm-teal-300)] lg:flex xl:w-[330px]"
          >
            <svg
              className="h-4 w-4 shrink-0 text-[var(--adm-text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={meta.searchPlaceholder}
              className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[var(--adm-text-primary)] outline-none placeholder:text-[var(--adm-text-muted)]"
            />
          </form>

          {/* ACCIÓN PRINCIPAL */}
          <button
            type="button"
            onClick={onQuickAction}
            className="hidden h-11 items-center gap-2 rounded-2xl border border-[var(--adm-teal-500)]/20 bg-[var(--adm-teal-500)] px-4 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(0,184,200,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--adm-teal-700)] hover:shadow-[0_16px_30px_rgba(0,184,200,0.24)] active:translate-y-0 md:flex"
          >
            <span className="text-lg leading-none">+</span>
            <span>{meta.actionLabel}</span>
          </button>

          {/* TEMA */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] text-[var(--adm-text-secondary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--adm-teal-300)] hover:text-[var(--adm-teal-500)] active:translate-y-0"
            aria-label={
              theme === "light" ? "Activar modo oscuro" : "Activar modo claro"
            }
          >
            {theme === "light" ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42 1.42" />
              </svg>
            )}
          </button>

          {/* USUARIO */}
          <div className="flex h-11 items-center gap-3 rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] px-3 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--adm-bg-badge-visible)] text-[12px] font-black text-[var(--adm-text-badge-visible)]">
              {initials}
            </div>

            <div className="hidden max-w-[145px] text-left leading-tight xl:block">
              <p className="truncate text-[12px] font-black text-[var(--adm-text-primary)]">
                {userName}
              </p>

              <p className="truncate text-[10px] font-bold text-[var(--adm-text-secondary)]">
                {userEmail}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="h-[2px] w-full bg-[linear-gradient(90deg,var(--adm-teal-500)_0%,var(--adm-teal-300)_35%,transparent_100%)]" />
    </header>
  );
}