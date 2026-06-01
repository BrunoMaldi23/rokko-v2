
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import AdminOverview from "./AdminOverview";
import AdminProducts from "./AdminProducts";
import AdminCommercial from "./AdminCommercial";
import AdminQuotes from "./AdminQuotes";
import AdminBranding from "./AdminBranding";

type Props = {
  onLogout: () => void;
};

const navigation = [
  { id: "resumen", label: "Resumen", description: "Indicadores del negocio" },
  { id: "productos", label: "Productos", description: "Catálogo y stock" },
  { id: "comercial", label: "Comercial", description: "Precios y reglas" },
  { id: "cotizaciones", label: "Cotizaciones", description: "Seguimiento comercial" },
  { id: "branding", label: "Marca", description: "Datos de empresa" },
] as const;

export type AdminTab = (typeof navigation)[number]["id"];

const pageCopy: Record<AdminTab, { title: string; description: string }> = {
  resumen: {
    title: "Resumen operativo",
    description: "Indicadores clave para mantener el cotizador listo para vender.",
  },
  productos: {
    title: "Catálogo de productos",
    description: "Gestiona disponibilidad, categorías y precios desde la tabla principal.",
  },
  comercial: {
    title: "Configuración comercial",
    description: "Define las reglas que ordenan descuentos, mayoristas y condiciones.",
  },
  cotizaciones: {
    title: "Cotizaciones",
    description: "Revisa el historial y prepara seguimiento de oportunidades.",
  },
  branding: {
    title: "Datos de marca",
    description: "Mantiene coherente la información que se muestra en documentos.",
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
};

function Icon({ type }: { type: AdminTab }) {
  return <div className="h-5 w-5 shrink-0">{iconMap[type]}</div>;
}

export default function AdminLayout({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>("resumen");
  const activeCopy = pageCopy[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-accent-soft/20 to-indigo-50/30 text-slate-900 font-sans antialiased selection:bg-accent/20">
      <div className="flex min-h-screen">
        <div
          aria-hidden="true"
          className="fixed inset-y-0 left-0 z-40 hidden w-0.5 bg-[#ece5dc] lg:block"
        />
        
        {/* SIDEBAR - COLOR CIAN PÁLIDO PREMIUM (image_d78a23.png) */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 shrink-0 flex-col border-r border-accent-soft/50 bg-[#ece5dc] backface-hidden lg:flex">
          
          {/* Contenedor del Logo */}
          <div className="flex items-center justify-start px-7 py-8">
            <div className="relative h-10 w-32">
              <Image
                src="/rokko.png"
                alt="Rokko Logo"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
            {navigation.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-all duration-200 border ${
                    active
                      ? "border-accent/40 bg-accent/10 text-accent font-medium shadow-sm"
                      : "border-[#e5ddd4] text-slate-500 hover:border-accent-soft/60 hover:bg-accent-soft/30 hover:text-slate-900"
                  }`}
                >
                  {/* Indicador de pestaña activa en el borde izquierdo */}
                  {active && (
                    <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent shadow-md shadow-accent/50" />
                  )}
                  
                  {/* Icono de la pestaña */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-accent text-white shadow-sm"
                        : "bg-slate-200/60 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                    }`}
                  >
                    <Icon type={item.id} />
                  </div>
                  
                  {/* Textos Informativos */}
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block text-sm transition-colors ${
                        active ? "text-slate-900 font-semibold" : "group-hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`block truncate text-xs transition-colors ${
                        active ? "text-accent" : "text-slate-400 group-hover:text-slate-500"
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Botón de Cerrar Sesión inferior */}
          <div className="border-t border-accent-soft/50 p-4 bg-[#ece5dc]/50">
            <button
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500 bg-red-300 px-4 py-2.5 text-sm font-medium text-slate-800 transition-all duration-200 hover:bg-red-500 hover:text-white hover:shadow-md hover:shadow-red-500/10 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* CONTENIDO DERECHO */}
        <main className="flex min-w-0 flex-1 flex-col lg:ml-72">
          
          {/* HEADER DE LA PÁGINA */}
          <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:px-8 lg:px-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">
                    {navigation.find((item) => item.id === activeTab)?.label}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    {activeCopy.title}
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {activeCopy.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 border border-accent-soft">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-medium tracking-wide text-accent">
                      Admin activo
                    </span>
                  </div>
                  <a
                    href="/"
                    className="flex items-center gap-1.5 rounded-full border border-[#e5ddd4] bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-accent-soft hover:text-accent hover:shadow-sm"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Ir a inicio</span>
                  </a>
                </div>
              </div>

              {/* Botonera de Navegación para Móviles */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
                {navigation.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`rounded-xl px-3 py-2 text-center text-sm font-medium transition-all ${
                        active
                          ? "bg-accent text-white font-semibold shadow-md shadow-accent/20"
                          : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          {/* VISTAS ACTIVAS */}
          <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 md:px-8 lg:px-10">
            {activeTab === "resumen" && <AdminOverview />}
            {activeTab === "productos" && <AdminProducts />}
            {activeTab === "comercial" && <AdminCommercial />}
            {activeTab === "cotizaciones" && <AdminQuotes />}
            {activeTab === "branding" && <AdminBranding />}
          </div>
        </main>

      </div>
    </div>
  );
}
