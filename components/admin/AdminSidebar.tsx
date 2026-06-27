"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode, SVGProps } from "react";

export type AdminTab =
  | "resumen"
  | "categorias"
  | "productos"
  | "comercial"
  | "cotizaciones"
  | "branding"
  | "usuarios";

type NavItem = {
  id: AdminTab;
  label: string;
  description: string;
  shortcut: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

type AdminSidebarProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
};

const navItems: NavItem[] = [
  {
    id: "resumen",
    label: "Resumen",
    description: "Indicadores",
    shortcut: "OV",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M12 17V5" />
        <path d="M6 17v-3" />
      </svg>
    ),
  },
  {
    id: "productos",
    label: "Productos",
    description: "Catálogo y stock",
    shortcut: "PR",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: "categorias",
    label: "Categorías",
    description: "Familias comerciales",
    shortcut: "CA",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="3" y="4" width="7" height="7" rx="1.5" />
        <rect x="14" y="4" width="7" height="7" rx="1.5" />
        <rect x="3" y="15" width="7" height="5" rx="1.5" />
        <rect x="14" y="15" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "comercial",
    label: "Comercial",
    description: "Precios y reglas",
    shortcut: "CO",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: "cotizaciones",
    label: "Cotizaciones",
    description: "Pipeline comercial",
    shortcut: "CT",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "branding",
    label: "Marca",
    description: "Datos de empresa",
    shortcut: "BR",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M12 3 4 7l8 4 8-4-8-4Z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 17 8 4 8-4" />
      </svg>
    ),
  },
  {
    id: "usuarios",
    label: "Usuarios",
    description: "Accesos admin",
    shortcut: "US",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function AdminSidebar({
  activeTab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar-shell sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden md:flex">
      <div className="px-4 pb-4 pt-5">
        <Link
          href="/admin"
          className="sidebar-logo-wrap flex items-center justify-center rounded-2xl"
          aria-label="ROKKO Admin"
        >
          <div className="sidebar-logo-box relative h-[72px] w-full">
            <Image
              src="/brand/rokko-navbar.png"
              alt="ROKKO"
              fill
              priority
              className="object-contain object-left"
              sizes="220px"
            />
          </div>
        </Link>
      </div>

      <div className="px-5 pb-3">
        <div className="flex items-center justify-between">
          <p className="sidebar-section-title text-[11px] font-black uppercase tracking-[0.18em]">
            Gestión
          </p>

          <span className="rounded-full bg-[var(--adm-bg-badge-visible)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--adm-text-badge-visible)]">
            Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                isActive
                  ? "sidebar-active-item"
                  : "text-[var(--adm-text-on-sidebar)] hover:bg-[var(--adm-bg-sidebar-hover)] hover:text-[var(--adm-text-primary)]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-9 w-1 -translate-y-1/2 rounded-r-full bg-[var(--adm-teal-500)]" />
              )}

              <span
                className={`sidebar-icon-box flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                  isActive ? "sidebar-icon-box-active" : ""
                }`}
              >
                <item.icon className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm font-black ${
                    isActive
                      ? "text-[var(--adm-teal-500)]"
                      : "text-[var(--adm-text-primary)]"
                  }`}
                >
                  {item.label}
                </span>

                <span className="mt-0.5 block truncate text-[10px] font-semibold leading-4 text-[var(--adm-text-secondary)]">
                  {item.description}
                </span>
              </span>

              <span className="sidebar-shortcut rounded-lg px-2 py-1 text-[10px] font-black tracking-wider">
                {item.shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-3">
        <Link
          href="/"
          className="sidebar-public-link mb-3 flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-black transition"
        >
          <span>Ver sitio público</span>

          <svg
            className="h-4 w-4 opacity-70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--adm-teal-500)]/30 bg-[var(--adm-teal-500)] px-4 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--adm-teal-700)] active:translate-y-0 active:scale-[0.99]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 text-white transition group-hover:bg-white/25">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </span>

          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}