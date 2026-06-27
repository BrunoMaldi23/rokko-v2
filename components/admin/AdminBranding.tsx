"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  fetchBrandSettings,
  fetchCommercialSettings,
  saveBrandSettings,
  type CommercialSettings,
} from "@/lib/settings";
import { formatPhone } from "@/lib/phone";

type BrandForm = {
  name: string;
  phone: string;
  email: string;
  city: string;
  footer: string;
  bank_name: string;
  bank_account_type: string;
  bank_account_number: string;
  bank_account_holder: string;
  bank_account_rut: string;
  bank_account_email: string;
  payment_notes: string;
};

type BrandTab = "identity" | "payment";

const defaultBrand: BrandForm = {
  name: "ROKKO",
  phone: "+56 9 XXXX XXXX",
  email: "contacto@rokko.cl",
  city: "Santiago",
  footer: "Gracias por preferirnos. La imagen de tu empresa comienza aquí.",
  bank_name: "",
  bank_account_type: "",
  bank_account_number: "",
  bank_account_holder: "",
  bank_account_rut: "",
  bank_account_email: "",
  payment_notes: "",
};

const bankOptions = [
  "Banco Estado",
  "Banco de Chile",
  "Banco Santander",
  "BCI",
  "Banco Itaú",
  "Scotiabank",
  "Banco Security",
  "Banco Falabella",
];

const accountTypes = [
  "Cuenta corriente",
  "Cuenta vista",
  "Cuenta RUT",
  "Cuenta empresa",
  "Cuenta de ahorro",
];

const sampleClient = {
  empresa: "Cliente ejemplo",
  contacto: "Rodrigo Bizama",
  telefono: "+56 9 8765 4321",
  correo: "compras@cliente.cl",
  observaciones: "Temuco",
};

const sampleItems = [
  {
    id: 1,
    color: "NEGRO",
    product: "CHAQUETA SOFTSHELL",
    logoPosition: "pecho izquierdo",
    application: "bordado",
    sizes: "S/4 | M/8 | L/10",
    totalUnits: 22,
    unitPrice: 22900,
    subtotal: 503800,
  },
  {
    id: 2,
    color: "AZUL",
    product: "POLERA PIQUE CORPORATIVA",
    logoPosition: "pecho centro",
    application: "estampado",
    sizes: "M/12 | L/12",
    totalUnits: 24,
    unitPrice: 11900,
    subtotal: 285600,
  },
];

