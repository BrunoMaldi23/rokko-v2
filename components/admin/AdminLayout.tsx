"use client";

import { useState } from "react";
import "../../app/admin-tokens.css";
import AdminBranding from "./AdminBranding";
import AdminCategories from "./AdminCategories";
import AdminCommercial from "./AdminCommercial";
import AdminOverview from "./AdminOverview";
import AdminProducts from "./AdminProducts";
import AdminQuotes from "./AdminQuotes";
import AdminUsers from "./AdminUsers";
import { AdminSidebar, type AdminTab } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

type AdminLayoutProps = {
  onLogout: () => void;
};

function renderTab(tab: AdminTab) {
  switch (tab) {
    case "resumen":
      return <AdminOverview />;

    case "categorias":
      return <AdminCategories />;

    case "productos":
      return <AdminProducts />;

    case "comercial":
      return <AdminCommercial />;

    case "cotizaciones":
      return <AdminQuotes />;

    case "branding":
      return <AdminBranding />;

    case "usuarios":
      return <AdminUsers />;

    default:
      return <AdminOverview />;
  }
}

function resolveSearchTab(query: string): AdminTab {
  const cleanQuery = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (
    cleanQuery.includes("producto") ||
    cleanQuery.includes("prenda") ||
    cleanQuery.includes("polera") ||
    cleanQuery.includes("softshell") ||
    cleanQuery.includes("stock") ||
    cleanQuery.includes("catalogo")
  ) {
    return "productos";
  }

  if (
    cleanQuery.includes("categoria") ||
    cleanQuery.includes("familia") ||
    cleanQuery.includes("linea")
  ) {
    return "categorias";
  }

  if (
    cleanQuery.includes("precio") ||
    cleanQuery.includes("mayorista") ||
    cleanQuery.includes("descuento") ||
    cleanQuery.includes("regla") ||
    cleanQuery.includes("comercial")
  ) {
    return "comercial";
  }

  if (
    cleanQuery.includes("cotizacion") ||
    cleanQuery.includes("solicitud") ||
    cleanQuery.includes("cliente") ||
    cleanQuery.includes("pipeline")
  ) {
    return "cotizaciones";
  }

  if (
    cleanQuery.includes("marca") ||
    cleanQuery.includes("logo") ||
    cleanQuery.includes("empresa") ||
    cleanQuery.includes("branding")
  ) {
    return "branding";
  }

  if (
    cleanQuery.includes("usuario") ||
    cleanQuery.includes("admin") ||
    cleanQuery.includes("correo") ||
    cleanQuery.includes("email") ||
    cleanQuery.includes("acceso")
  ) {
    return "usuarios";
  }

  return "resumen";
}

function getSearchLabel(tab: AdminTab) {
  switch (tab) {
    case "resumen":
      return "Resumen";

    case "productos":
      return "Productos";

    case "categorias":
      return "Categorías";

    case "comercial":
      return "Comercial";

    case "cotizaciones":
      return "Cotizaciones";

    case "branding":
      return "Marca";

    case "usuarios":
      return "Usuarios";

    default:
      return "Resumen";
  }
}

export function AdminLayout({ onLogout }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("resumen");
  const [searchQuery, setSearchQuery] = useState("");

  function handleTabChange(tab: AdminTab) {
    setActiveTab(tab);
    setSearchQuery("");
  }

  function handleSearch(query: string) {
    const cleanQuery = query.trim();

    if (!cleanQuery) return;

    const targetTab = resolveSearchTab(cleanQuery);

    setActiveTab(targetTab);
    setSearchQuery(cleanQuery);
  }

  function handleQuickAction() {
    switch (activeTab) {
      case "resumen":
        setSearchQuery("");
        return;

      case "productos":
        setActiveTab("productos");
        return;

      case "categorias":
        setActiveTab("categorias");
        return;

      case "comercial":
        setActiveTab("comercial");
        return;

      case "cotizaciones":
        setActiveTab("cotizaciones");
        return;

      case "branding":
        setActiveTab("branding");
        return;

      case "usuarios":
        setActiveTab("usuarios");
        return;

      default:
        setActiveTab("resumen");
    }
  }

  return (
    <div className="admin-root min-h-screen bg-[var(--adm-bg-page)]" data-admin>
      <div className="flex min-h-screen overflow-hidden text-[var(--adm-text-primary)] antialiased transition-colors duration-150">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={onLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopbar
            activeTab={activeTab}
            onSearch={handleSearch}
            onQuickAction={handleQuickAction}
          />

          <main className="flex-1 overflow-y-auto bg-[var(--adm-bg-page)]">
            <div className="w-full px-5 py-6 lg:px-8 lg:py-8 xl:px-10">
              {searchQuery && (
                <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-card)] px-5 py-4 shadow-[var(--adm-shadow-card)] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--adm-teal-500)]">
                      Búsqueda activa
                    </p>

                    <p className="mt-1 text-[13px] font-bold text-[var(--adm-text-primary)]">
                      Buscando{" "}
                      <span className="text-[var(--adm-teal-500)]">
                        “{searchQuery}”
                      </span>{" "}
                      en {getSearchLabel(activeTab)}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="h-10 rounded-xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] px-4 text-[12px] font-black text-[var(--adm-text-secondary)] transition hover:border-[var(--adm-teal-500)]/50 hover:text-[var(--adm-teal-500)]"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              )}

              {renderTab(activeTab)}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;