"use client";

import {
  buildCommercialPreviewLines,
  type CommercialRules,
  type CommercialSummaryItem,
} from "./commercialUtils";

type CommercialPreviewPanelProps = {
  rules: CommercialRules;
  summary: CommercialSummaryItem[];
};

export default function CommercialPreviewPanel({
  rules,
  summary,
}: CommercialPreviewPanelProps) {
  const previewLines = buildCommercialPreviewLines(rules);

  return (
    <aside className="space-y-5 xl:sticky xl:top-28">
      <section className="overflow-hidden rounded-[28px] border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f3fbfd_100%)] shadow-[0_12px_30px_rgba(8,115,129,0.06)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
        <div className="border-b border-[#cfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] px-5 py-5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
            Configuración aplicada
          </p>

          <h3 className="mt-1 text-[24px] font-black leading-none tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
            Resumen comercial
          </h3>

          <p className="mt-2 text-[12px] font-bold leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
            Vista rápida de las reglas que se usarán en las cotizaciones.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          {summary.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#bfe8ee] bg-white p-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                {item.label}
              </p>

              <p className="mt-1 text-[25px] font-black leading-none tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                {item.value}
              </p>

              <p className="mt-2 text-[11px] font-bold leading-4 text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f3fbfd_100%)] shadow-[0_12px_30px_rgba(8,115,129,0.06)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
        <div className="border-b border-[#cfe8ee] px-5 py-4 [html[data-theme='dark']_&]:border-[#243542]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
            Vista previa
          </p>

          <h3 className="mt-1 text-[21px] font-black leading-none tracking-[-0.04em] text-[#071827] [html[data-theme='dark']_&]:text-white">
            Texto para cotización
          </h3>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-[#bfe8ee] bg-white p-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
            <p className="text-[12px] font-bold italic leading-6 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
              “
              {rules.terms ||
                "Agrega condiciones comerciales para mostrarlas aquí."}
              ”
            </p>
          </div>

          <div className="rounded-2xl border border-[#bfe8ee] bg-[#f4fbfd] p-4 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
              Lectura automática
            </p>

            <div className="mt-3 space-y-2">
              {previewLines.map((line) => (
                <div key={line} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#21b7c7] [html[data-theme='dark']_&]:bg-[#00b8c8]" />

                  <p className="text-[12px] font-bold leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                    {line}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 [html[data-theme='dark']_&]:border-amber-500/25 [html[data-theme='dark']_&]:bg-amber-500/10">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-700 [html[data-theme='dark']_&]:text-amber-300">
              Recomendación
            </p>

            <p className="mt-2 text-[12px] font-bold leading-5 text-amber-800 [html[data-theme='dark']_&]:text-amber-200">
              Mantén las condiciones comerciales breves, claras y fáciles de
              entender para el cliente.
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}