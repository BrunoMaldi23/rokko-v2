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

export function AdminLayout({ onLogout }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("resumen");

  return (
    <div className="admin-root min-h-screen bg-[var(--adm-bg-page)]" data-admin>
      <div className="flex min-h-screen overflow-hidden text-[var(--adm-text-primary)] transition-colors duration-150">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={onLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopbar activeTab={activeTab} />

          <main className="flex-1 overflow-y-auto bg-[var(--adm-bg-page)]">
            <div className="w-full px-5 py-6 lg:px-8 lg:py-8 xl:px-10">
              {renderTab(activeTab)}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;