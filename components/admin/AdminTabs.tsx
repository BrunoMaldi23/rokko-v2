"use client";

export type AdminTab =
  | "resumen"
  | "productos"
  | "comercial"
  | "cotizaciones"
  | "branding";

type Props = {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
};

const tabs: { id: AdminTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "productos", label: "Productos" },
  { id: "comercial", label: "Comercial" },
  { id: "cotizaciones", label: "Cotizaciones" },
  { id: "branding", label: "Branding" },
];

export default function AdminTabs({ activeTab, onChange }: Props) {
  return (
    <div className="mb-8 flex flex-wrap gap-3 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
            activeTab === tab.id
              ? "bg-slate-950 text-white"
              : "text-slate-500 hover:bg-cyan-50 hover:text-cyan-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}