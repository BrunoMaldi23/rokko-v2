"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  FileText,
  Mail,
  Minus,
  Package2,
  Plus,
  Printer,
  RefreshCcw,
  Save,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import type { QuoteItem, QuoteRecord } from "@/lib/quotes";
import type { BrandSettings, CommercialSettings } from "@/lib/settings";
import { formatMoney } from "./quotesUtils";

type UpdateAdminQuoteFull = (
  id: number,
  payload: Partial<QuoteRecord>,
) => Promise<boolean>;

type QuoteNegotiationModalProps = {
  quote: QuoteRecord;
  brand: BrandSettings | null;
  commercial: CommercialSettings | null;
  saving: boolean;
  setSaving: (value: boolean) => void;
  onClose: () => void;
  onPreview: (quote: QuoteRecord) => void;
  onSaved: (quote: QuoteRecord) => void;
  updateAdminQuoteFull: UpdateAdminQuoteFull;
};

type ReviewStatus =
  | "pendiente"
  | "respondida"
  | "aprobada"
  | "rechazada"
  | "cerrada";

const defaultSizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

function normalizeReviewStatus(status?: string): ReviewStatus {
  if (status === "aceptada") return "aprobada";

  if (
    status === "pendiente" ||
    status === "respondida" ||
    status === "aprobada" ||
    status === "rechazada" ||
    status === "cerrada"
  ) {
    return status;
  }

  return "pendiente";
}

function cloneQuoteItems(items: QuoteItem[]) {
  return items.map((item) => ({
    ...item,
    sizes: { ...(item.sizes || {}) },
  }));
}

function getItemUnits(item: QuoteItem) {
  return Object.values(item.sizes || {}).reduce(
    (sum, qty) => sum + Math.max(0, Number(qty) || 0),
    0,
  );
}

function getEditableSizes(item: QuoteItem) {
  const currentSizes = Object.keys(item.sizes || {}).filter(
    (size) => Number(item.sizes?.[size] || 0) > 0,
  );

  return currentSizes.length > 0 ? currentSizes : defaultSizes;
}

function isItemChanged(current: QuoteItem, original?: QuoteItem) {
  if (!original) return true;

  const priceChanged =
    Number(current.unitPrice || 0) !== Number(original.unitPrice || 0);

  const allSizes = Array.from(
    new Set([
      ...Object.keys(current.sizes || {}),
      ...Object.keys(original.sizes || {}),
    ]),
  );

  const qtyChanged = allSizes.some(
    (size) =>
      Number(current.sizes?.[size] || 0) !==
      Number(original.sizes?.[size] || 0),
  );

  return priceChanged || qtyChanged;
}

