"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchBrandSettings, saveBrandSettings } from "@/lib/settings";
import { formatPhone } from "@/lib/phone";

const defaultBrand = {
  name: "ROKKO",
  phone: "+56 9 XXXX XXXX",
  email: "contacto@rokko.cl",
  city: "Santiago",
  footer: "Gracias por preferirnos. La imagen de tu empresa comienza aquí.",
};

export default function AdminBranding() {
  const [brand, setBrand] = useState(defaultBrand);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchBrandSettings().then((data) => {
      if (data) {
        setBrand({
          name: data.name,
          phone: data.phone,
          email: data.email,
          city: data.city,
          footer: data.footer,
        });
      }
      setLoading(false);
    });
  }, []);

  const contactRows = useMemo(
    () => [
      { label: "Teléfono", value: brand.phone },
      { label: "Correo", value: brand.email },
      { label: "Ciudad", value: brand.city },
    ],
    [brand]
  );

  function updateBrand(field: keyof typeof defaultBrand, value: string) {
    setBrand((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const ok = await saveBrandSettings(brand);
      setSaving(false);
      if (ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Error al guardar. ¿Ejecutaste sql/003_tables.sql en Supabase?");
      }
    } catch {
      setSaving(false);
      alert("Error inesperado. Revisa la consola para más detalles.");
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
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] items-start animate-fade-in">

      <section className="rounded-2xl border border-accent-soft/50 bg-white p-6 shadow-sm shadow-slate-100/50">
        <div className="border-b border-slate-100 pb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent">
            Identidad
          </p>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
            Información de empresa
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Estos datos alimentan cotizaciones, encabezados y contacto comercial.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Nombre comercial">
            <input
              type="text"
              value={brand.name}
              onChange={(e) => updateBrand("name", e.target.value)}
              placeholder="Ej. ROKKO"
              className="admin-control"
            />
          </Field>

          <Field label="Teléfono">
            <input
              type="text"
              value={brand.phone}
              onChange={(e) => updateBrand("phone", formatPhone(e.target.value))}
              placeholder="+569 1234 5678"
              maxLength={15}
              className="admin-control"
            />
          </Field>

          <Field label="Correo electrónico">
            <input
              type="email"
              value={brand.email}
              onChange={(e) => updateBrand("email", e.target.value)}
              placeholder="correo@empresa.com"
              className="admin-control"
            />
          </Field>

          <Field label="Ciudad">
            <input
              type="text"
              value={brand.city}
              onChange={(e) => updateBrand("city", e.target.value)}
              placeholder="Ej. Temuco"
              className="admin-control"
            />
          </Field>
        </div>

        <Field label="Mensaje pie de cotización" className="mt-5">
          <textarea
            value={brand.footer}
            onChange={(e) => updateBrand("footer", e.target.value)}
            rows={4}
            placeholder="Mensaje de agradecimiento o condiciones..."
            className="admin-control resize-none"
          />
        </Field>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full sm:w-auto rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar datos de marca"}
        </button>
      </section>

      <aside className="sticky top-28 rounded-2xl border border-accent-soft/50 bg-[#ece5dc]/50 p-6 shadow-sm shadow-slate-100/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Vista previa
            </p>
            <h3 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
              Cotización comercial
            </h3>
          </div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent border border-accent-soft/30">
            Documento
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="bg-gradient-to-r from-accent to-accent px-6 py-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-base font-bold text-white backdrop-blur-md border border-white/10">
                  {brand.name.slice(0, 1) || "R"}
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight leading-tight">{brand.name || "ROKKO"}</p>
                  <p className="text-xs font-medium text-accent-soft/80 mt-0.5">Vestuario corporativo</p>
                </div>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md border border-white/10">PDF</p>
            </div>
          </div>

          <div className="space-y-5 p-6 text-slate-700">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Propuesta
              </p>
              <h4 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
                Cotización para cliente
              </h4>
            </div>

            <div className="divide-y divide-slate-100 border-y border-slate-100">
              {contactRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-slate-400">
                    {row.label}
                  </span>
                  <span className="font-medium text-slate-800">{row.value || "—"}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-[#ece5dc]/50 p-4 border border-accent-soft/20">
              <p className="text-xs font-medium leading-relaxed text-slate-500 italic">
                &quot;{brand.footer || "..."}&quot;
              </p>
            </div>
          </div>
        </div>
      </aside>

    </div>
  );
}

function Field({
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
