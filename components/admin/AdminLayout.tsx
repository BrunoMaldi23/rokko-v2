"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminOverview from "./AdminOverview";
import AdminProducts from "./AdminProducts";
import AdminCommercial from "./AdminCommercial";
import AdminQuotes from "./AdminQuotes";
import AdminBranding from "./AdminBranding";
import AdminModels3D from "./AdminModels3D";
import AdminUsers from "./AdminUsers";

type Props = {
  onLogout: () => void;
};

const navigation = [
  { id: "resumen", label: "Resumen", description: "Indicadores", code: "OV" },
  { id: "productos", label: "Productos", description: "Catalogo y stock", code: "PR" },
  { id: "modelos3d", label: "Modelos 3D", description: "Prendas GLB/GLTF", code: "3D" },
  { id: "comercial", label: "Comercial", description: "Precios y reglas", code: "CO" },
  { id: "cotizaciones", label: "Cotizaciones", description: "Pipeline comercial", code: "CT" },
  { id: "branding", label: "Marca", description: "Datos de empresa", code: "BR" },
  { id: "usuarios", label: "Usuarios", description: "Accesos admin", code: "US" },
] as const;

export type AdminTab = (typeof navigation)[number]["id"];

const pageCopy: Record<AdminTab, { title: string; description: string }> = {
  resumen: {
    title: "Resumen operativo",
    description: "Indicadores clave para mantener el cotizador listo para vender.",
  },
  productos: {
    title: "Catalogo de productos",
    description: "Gestiona disponibilidad, categorias y precios desde la tabla principal.",
  },
  modelos3d: {
    title: "Modelos 3D",
    description: "Sube prendas GLB/GLTF, calibralas y asocialas a productos.",
  },
  comercial: {
    title: "Configuracion comercial",
    description: "Define las reglas que ordenan descuentos, mayoristas y condiciones.",
  },
  cotizaciones: {
    title: "Cotizaciones",
    description: "Revisa el historial y prepara seguimiento de oportunidades.",
  },
  branding: {
    title: "Datos de marca",
    description: "Mantiene coherente la informacion que se muestra en documentos.",
  },
  usuarios: {
    title: "Usuarios",
    description: "Gestiona accesos del panel con Supabase Auth.",
  },
};

const iconMap: Record<AdminTab, ReactNode> = {
  resumen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M12 17V5" />
      <path d="M6 17v-3" />
    </svg>
  ),
  productos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  modelos3d: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
      <path d="M12 11l8-4.5" />
      <path d="M12 11L4 6.5" />
      <path d="M12 11v9" />
    </svg>
  ),
  comercial: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  cotizaciones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  branding: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  usuarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

function Icon({ type }: { type: AdminTab }) {
  return <div className="h-5 w-5 shrink-0">{iconMap[type]}</div>;
}

export default function AdminLayout({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>("resumen");
  const activeCopy = pageCopy[activeTab];
  const activeItem = navigation.find((item) => item.id === activeTab) || navigation[0];

  return (
    <div className="admin-shell min-h-screen text-text font-sans antialiased selection:bg-accent/20">
      <div className="flex min-h-screen">
        <aside className="admin-sidebar fixed inset-y-0 left-0 z-30 hidden w-[18rem] shrink-0 flex-col border-r border-white/80 lg:flex">
          <div className="px-5 pb-4 pt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="relative h-10 w-[176px]">
                <Image
                  src="/brand/rokko-navbar.png"
                  alt="Rokko Logo"
                  fill
                  priority
                  sizes="176px"
                  className="object-contain object-left"
                />
              </div>
              <span className="rounded-full border border-accent/20 bg-accent-soft/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-accent">
                Admin
              </span>
            </div>
          </div>

          <div className="px-5">
            <p className="px-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted/70">
              Gestion
            </p>
          </div>

          <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-3">
            {navigation.map((item) => {
              const active = activeTab === item.id;
              const isQuotes = item.id === "cotizaciones";
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                    active
                      ? "bg-white text-accent shadow-[0_12px_30px_rgba(45,52,54,0.08)] ring-1 ring-accent/15"
                      : "text-muted hover:bg-white/66 hover:text-text"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-accent shadow-[0_0_12px_rgba(0,144,160,0.32)]" />
                  )}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-all ${
                      active
                        ? "bg-accent text-white shadow-[0_2px_10px_rgba(0,144,160,0.25)]"
                        : isQuotes
                          ? "bg-accent-soft text-accent"
                          : "bg-surface-2 text-muted group-hover:bg-accent-soft group-hover:text-accent"
                    }`}
                  >
                    <Icon type={item.id} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`block text-sm ${active ? "font-black text-accent" : "font-semibold"}`}>
                      {item.label}
                    </span>
                    <span className={`block truncate text-[11px] ${active ? "text-accent/65" : "text-muted/55"}`}>
                      {item.description}
                    </span>
                  </div>
                  <span className={`rounded-md px-2 py-1 text-[10px] font-black ${active ? "bg-accent-soft text-accent" : isQuotes ? "bg-accent-soft/70 text-accent" : "bg-white/70 text-muted/60"}`}>
                    {item.code}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="relative border-t border-border/80 px-4 py-4">
            <Link
              href="/"
              className="mb-3 flex items-center justify-center rounded-lg border border-border bg-white/65 px-4 py-2.5 text-xs font-black text-muted transition hover:border-accent/30 hover:text-accent"
            >
              Ver sitio publico
            </Link>
            <button onClick={onLogout} className="admin-button admin-button-danger w-full">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Cerrar sesion</span>
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col lg:ml-[18rem]">
          <header className="sticky top-0 z-20 border-b border-white/80 bg-bg/74 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-6 md:px-8 lg:px-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {activeItem.label}
                  </p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-text md:text-3xl">
                    {activeCopy.title}
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm text-muted">
                    {activeCopy.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="admin-chip">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span>Admin activo</span>
                  </div>
                  <Link
                    href="/"
                    className="admin-button admin-button-secondary !rounded-full !px-3.5 !py-1.5 !text-xs"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Inicio</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
                {navigation.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`rounded-lg px-3 py-2 text-center text-sm font-semibold transition-all ${
                        active
                          ? "bg-accent text-white shadow-md shadow-accent/20"
                          : "border border-border bg-white/70 text-muted hover:border-accent/30 hover:bg-accent-soft/40 hover:text-accent"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-7 sm:px-6 md:px-8 lg:px-10">
            {activeTab === "resumen" && <AdminOverview />}
            {activeTab === "productos" && <AdminProducts />}
            {activeTab === "modelos3d" && <AdminModels3D />}
            {activeTab === "comercial" && <AdminCommercial />}
            {activeTab === "cotizaciones" && <AdminQuotes />}
            {activeTab === "branding" && <AdminBranding />}
            {activeTab === "usuarios" && <AdminUsers />}
          </div>
        </main>
      </div>
    </div>
  );
}