export default function QuoteNegotiationModal({
  quote,
  brand,
  commercial,
  saving,
  setSaving,
  onClose,
  onPreview,
  onSaved,
  updateAdminQuoteFull,
}: QuoteNegotiationModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const originalItems = useMemo(
    () => cloneQuoteItems(quote.items),
    [quote.items],
  );

  const originalSubtotal = useMemo(() => {
    return quote.items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [quote.items]);

  const initialDiscount =
    originalSubtotal > 0 && quote.total < originalSubtotal
      ? Math.round(((originalSubtotal - quote.total) / originalSubtotal) * 100)
      : Number(commercial?.discount || 0) || 0;

  const [items, setItems] = useState<QuoteItem[]>(() =>
    cloneQuoteItems(quote.items),
  );

  const [discount, setDiscount] = useState(initialDiscount);

  const [notes, setNotes] = useState(
    () =>
      quote.admin_notes ||
      "Cotización definitiva ajustada según negociación comercial.",
  );

  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(() =>
    normalizeReviewStatus(quote.status),
  );

  const [sending, setSending] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const totalUnits = useMemo(() => {
    return items.reduce((sum, item) => sum + getItemUnits(item), 0);
  }, [items]);

  const safeDiscount = Math.max(0, Math.min(90, Number(discount) || 0));

  const discountAmount = Math.max(
    0,
    Math.round(subtotal * (safeDiscount / 100)),
  );

  const total = Math.max(0, subtotal - discountAmount);

  const hasChanges =
    total !== quote.total ||
    notes !== (quote.admin_notes || "") ||
    reviewStatus !== normalizeReviewStatus(quote.status) ||
    JSON.stringify(items) !== JSON.stringify(quote.items);

  if (typeof document === "undefined") return null;

  function updateItem(index: number, updater: (item: QuoteItem) => QuoteItem) {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? updater(item) : item,
      ),
    );

    setLastSaved(false);
  }

  function recalcItem(item: QuoteItem, sizes: Record<string, number>) {
    const totalUnits = Object.values(sizes).reduce(
      (sum, qty) => sum + Math.max(0, Number(qty) || 0),
      0,
    );

    return {
      ...item,
      sizes,
      totalUnits,
      subtotal: totalUnits * item.unitPrice,
    };
  }

  function updateItemSize(index: number, size: string, value: string | number) {
    const requestedItem = quote.items[index];
    const requestedQuantity = Number(requestedItem?.sizes?.[size] || 0);
    const nextQuantity = Math.max(0, Number(value) || 0);
    const cappedQuantity = Math.min(nextQuantity, requestedQuantity);

    updateItem(index, (item) => {
      const sizes = {
        ...(item.sizes || {}),
        [size]: cappedQuantity,
      };

      return recalcItem(item, sizes);
    });
  }

  function updateItemPrice(index: number, value: string) {
    const unitPrice = Math.max(0, Number(value) || 0);

    updateItem(index, (item) => ({
      ...item,
      unitPrice,
      subtotal: unitPrice * getItemUnits(item),
    }));
  }

  function resetItem(index: number) {
    const original = quote.items[index];
    if (!original) return;

    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...original,
              sizes: { ...(original.sizes || {}) },
            }
          : item,
      ),
    );

    setLastSaved(false);
  }

  function resetAll() {
    setItems(cloneQuoteItems(quote.items));
    setDiscount(initialDiscount);
    setNotes(
      quote.admin_notes ||
        "Cotización definitiva ajustada según negociación comercial.",
    );
    setReviewStatus(normalizeReviewStatus(quote.status));
    setLastSaved(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveNegotiation(nextStatus: ReviewStatus = reviewStatus) {
    const next: QuoteRecord = {
      ...quote,
      items,
      total,
      status: nextStatus as QuoteRecord["status"],
      admin_notes: notes,
    };

    setSaving(true);

    try {
      const ok = await updateAdminQuoteFull(quote.id, {
        items,
        total,
        status: nextStatus as QuoteRecord["status"],
        admin_notes: notes,
      });

      if (!ok) throw new Error("No se pudo guardar la negociación.");

      setReviewStatus(nextStatus);
      onSaved(next);
      setLastSaved(true);
      return next;
    } catch (error) {
      console.error("save quote negotiation error:", error);
      alert("No se pudo guardar la negociación.");
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

      alert("Cotización definitiva enviada al cliente.");
      onSaved(next);
      onClose();
    } catch (error) {
      console.error("send definitive quote error:", error);
      alert("No se pudo enviar la cotización definitiva.");
    } finally {
      setSending(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[135] flex items-center justify-center p-2 sm:p-3">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
        aria-label="Cerrar editor de negociación"
      />

      <section
        className="relative flex h-[95vh] w-full max-w-[1560px] flex-col overflow-hidden rounded-[26px] border border-[#9edfea] bg-white shadow-[0_32px_110px_rgba(15,23,42,0.38)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]"
        role="dialog"
        aria-modal="true"
        aria-label={`Editar negociación ${quote.folio}`}
      >
        <header className="shrink-0 border-b border-[#bde7ef] bg-[linear-gradient(135deg,#f9feff_0%,#f2fcfe_52%,#eefbfd_100%)] px-5 py-3 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[linear-gradient(135deg,#111b22_0%,#11252e_60%,#0e1d24_100%)]">
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700 [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Editor comercial
                </span>

                {lastSaved && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bfe8ee] bg-white px-3 py-1 text-[10px] font-black text-[#087381] [html[data-theme='dark']_&]:border-[#00b8c8]/25 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Cambios guardados
                  </span>
                )}
              </div>

              <h3 className="mt-1.5 text-[23px] font-black leading-none tracking-[-0.045em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                {quote.folio} · {quote.client_empresa || "Sin empresa"}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <HeaderInfoChip
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Contacto"
                  value={quote.client_contacto || "Sin contacto"}
                />

                <HeaderInfoChip
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Correo"
                  value={quote.client_correo || "Sin correo"}
                />

                <HeaderInfoChip
                  icon={<Package2 className="h-3.5 w-3.5" />}
                  label="Solicitado"
                  value={`${quote.items.length} item(s) · ${quote.items.reduce(
                    (sum, item) => sum + item.totalUnits,
                    0,
                  )} unidades`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 2xl:justify-end">
              <TopButton
                onClick={resetAll}
                disabled={saving || sending}
                variant="secondary"
                icon={<RefreshCcw className="h-4 w-4" />}
              >
                Restaurar
              </TopButton>

              <TopButton
                onClick={async () => {
                  const next = await saveNegotiation();
                  if (next) onPreview(next);
                }}
                disabled={saving || sending}
                variant="cyan"
                icon={<Printer className="h-4 w-4" />}
              >
                PDF
              </TopButton>

              <TopButton
                onClick={sendDefinitiveQuote}
                disabled={saving || sending || !quote.client_correo}
                variant="green"
                icon={<Send className="h-4 w-4" />}
              >
                Enviar
              </TopButton>

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
        </header>

        <div
          ref={scrollRef}
          className="grid min-h-0 flex-1 gap-4 overflow-y-auto bg-[#f3fbfd] p-4 xl:grid-cols-[minmax(0,1fr)_350px] 2xl:grid-cols-[minmax(0,1fr)_370px] [html[data-theme='dark']_&]:bg-[#0b1319]"
        >
          <main className="min-w-0 space-y-3">
            <section className="rounded-[20px] border border-[#bfe8ee] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(8,115,129,0.04)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                    Productos solicitados
                  </p>

                  <h4 className="mt-1 text-[19px] font-black tracking-[-0.04em] text-[#071827] [html[data-theme='dark']_&]:text-white">
                    Ajuste de negociación
                  </h4>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <MiniMetric label="Items" value={items.length} />
                  <MiniMetric label="Unid." value={totalUnits} />
                  <MiniMetric label="Subtotal" value={formatMoney(subtotal)} />
                </div>
              </div>
            </section>

            <div className="space-y-3">
              {items.map((item, index) => {
                const original = originalItems[index] || quote.items[index];
                const previousUnitPrice = original?.unitPrice ?? item.unitPrice;
                const editableSizes = getEditableSizes(original || item);
                const changed = isItemChanged(item, original);

                return (
                  <NegotiationItemCard
                    key={`${item.product}-${index}`}
                    index={index}
                    item={item}
                    originalItem={original}
                    changed={changed}
                    previousUnitPrice={previousUnitPrice}
                    editableSizes={editableSizes}
                    onReset={() => resetItem(index)}
                    onPriceChange={(value) => updateItemPrice(index, value)}
                    onSizeChange={(size, value) =>
                      updateItemSize(index, size, value)
                    }
                  />
                );
              })}
            </div>
          </main>

          <aside className="min-w-0 space-y-3 xl:sticky xl:top-0 xl:self-start">
            <section className="overflow-hidden rounded-[22px] border border-cyan-500/20 bg-[#071c20] text-white shadow-[0_22px_58px_rgba(7,28,32,0.28)]">
              <div className="border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Calculator className="h-4 w-4" />

                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                    Resumen final
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <SummaryLine label="Subtotal" value={formatMoney(subtotal)} />

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <label className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-semibold text-white/72">
                        Descuento
                      </span>

                      <span className="mt-0.5 block text-[11px] font-semibold text-white/45">
                        Máx. 90%
                      </span>
                    </span>

                    <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-2 py-1">
                      <input
                        value={discount}
                        onChange={(event) => {
                          setDiscount(Number(event.target.value) || 0);
                          setLastSaved(false);
                        }}
                        className="h-9 w-16 bg-transparent text-right text-lg font-black text-white outline-none"
                        inputMode="numeric"
                      />

                      <span className="font-black text-cyan-200">%</span>
                    </span>
                  </label>
                </div>

                <SummaryLine
                  label="Rebaja"
                  value={`-${formatMoney(discountAmount)}`}
                  accent
                />

                <div className="rounded-[18px] border border-white/10 bg-white/[0.08] px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                    Total definitivo
                  </p>

                  <p className="mt-2 text-[30px] font-black leading-none tracking-[-0.06em] text-white">
                    {formatMoney(total)}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-white/55">
                    {totalUnits} unidades · {items.length} item(s)
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[22px] border border-[#bfe8ee] bg-white p-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0ea5b7]" />

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                  Revisión de cotización
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <ReviewButton
                  active={reviewStatus === "pendiente"}
                  variant="pending"
                  onClick={() => {
                    setReviewStatus("pendiente");
                    setLastSaved(false);
                  }}
                  disabled={saving || sending}
                >
                  Pendiente
                </ReviewButton>

                <ReviewButton
                  active={reviewStatus === "aprobada"}
                  variant="approved"
                  onClick={() => {
                    setReviewStatus("aprobada");
                    setLastSaved(false);
                  }}
                  disabled={saving || sending}
                >
                  Aprobada
                </ReviewButton>

                <ReviewButton
                  active={reviewStatus === "rechazada"}
                  variant="rejected"
                  onClick={() => {
                    setReviewStatus("rechazada");
                    setLastSaved(false);
                  }}
                  disabled={saving || sending}
                >
                  Rechazada
                </ReviewButton>
              </div>

              <p className="mt-3 text-[11px] font-bold leading-4 text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                Selecciona el estado y presiona “Guardar cambios” para
                actualizarlo en el pipeline.
              </p>
            </section>

            <section className="rounded-[22px] border border-[#bfe8ee] bg-white p-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                  Nota comercial
                </span>

                <textarea
                  value={notes}
                  onChange={(event) => {
                    setNotes(event.target.value);
                    setLastSaved(false);
                  }}
                  rows={5}
                  placeholder="Ej: Se aplicó descuento por volumen y se mantiene bordado en pecho."
                  className="mt-3 w-full resize-none rounded-2xl border border-[#bfe8ee] bg-white px-4 py-3 text-[13px] font-bold leading-5 text-[#071827] outline-none transition placeholder:text-[#64748b] focus:border-[#21b7c7] focus:ring-4 focus:ring-[#21b7c7]/10 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-white [html[data-theme='dark']_&]:placeholder:text-[#94a3b8]"
                />
              </label>
            </section>

            <section className="rounded-[22px] border border-[#bfe8ee] bg-white p-4 shadow-[0_8px_22px_rgba(8,115,129,0.04)] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0ea5b7]" />

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                  Acciones
                </p>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => void saveNegotiation()}
                  disabled={saving || sending || !hasChanges}
                  className="h-10 rounded-2xl border border-[#bfe8ee] bg-white px-5 text-[12px] font-black text-[#087381] transition hover:bg-[#f4fbfd] disabled:cursor-not-allowed disabled:opacity-45 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#00b8c8]"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={sendDefinitiveQuote}
                  disabled={saving || sending || !quote.client_correo}
                  className="h-11 rounded-2xl bg-emerald-600 px-5 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(5,150,105,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    {sending ? "Enviando..." : "Guardar y responder"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const next = await saveNegotiation();
                    if (next) onPreview(next);
                  }}
                  disabled={saving || sending}
                  className="h-10 rounded-2xl bg-[#21b7c7] px-5 text-[12px] font-black text-white shadow-[0_12px_24px_rgba(33,183,199,0.18)] transition hover:-translate-y-0.5 hover:bg-[#087381] disabled:cursor-not-allowed disabled:opacity-45 [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827]"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Printer className="h-4 w-4" />
                    Guardar y ver PDF
                  </span>
                </button>
              </div>

              {!quote.client_correo && (
                <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800 [html[data-theme='dark']_&]:border-amber-500/25 [html[data-theme='dark']_&]:bg-amber-500/10 [html[data-theme='dark']_&]:text-amber-200">
                  Esta cotización no tiene correo de cliente. Puedes guardar y
                  generar PDF, pero no enviarla por correo.
                </p>
              )}
            </section>

            <button
              type="button"
              onClick={onClose}
              className="hidden h-10 w-full rounded-2xl border border-[#bfe8ee] bg-white px-5 text-[12px] font-black text-[#475569] transition hover:bg-[#f4fbfd] xl:flex xl:items-center xl:justify-center xl:gap-2 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:text-[#94a3b8]"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al pipeline
            </button>
          </aside>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function NegotiationItemCard({
  index,
  item,
  originalItem,
  changed,
  previousUnitPrice,
  editableSizes,
  onReset,
  onPriceChange,
  onSizeChange,
}: {
  index: number;
  item: QuoteItem;
  originalItem?: QuoteItem;
  changed: boolean;
  previousUnitPrice: number;
  editableSizes: string[];
  onReset: () => void;
  onPriceChange: (value: string) => void;
  onSizeChange: (size: string, value: string | number) => void;
}) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-[#bfe8ee] bg-white shadow-[0_8px_22px_rgba(8,115,129,0.04)] transition hover:border-[#21b7c7]/50 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]">
      <div className="grid gap-3 p-3 xl:grid-cols-[minmax(240px,0.95fr)_minmax(280px,1.35fr)_220px]">
        <section className="min-w-0 rounded-[18px] border border-[#bfe8ee] bg-[#f8feff] p-3 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#21b7c7] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827]">
              Item {index + 1}
            </span>

            {changed && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700 [html[data-theme='dark']_&]:border-amber-500/25 [html[data-theme='dark']_&]:bg-amber-500/10 [html[data-theme='dark']_&]:text-amber-300">
                Modificado
              </span>
            )}
          </div>

          <h4 className="mt-2 line-clamp-2 text-[16px] font-black leading-5 tracking-[-0.03em] text-[#071827] [html[data-theme='dark']_&]:text-white">
            {item.product}
          </h4>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <ProductChip label="Color" value={item.color} />
            <ProductChip label="Logo" value={item.application} />
            <ProductChip label="Ubicación" value={item.logoPosition} />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <ProductMetric label="Ant." value={formatMoney(previousUnitPrice)} />
            <ProductMetric label="Unid." value={item.totalUnits} />
            <ProductMetric label="Subt." value={formatMoney(item.subtotal)} />
          </div>
        </section>

        <section className="rounded-[18px] border border-[#bfe8ee] bg-[#f4fbfd] p-3 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
                Tallas
              </p>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
                No supera lo solicitado.
              </p>
            </div>

            <Package2 className="h-4 w-4 text-[#0ea5b7]" />
          </div>

          <div className="flex flex-wrap gap-2">
            {editableSizes.map((size) => {
              const quantity = Number(item.sizes?.[size] || 0);
              const requestedQuantity = Number(originalItem?.sizes?.[size] || 0);
              const reachedLimit = quantity >= requestedQuantity;

              return (
                <div
                  key={size}
                  className="w-[104px] rounded-xl border border-[#bfe8ee] bg-white p-2 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[12px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
                      {size}
                    </span>

                    <span className="rounded-full bg-[#e6f8fb] px-1.5 py-0.5 text-[9px] font-black text-[#087381] [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]">
                      máx {requestedQuantity}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-[26px_minmax(0,1fr)_26px] items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSizeChange(size, Math.max(0, quantity - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={quantity <= 0}
                      aria-label={`Restar ${size}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <input
                      value={quantity}
                      onChange={(event) => onSizeChange(size, event.target.value)}
                      className="h-7 min-w-0 rounded-lg border border-[#bfe8ee] bg-white text-center text-xs font-black text-[#071827] outline-none focus:border-[#21b7c7] focus:ring-2 focus:ring-[#21b7c7]/10 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-white"
                      inputMode="numeric"
                    />

                    <button
                      type="button"
                      onClick={() => onSizeChange(size, quantity + 1)}
                      disabled={reachedLimit}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-35 [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300"
                      aria-label={`Sumar ${size}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[18px] border border-[#bfe8ee] bg-[#f8feff] p-3 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
            Precio
          </p>

          <label className="mt-2 block">
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
              Unitario
            </span>

            <input
              value={item.unitPrice}
              onChange={(event) => onPriceChange(event.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-[#bfe8ee] bg-white px-3 text-right text-sm font-black text-[#071827] outline-none focus:border-[#21b7c7] focus:ring-2 focus:ring-[#21b7c7]/10 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:text-white"
              inputMode="numeric"
            />
          </label>

          <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-right [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700 [html[data-theme='dark']_&]:text-emerald-300">
              Subtotal
            </p>

            <p className="mt-1 text-[20px] font-black leading-none text-[#071827] [html[data-theme='dark']_&]:text-white">
              {formatMoney(item.subtotal)}
            </p>

            <p className="mt-1 text-[10px] font-bold text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
              {item.totalUnits} unidades
            </p>
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={!changed}
            className="mt-2 h-8 w-full rounded-xl border border-[#bfe8ee] bg-white text-[10px] font-black text-[#475569] transition hover:bg-[#f4fbfd] hover:text-[#087381] disabled:cursor-not-allowed disabled:opacity-40 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#111b22] [html[data-theme='dark']_&]:text-[#94a3b8]"
          >
            Restaurar
          </button>
        </section>
      </div>
    </article>
  );
}

function ReviewButton({
  children,
  active,
  variant,
  disabled,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  variant: "pending" | "approved" | "rejected";
  disabled?: boolean;
  onClick: () => void;
}) {
  const activeStyles = {
    pending:
      "border-amber-300 bg-amber-100 text-amber-800 shadow-[0_8px_18px_rgba(245,158,11,0.12)]",
    approved:
      "border-emerald-300 bg-emerald-100 text-emerald-800 shadow-[0_8px_18px_rgba(16,185,129,0.12)]",
    rejected:
      "border-red-300 bg-red-100 text-red-700 shadow-[0_8px_18px_rgba(239,68,68,0.12)]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-9 rounded-xl border px-2 text-[11px] font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
        active
          ? activeStyles[variant]
          : "border-[#bfe8ee] bg-white text-[#475569] hover:border-[#21b7c7] hover:text-[#087381] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]"
      }`}
    >
      {children}
    </button>
  );
}

function TopButton({
  children,
  icon,
  variant,
  disabled,
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  variant: "secondary" | "cyan" | "green";
  disabled?: boolean;
  onClick: () => void;
}) {
  const styles = {
    secondary:
      "border border-[#bfe8ee] bg-white text-[#475569] hover:bg-[#f4fbfd] hover:text-[#087381] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]",
    cyan: "bg-[#21b7c7] text-white hover:bg-[#087381] [html[data-theme='dark']_&]:bg-[#00b8c8] [html[data-theme='dark']_&]:text-[#071827]",
    green: "bg-emerald-600 text-white hover:bg-emerald-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-10 rounded-2xl px-4 text-[12px] font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]}`}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  );
}

function HeaderInfoChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#bfe8ee] bg-white px-3 py-1.5 text-[11px] font-bold text-[#334155] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#cbd5e1]">
      <span className="text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
        {icon}
      </span>

      <span className="font-black uppercase tracking-[0.1em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
        {label}
      </span>

      <span className="truncate">{value}</span>
    </span>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-[86px] rounded-2xl border border-[#bfe8ee] bg-[#f4fbfd] px-3 py-1.5 text-center [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
      <p className="truncate text-[13px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
        {value}
      </p>

      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
        {label}
      </p>
    </div>
  );
}

function ProductChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#bfe8ee] bg-white px-2.5 py-1 text-[10px] font-bold text-[#334155] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#cbd5e1]">
      <span className="font-black uppercase tracking-[0.12em] text-[#0ea5b7] [html[data-theme='dark']_&]:text-[#00b8c8]">
        {label}
      </span>

      <span className="truncate">{value || "-"}</span>
    </span>
  );
}

function ProductMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-[#bfe8ee] bg-white px-2 py-1.5 text-right [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319]">
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#64748b] [html[data-theme='dark']_&]:text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[12px] font-black text-[#071827] [html[data-theme='dark']_&]:text-white">
        {value}
      </p>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-semibold text-white/72">{label}</span>

      <span
        className={`font-black ${accent ? "text-emerald-200" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}