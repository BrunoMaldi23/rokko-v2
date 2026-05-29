"use client";

import { useEffect, useState } from "react";
import { fetchQuotes, updateQuoteFull, deleteQuote, type QuoteRecord } from "@/lib/quotes";

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

const statusConfig: Record<string, { label: string; bg: string; dot: string }> = {
  pendiente: { label: "Pendiente", bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  enviada: { label: "Enviada", bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  respondida: { label: "Respondida", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  cerrada: { label: "Cerrada", bg: "bg-slate-50 text-slate-500 border-slate-200", dot: "bg-slate-300" },
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QuoteRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchQuotes().then((data) => {
      setQuotes(data);
      setLoading(false);
    });
  }, []);

  async function handleApprove(id: number) {
    if (!adminNotes.trim()) {
      alert("Escribe una observación antes de aprobar.");
      return;
    }
    setSaving(true);
    const ok = await updateQuoteFull(id, { status: "respondida", admin_notes: adminNotes });
    if (ok) {
      const upd = (q: QuoteRecord) => q.id === id ? { ...q, status: "respondida", admin_notes: adminNotes } : q;
      setQuotes((prev) => prev.map(upd));
      if (selected?.id === id) {
        setSelected(upd(selected));
        sendResponseEmail(upd(selected), adminNotes);
      }
    }
    setSaving(false);
  }

  async function handleReject(id: number) {
    if (!adminNotes.trim()) {
      alert("Escribe una observación antes de cerrar.");
      return;
    }
    setSaving(true);
    const ok = await updateQuoteFull(id, { status: "cerrada", admin_notes: adminNotes });
    if (ok) {
      const upd = (q: QuoteRecord) => q.id === id ? { ...q, status: "cerrada", admin_notes: adminNotes } : q;
      setQuotes((prev) => prev.map(upd));
      if (selected?.id === id) {
        setSelected(upd(selected));
        sendResponseEmail(upd(selected), adminNotes);
      }
    }
    setSaving(false);
  }

  async function handleSaveNotes(id: number) {
    setSaving(true);
    const ok = await updateQuoteFull(id, { admin_notes: adminNotes });
    if (ok) {
      const upd = (q: QuoteRecord) => q.id === id ? { ...q, admin_notes: adminNotes } : q;
      setQuotes((prev) => prev.map(upd));
      if (selected?.id === id) setSelected(upd(selected));
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    const ok = await deleteQuote(id);
    if (ok) {
      setQuotes((prev) => prev.filter((q) => q.id !== id));
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
      </div>
    );
  }

  /* ─── DETALLE ─── */
  if (selected) {
    const cfg = statusConfig[selected.status] || statusConfig.pendiente;
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
        <div id="admin-quote-detail" className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:border-cyan-300 hover:text-cyan-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Volver al listado
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-cyan-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir
          </button>
        </div>

        {/* Cabecera */}
        <div className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">{selected.folio}</p>
                <h2 className="mt-0.5 text-xl font-black text-slate-950">{selected.client_empresa}</h2>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-black ${cfg.bg}`}>
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* Info cliente */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard label="RUT" value={selected.client_rut} />
            <InfoCard label="Contacto" value={selected.client_contacto} />
            <InfoCard label="Correo" value={selected.client_correo} />
            <InfoCard label="Teléfono" value={selected.client_telefono} />
          </div>

          {selected.client_observaciones && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Observaciones del cliente</p>
              <p className="mt-1 text-sm text-slate-700">{selected.client_observaciones}</p>
            </div>
          )}

          {/* Productos */}
          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
              Productos ({selected.items.length})
            </p>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {selected.items.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{item.product}</p>
                    <p className="text-xs text-slate-500">{item.color} · {item.application} · {item.logoPosition}</p>
                    <p className="text-xs text-slate-400">
                      {Object.entries(item.sizes).filter(([, q]) => q > 0).map(([s, q]) => `${s}: ${q}`).join(" · ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900">${item.subtotal.toLocaleString("es-CL")}</p>
                    <p className="text-xs text-slate-400">{item.totalUnits} und.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total y fecha */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">
              <span className="font-semibold">Creada:</span> {new Date(selected.created_at).toLocaleDateString("es-CL", { dateStyle: "long" })}
            </p>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
              <p className="text-2xl font-black text-cyan-700">${selected.total.toLocaleString("es-CL")}</p>
            </div>
          </div>
        </div>

        {/* Panel de admin */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white text-xs font-black">A</div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Acción del administrador</p>
              <p className="text-[11px] text-slate-400">Aprobar, rechazar o dejar comentario interno</p>
            </div>
          </div>

          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            placeholder="Escribe tu respuesta, observaciones o comentario sobre esta cotización..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/10"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => handleSaveNotes(selected.id)}
              disabled={saving || !adminNotes.trim()}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-40"
            >
              {saving ? "Guardando..." : "Guardar comentario"}
            </button>
            {selected.status !== "respondida" && (
              <button
                onClick={() => handleApprove(selected.id)}
                disabled={saving || !adminNotes.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.97] disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Aprobar
              </button>
            )}
            {selected.status !== "cerrada" && (
              <button
                onClick={() => handleReject(selected.id)}
                disabled={saving || !adminNotes.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.97] disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                Rechazar
              </button>
            )}
            <button
              onClick={() => setConfirmDelete(selected.id)}
              className="ml-auto rounded-xl border border-red-100 bg-white px-5 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 hover:border-red-200"
            >
              Eliminar
            </button>
          </div>

          {selected.admin_notes && (
            <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-black ${cfg.bg}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
                <span className="text-[10px] font-bold text-slate-400">— Comentario registrado</span>
              </div>
              <p className="text-sm text-cyan-800">{selected.admin_notes}</p>
            </div>
          )}
        </div>

        {/* Modal eliminar */}
        {confirmDelete === selected.id && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <p className="text-center text-lg font-black text-slate-900">¿Eliminar cotización?</p>
              <p className="mt-2 text-center text-sm text-slate-500">Esta acción no se puede deshacer.</p>
              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
    );
  }

  /* ─── LISTADO ─── */
  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cyan-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Seguimiento</p>
            <h2 className="text-xl font-black text-slate-950">Cotizaciones recibidas</h2>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm">
          <span className="font-black text-slate-900">{quotes.length}</span>
          <span className="text-slate-500 ml-1">total</span>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          </div>
          <p className="font-bold text-slate-400">No hay cotizaciones registradas aún.</p>
          <p className="mt-1 text-sm text-slate-300">Cuando un cliente complete el formulario, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Folio", "Empresa", "Fecha", "Total", "Estado", "", "Acción"].map((col) => (
                  <th key={col} className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    {col || <span className="sr-only">Comentario</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map((quote) => {
                const cfg = statusConfig[quote.status] || statusConfig.pendiente;
                const hasNotes = quote.admin_notes?.trim();
                return (
                  <tr key={quote.id} className="group transition-all hover:bg-cyan-50/40 cursor-pointer" onClick={() => openDetail(quote)}>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-950 text-xs tracking-wide">{quote.folio}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700">{quote.client_empresa}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(quote.created_at).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      ${quote.total.toLocaleString("es-CL")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${cfg.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasNotes ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h2" /></svg>
                          Nota
                        </span>
                      ) : (
                        <span className="text-slate-200">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); openDetail(quote); }}
                          className="rounded-lg border border-cyan-200 bg-white p-2 text-cyan-600 transition-all hover:bg-cyan-50 hover:border-cyan-300"
                          title="Ver detalle"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(quote.id); }}
                          className="rounded-lg border border-red-100 bg-white p-2 text-red-400 transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                          title="Eliminar"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal eliminar desde listado */}
      {confirmDelete && !selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <p className="text-center text-lg font-black text-slate-900">¿Eliminar cotización?</p>
            <p className="mt-2 text-center text-sm text-slate-500">Esta acción no se puede deshacer.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-800 truncate">{value || "—"}</p>
    </div>
  );
}
