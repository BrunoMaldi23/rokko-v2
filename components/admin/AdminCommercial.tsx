"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  fetchCommercialSettings,
  saveCommercialSettings,
} from "@/lib/settings";

const defaultRules = {
  discount: "0",
  wholesaleMin: "15",
  vat: "19",
  validity: "7",
  terms:
    "Valores con IVA incluido. Logo pecho incluido en precio base. Stock sujeto a disponibilidad.",
};

export default function AdminCommercial() {
  const [rules, setRules] = useState(defaultRules);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchCommercialSettings().then((data) => {
      if (data) {
        setRules({
          discount: String(data.discount),
          wholesaleMin: String(data.wholesale_min),
          vat: String(data.vat),
          validity: String(data.validity),
          terms: data.terms,
        });
      }
      setLoading(false);
    });
  }, []);

  const summary = useMemo(
    () => [
      { id: "disc", label: "Descuento", value: `${rules.discount || 0}%` },
      { id: "whol", label: "Mayorista desde", value: `${rules.wholesaleMin || 0} und.` },
      { id: "tax", label: "IVA", value: `${rules.vat || 0}%` },
      { id: "valid", label: "Validez", value: `${rules.validity || 0} dias` },
    ],
    [rules]
  );

  function updateRule(field: keyof typeof defaultRules, value: string) {
    setRules((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const ok = await saveCommercialSettings({
      discount: Number(rules.discount),
      wholesale_min: Number(rules.wholesaleMin),
      vat: Number(rules.vat),
      validity: Number(rules.validity),
      terms: rules.terms,
    });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert("Error al guardar. Revisa que tengas permisos de administrador.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-2xl border border-cyan-100/50 bg-white p-6 shadow-sm shadow-slate-100/50">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-600">
              Reglas de venta
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Parametros comerciales
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ajusta los criterios que guian la cotizacion y las condiciones visibles.
            </p>
          </div>
          <span className="rounded-full border border-cyan-100/30 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            Vista previa activa
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InputBlock label="Descuento global (%)">
            <input
              type="number"
              value={rules.discount}
              onChange={(e) => updateRule("discount", e.target.value)}
              className="admin-control"
            />
          </InputBlock>
          <InputBlock label="Minimo mayorista (unidades)">
            <input
              type="number"
              value={rules.wholesaleMin}
              onChange={(e) => updateRule("wholesaleMin", e.target.value)}
              className="admin-control"
            />
          </InputBlock>
          <InputBlock label="IVA (%)">
            <input
              type="number"
              value={rules.vat}
              onChange={(e) => updateRule("vat", e.target.value)}
              className="admin-control"
            />
          </InputBlock>
          <InputBlock label="Validez cotizacion (dias)">
            <input
              type="number"
              value={rules.validity}
              onChange={(e) => updateRule("validity", e.target.value)}
              className="admin-control"
            />
          </InputBlock>
        </div>

        <InputBlock label="Condiciones comerciales" className="mt-5">
          <textarea
            value={rules.terms}
            onChange={(e) => updateRule("terms", e.target.value)}
            rows={4}
            className="admin-control resize-none"
          />
        </InputBlock>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
          >
            {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar configuracion"}
          </button>
          <button
            type="button"
            onClick={() => setRules(defaultRules)}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-cyan-200 hover:bg-cyan-50/30 hover:text-cyan-700"
          >
            Restaurar
          </button>
        </div>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-28">
        <section className="rounded-2xl border border-cyan-100/50 bg-white p-6 shadow-sm shadow-slate-100/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-600">
            Resumen actual
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {summary.map((item) => (
              <div key={item.id} className="rounded-xl border border-cyan-100/30 bg-[#f4fafd]/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-100/40 bg-[#f4fafd]/50 p-6 shadow-sm shadow-slate-100/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-700">
            Texto de cotizacion
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100/30">
            <p className="text-xs font-medium italic leading-relaxed text-slate-600">
              &quot;{rules.terms || "Agrega condiciones comerciales para mostrarlas aqui."}&quot;
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}

function InputBlock({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
