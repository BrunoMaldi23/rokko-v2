"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminQuote,
  fetchAdminQuotes,
  updateAdminQuoteFull,
} from "@/lib/adminQuotes";
import type { QuoteRecord } from "@/lib/quotes";
import {
  fetchBrandSettings,
  fetchCommercialSettings,
  type BrandSettings,
  type CommercialSettings,
} from "@/lib/settings";
import DeleteQuoteModal from "./quotes/DeleteQuoteModal";
import QuoteNegotiationModal from "./quotes/QuoteNegotiationModal";
import QuotePreviewModal from "./quotes/QuotePreviewModal";
import QuotesStats from "./quotes/QuotesStats";
import QuotesTable from "./quotes/QuotesTable";
import {
  buildQuoteStats,
  normalizeText,
  statusOptions,
} from "./quotes/quotesUtils";

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("todas");
  const [search, setSearch] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [previewQuote, setPreviewQuote] = useState<QuoteRecord | null>(null);
  const [editingQuote, setEditingQuote] = useState<QuoteRecord | null>(null);

  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [commercial, setCommercial] = useState<CommercialSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminQuotes()
      .then((data) => setQuotes(data))
      .catch((error) => {
        console.error("fetch admin quotes error:", error);
        setQuotes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBrandSettings().then(setBrand);
    fetchCommercialSettings().then(setCommercial);
  }, []);

  useEffect(() => {
    if (!previewQuote && !editingQuote && !confirmDelete) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [previewQuote, editingQuote, confirmDelete]);

  const stats = useMemo(() => buildQuoteStats(quotes), [quotes]);

  const filteredQuotes = useMemo(() => {
    const q = normalizeText(search);

    return quotes.filter((quote) => {
      const statusOk =
        statusFilter === "todas" || quote.status === statusFilter;

      const searchOk =
        !q ||
        normalizeText(
          `${quote.folio} ${quote.client_empresa} ${quote.client_contacto} ${quote.client_correo} ${quote.client_rut}`,
        ).includes(q);

      return statusOk && searchOk;
    });
  }, [quotes, search, statusFilter]);

  function openNegotiation(quote: QuoteRecord) {
    setEditingQuote({
      ...quote,
      items: quote.items.map((item) => ({
        ...item,
        sizes: { ...(item.sizes || {}) },
      })),
    });
  }

  function syncQuote(next: QuoteRecord) {
    setQuotes((prev) =>
      prev.map((quote) => (quote.id === next.id ? next : quote)),
    );

    setPreviewQuote((prev) => (prev?.id === next.id ? next : prev));
    setEditingQuote((prev) => (prev?.id === next.id ? next : prev));
  }

  async function handleDelete(id: number) {
    const ok = await deleteAdminQuote(id);

    if (ok) {
      setQuotes((prev) => prev.filter((quote) => quote.id !== id));
      setPreviewQuote((prev) => (prev?.id === id ? null : prev));
      setEditingQuote((prev) => (prev?.id === id ? null : prev));
    }

    setConfirmDelete(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dff7fa] border-t-[#21b7c7] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:border-t-[#00b8c8]" />
      </div>
    );
  }

  return (
    <>
      <section className="animate-fade-in overflow-hidden rounded-[28px] border border-[#bfe8ee] bg-[linear-gradient(180deg,#fbfeff_0%,#f3fbfd_100%)] shadow-[0_12px_30px_rgba(8,115,129,0.06)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(180deg,#111b22_0%,#0f1a22_100%)] [html[data-theme='dark']_&]:shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
        <div className="relative border-b border-[#cfe8ee] bg-[linear-gradient(135deg,#f9feff_0%,#eefbfd_58%,#f7fdff_100%)] px-5 py-5 sm:px-6 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#0f2630_58%,#111b22_100%)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Pipeline comercial
              </p>

              <h2 className="mt-1 text-[28px] font-black leading-none tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                Cotizaciones recibidas
              </h2>

              <p className="mt-2 max-w-2xl text-[13px] font-bold leading-5 text-[#334155] [html[data-theme='dark']_&]:text-[#cbd5e1]">
                Prioriza oportunidades, revisa solicitudes y negocia propuestas
                comerciales desde un solo lugar.
              </p>
            </div>

            <QuotesStats stats={stats} />
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0ea5b7]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por folio, empresa, contacto, correo o RUT..."
                className="admin-control h-11 !pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const active = statusFilter === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={`h-11 rounded-2xl border px-4 text-[12px] font-black transition ${
                      active
                        ? "border-[#21b7c7] bg-[#21b7c7] text-white shadow-[0_10px_24px_rgba(33,183,199,0.2)] [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827]"
                        : "border-[#bfe8ee] bg-white text-[#334155] hover:border-[#21b7c7] hover:text-[#087381] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#cbd5e1] [html[data-theme='dark']_&]:hover:text-[#00b8c8]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <QuotesTable
          quotes={filteredQuotes}
          onPreviewQuote={setPreviewQuote}
          onEditQuote={openNegotiation}
          onDeleteQuote={(id) => setConfirmDelete(id)}
        />
      </section>

      {confirmDelete && (
        <DeleteQuoteModal
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}

      {previewQuote && (
        <QuotePreviewModal
          quote={previewQuote}
          brand={brand}
          commercial={commercial}
          onClose={() => setPreviewQuote(null)}
          onEdit={() => {
            openNegotiation(previewQuote);
            setPreviewQuote(null);
          }}
        />
      )}

      {editingQuote && (
        <QuoteNegotiationModal
          quote={editingQuote}
          brand={brand}
          commercial={commercial}
          saving={saving}
          setSaving={setSaving}
          onClose={() => setEditingQuote(null)}
          onPreview={(quote) => {
            setPreviewQuote(quote);
            setEditingQuote(null);
          }}
          onSaved={syncQuote}
          updateAdminQuoteFull={updateAdminQuoteFull}
        />
      )}
    </>
  );
}