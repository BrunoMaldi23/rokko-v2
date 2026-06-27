"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Calculator,
  Eye,
  FileText,
  Minus,
  Pencil,
  Plus,
  Printer,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { deleteAdminQuote, fetchAdminQuotes, updateAdminQuoteFull } from "@/lib/adminQuotes";
import type { QuoteItem, QuoteRecord } from "@/lib/quotes";
import { printElement } from "@/lib/print";
import {
  fetchBrandSettings,
  fetchCommercialSettings,
  type BrandSettings,
  type CommercialSettings,
} from "@/lib/settings";

function sendResponseEmail(quote: QuoteRecord, adminNotes: string) {
  fetch("/api/send-quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "admin_response",
      folio: quote.folio,
      client_empresa: quote.client_empresa,
      client_correo: quote.client_correo,
      admin_notes: adminNotes,
      status: quote.status,
    }),
  }).catch((err) => console.error("send response email error:", err));
}

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  pendiente: {
    label: "Pendiente",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },
  enviada: {
    label: "Enviada",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-400",
  },
  respondida: {
    label: "Respondida",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  cerrada: {
    label: "Cerrada",
    className: "border-border bg-surface-2 text-muted",
    dot: "bg-muted/45",
  },
};

const statusOptions = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "respondida", label: "Respondidas" },
  { value: "cerrada", label: "Cerradas" },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("es-CL")}`;
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QuoteRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("todas");
  const [search, setSearch] = useState("");
  const [previewQuote, setPreviewQuote] = useState<QuoteRecord | null>(null);
  const [editingQuote, setEditingQuote] = useState<QuoteRecord | null>(null);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [commercial, setCommercial] = useState<CommercialSettings | null>(null);

  useEffect(() => {
    fetchAdminQuotes()
      .then((data) => {
        setQuotes(data);
      })
      .catch((err) => {
        console.error("fetch admin quotes error:", err);
        setQuotes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBrandSettings().then(setBrand);
    fetchCommercialSettings().then(setCommercial);
  }, []);

  useEffect(() => {
    if (!previewQuote && !editingQuote) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [previewQuote, editingQuote]);

  const stats = useMemo(() => {
    const pending = quotes.filter((quote) => quote.status === "pendiente").length;
    const answered = quotes.filter((quote) => quote.status === "respondida").length;
    const revenue = quotes.reduce((sum, quote) => sum + (quote.total || 0), 0);
    return [
      { label: "Total", value: String(quotes.length), detail: "solicitudes" },
      { label: "Pendientes", value: String(pending), detail: "requieren accion" },
      { label: "Respondidas", value: String(answered), detail: "con seguimiento" },
      { label: "Valor pipeline", value: formatMoney(revenue), detail: "monto bruto" },
    ];
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const q = normalize(search);
    return quotes.filter((quote) => {
      const statusOk = statusFilter === "todas" || quote.status === statusFilter;
      const searchOk =
        !q ||
        normalize(
          `${quote.folio} ${quote.client_empresa} ${quote.client_contacto} ${quote.client_correo} ${quote.client_rut}`
        ).includes(q);
      return statusOk && searchOk;
    });
  }, [quotes, search, statusFilter]);

  async function handleApprove(id: number) {
    if (!adminNotes.trim()) {
      alert("Escribe una observacion antes de aprobar.");
      return;
    }
    setSaving(true);
    const ok = await updateAdminQuoteFull(id, { status: "respondida", admin_notes: adminNotes });
    if (ok) {
      const upd = (q: QuoteRecord) =>
        q.id === id ? { ...q, status: "respondida", admin_notes: adminNotes } : q;
      setQuotes((prev) => prev.map(upd));
      if (selected?.id === id) {
        const next = upd(selected);
        setSelected(next);
        sendResponseEmail(next, adminNotes);
      }
    }
    setSaving(false);
  }

  async function handleReject(id: number) {
    if (!adminNotes.trim()) {
      alert("Escribe una observacion antes de cerrar.");
      return;
    }
    setSaving(true);
    const ok = await updateAdminQuoteFull(id, { status: "cerrada", admin_notes: adminNotes });
    if (ok) {
      const upd = (q: QuoteRecord) =>
        q.id === id ? { ...q, status: "cerrada", admin_notes: adminNotes } : q;
      setQuotes((prev) => prev.map(upd));
      if (selected?.id === id) {
        const next = upd(selected);
        setSelected(next);
        sendResponseEmail(next, adminNotes);
      }
    }
    setSaving(false);
  }

  async function handleSaveNotes(id: number) {
    setSaving(true);
    const ok = await updateAdminQuoteFull(id, { admin_notes: adminNotes });
    if (ok) {
      const upd = (q: QuoteRecord) => (q.id === id ? { ...q, admin_notes: adminNotes } : q);
      setQuotes((prev) => prev.map(upd));
      if (selected?.id === id) setSelected(upd(selected));
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    const ok = await deleteAdminQuote(id);
    if (ok) {
      setQuotes((prev) => prev.filter((quote) => quote.id !== id));
      if (selected?.id === id) setSelected(null);
    }
    setConfirmDelete(null);
  }

  function openDetail(quote: QuoteRecord) {
    setSelected(quote);
    setAdminNotes(quote.admin_notes || "");
  }

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
    setQuotes((prev) => prev.map((quote) => (quote.id === next.id ? next : quote)));
    if (selected?.id === next.id) setSelected(next);
    if (previewQuote?.id === next.id) setPreviewQuote(next);
    if (editingQuote?.id === next.id) setEditingQuote(next);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
      </div>
    );
  }

  if (selected) {
    const totalUnits = selected.items.reduce((sum, item) => sum + item.totalUnits, 0);

    return (
      <>
        <style>{`
          @media print {
            body > * { display: none !important; }
            #admin-quote-detail { display: block !important; position: fixed; inset: 0; overflow: visible; background: #fff; z-index: 999999; padding: 0.5in; }
            #admin-quote-detail .no-print { display: none !important; }
            .print\\:hidden { display: none !important; }
          }
        `}</style>
        <div id="admin-quote-detail" className="animate-fade-in space-y-5">
          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => setSelected(null)} className="admin-button admin-button-secondary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al pipeline
            </button>
            <button onClick={() => window.print()} className="admin-button admin-button-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
          </div>

          <section className="overflow-hidden rounded-xl border border-accent/18 bg-gradient-to-br from-white via-[#f8feff] to-accent-soft/35 shadow-[0_22px_70px_rgba(0,144,160,0.10)]">
            <div className="relative overflow-hidden border-b border-accent/15 bg-brand-dark px-5 py-5 text-white sm:px-6">
              <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-light">
                    Oportunidad comercial
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">{selected.client_empresa}</h2>
                  <p className="mt-1 text-sm font-semibold text-white/68">
                    {selected.folio} - {selected.client_contacto || "Sin contacto"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-accent-light">Total</p>
                    <p className="mt-1 text-lg font-black text-white">{formatMoney(selected.total)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-accent-light">Unidades</p>
                    <p className="mt-1 text-lg font-black text-white">{totalUnits}</p>
                  </div>
                  <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur sm:col-span-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-accent-light">Estado</p>
                    <div className="mt-1">
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1fr_380px]">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="admin-eyebrow">{selected.folio}</p>
                    <h2 className="mt-2 text-2xl font-black text-text">{selected.client_empresa}</h2>
                    <p className="mt-1 text-sm font-medium text-muted">
                      {selected.client_contacto} - {selected.client_correo}
                    </p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCell label="RUT" value={selected.client_rut} />
                  <InfoCell label="Telefono" value={selected.client_telefono} />
                  <InfoCell label="Unidades" value={`${totalUnits} und.`} />
                  <InfoCell label="Fecha" value={formatDate(selected.created_at)} />
                </div>

                {selected.client_observaciones && (
                  <div className="mt-5 rounded-xl border border-accent/15 bg-white/78 p-4 shadow-sm shadow-accent/5">
                    <p className="admin-eyebrow">Observacion del cliente</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{selected.client_observaciones}</p>
                  </div>
                )}

                <div className="mt-6 overflow-hidden rounded-xl border border-accent/15 bg-white/86 shadow-sm shadow-accent/5">
                  <table className="admin-table w-full min-w-[680px] text-left text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">Color</th>
                        <th className="px-4 py-3">Aplicacion</th>
                        <th className="px-4 py-3 text-right">Und.</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-accent/10">
                      {selected.items.map((item, index) => (
                        <tr key={`${item.product}-${index}`}>
                          <td className="px-4 py-4">
                            <p className="font-black text-text">{item.product}</p>
                            <p className="mt-1 text-xs text-muted">
                              {Object.entries(item.sizes)
                                .filter(([, quantity]) => quantity > 0)
                                .map(([size, quantity]) => `${size}: ${quantity}`)
                                .join(" / ")}
                            </p>
                          </td>
                          <td className="px-4 py-4 font-semibold text-muted">{item.color}</td>
                          <td className="px-4 py-4 text-muted">{item.application} - {item.logoPosition}</td>
                          <td className="px-4 py-4 text-right font-black text-text">{item.totalUnits}</td>
                          <td className="px-4 py-4 text-right font-black text-accent">{formatMoney(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-accent/25 bg-gradient-to-br from-brand-dark via-[#12383d] to-accent-deep p-5 text-white shadow-[0_20px_50px_rgba(0,91,102,0.20)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-accent-light">Total cotizado</p>
                  <p className="mt-2 text-3xl font-black text-white">{formatMoney(selected.total)}</p>
                  <p className="mt-1 text-xs font-semibold text-white/68">{selected.items.length} productos solicitados</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                      <p className="font-black text-white">{totalUnits}</p>
                      <p className="font-semibold text-white/62">unidades</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                      <p className="font-black text-white">{selected.items.length}</p>
                      <p className="font-semibold text-white/62">items</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-accent/18 bg-white/88 p-5 shadow-sm shadow-accent/5">
                  <div className="flex items-center gap-3">
                    <div className="admin-icon-tile bg-accent text-white">A</div>
                    <div>
                      <p className="text-sm font-black text-text">Decision comercial</p>
                      <p className="text-xs text-muted">Respuesta al cliente o nota interna</p>
                    </div>
                  </div>

                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={5}
                    placeholder="Escribe respuesta, condiciones, disponibilidad o proximo paso..."
                    className="admin-control mt-4 resize-none"
                  />

                  <p className="mt-3 rounded-lg border border-accent/14 bg-accent-soft/45 px-3 py-2 text-xs font-semibold leading-5 text-accent-deep">
                    Para activar las acciones comerciales escribe una nota breve. Esa nota da contexto al correo de respuesta.
                  </p>

                  <div className="mt-4 grid gap-2">
                    <button
                      onClick={() => handleApprove(selected.id)}
                      disabled={saving || !adminNotes.trim()}
                      className="admin-button bg-accent text-white shadow-[0_12px_28px_rgba(0,144,160,0.18)] hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Aprobar y responder
                    </button>
                    <button
                      onClick={() => handleSaveNotes(selected.id)}
                      disabled={saving || !adminNotes.trim()}
                      className="admin-button border border-accent/20 bg-accent-soft/65 text-accent-deep hover:border-accent/35 hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Guardar nota
                    </button>
                    <button
                      onClick={() => handleReject(selected.id)}
                      disabled={saving || !adminNotes.trim()}
                      className="admin-button admin-button-danger disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Cerrar oportunidad
                    </button>
                  </div>

                  {selected.admin_notes && (
                    <div className="mt-4 rounded-xl border border-accent/20 bg-accent-soft/45 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                        Ultima nota
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">{selected.admin_notes}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setConfirmDelete(selected.id)}
                  className="admin-button admin-button-danger no-print w-full"
                >
                  Eliminar cotizacion
                </button>
              </aside>
            </div>
          </section>

          {confirmDelete === selected.id && (
            <DeleteModal
              onCancel={() => setConfirmDelete(null)}
              onConfirm={() => handleDelete(selected.id)}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <section className="animate-fade-in overflow-hidden rounded-xl border border-accent/18 bg-gradient-to-br from-white via-[#f7fdfe] to-accent-soft/40 shadow-[0_22px_70px_rgba(0,144,160,0.10)]">
      <div className="relative border-b border-accent/12 px-5 py-5 sm:px-6">
        <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="admin-eyebrow">Pipeline comercial</p>
            <h2 className="mt-2 text-2xl font-black text-text">Cotizaciones recibidas</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Prioriza solicitudes, responde con contexto y mantiene trazabilidad por estado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[560px]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/80 bg-white/78 px-3 py-3 shadow-sm shadow-accent/5 backdrop-blur"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-accent-deep">{stat.label}</p>
                <p className="mt-1 truncate text-lg font-black text-text">{stat.value}</p>
                <p className="text-[10px] font-semibold text-muted/75">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5-5M10 18a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por folio, empresa, contacto, correo o RUT..."
              className="admin-control !pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const active = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-lg border px-4 py-2.5 text-xs font-black transition ${
                    active
                      ? "border-accent bg-accent text-white shadow-[0_10px_26px_rgba(0,144,160,0.18)]"
                      : "border-accent/15 bg-white/72 text-muted hover:border-accent/35 hover:bg-white hover:text-accent"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredQuotes.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="font-black text-text">No hay cotizaciones para este filtro.</p>
          <p className="mt-1 text-sm text-muted">Ajusta la busqueda o cambia el estado seleccionado.</p>
        </div>
      ) : (
        <>
        <div className="hidden overflow-x-auto bg-gradient-to-b from-[#eefbfc] via-white/60 to-white/20 px-4 pb-5 pt-4 lg:block">
          <table className="w-full min-w-[1040px] border-separate border-spacing-y-3 text-left text-sm">
            <thead>
              <tr className="overflow-hidden rounded-xl bg-brand-dark text-white shadow-[0_14px_36px_rgba(7,28,32,0.16)]">
                {["Oportunidad", "Contacto", "Fecha", "Productos", "Total", "Estado", ""].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-white/72 first:rounded-l-xl last:rounded-r-xl"
                  >
                    {col || <span className="sr-only">Accion</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => {
                const units = quote.items.reduce((sum, item) => sum + item.totalUnits, 0);
                const hasNotes = quote.admin_notes?.trim();
                return (
                  <tr key={quote.id} className="group">
                    <td className="border-y border-l border-accent/14 bg-white/88 px-5 py-4 shadow-sm shadow-accent/5 transition group-hover:border-accent/28 group-hover:bg-[#f2fbfc] first:rounded-l-xl">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-deep ring-1 ring-accent/15">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-accent">{quote.folio}</p>
                          <p className="mt-1 max-w-[220px] truncate font-black text-text">{quote.client_empresa}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-y border-accent/14 bg-white/88 px-5 py-4 shadow-sm shadow-accent/5 transition group-hover:border-accent/28 group-hover:bg-[#f2fbfc]">
                      <p className="font-semibold text-text">{quote.client_contacto || "Sin contacto"}</p>
                      <p className="mt-0.5 max-w-[220px] truncate text-xs text-muted">{quote.client_correo}</p>
                    </td>
                    <td className="border-y border-accent/14 bg-white/88 px-5 py-4 font-semibold text-muted shadow-sm shadow-accent/5 transition group-hover:border-accent/28 group-hover:bg-[#f2fbfc]">
                      {formatDate(quote.created_at)}
                    </td>
                    <td className="border-y border-accent/14 bg-white/88 px-5 py-4 shadow-sm shadow-accent/5 transition group-hover:border-accent/28 group-hover:bg-[#f2fbfc]">
                      <div className="inline-flex items-center gap-2 rounded-full border border-accent/14 bg-accent-soft/55 px-3 py-1.5">
                        <span className="font-black text-text">{quote.items.length} items</span>
                        <span className="h-1 w-1 rounded-full bg-accent/45" />
                        <span className="text-xs font-semibold text-muted">{units} unidades</span>
                      </div>
                    </td>
                    <td className="border-y border-accent/14 bg-white/88 px-5 py-4 shadow-sm shadow-accent/5 transition group-hover:border-accent/28 group-hover:bg-[#f2fbfc]">
                      <p className="font-black text-text">{formatMoney(quote.total)}</p>
                      <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-accent">bruto</p>
                    </td>
                    <td className="border-y border-accent/14 bg-white/88 px-5 py-4 shadow-sm shadow-accent/5 transition group-hover:border-accent/28 group-hover:bg-[#f2fbfc]">
                      <div className="flex flex-col items-start gap-2">
                        <StatusBadge status={quote.status} />
                        {hasNotes && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-accent/15 bg-accent-soft px-2.5 py-1 text-[10px] font-black text-accent">
                            <Pencil className="h-3 w-3" />
                            Con nota
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border-y border-r border-accent/14 bg-white/88 px-5 py-4 text-right shadow-sm shadow-accent/5 transition group-hover:border-accent/28 group-hover:bg-[#f2fbfc] last:rounded-r-xl">
                      <div className="flex justify-end gap-2">
                        <ActionIconButton label="Ver formato comercial" tone="view" onClick={() => setPreviewQuote(quote)}>
                          <Eye className="h-4 w-4" />
                        </ActionIconButton>
                        <ActionIconButton label="Editar negociacion" tone="edit" onClick={() => openNegotiation(quote)}>
                          <Pencil className="h-4 w-4" />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Eliminar cotizacion"
                          tone="danger"
                          onClick={() => setConfirmDelete(quote.id)}
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
        <div className="grid gap-3 p-4 lg:hidden">
          {filteredQuotes.map((quote) => {
            const units = quote.items.reduce((sum, item) => sum + item.totalUnits, 0);
            return (
              <div
                key={quote.id}
                className="rounded-xl border border-accent/15 bg-white/82 p-4 text-left shadow-sm shadow-accent/5 transition hover:border-accent/35 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                      {quote.folio}
                    </p>
                    <p className="mt-1 truncate text-base font-black text-text">
                      {quote.client_empresa}
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-muted">
                      {quote.client_contacto || "Sin contacto"} - {quote.client_correo || "sin correo"}
                    </p>
                  </div>
                  <StatusBadge status={quote.status} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-accent-soft/60 px-3 py-2">
                    <p className="font-black text-text">{quote.items.length}</p>
                    <p className="font-semibold text-muted">items</p>
                  </div>
                  <div className="rounded-lg bg-accent-soft/60 px-3 py-2">
                    <p className="font-black text-text">{units}</p>
                    <p className="font-semibold text-muted">unid.</p>
                  </div>
                  <div className="rounded-lg bg-accent-soft/60 px-3 py-2">
                    <p className="font-black text-text">{formatMoney(quote.total)}</p>
                    <p className="font-semibold text-muted">total</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setPreviewQuote(quote)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => openNegotiation(quote)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(quote.id)}
                    className="flex h-9 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600"
                    aria-label="Eliminar cotizacion"
                    title="Eliminar cotizacion"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {confirmDelete && !selected && (
        <DeleteModal
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}

      {previewQuote && (
        <AdminQuotePreviewModal
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
        <AdminQuoteNegotiationModal
          quote={editingQuote}
          brand={brand}
          commercial={commercial}
          saving={saving}
          onClose={() => setEditingQuote(null)}
          onPreview={(quote) => {
            setPreviewQuote(quote);
            setEditingQuote(null);
          }}
          onSaved={syncQuote}
          setSaving={setSaving}
        />
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.pendiente;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${cfg.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function AdminQuotePreviewModal({
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
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <button
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-label="Cerrar vista previa"
      />

      <section
        className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.32)] animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label={`Vista previa de ${quote.folio}`}
      >
        <div className="no-print shrink-0 border-b border-slate-100 bg-gradient-to-r from-surface-2 via-white to-accent-soft/55 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                Vista comercial
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-950">
                {quote.folio} - {quote.client_empresa || "Sin empresa"}
              </h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Este es el formato que se visualiza al cotizar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => printElement("admin-quote-preview-wrapper")}
                className="admin-button bg-accent text-white hover:bg-accent-deep"
              >
                <Printer className="h-4 w-4" />
                Imprimir / PDF
              </button>
              <button onClick={onEdit} className="admin-button admin-button-secondary">
                <Pencil className="h-4 w-4" />
                Editar negociacion
              </button>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-accent/40 hover:text-accent"
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
          className="max-h-[calc(90vh-92px)] overflow-auto overscroll-contain bg-[radial-gradient(circle_at_top,#d9f7fa_0,#f6fdfe_34%,#eef7f8_100%)] px-3 py-5 sm:px-6"
        >
          <AdminQuoteDocument quote={quote} brand={brand} commercial={commercial} />
        </div>
      </section>
    </div>,
    document.body
  );
}

function AdminQuoteDocument({
  quote,
  brand,
  commercial,
}: {
  quote: QuoteRecord;
  brand: BrandSettings | null;
  commercial: CommercialSettings | null;
}) {
  const vatRate = commercial?.vat ?? 19;
  const total = quote.total || 0;
  const grossTotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountPercent = Math.max(0, Math.min(100, Number(commercial?.discount || 0)));
  const discountTotal = Math.max(0, grossTotal - total);
  const effectiveDiscountPercent =
    discountTotal > 0 && grossTotal > 0 ? Math.round((discountTotal / grossTotal) * 100) : discountPercent;
  const neto = Math.round(total / (1 + vatRate / 100));
  const iva = total - neto;
  const city = brand?.city || "Temuco";
  const quoteDate = formatDate(quote.created_at);
  const validity = commercial?.validity || 5;
  const paymentTerms = commercial?.terms || "60% al confirmar el trabajo, saldo contra entrega.";
  const hasPaymentData = [
    brand?.bank_name,
    brand?.bank_account_type,
    brand?.bank_account_number,
    brand?.bank_account_holder,
    brand?.bank_account_rut,
    brand?.bank_account_email,
    brand?.payment_notes,
  ].some((value) => String(value || "").trim());
  const cellBorder = { border: "1px solid #000" } as const;
  const headerCell = { border: "1px solid #000", backgroundColor: "#f2f2f2" } as const;
  const tableHeaderCell = {
    border: "1px solid #000",
    backgroundColor: "#0b8fa1",
    color: "#fff",
  } as const;

  return (
    <div
      data-quote-print-document
      className="mx-auto min-h-[1123px] w-[794px] bg-white px-[38px] py-[34px] text-[11px] leading-tight text-black shadow-2xl print:min-h-0 print:w-full print:px-0 print:py-0 print:shadow-none"
    >
      <div className="grid grid-cols-[210px_1fr_150px] items-start gap-6">
        <div className="pt-1">
          <Image
            src="/brand/rokko-navbar.png"
            alt="ROKKO"
            width={205}
            height={66}
            className="object-contain object-left"
            priority
          />
        </div>

        <div className="pt-2 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-accent">
            Vestuario corporativo profesional
          </p>
          <h1 className="mt-1 text-[21px] font-black uppercase tracking-[0.02em]">
            Cotizacion comercial
          </h1>
          <p className="mt-1 text-[11px] font-semibold text-muted">Nro. {quote.folio}</p>
        </div>

        <div className="grid grid-cols-[62px_1fr] self-start text-[10px]">
          <div className="px-2 py-1 font-black uppercase" style={headerCell}>
            Fecha
          </div>
          <div className="px-2 py-1 font-semibold" style={cellBorder}>
            {quoteDate}
          </div>
          <div className="px-2 py-1 font-black uppercase" style={headerCell}>
            Ciudad
          </div>
          <div className="px-2 py-1 font-semibold" style={cellBorder}>
            {city}
          </div>
        </div>
      </div>

      <table className="mt-7 w-full table-fixed border-collapse text-[10.5px]">
        <tbody>
          <tr>
            <th className="w-[92px] px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Cotizacion</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{quote.folio}</td>
            <th className="w-[92px] px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Empresa</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{quote.client_empresa || "-"}</td>
          </tr>
          <tr>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Contacto</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{quote.client_contacto || "-"}</td>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Telefono</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>
              {quote.client_telefono && quote.client_telefono !== "+56 9" ? quote.client_telefono : "-"}
            </td>
          </tr>
          <tr>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Mail</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{quote.client_correo || "-"}</td>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Direccion</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{quote.client_observaciones || city || "-"}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 grid w-[360px] grid-cols-2 text-[10.5px]">
        <AdminQuoteField label="Abono 60%" value="SI" />
        <AdminQuoteField label="Tipo Pago" value="CONTADO" />
      </div>

      <table className="mt-6 w-full table-fixed border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-white text-left text-[9.5px] uppercase tracking-[0.08em] text-muted">
            <th className="w-[82px] px-2 py-1.5 font-black" style={tableHeaderCell}>Color</th>
            <th className="w-[282px] px-2 py-1.5 font-black" style={tableHeaderCell}>Descripcion</th>
            <th className="w-[122px] px-2 py-1.5 font-black" style={tableHeaderCell}>Talla</th>
            <th className="w-[58px] px-2 py-1.5 text-right font-black" style={tableHeaderCell}>Cantidad</th>
            <th className="w-[90px] px-2 py-1.5 text-right font-black" style={tableHeaderCell}>Valor unitario</th>
            <th className="w-[92px] px-2 py-1.5 text-right font-black" style={tableHeaderCell}>Total neto</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map((item, index) => {
            const sizeEntries = Object.entries(item.sizes || {}).filter(([, q]) => q > 0);

            return (
              <tr key={`${item.product}-${index}`} className="bg-white">
                <td className="break-words px-2 py-1.5 align-top font-black uppercase" style={cellBorder}>
                  {item.color}
                </td>
                <td className="break-words px-2 py-1.5 align-top" style={cellBorder}>
                  <p className="font-black uppercase leading-4">{item.product}</p>
                  <p className="mt-0.5 text-[9.5px] leading-3">
                    * Incluye logo {item.logoPosition.toLowerCase()} {item.application.toLowerCase()}.
                  </p>
                  <p className="text-[9.5px] leading-3">
                    * Producto sujeto a disponibilidad de stock y color.
                  </p>
                </td>
                <td className="break-words px-2 py-1.5 align-top text-[9.5px] leading-4" style={cellBorder}>
                  {sizeEntries.map(([size, quantity], sizeIndex) => (
                    <span key={size} className="font-semibold">
                      {sizeIndex > 0 ? " | " : ""}
                      {size}/{quantity}
                    </span>
                  ))}
                </td>
                <td className="px-2 py-1.5 text-right align-top font-black" style={cellBorder}>
                  {item.totalUnits}
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 text-right align-top" style={cellBorder}>
                  ${item.unitPrice.toLocaleString("es-CL")}
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 text-right align-top font-black" style={cellBorder}>
                  ${item.subtotal.toLocaleString("es-CL")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-5 break-inside-avoid" style={cellBorder}>
        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em]" style={headerCell}>
          Condiciones y resumen financiero
        </div>
        <div className="grid grid-cols-[1fr_270px] items-stretch">
          <div className="min-w-0 px-3 py-3 text-[10px] leading-4" style={{ borderRight: "1px solid #000" }}>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              <div>
                <p className="font-black uppercase">Plazo</p>
                <p>2 semanas con diseno aprobado.</p>
              </div>
              <div>
                <p className="font-black uppercase">Pago</p>
                <p>{paymentTerms}</p>
              </div>
              <div>
                <p className="font-black uppercase">Contacto</p>
                <p>{brand?.name || "ROKKO-TCO"}</p>
                {brand?.phone && <p>{brand.phone}</p>}
              </div>
              <div>
                <p className="font-black uppercase">Inicio de trabajos</p>
                <p>{brand?.name || "ROKKO-TCO"}</p>
                {brand?.email && <p>{brand.email}</p>}
              </div>
            </div>

            {hasPaymentData && (
              <div className="mt-3 border-t border-black/15 pt-2">
                <p className="font-black uppercase">Datos de transferencia</p>
                <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <AdminQuotePaymentLine label="Banco" value={brand?.bank_name} />
                  <AdminQuotePaymentLine label="Tipo" value={brand?.bank_account_type} />
                  <AdminQuotePaymentLine label="Cuenta" value={brand?.bank_account_number} />
                  <AdminQuotePaymentLine label="Titular" value={brand?.bank_account_holder} />
                  <AdminQuotePaymentLine label="RUT" value={brand?.bank_account_rut} />
                  <AdminQuotePaymentLine label="Correo" value={brand?.bank_account_email} />
                </div>
                {brand?.payment_notes && <p className="mt-1.5 font-semibold">{brand.payment_notes}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center p-3">
            <div className="grid grid-cols-[1fr_128px] text-[11px]">
              {discountTotal > 0 && (
                <>
                  <div className="px-3 py-2 font-black uppercase" style={headerCell}>Subtotal</div>
                  <div className="whitespace-nowrap px-3 py-2 text-right font-black" style={cellBorder}>
                    ${grossTotal.toLocaleString("es-CL")}
                  </div>
                  <div className="px-3 py-2 font-black uppercase" style={headerCell}>Descuento {effectiveDiscountPercent}%</div>
                  <div className="whitespace-nowrap px-3 py-2 text-right font-black" style={cellBorder}>
                    -${discountTotal.toLocaleString("es-CL")}
                  </div>
                </>
              )}
              <div className="px-3 py-2 font-black uppercase" style={headerCell}>Valor neto</div>
              <div className="whitespace-nowrap px-3 py-2 text-right font-black" style={cellBorder}>
                ${neto.toLocaleString("es-CL")}
              </div>
              <div className="px-3 py-2 font-black uppercase" style={headerCell}>{vatRate}%</div>
              <div className="whitespace-nowrap px-3 py-2 text-right font-black" style={cellBorder}>
                ${iva.toLocaleString("es-CL")}
              </div>
              <div className="px-3 py-2 text-[13px] font-black uppercase" style={headerCell}>Total</div>
              <div className="whitespace-nowrap px-3 py-2 text-right text-[14px] font-black" style={cellBorder}>
                ${total.toLocaleString("es-CL")}
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 text-[9.5px] leading-4" style={{ borderTop: "1px solid #000" }}>
          <p className="inline">
            <span className="font-black">Presupuesto valido por {validity} dias corridos.</span>
          </p>
          <p className="inline">
            {" "}
            <span className="font-black">INCLUYE:</span> montaje de logos imagen digital, correccion de logo para tecnica estampado o bordado. Foto montaje es utilizada como elemento de referencia.
          </p>
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between border-t border-black/8 pt-3 text-[9px] uppercase tracking-[0.14em]">
        <p className="font-bold text-accent">ROKKO Vestuario Corporativo</p>
        <p className="font-bold">Documento generado para cotizacion comercial</p>
      </div>
    </div>
  );
}

function AdminQuoteField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr]">
      <p className="border border-black bg-[#f2f2f2] px-2 py-1.5 font-black uppercase">{label}</p>
      <p className="border border-black px-2 py-1.5 font-semibold">{value || "-"}</p>
    </div>
  );
}

function AdminQuotePaymentLine({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p>
      <span className="font-black">{label}: </span>
      {value}
    </p>
  );
}

function AdminQuoteNegotiationModal({
  quote,
  brand,
  commercial,
  saving,
  onClose,
  onPreview,
  onSaved,
  setSaving,
}: {
  quote: QuoteRecord;
  brand: BrandSettings | null;
  commercial: CommercialSettings | null;
  saving: boolean;
  onClose: () => void;
  onPreview: (quote: QuoteRecord) => void;
  onSaved: (quote: QuoteRecord) => void;
  setSaving: (value: boolean) => void;
}) {
  const baseSubtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);
  const initialDiscount =
    baseSubtotal > 0 && quote.total < baseSubtotal
      ? Math.round(((baseSubtotal - quote.total) / baseSubtotal) * 100)
      : 0;
  const [items, setItems] = useState<QuoteItem[]>(quote.items);
  const [discount, setDiscount] = useState(initialDiscount);
  const [notes, setNotes] = useState(
    quote.admin_notes || "Cotizacion definitiva ajustada segun negociacion comercial."
  );
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);
  const safeDiscount = Math.max(0, Math.min(90, Number(discount) || 0));
  const total = Math.max(0, Math.round(subtotal * (1 - safeDiscount / 100)));
  const discountAmount = Math.max(0, subtotal - total);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [quote.id]);

  if (typeof document === "undefined") return null;

  function updateItem(index: number, updater: (item: QuoteItem) => QuoteItem) {
    setItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? updater(item) : item)));
  }

  function updateItemPrice(index: number, value: string) {
    const unitPrice = Math.max(0, Number(value) || 0);
    updateItem(index, (item) => ({
      ...item,
      unitPrice,
      subtotal: unitPrice * item.totalUnits,
    }));
  }

  function updateItemSize(index: number, size: string, value: string) {
    const quantity = Math.max(0, Number(value) || 0);
    updateItem(index, (item) => {
      const sizes = { ...(item.sizes || {}), [size]: quantity };
      const totalUnits = Object.values(sizes).reduce((sum, qty) => sum + Math.max(0, Number(qty) || 0), 0);
      return {
        ...item,
        sizes,
        totalUnits,
        subtotal: item.unitPrice * totalUnits,
      };
    });
  }

  async function saveNegotiation(status: "pendiente" | "respondida" = "pendiente") {
    const next: QuoteRecord = {
      ...quote,
      items,
      total,
      status,
      admin_notes: notes,
    };
    setSaving(true);
    try {
      await updateAdminQuoteFull(quote.id, {
        items,
        total,
        status,
        admin_notes: notes,
      });
      onSaved(next);
      return next;
    } catch (error) {
      console.error("save quote negotiation error:", error);
      alert("No se pudo guardar la negociacion.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function sendDefinitiveQuote() {
    const next = await saveNegotiation("respondida");
    if (!next) return;
    setSending(true);
    try {
      const response = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folio: next.folio,
          client_empresa: next.client_empresa,
          client_rut: next.client_rut,
          client_contacto: next.client_contacto,
          client_correo: next.client_correo,
          client_telefono: next.client_telefono,
          client_observaciones: next.client_observaciones,
          items: next.items,
          total: next.total,
          brand,
          commercial,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      alert("Cotizacion definitiva enviada al cliente.");
      onSaved(next);
    } catch (error) {
      console.error("send definitive quote error:", error);
      alert("No se pudo enviar la cotizacion definitiva.");
    } finally {
      setSending(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[135] flex items-center justify-center p-4 sm:p-6">
      <button
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-label="Cerrar editor de negociacion"
      />

      <section
        className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.34)] animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label={`Editar negociacion ${quote.folio}`}
      >
        <div className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-600">
                Editor de negociacion
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-950">
                {quote.folio} - {quote.client_empresa || "Sin empresa"}
              </h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Ajusta cantidades, precio o descuento antes de enviar la version definitiva.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={async () => {
                  const next = await saveNegotiation();
                  if (next) onPreview(next);
                }}
                disabled={saving || sending}
                className="admin-button bg-accent text-white hover:bg-accent-deep disabled:opacity-50"
              >
                <Printer className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={sendDefinitiveQuote}
                disabled={saving || sending || !quote.client_correo}
                className="admin-button bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="grid max-h-[calc(90vh-94px)] gap-5 overflow-y-auto overscroll-contain bg-gradient-to-br from-slate-50 via-white to-cyan-50/45 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]"
        >
          <div className="space-y-4 pb-2">
            {items.map((item, index) => {
              const previousUnitPrice = quote.items[index]?.unitPrice ?? item.unitPrice;
              const sizeEntries = Object.entries(item.sizes || {}).filter(([, quantity]) => Number(quantity) > 0);
              const editableSizes = sizeEntries.length
                ? sizeEntries.map(([size]) => size)
                : ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
              const sizeSummary = sizeEntries.length
                ? sizeEntries.map(([size, quantity]) => `${quantity}/${size}`).join(" - ")
                : "Sin tallas asignadas";
              return (
                <article
                  key={`${item.product}-${index}`}
                  className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5"
                >
                  <div className="grid gap-5 xl:grid-cols-[minmax(180px,0.9fr)_minmax(0,1.35fr)_190px]">
                    <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                        Item {index + 1}
                      </p>
                      <h4 className="mt-2 text-base font-black leading-5 text-slate-950">
                        {item.product}
                      </h4>
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-black uppercase tracking-[0.12em] text-slate-500">Color</span>
                          <span className="font-black text-slate-900">{item.color}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-black uppercase tracking-[0.12em] text-slate-500">Logo</span>
                          <span className="font-black text-slate-900">{item.application}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-black uppercase tracking-[0.12em] text-slate-500">Ubicacion</span>
                          <span className="text-right font-black text-slate-900">{item.logoPosition}</span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[11px] font-black text-cyan-800">
                          Precio anterior unidad {formatMoney(previousUnitPrice)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-700">
                          {sizeSummary}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-700">
                          {item.totalUnits} unidades
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                              Cantidad total
                            </p>
                            <p className="text-xs font-semibold text-slate-600">
                              Reparte la cantidad actual en la primera talla seleccionada.
                            </p>
                          </div>
                          <label className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Todas</span>
                            <input
                              value={item.totalUnits}
                              onChange={(event) => updateItemSize(index, editableSizes[0] || "S", event.target.value)}
                              className="h-9 w-20 rounded-lg border border-emerald-200 bg-white px-2 text-center text-sm font-black text-slate-950 outline-none"
                              inputMode="numeric"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                          Tallas seleccionadas
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-4">
                          {editableSizes.map((size) => (
                            <label key={size} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">{size}</span>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-emerald-700">
                                  {item.sizes?.[size] || 0} und.
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-[28px_minmax(0,1fr)_28px] items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateItemSize(index, size, String(Math.max(0, Number(item.sizes?.[size] || 0) - 1)))}
                                  className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-200 text-slate-700"
                                  aria-label={`Restar ${size}`}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <input
                                  value={item.sizes?.[size] || 0}
                                  onChange={(event) => updateItemSize(index, size, event.target.value)}
                                  className="h-8 min-w-0 rounded-md border border-slate-200 bg-white text-center text-sm font-black text-slate-950 outline-none"
                                  inputMode="numeric"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateItemSize(index, size, String(Number(item.sizes?.[size] || 0) + 1))}
                                  className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-800"
                                  aria-label={`Sumar ${size}`}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid content-start gap-3">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Subtotal</p>
                        <p className="text-xl font-black text-slate-950">{formatMoney(item.subtotal)}</p>
                      </div>
                      <label className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">
                          Nuevo precio unitario
                        </span>
                        <input
                          value={item.unitPrice}
                          onChange={(event) => updateItemPrice(index, event.target.value)}
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-sm font-black text-slate-950 outline-none"
                          inputMode="numeric"
                        />
                        <p className="mt-2 text-right text-xs font-semibold text-slate-500">
                          Se recalcula con {item.totalUnits} unidades
                        </p>
                      </label>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
            <div className="rounded-2xl border border-cyan-500/20 bg-[#071c20] p-5 text-white shadow-[0_22px_58px_rgba(7,28,32,0.28)]">
              <div className="flex items-center gap-2 text-cyan-200">
                <Calculator className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">Resumen final</p>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-white/72">Subtotal</span>
                  <span className="font-black text-white">{formatMoney(subtotal)}</span>
                </div>
                <label className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-white/72">Descuento</span>
                  <span className="flex items-center gap-2">
                    <input
                      value={discount}
                      onChange={(event) => setDiscount(Number(event.target.value) || 0)}
                      className="h-9 w-16 rounded-lg border border-white/20 bg-white/12 px-2 text-right font-black text-white outline-none"
                      inputMode="numeric"
                    />
                    <span className="font-black text-cyan-200">%</span>
                  </span>
                </label>
                <div className="flex justify-between text-emerald-200">
                  <span className="font-semibold">Rebaja</span>
                  <span className="font-black">-{formatMoney(discountAmount)}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/8 px-3 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-cyan-100">Total definitivo</span>
                    <span className="text-2xl font-black text-white">{formatMoney(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <label className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">
                Nota comercial
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold leading-5 text-slate-800 outline-none focus:border-emerald-300"
              />
            </label>

            <div className="grid gap-2">
              <button
                onClick={() => saveNegotiation()}
                disabled={saving || sending}
                className="admin-button admin-button-secondary disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Guardar cambios
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>,
    document.body
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-accent/14 bg-white/78 p-4 shadow-sm shadow-accent/5">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 truncate font-black text-text">{value || "-"}</p>
    </div>
  );
}

function ActionIconButton({
  children,
  label,
  onClick,
  tone = "view",
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "view" | "edit" | "danger";
}) {
  const className = {
    view: "border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300 hover:bg-violet-600 hover:text-white",
    edit: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-600 hover:text-white",
    danger: "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-600 hover:text-white",
  }[tone];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${className}`}
    >
      {children}
    </button>
  );
}

function DeleteModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/45 px-4 backdrop-blur-sm">
      <div className="admin-panel-strong w-full max-w-sm rounded-lg p-6 shadow-xl animate-scale-in">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-center text-lg font-black text-text">Eliminar cotizacion</p>
        <p className="mt-2 text-center text-sm text-muted">Esta accion no se puede deshacer.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={onCancel} className="admin-button admin-button-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className="admin-button admin-button-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
