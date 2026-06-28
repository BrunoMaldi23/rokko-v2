"use client";

import type { ReactNode } from "react";
import type { CommercialRules } from "./commercialUtils";

type CommercialRulesPanelProps = {
  rules: CommercialRules;
  saving: boolean;
  saved: boolean;
  onChange: (field: keyof CommercialRules, value: string) => void;
  onSave: () => void | Promise<void>;
  onRestore: () => void;
};

export default function CommercialRulesPanel({
  rules,
  saving,
  saved,
  onChange,
  onSave,
  onRestore,
}: CommercialRulesPanelProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f3fbfd_100%)] shadow-[0_12px_30px_rgba(8,115,129,0.06)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
      <div className="border-b border-[#cfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] px-5 py-5 sm:px-6 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
              Reglas comerciales
            </p>

            <h2 className="mt-1 text-[27px] font-black leading-none tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
              Parámetros de cotización
            </h2>

            <p className="mt-2 max-w-[680px] text-[13px] font-bold leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
              Configura descuentos, IVA, mínimos mayoristas y condiciones que se
              mostrarán en la cotización enviada al cliente.
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[11px] font-black ${
              saved
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300"
                : "border-[#bfe8ee] bg-white text-[#087381] [html[data-theme='dark']_&]:border-[#00b8c8]/25 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]"
            }`}
          >
            {saved ? "Cambios guardados" : "Configuración editable"}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <section className="rounded-[24px] border border-[#bfe8ee] bg-white p-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Precio y cálculo
              </p>

              <h3 className="mt-1 text-[18px] font-black tracking-[-0.035em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                Reglas de venta
              </h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InputBlock label="Descuento global (%)">
              <input
                type="number"
                min="0"
                value={rules.discount}
                onChange={(event) => onChange("discount", event.target.value)}
                className="admin-control"
              />
            </InputBlock>

            <InputBlock label="IVA (%)">
              <input
                type="number"
                min="0"
                value={rules.vat}
                onChange={(event) => onChange("vat", event.target.value)}
                className="admin-control"
              />
            </InputBlock>

            <InputBlock label="Mayorista desde">
              <input
                type="number"
                min="0"
                value={rules.wholesaleMin}
                onChange={(event) =>
                  onChange("wholesaleMin", event.target.value)
                }
                className="admin-control"
              />
            </InputBlock>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#bfe8ee] bg-white p-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Cotización
              </p>

              <h3 className="mt-1 text-[18px] font-black tracking-[-0.035em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                Validez y condiciones
              </h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <InputBlock label="Validez cotización">
              <input
                type="number"
                min="0"
                value={rules.validity}
                onChange={(event) => onChange("validity", event.target.value)}
                className="admin-control"
              />
            </InputBlock>

            <InputBlock label="Condiciones comerciales">
              <textarea
                value={rules.terms}
                onChange={(event) => onChange("terms", event.target.value)}
                rows={5}
                className="admin-control resize-none"
                placeholder="Ej: Valores con IVA incluido. Stock sujeto a disponibilidad."
              />
            </InputBlock>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#cfe8ee] bg-[#f4fbfd] px-5 py-4 sm:px-6 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
        <p className="text-[12px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
          Estos datos se aplican a la cotización comercial.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRestore}
            className="h-11 rounded-2xl border border-[#bfe8ee] bg-white px-5 text-[13px] font-black text-[#475569] transition hover:bg-[#f4fbfd] hover:text-[#087381] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:text-[#94a3b8] [html[data-theme='dark']_&]:hover:text-[#00b8c8]"
          >
            Restaurar
          </button>

          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving}
            className="h-11 rounded-2xl bg-[#21b7c7] px-6 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(33,183,199,0.2)] transition hover:-translate-y-0.5 hover:bg-[#087381] disabled:cursor-not-allowed disabled:opacity-50 [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827] [html[data-theme='dark']_&]:hover:bg-[#9eeef4]"
          >
            {saving
              ? "Guardando..."
              : saved
                ? "Guardado"
                : "Guardar configuración"}
          </button>
        </div>
      </div>
    </section>
  );
}

function InputBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="admin-field-label">{label}</span>
      {children}
    </label>
  );
}