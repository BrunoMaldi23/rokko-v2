"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchCommercialSettings, saveCommercialSettings } from "@/lib/settings";

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
    [rules],
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="admin-panel-strong overflow-hidden rounded-lg">
        <div className="border-b border-border bg-gradient-to-r from-accent-soft/80 via-white to-white px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="admin-eyebrow">Reglas de venta</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-text">
                Parametros comerciales
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Ajusta descuentos, impuestos y condiciones que se muestran en la cotizacion.
              </p>
            </div>
            <span className="admin-chip">Vista previa activa</span>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
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

        <div className="px-6">
          <InputBlock label="Condiciones comerciales">
            <textarea
              value={rules.terms}
              onChange={(e) => updateRule("terms", e.target.value)}
              rows={5}
              className="admin-control resize-none"
            />
          </InputBlock>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border bg-surface-2/45 px-6 py-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-button admin-button-primary disabled:opacity-50"
          >
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar configuracion"}
          </button>
          <button
            type="button"
            onClick={() => setRules(defaultRules)}
            className="admin-button admin-button-secondary"
          >
            Restaurar
          </button>
        </div>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-28">
        <section className="admin-panel-strong rounded-lg p-6">
          <p className="admin-eyebrow">Resumen actual</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {summary.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-surface-2/55 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                  {item.label}
                </p>
                <p className="mt-1.5 text-xl font-black tracking-tight text-text">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel rounded-lg p-6">
          <p className="admin-eyebrow">Texto de cotizacion</p>
          <div className="mt-4 rounded-lg border border-border bg-white p-4">
            <p className="text-xs font-medium italic leading-relaxed text-muted">
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
      <span className="mb-2 block text-xs font-semibold tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