export default function AdminBranding() {
  const [brand, setBrand] = useState<BrandForm>(defaultBrand);
  const [commercial, setCommercial] = useState<CommercialSettings | null>(null);
  const [activeTab, setActiveTab] = useState<BrandTab>("identity");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchBrandSettings(), fetchCommercialSettings()]).then(
      ([brandData, commercialData]) => {
        if (!mounted) return;

        if (brandData) {
          setBrand({
            name: brandData.name,
            phone: brandData.phone,
            email: brandData.email,
            city: brandData.city,
            footer: brandData.footer,
            bank_name: brandData.bank_name || "",
            bank_account_type: brandData.bank_account_type || "",
            bank_account_number: brandData.bank_account_number || "",
            bank_account_holder: brandData.bank_account_holder || "",
            bank_account_rut: brandData.bank_account_rut || "",
            bank_account_email: brandData.bank_account_email || "",
            payment_notes: brandData.payment_notes || "",
          });
        }

        setCommercial(commercialData);
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
    };
  }, []);

  const completedPaymentFields = useMemo(() => {
    const values = [
      brand.bank_name,
      brand.bank_account_type,
      brand.bank_account_number,
      brand.bank_account_holder,
      brand.bank_account_rut,
      brand.bank_account_email,
    ];

    return values.filter((value) => value.trim()).length;
  }, [brand]);

  function updateBrand(field: keyof BrandForm, value: string) {
    setBrand((prev) => ({ ...prev, [field]: value }));
  }

  function applyBankPreset(bankName: string) {
    setBrand((prev) => ({
      ...prev,
      bank_name: bankName,
    }));
  }

  async function handleSave() {
    setSaving(true);

    try {
      const ok = await saveBrandSettings(brand);

      if (ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(
          "Error al guardar. Ejecuta sql/003_tables.sql en Supabase si falta la tabla.",
        );
      }
    } catch {
      alert("Error inesperado. Revisa la consola para más detalles.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--adm-bg-badge-visible)] border-t-[var(--adm-teal-500)]" />
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-150px)] min-h-[640px] animate-fade-in gap-5 overflow-hidden xl:grid-cols-[380px_minmax(0,1fr)]">
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] shadow-[var(--adm-shadow-panel)]">
        <div className="shrink-0 border-b border-[var(--adm-border-default)] bg-[linear-gradient(135deg,var(--adm-bg-surface)_0%,var(--adm-bg-surface-hover)_100%)] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--adm-teal-500)] text-white shadow-[0_14px_28px_rgba(32,184,199,0.22)]">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3 4 7l8 4 8-4-8-4Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4 12 8 4 8-4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4 17 8 4 8-4"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.18em]">
                Identidad
              </p>

              <h2 className="mt-1 text-[24px] font-black leading-none tracking-[-0.04em] text-[var(--adm-text-heading)]">
                Datos de marca
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--adm-text-secondary)]">
                Configura la información visible en cotizaciones.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] p-1">
            <TabButton
              active={activeTab === "identity"}
              label="Identidad"
              onClick={() => setActiveTab("identity")}
            />

            <TabButton
              active={activeTab === "payment"}
              label="Transferencia"
              badge={`${completedPaymentFields}/6`}
              onClick={() => setActiveTab("payment")}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {activeTab === "identity" && (
            <div className="grid gap-4">
              <Field label="Nombre comercial">
                <input
                  type="text"
                  value={brand.name}
                  onChange={(e) => updateBrand("name", e.target.value)}
                  placeholder="Ej. ROKKO"
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                />
              </Field>

              <Field label="Teléfono">
                <input
                  type="text"
                  value={brand.phone}
                  onChange={(e) =>
                    updateBrand("phone", formatPhone(e.target.value))
                  }
                  placeholder="+569 1234 5678"
                  maxLength={15}
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                />
              </Field>

              <Field label="Ciudad">
                <input
                  type="text"
                  value={brand.city}
                  onChange={(e) => updateBrand("city", e.target.value)}
                  placeholder="Ej. Temuco"
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                />
              </Field>

              <Field label="Correo electrónico">
                <input
                  type="email"
                  value={brand.email}
                  onChange={(e) => updateBrand("email", e.target.value)}
                  placeholder="correo@empresa.com"
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                />
              </Field>

              <Field label="Mensaje pie de cotización">
                <textarea
                  value={brand.footer}
                  onChange={(e) => updateBrand("footer", e.target.value)}
                  rows={5}
                  placeholder="Mensaje de agradecimiento o condiciones..."
                  className="admin-control w-full resize-none rounded-2xl px-4 py-3 text-sm font-semibold outline-none"
                />
              </Field>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="grid gap-4">
              <div className="rounded-[24px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] p-4">
                <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.18em]">
                  Banco rápido
                </p>

                <p className="mt-1 text-sm font-semibold text-[var(--adm-text-secondary)]">
                  Selecciona un banco frecuente.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {bankOptions.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => applyBankPreset(bank)}
                      className={`rounded-2xl border px-3 py-2 text-left text-xs font-black transition ${
                        brand.bank_name === bank
                          ? "border-[var(--adm-teal-500)] bg-[var(--adm-bg-badge-visible)] text-[var(--adm-text-badge-visible)]"
                          : "border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] text-[var(--adm-text-secondary)] hover:border-[var(--adm-teal-300)] hover:text-[var(--adm-teal-500)]"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Banco">
                <input
                  type="text"
                  value={brand.bank_name}
                  onChange={(e) => updateBrand("bank_name", e.target.value)}
                  placeholder="Ej. Banco Estado"
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                />
              </Field>

              <Field label="Tipo de cuenta">
                <select
                  value={brand.bank_account_type}
                  onChange={(e) =>
                    updateBrand("bank_account_type", e.target.value)
                  }
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                >
                  <option value="">Seleccionar tipo de cuenta</option>
                  {accountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Número de cuenta">
                <input
                  type="text"
                  value={brand.bank_account_number}
                  onChange={(e) =>
                    updateBrand("bank_account_number", e.target.value)
                  }
                  placeholder="Ej. 123456789"
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                />
              </Field>

              <Field label="Titular">
                <input
                  type="text"
                  value={brand.bank_account_holder}
                  onChange={(e) =>
                    updateBrand("bank_account_holder", e.target.value)
                  }
                  placeholder="Ej. ROKKO SpA"
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                />
              </Field>

              <Field label="RUT titular">
                <input
                  type="text"
                  value={brand.bank_account_rut}
                  onChange={(e) =>
                    updateBrand("bank_account_rut", e.target.value)
                  }
                  placeholder="Ej. 76.123.456-7"
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                />
              </Field>

              <Field label="Correo pago">
                <input
                  type="email"
                  value={brand.bank_account_email}
                  onChange={(e) =>
                    updateBrand("bank_account_email", e.target.value)
                  }
                  placeholder="pagos@rokko.cl"
                  className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                />
              </Field>

              <Field label="Detalle adicional">
                <textarea
                  value={brand.payment_notes}
                  onChange={(e) => updateBrand("payment_notes", e.target.value)}
                  rows={4}
                  placeholder="Ej. Enviar comprobante al correo indicado."
                  className="admin-control w-full resize-none rounded-2xl px-4 py-3 text-sm font-semibold outline-none"
                />
              </Field>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] p-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-11 w-full rounded-2xl bg-[var(--adm-teal-500)] text-sm font-black text-white shadow-[0_14px_28px_rgba(32,184,199,0.2)] transition hover:bg-[var(--adm-teal-700)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : saved
                ? "Datos guardados"
                : "Guardar datos de marca"}
          </button>
        </div>
      </section>

      <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] shadow-[var(--adm-shadow-panel)]">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--adm-border-default)] bg-[linear-gradient(135deg,var(--adm-bg-surface)_0%,var(--adm-bg-surface-hover)_100%)] p-5">
          <div>
            <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.18em]">
              Preview real
            </p>

            <h3 className="mt-1 text-[24px] font-black leading-none tracking-[-0.04em] text-[var(--adm-text-heading)]">
              Formato del cotizador
            </h3>

            <p className="mt-2 text-sm font-semibold text-[var(--adm-text-secondary)]">
              Vista previa con scroll interno independiente.
            </p>
          </div>

          <span className="rounded-full border border-[var(--adm-teal-500)]/25 bg-[var(--adm-bg-badge-visible)] px-4 py-2 text-xs font-black text-[var(--adm-text-badge-visible)]">
            PDF cliente
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[var(--adm-bg-surface-hover)] p-5">
          <div className="mx-auto w-fit min-w-max">
            <QuoteDocumentPreview brand={brand} commercial={commercial} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function QuoteDocumentPreview({
  brand,
  commercial,
}: {
  brand: BrandForm;
  commercial: CommercialSettings | null;
}) {
  const total = sampleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountPercent = Math.max(
    0,
    Math.min(100, Number(commercial?.discount || 0)),
  );
  const discountAmount = Math.round(total * (discountPercent / 100));
  const finalTotal = Math.max(0, total - discountAmount);
  const vatRate = commercial?.vat ?? 19;
  const neto = Math.round(finalTotal / (1 + vatRate / 100));
  const iva = finalTotal - neto;
  const quoteDate = new Date().toLocaleDateString("es-CL");
  const quoteNumber = "COT-202606-1048";
  const validity = commercial?.validity || 5;
  const paymentTerms =
    commercial?.terms || "60% al confirmar el trabajo, saldo contra entrega.";

  const hasPaymentData = [
    brand.bank_name,
    brand.bank_account_type,
    brand.bank_account_number,
    brand.bank_account_holder,
    brand.bank_account_rut,
    brand.bank_account_email,
    brand.payment_notes,
  ].some((value) => value.trim());

  const blackBorder = { border: "1px solid #111827" } as const;
  const headerCell = {
    border: "1px solid #111827",
    backgroundColor: "#f3f4f6",
    color: "#111827",
  } as const;
  const tableHeaderCell = {
    border: "1px solid #111827",
    backgroundColor: "#20b8c7",
    color: "#ffffff",
  } as const;

  return (
    <div
      style={{
        width: 850,
        minHeight: 1123,
        backgroundColor: "#ffffff",
        color: "#111827",
        boxShadow: "0 22px 80px rgba(17,27,40,0.22)",
      }}
      className="px-[42px] py-[34px] text-[11px] leading-tight"
    >
      <div className="grid grid-cols-[225px_1fr_165px] items-start gap-7">
        <div className="pt-1">
          <Image
            src="/brand/rokko-navbar.png"
            alt="ROKKO"
            width={220}
            height={70}
            className="object-contain object-left"
            priority
          />
        </div>

        <div className="pt-2 text-center">
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#20b8c7" }}
          >
            Vestuario corporativo profesional
          </p>
          <h1 className="mt-1 text-[22px] font-black uppercase tracking-[0.02em]">
            Cotización comercial
          </h1>
          <p className="mt-1 text-[11px] font-semibold text-[#64748b]">
            Nro. {quoteNumber}
          </p>
        </div>

        <div className="grid grid-cols-[66px_1fr] self-start text-[10px]">
          <div className="px-2 py-1 font-black uppercase" style={headerCell}>
            Fecha
          </div>
          <div className="px-2 py-1 font-semibold" style={blackBorder}>
            {quoteDate}
          </div>
          <div className="px-2 py-1 font-black uppercase" style={headerCell}>
            Ciudad
          </div>
          <div className="px-2 py-1 font-semibold" style={blackBorder}>
            {brand.city || "-"}
          </div>
        </div>
      </div>

      <table className="mt-7 w-full table-fixed border-collapse text-[10.5px]">
        <tbody>
          <tr>
            <QuoteTh>Cotización</QuoteTh>
            <QuoteTd>{quoteNumber}</QuoteTd>
            <QuoteTh>Empresa</QuoteTh>
            <QuoteTd>{sampleClient.empresa}</QuoteTd>
          </tr>
          <tr>
            <QuoteTh>Contacto</QuoteTh>
            <QuoteTd>{sampleClient.contacto}</QuoteTd>
            <QuoteTh>Teléfono</QuoteTh>
            <QuoteTd>{sampleClient.telefono}</QuoteTd>
          </tr>
          <tr>
            <QuoteTh>Mail</QuoteTh>
            <QuoteTd>{sampleClient.correo}</QuoteTd>
            <QuoteTh>Dirección</QuoteTh>
            <QuoteTd>{sampleClient.observaciones || brand.city || "-"}</QuoteTd>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 grid w-[380px] grid-cols-2 text-[10.5px]">
        <QuoteField label="Abono 60%" value="SI" />
        <QuoteField label="Tipo Pago" value="CONTADO" />
      </div>

      <table className="mt-6 w-full table-fixed border-collapse text-[10.5px]">
        <thead>
          <tr className="text-left text-[9.5px] uppercase tracking-[0.08em]">
            <th className="w-[88px] px-2.5 py-2 font-black" style={tableHeaderCell}>
              Color
            </th>
            <th className="w-[312px] px-2.5 py-2 font-black" style={tableHeaderCell}>
              Descripción
            </th>
            <th className="w-[132px] px-2.5 py-2 font-black" style={tableHeaderCell}>
              Talla
            </th>
            <th className="w-[64px] px-2.5 py-2 text-right font-black" style={tableHeaderCell}>
              Cantidad
            </th>
            <th className="w-[102px] px-2.5 py-2 text-right font-black" style={tableHeaderCell}>
              Valor unitario
            </th>
            <th className="w-[104px] px-2.5 py-2 text-right font-black" style={tableHeaderCell}>
              Total neto
            </th>
          </tr>
        </thead>

        <tbody>
          {sampleItems.map((item) => (
            <tr key={item.id}>
              <td className="break-words px-2.5 py-2 align-top font-black uppercase" style={blackBorder}>
                {item.color}
              </td>
              <td className="break-words px-2.5 py-2 align-top" style={blackBorder}>
                <p className="font-black uppercase leading-4">{item.product}</p>
                <p className="mt-1 text-[10px] leading-3.5">
                  * Incluye logo {item.logoPosition} {item.application}
                </p>
                <p className="text-[10px] leading-3.5">
                  * Producto sujeto a disponibilidad de stock y color.
                </p>
              </td>
              <td className="break-words px-2.5 py-2 align-top text-[10px] leading-4" style={blackBorder}>
                <span className="font-semibold">{item.sizes}</span>
              </td>
              <td className="px-2.5 py-2 text-right align-top font-black" style={blackBorder}>
                {item.totalUnits}
              </td>
              <td className="whitespace-nowrap px-2.5 py-2 text-right align-top" style={blackBorder}>
                ${item.unitPrice.toLocaleString("es-CL")}
              </td>
              <td className="whitespace-nowrap px-2.5 py-2 text-right align-top font-black" style={blackBorder}>
                ${item.subtotal.toLocaleString("es-CL")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 break-inside-avoid" style={blackBorder}>
        <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em]" style={headerCell}>
          Condiciones y resumen financiero
        </div>

        <div className="grid grid-cols-[1fr_292px] items-stretch">
          <div className="min-w-0 px-3.5 py-3 text-[10px] leading-4" style={{ borderRight: "1px solid #111827" }}>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              <QuoteInfo label="Plazo" value="2 semanas con diseño aprobado." />
              <QuoteInfo label="Pago" value={paymentTerms} />
              <QuoteInfo
                label="Contacto"
                value={`${brand.name || "ROKKO-TCO"} ${brand.phone ? `· ${brand.phone}` : ""}`}
              />
              <QuoteInfo
                label="Inicio de trabajos"
                value={brand.email || "contacto@rokko.cl"}
              />
            </div>

            {hasPaymentData && (
              <div className="mt-3 border-t border-black/15 pt-2">
                <p className="font-black uppercase">Datos de transferencia</p>
                <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <PaymentLine label="Banco" value={brand.bank_name} />
                  <PaymentLine label="Tipo" value={brand.bank_account_type} />
                  <PaymentLine label="Cuenta" value={brand.bank_account_number} />
                  <PaymentLine label="Titular" value={brand.bank_account_holder} />
                  <PaymentLine label="RUT" value={brand.bank_account_rut} />
                  <PaymentLine label="Correo" value={brand.bank_account_email} />
                </div>

                {brand.payment_notes && (
                  <p className="mt-1.5 font-semibold">{brand.payment_notes}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center p-3">
            <div className="grid grid-cols-[1fr_138px] text-[11px]">
              {discountPercent > 0 && discountAmount > 0 && (
                <>
                  <TotalCell
                    label="Subtotal"
                    value={total}
                    headerCell={headerCell}
                    cellBorder={blackBorder}
                  />
                  <TotalCell
                    label={`Desc. ${discountPercent}%`}
                    value={-discountAmount}
                    headerCell={headerCell}
                    cellBorder={blackBorder}
                  />
                </>
              )}

              <TotalCell
                label="Valor neto"
                value={neto}
                headerCell={headerCell}
                cellBorder={blackBorder}
              />
              <TotalCell
                label={`${vatRate}% IVA`}
                value={iva}
                headerCell={headerCell}
                cellBorder={blackBorder}
              />
              <TotalCell
                label="Total"
                value={finalTotal}
                headerCell={headerCell}
                cellBorder={blackBorder}
                strong
              />
            </div>
          </div>
        </div>

        <div className="px-3.5 py-1.5 text-[9.5px] leading-4" style={{ borderTop: "1px solid #111827" }}>
          <span className="font-black">
            Presupuesto válido por {validity} días corridos.
          </span>{" "}
          <span className="font-black">INCLUYE:</span> montaje de logos imagen
          digital, corrección de logo para técnica estampado o bordado.
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between border-t border-black/8 pt-3 text-[9px] uppercase tracking-[0.14em]">
        <p className="font-bold text-[#20b8c7]">ROKKO Vestuario Corporativo</p>
        <p className="font-bold text-[#334155]">
          Documento generado para cotización comercial
        </p>
      </div>

      <p className="mt-4 text-[10px] italic leading-4 text-[#64748b]">
        {brand.footer ||
          "Gracias por preferirnos. La imagen de tu empresa comienza aquí."}
      </p>
    </div>
  );
}

function TabButton({
  active,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-black transition ${
        active
          ? "bg-[var(--adm-teal-500)] text-white shadow-[0_10px_22px_rgba(32,184,199,0.18)]"
          : "text-[var(--adm-text-secondary)] hover:bg-[var(--adm-bg-surface-hover)] hover:text-[var(--adm-text-primary)]"
      }`}
    >
      <span>{label}</span>
      {badge && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] ${
            active
              ? "bg-white/20 text-white"
              : "bg-[var(--adm-bg-badge-visible)] text-[var(--adm-text-badge-visible)]"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function QuoteInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-black uppercase">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function PaymentLine({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <p>
      <span className="font-black">{label}: </span>
      {value}
    </p>
  );
}

