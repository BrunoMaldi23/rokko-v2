"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Printer, X } from "lucide-react";
import type { QuoteRecord } from "@/lib/quotes";
import { printElement } from "@/lib/print";
import type {
  BrandSettings,
  CommercialSettings,
} from "@/lib/settings";
import QuoteDocument from "./QuoteDocument";

export default function QuotePreviewModal({
  quote,
  brand,
  commercial,
  onClose,
  onEdit,
}: {
  quote: QuoteRecord;
  brand: BrandSettings | null;
  commercial: CommercialSettings | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [quote.id]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
        onClick={onClose}
        aria-label="Cerrar vista previa"
      />

      <section
        className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[#bfe8ee] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.32)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]"
        role="dialog"
        aria-modal="true"
        aria-label={`Vista previa de ${quote.folio}`}
      >
        <div className="no-print shrink-0 border-b border-[#cfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] px-5 py-4 sm:px-6 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Vista comercial
              </p>

              <h3 className="mt-1 text-xl font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                {quote.folio} · {quote.client_empresa || "Sin empresa"}
              </h3>

              <p className="mt-1 text-xs font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                Este es el formato que se visualiza al cotizar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => printElement("admin-quote-preview-wrapper")}
                className="h-10 rounded-2xl bg-[#21b7c7] px-4 text-[12px] font-black text-white transition hover:bg-[#087381] [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827]"
              >
                <span className="inline-flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir / PDF
                </span>
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="h-10 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-[12px] font-black text-emerald-700 transition hover:bg-emerald-100 [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300"
              >
                <span className="inline-flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Negociar
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#bfe8ee] bg-white text-[#475569] transition hover:border-[#21b7c7] hover:text-[#087381] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8] [html[data-theme='dark']_&]:hover:text-[#00b8c8]"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          id="admin-quote-preview-wrapper"
          className="max-h-[calc(92vh-92px)] overflow-auto overscroll-contain bg-[radial-gradient(circle_at_top,#d9f7fa_0,#f6fdfe_34%,#eef7f8_100%)] px-3 py-5 sm:px-6"
        >
          <QuoteDocument quote={quote} brand={brand} commercial={commercial} />
        </div>
      </section>
    </div>,
    document.body,
  );
}