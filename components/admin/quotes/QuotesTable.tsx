"use client";

import type { ReactNode } from "react";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";
import type { QuoteRecord } from "@/lib/quotes";
import QuoteStatusBadge from "./QuoteStatusBadge";
import {
  formatDate,
  formatMoney,
  getQuotePriority,
  getQuotePriorityClass,
  getQuoteUnits,
} from "./quotesUtils";

type QuotesTableProps = {
  quotes: QuoteRecord[];
  onPreviewQuote: (quote: QuoteRecord) => void;
  onEditQuote: (quote: QuoteRecord) => void;
  onDeleteQuote: (id: number) => void;
};

export default function QuotesTable({
  quotes,
  onPreviewQuote,
  onEditQuote,
  onDeleteQuote,
}: QuotesTableProps) {
  if (quotes.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#bfe8ee] bg-white text-[#0ea5b7] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
          <FileText className="h-7 w-7" />
        </div>

        <p className="font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
          No hay cotizaciones para este filtro.
        </p>

        <p className="mt-1 text-sm font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
          Ajusta la búsqueda o cambia el estado seleccionado.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto bg-[#f4fbfd] px-4 pb-5 pt-4 [html[data-theme='dark']_&]:bg-[#0b1319] lg:block">
        <table className="w-full min-w-[1120px] border-separate border-spacing-y-3 text-left text-sm">
          <thead>
            <tr>
              {[
                "Oportunidad",
                "Contacto",
                "Fecha",
                "Productos",
                "Total",
                "Prioridad",
                "Estado",
                "",
              ].map((column) => (
                <th
                  key={column || "acciones"}
                  className="bg-[#eaf8fb] px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#0f5f6d] first:rounded-l-2xl last:rounded-r-2xl [html[data-theme='dark']_&]:bg-[#162530] [html[data-theme='dark']_&]:text-[#00b8c8]"
                >
                  {column || <span className="sr-only">Acciones</span>}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {quotes.map((quote) => {
              const units = getQuoteUnits(quote);
              const priority = getQuotePriority(quote);
              const hasNotes = Boolean(quote.admin_notes?.trim());

              return (
                <tr key={quote.id} className="group">
                  <td className="border-y border-l border-[#bfe8ee] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] transition group-hover:border-[#21b7c7]/50 group-hover:bg-[#f8feff] first:rounded-l-2xl [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:group-hover:bg-[#14242e]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e6f8fb] text-[#087381] ring-1 ring-[#21b7c7]/20 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                          {quote.folio}
                        </p>

                        <p className="mt-1 max-w-[220px] truncate font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                          {quote.client_empresa || "Sin empresa"}
                        </p>

                        {hasNotes && (
                          <p className="mt-1 text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                            Con nota comercial
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="border-y border-[#bfe8ee] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] transition group-hover:border-[#21b7c7]/50 group-hover:bg-[#f8feff] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:group-hover:bg-[#14242e]">
                    <p className="font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                      {quote.client_contacto || "Sin contacto"}
                    </p>

                    <p className="mt-0.5 max-w-[220px] truncate text-xs font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                      {quote.client_correo || "Sin correo"}
                    </p>
                  </td>

                  <td className="border-y border-[#bfe8ee] bg-white px-5 py-4 font-bold text-[#334155] shadow-[0_8px_22px_rgba(8,115,129,0.04)] transition group-hover:border-[#21b7c7]/50 group-hover:bg-[#f8feff] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:text-[#cbd5e1] [html[data-theme='dark']_&]:group-hover:bg-[#14242e]">
                    {formatDate(quote.created_at)}
                  </td>

                  <td className="border-y border-[#bfe8ee] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] transition group-hover:border-[#21b7c7]/50 group-hover:bg-[#f8feff] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:group-hover:bg-[#14242e]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe8ee] bg-[#f4fbfd] px-3 py-1.5 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
                      <span className="font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                        {quote.items.length} items
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[#21b7c7]" />
                      <span className="text-xs font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                        {units} unidades
                      </span>
                    </div>
                  </td>

                  <td className="border-y border-[#bfe8ee] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] transition group-hover:border-[#21b7c7]/50 group-hover:bg-[#f8feff] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:group-hover:bg-[#14242e]">
                    <p className="font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                      {formatMoney(quote.total)}
                    </p>

                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                      bruto
                    </p>
                  </td>

                  <td className="border-y border-[#bfe8ee] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] transition group-hover:border-[#21b7c7]/50 group-hover:bg-[#f8feff] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:group-hover:bg-[#14242e]">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${getQuotePriorityClass(
                        priority,
                      )}`}
                    >
                      {priority}
                    </span>
                  </td>

                  <td className="border-y border-[#bfe8ee] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] transition group-hover:border-[#21b7c7]/50 group-hover:bg-[#f8feff] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:group-hover:bg-[#14242e]">
                    <QuoteStatusBadge status={quote.status} />
                  </td>

                  <td className="border-y border-r border-[#bfe8ee] bg-white px-5 py-4 text-right shadow-[0_8px_22px_rgba(8,115,129,0.04)] transition group-hover:border-[#21b7c7]/50 group-hover:bg-[#f8feff] last:rounded-r-2xl [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:group-hover:bg-[#14242e]">
                    <div className="flex justify-end gap-2">
                      <ActionIconButton
                        label="Ver cotización"
                        tone="view"
                        onClick={() => onPreviewQuote(quote)}
                      >
                        <Eye className="h-4 w-4" />
                      </ActionIconButton>

                      <ActionIconButton
                        label="Negociar"
                        tone="edit"
                        onClick={() => onEditQuote(quote)}
                      >
                        <Pencil className="h-4 w-4" />
                      </ActionIconButton>

                      <ActionIconButton
                        label="Eliminar"
                        tone="danger"
                        onClick={() => onDeleteQuote(quote.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionIconButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 bg-[#f4fbfd] p-4 [html[data-theme='dark']_&]:bg-[#0b1319] lg:hidden">
        {quotes.map((quote) => {
          const units = getQuoteUnits(quote);
          const priority = getQuotePriority(quote);

          return (
            <article
              key={quote.id}
              className="rounded-2xl border border-[#bfe8ee] bg-white p-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                    {quote.folio}
                  </p>

                  <p className="mt-1 truncate text-base font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                    {quote.client_empresa || "Sin empresa"}
                  </p>

                  <p className="mt-1 truncate text-xs font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                    {quote.client_contacto || "Sin contacto"} ·{" "}
                    {quote.client_correo || "Sin correo"}
                  </p>
                </div>

                <QuoteStatusBadge status={quote.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <MobileMetric label="Items" value={quote.items.length} />
                <MobileMetric label="Unid." value={units} />
                <MobileMetric label="Total" value={formatMoney(quote.total)} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${getQuotePriorityClass(
                    priority,
                  )}`}
                >
                  {priority}
                </span>

                <p className="text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                  {formatDate(quote.created_at)}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onPreviewQuote(quote)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#bfe8ee] bg-[#e6f8fb] px-3 py-2 text-xs font-black text-[#087381] [html[data-theme='dark']_&]:border-[#00b8c8]/30 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </button>

                <button
                  type="button"
                  onClick={() => onEditQuote(quote)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300"
                >
                  <Pencil className="h-4 w-4" />
                  Negociar
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteQuote(quote.id)}
                  className="flex h-9 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 [html[data-theme='dark']_&]:border-red-500/25 [html[data-theme='dark']_&]:bg-red-500/10 [html[data-theme='dark']_&]:text-red-300"
                  aria-label="Eliminar cotización"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function ActionIconButton({
  children,
  label,
  onClick,
  tone,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  tone: "view" | "edit" | "danger";
}) {
  const styles = {
    view: "border-[#bfe8ee] bg-[#e6f8fb] text-[#087381] hover:bg-[#21b7c7] hover:text-white [html[data-theme='dark']_&]:border-[#00b8c8]/25 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]",
    edit: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300",
    danger:
      "border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white [html[data-theme='dark']_&]:border-red-500/25 [html[data-theme='dark']_&]:bg-red-500/10 [html[data-theme='dark']_&]:text-red-300",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${styles[tone]}`}
    >
      {children}
    </button>
  );
}

function MobileMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-[#f4fbfd] px-3 py-2 [html[data-theme='dark']_&]:bg-[#0b1319]">
      <p className="truncate font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
        {value}
      </p>

      <p className="font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
        {label}
      </p>
    </div>
  );
}