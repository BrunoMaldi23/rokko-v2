"use client";

import { useState } from "react";
import AdminTabs, { AdminTab } from "./AdminTabs";
import AdminOverview from "./AdminOverview";
import AdminProducts from "./AdminProducts";
import AdminCommercial from "./AdminCommercial";
import AdminQuotes from "./AdminQuotes";
import AdminBranding from "./AdminBranding";

type Props = {
  onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>("resumen");

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-600">
            Panel Admin
          </p>

          <h1 className="mt-3 text-5xl font-black text-slate-950">
            Gestión ROKKO
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Administra productos, precios, descuentos, disponibilidad,
            cotizaciones y branding.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-500"
        >
          Cerrar sesión
        </button>
      </div>

      <AdminTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "resumen" && <AdminOverview />}
      {activeTab === "productos" && <AdminProducts />}
      {activeTab === "comercial" && <AdminCommercial />}
      {activeTab === "cotizaciones" && <AdminQuotes />}
      {activeTab === "branding" && <AdminBranding />}
    </section>
  );
}