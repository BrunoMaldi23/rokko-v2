"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  fetchBrandSettings,
  fetchCommercialSettings,
  saveBrandSettings,
  type CommercialSettings,
} from "@/lib/settings";
import { formatPhone } from "@/lib/phone";

const defaultBrand = {
  name: "ROKKO",
  phone: "+56 9 XXXX XXXX",
  email: "contacto@rokko.cl",
  city: "Santiago",
  footer: "Gracias por preferirnos. La imagen de tu empresa comienza aqui.",
  bank_name: "",
  bank_account_type: "",
  bank_account_number: "",
  bank_account_holder: "",
  bank_account_rut: "",
  bank_account_email: "",
  payment_notes: "",
};

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
  const [brand, setBrand] = useState(defaultBrand);
  const [commercial, setCommercial] = useState<CommercialSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([fetchBrandSettings(), fetchCommercialSettings()]).then(
      ([brandData, commercialData]) => {
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
  }, []);

  function updateBrand(field: keyof typeof defaultBrand, value: string) {
    setBrand((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const ok = await saveBrandSettings(brand);
      setSaving(false);
      if (ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Error al guardar. Ejecuta sql/003_tables.sql en Supabase si falta la tabla.");
      }
    } catch {
      setSaving(false);
      alert("Error inesperado. Revisa la consola para mas detalles.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
      </div>
    );
  }

  return (
    <div className="grid animate-fade-in items-start gap-7 xl:grid-cols-[390px_minmax(820px,1fr)]">
      <section className="admin-panel-strong rounded-lg p-6 xl:sticky xl:top-28">
        <div className="border-b border-border pb-5">
          <p className="admin-eyebrow">Identidad</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-text">
            Datos visibles en cotizacion
          </h2>
          <p className="mt-1 text-sm text-muted">
            Estos campos alimentan el encabezado, condiciones y pie del documento real.
          </p>
        </div>

        <div className="mt-6 grid gap-5">
          <Field label="Nombre comercial">
            <input
              type="text"
              value={brand.name}
              onChange={(e) => updateBrand("name", e.target.value)}
              placeholder="Ej. ROKKO"
              className="admin-control"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="Telefono">
              <input
                type="text"
                value={brand.phone}
                onChange={(e) => updateBrand("phone", formatPhone(e.target.value))}
                placeholder="+569 1234 5678"
                maxLength={15}
                className="admin-control"
              />
            </Field>

            <Field label="Ciudad">
              <input
                type="text"
                value={brand.city}
                onChange={(e) => updateBrand("city", e.target.value)}
                placeholder="Ej. Temuco"
                className="admin-control"
              />
            </Field>
          </div>

          <Field label="Correo electronico">
            <input
              type="email"
              value={brand.email}
              onChange={(e) => updateBrand("email", e.target.value)}
              placeholder="correo@empresa.com"
              className="admin-control"
            />
          </Field>

          <Field label="Mensaje pie de cotizacion">
            <textarea
              value={brand.footer}
              onChange={(e) => updateBrand("footer", e.target.value)}
              rows={5}
              placeholder="Mensaje de agradecimiento o condiciones..."
              className="admin-control resize-none"
            />
          </Field>

          <div className="rounded-lg border border-accent/20 bg-accent-soft/35 p-4">
            <p className="admin-eyebrow">Pagos</p>
            <h3 className="mt-1 text-base font-black text-text">
              Datos de transferencia
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              Estos datos se muestran en la cotizacion y correo para que el cliente pueda realizar el pago.
            </p>

            <div className="mt-4 grid gap-4">
              <Field label="Banco">
                <input
                  type="text"
                  value={brand.bank_name}
                  onChange={(e) => updateBrand("bank_name", e.target.value)}
                  placeholder="Ej. Banco Estado"
                  className="admin-control"
                />
              </Field>

              <Field label="Tipo de cuenta">
                <input
                  type="text"
                  value={brand.bank_account_type}
                  onChange={(e) => updateBrand("bank_account_type", e.target.value)}
                  placeholder="Ej. Cuenta corriente"
                  className="admin-control"
                />
              </Field>

              <Field label="Numero de cuenta">
                <input
                  type="text"
                  value={brand.bank_account_number}
                  onChange={(e) => updateBrand("bank_account_number", e.target.value)}
                  placeholder="Ej. 123456789"
                  className="admin-control"
                />
              </Field>

              <Field label="Titular">
                <input
                  type="text"
                  value={brand.bank_account_holder}
                  onChange={(e) => updateBrand("bank_account_holder", e.target.value)}
                  placeholder="Ej. ROKKO SpA"
                  className="admin-control"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Field label="RUT titular">
                  <input
                    type="text"
                    value={brand.bank_account_rut}
                    onChange={(e) => updateBrand("bank_account_rut", e.target.value)}
                    placeholder="Ej. 76.123.456-7"
                    className="admin-control"
                  />
                </Field>

                <Field label="Correo pago">
                  <input
                    type="email"
                    value={brand.bank_account_email}
                    onChange={(e) => updateBrand("bank_account_email", e.target.value)}
                    placeholder="pagos@rokko.cl"
                    className="admin-control"
                  />
                </Field>
              </div>

              <Field label="Detalle adicional">
                <textarea
                  value={brand.payment_notes}
                  onChange={(e) => updateBrand("payment_notes", e.target.value)}
                  rows={3}
                  placeholder="Ej. Enviar comprobante al correo indicado."
                  className="admin-control resize-none"
                />
              </Field>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-button admin-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar datos de marca"}
        </button>
      </section>

      <aside className="admin-panel rounded-lg p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="admin-eyebrow">Preview real</p>
            <h3 className="mt-1 text-xl font-black text-text">Formato del cotizador</h3>
          </div>
          <span className="admin-chip">PDF cliente</span>
        </div>

        <div className="overflow-auto rounded-lg border border-border bg-surface-2/60 p-5">
          <QuoteDocumentPreview brand={brand} commercial={commercial} />
        </div>
      </aside>
    </div>
  );
}

function QuoteDocumentPreview({
  brand,
  commercial,
}: {
  brand: typeof defaultBrand;
  commercial: CommercialSettings | null;
}) {
  const total = sampleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountPercent = Math.max(0, Math.min(100, Number(commercial?.discount || 0)));
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

  const cellBorder = { border: "1px solid #000" } as const;
  const headerCell = {
    border: "1px solid #000",
    backgroundColor: "#f2f2f2",
  } as const;
  const tableHeaderCell = {
    border: "1px solid #000",
    backgroundColor: "#46b9c8",
    color: "#fff",
  } as const;

  return (
    <div className="mx-auto min-h-[1123px] w-[850px] bg-white px-[42px] py-[34px] text-[11px] leading-tight text-black shadow-[0_22px_80px_rgba(45,52,54,0.16)]">
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
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-accent">
            Vestuario corporativo profesional
          </p>
          <h1 className="mt-1 text-[22px] font-black uppercase tracking-[0.02em]">
            Cotizacion comercial
          </h1>
          <p className="mt-1 text-[11px] font-semibold text-muted">
            Nro. {quoteNumber}
          </p>
        </div>

        <div className="grid grid-cols-[66px_1fr] self-start text-[10px]">
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
            {brand.city || "-"}
          </div>
        </div>
      </div>

      <table className="mt-7 w-full table-fixed border-collapse text-[10.5px]">
        <tbody>
          <tr>
            <th className="w-[92px] px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Cotizacion</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{quoteNumber}</td>
            <th className="w-[92px] px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Empresa</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{sampleClient.empresa}</td>
          </tr>
          <tr>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Contacto</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{sampleClient.contacto}</td>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Telefono</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{sampleClient.telefono}</td>
          </tr>
          <tr>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Mail</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{sampleClient.correo}</td>
            <th className="px-2 py-1.5 text-left font-black uppercase" style={headerCell}>Direccion</th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>{sampleClient.observaciones || brand.city || "-"}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 grid w-[380px] grid-cols-2 text-[10.5px]">
        <QuoteField label="Abono 60%" value="SI" />
        <QuoteField label="Tipo Pago" value="CONTADO" />
      </div>

      <table className="mt-6 w-full table-fixed border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-white text-left text-[9.5px] uppercase tracking-[0.08em] text-muted">
            <th className="w-[88px] px-2.5 py-2 font-black" style={tableHeaderCell}>
              Color
            </th>
            <th className="w-[312px] px-2.5 py-2 font-black" style={tableHeaderCell}>
              Descripcion
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
            <tr key={item.id} className="bg-white">
              <td className="break-words px-2.5 py-2 align-top font-black uppercase" style={cellBorder}>
                {item.color}
              </td>
              <td className="break-words px-2.5 py-2 align-top" style={cellBorder}>
                <p className="font-black uppercase leading-4">{item.product}</p>
                <p className="mt-1 text-[10px] leading-3.5">
                  * Incluye logo {item.logoPosition} {item.application}
                </p>
                <p className="text-[10px] leading-3.5">
                  * Producto sujeto a disponibilidad de stock y color.
                </p>
              </td>
              <td className="break-words px-2.5 py-2 align-top text-[10px] leading-4" style={cellBorder}>
                <span className="font-semibold">{item.sizes}</span>
              </td>
              <td className="px-2.5 py-2 text-right align-top font-black" style={cellBorder}>
                {item.totalUnits}
              </td>
              <td className="whitespace-nowrap px-2.5 py-2 text-right align-top" style={cellBorder}>
                ${item.unitPrice.toLocaleString("es-CL")}
              </td>
              <td className="whitespace-nowrap px-2.5 py-2 text-right align-top font-black" style={cellBorder}>
                ${item.subtotal.toLocaleString("es-CL")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 break-inside-avoid" style={cellBorder}>
        <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em]" style={headerCell}>
          Condiciones y resumen financiero
        </div>
        <div className="grid grid-cols-[1fr_292px] items-stretch">
          <div className="min-w-0 px-3.5 py-3 text-[10px] leading-4" style={{ borderRight: "1px solid #000" }}>
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
                <p>{brand.name || "ROKKO-TCO"}</p>
                {brand.phone && <p>{brand.phone}</p>}
              </div>
              <div>
                <p className="font-black uppercase">Inicio de trabajos</p>
                <p>{brand.name || "ROKKO-TCO"}</p>
                {brand.email && <p>{brand.email}</p>}
              </div>
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
                  <TotalCell label="Subtotal" value={total} headerCell={headerCell} cellBorder={cellBorder} />
                  <TotalCell label={`Desc. ${discountPercent}%`} value={-discountAmount} headerCell={headerCell} cellBorder={cellBorder} />
                </>
              )}
              <TotalCell label="Valor neto" value={neto} headerCell={headerCell} cellBorder={cellBorder} />
              <TotalCell label={`${vatRate}%`} value={iva} headerCell={headerCell} cellBorder={cellBorder} />
              <TotalCell label="Total" value={finalTotal} headerCell={headerCell} cellBorder={cellBorder} strong />
            </div>
          </div>
        </div>

        <div className="px-3.5 py-1.5 text-[9.5px] leading-4" style={{ borderTop: "1px solid #000" }}>
          <p className="inline">
            <span className="font-black">
              Presupuesto valido por {validity} dias corridos.
            </span>
          </p>
          <p className="inline">
            {" "}
            <span className="font-black">INCLUYE:</span> montaje de logos imagen
            digital, correccion de logo para tecnica estampado o bordado.
          </p>
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between border-t border-black/8 pt-3 text-[9px] uppercase tracking-[0.14em]">
        <p className="font-bold text-accent">ROKKO Vestuario Corporativo</p>
        <p className="font-bold">Documento generado para cotizacion comercial</p>
      </div>

      <p className="mt-4 text-[10px] italic leading-4 text-muted">
        {brand.footer || "Gracias por preferirnos. La imagen de tu empresa comienza aqui."}
      </p>
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
      <p className="border border-black bg-[#f2f2f2] px-2 py-1.5 font-black uppercase">
        {label}
      </p>
      <p className="border border-black px-2 py-1.5 font-semibold">{value || "-"}</p>
    </div>
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
      <div className={`px-3 py-2 font-black uppercase ${strong ? "text-[13px]" : ""}`} style={headerCell}>
        {label}
      </div>
      <div className={`whitespace-nowrap px-3 py-2 text-right font-black ${strong ? "text-[14px]" : ""}`} style={cellBorder}>
        {value < 0 ? "-" : ""}${Math.abs(value).toLocaleString("es-CL")}
      </div>
    </>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
