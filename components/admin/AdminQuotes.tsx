"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteAdminQuote, fetchAdminQuotes, updateAdminQuoteFull } from "@/lib/adminQuotes";
import type { QuoteRecord } from "@/lib/quotes";

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

          <section className="admin-panel-strong rounded-lg p-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
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
                  <div className="mt-5 rounded-lg border border-border bg-surface-2/55 p-4">
                    <p className="admin-eyebrow">Observacion del cliente</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{selected.client_observaciones}</p>
                  </div>
                )}

                <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white">
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
                    <tbody className="divide-y divide-border">
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
                <div className="rounded-lg border border-accent/20 bg-accent-soft/45 p-5">
                  <p className="admin-eyebrow">Total cotizado</p>
                  <p className="mt-2 text-3xl font-black text-accent">{formatMoney(selected.total)}</p>
                  <p className="mt-1 text-xs font-semibold text-muted">{selected.items.length} productos solicitados</p>
                </div>

                <div className="rounded-lg border border-border bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="admin-icon-tile">A</div>
                    <div>
                      <p className="text-sm font-black text-text">Decision comercial</p>
                      <p className="text-xs text-muted">Respuesta o nota interna</p>
                    </div>
                  </div>

                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={5}
                    placeholder="Escribe respuesta, condiciones, disponibilidad o proximo paso..."
                    className="admin-control mt-4 resize-none"
                  />

                  <div className="mt-4 grid gap-2">
                    <button
                      onClick={() => handleApprove(selected.id)}
                      disabled={saving || !adminNotes.trim()}
                      className="admin-button bg-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Aprobar y responder
                    </button>
                    <button
                      onClick={() => handleSaveNotes(selected.id)}
                      disabled={saving || !adminNotes.trim()}
                      className="admin-button admin-button-secondary disabled:cursor-not-allowed disabled:opacity-45"
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
                    <div className="mt-4 rounded-lg border border-accent/20 bg-accent-soft/45 p-4">
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
    <section className="admin-panel-strong animate-fade-in overflow-hidden rounded-lg">
      <div className="border-b border-border px-5 py-5 sm:px-6">
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
              <div key={stat.label} className="rounded-lg border border-border bg-surface-2/55 px-3 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">{stat.label}</p>
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
                      : "border-border bg-white/70 text-muted hover:border-accent/30 hover:text-accent"
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
        <div className="overflow-x-auto">
          <table className="admin-table w-full min-w-[940px] text-left text-sm">
            <thead>
              <tr>
                {["Oportunidad", "Contacto", "Fecha", "Productos", "Total", "Estado", ""].map((col) => (
                  <th key={col} className="px-6 py-4">
                    {col || <span className="sr-only">Accion</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white/70">
              {filteredQuotes.map((quote) => {
                const units = quote.items.reduce((sum, item) => sum + item.totalUnits, 0);
                const hasNotes = quote.admin_notes?.trim();
                return (
                  <tr key={quote.id} className="cursor-pointer" onClick={() => openDetail(quote)}>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-accent">{quote.folio}</p>
                      <p className="mt-1 max-w-[240px] truncate font-black text-text">{quote.client_empresa}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text">{quote.client_contacto || "Sin contacto"}</p>
                      <p className="mt-0.5 max-w-[220px] truncate text-xs text-muted">{quote.client_correo}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-muted">{formatDate(quote.created_at)}</td>
                    <td className="px-6 py-4">
                      <p className="font-black text-text">{quote.items.length} items</p>
                      <p className="text-xs text-muted">{units} unidades</p>
                    </td>
                    <td className="px-6 py-4 font-black text-text">{formatMoney(quote.total)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <StatusBadge status={quote.status} />
                        {hasNotes && (
                          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-black text-accent">
                            Con nota
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(quote);
                        }}
                        className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-black text-muted transition hover:border-accent/30 hover:text-accent"
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && !selected && (
        <DeleteModal
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
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

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/55 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 truncate font-black text-text">{value || "-"}</p>
    </div>
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