function QuoteField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr]">
      <p className="border border-[#111827] bg-[#f3f4f6] px-2 py-1.5 font-black uppercase text-[#111827]">
        {label}
      </p>
      <p className="border border-[#111827] px-2 py-1.5 font-semibold text-[#111827]">
        {value || "-"}
      </p>
    </div>
  );
}

function QuoteTh({ children }: { children: ReactNode }) {
  return (
    <th
      className="w-[92px] px-2 py-1.5 text-left font-black uppercase"
      style={{
        border: "1px solid #111827",
        backgroundColor: "#f3f4f6",
        color: "#111827",
      }}
    >
      {children}
    </th>
  );
}

function QuoteTd({ children }: { children: ReactNode }) {
  return (
    <td
      className="px-2 py-1.5 font-semibold"
      style={{
        border: "1px solid #111827",
        color: "#111827",
        backgroundColor: "#ffffff",
      }}
    >
      {children}
    </td>
  );
}

function TotalCell({
  label,
  value,
  headerCell,
  cellBorder,
  strong = false,
}: {
  label: string;
  value: number;
  headerCell: React.CSSProperties;
  cellBorder: React.CSSProperties;
  strong?: boolean;
}) {
  return (
    <>
      <div
        className={`px-3 py-2 font-black uppercase ${
          strong ? "text-[13px]" : ""
        }`}
        style={headerCell}
      >
        {label}
      </div>

      <div
        className={`whitespace-nowrap px-3 py-2 text-right font-black ${
          strong ? "text-[14px]" : ""
        }`}
        style={{
          ...cellBorder,
          backgroundColor: "#ffffff",
          color: "#111827",
        }}
      >
        {value < 0 ? "-" : ""}${Math.abs(value).toLocaleString("es-CL")}
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-[var(--adm-text-secondary)]">
        {label}
      </span>

      {children}
    </label>
  );
}