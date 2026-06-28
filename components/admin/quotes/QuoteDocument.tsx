"use client";

import Image from "next/image";
import type { QuoteRecord } from "@/lib/quotes";
import type {
  BrandSettings,
  CommercialSettings,
} from "@/lib/settings";
import { formatDate } from "./quotesUtils";

export default function QuoteDocument({
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

  const discountPercent = Math.max(
    0,
    Math.min(100, Number(commercial?.discount || 0)),
  );

  const discountTotal = Math.max(0, grossTotal - total);

  const effectiveDiscountPercent =
    discountTotal > 0 && grossTotal > 0
      ? Math.round((discountTotal / grossTotal) * 100)
      : discountPercent;

  const neto = Math.round(total / (1 + vatRate / 100));
  const iva = total - neto;

  const city = brand?.city || "Temuco";
  const quoteDate = formatDate(quote.created_at);
  const validity = commercial?.validity || 5;

  const paymentTerms =
    commercial?.terms || "60% al confirmar el trabajo, saldo contra entrega.";

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

  const headerCell = {
    border: "1px solid #000",
    backgroundColor: "#f2f2f2",
  } as const;

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
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0b8fa1]">
            Vestuario corporativo profesional
          </p>

          <h1 className="mt-1 text-[21px] font-black uppercase tracking-[0.02em]">
            Cotización comercial
          </h1>

          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Nro. {quote.folio}
          </p>
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
            <th
              className="w-[92px] px-2 py-1.5 text-left font-black uppercase"
              style={headerCell}
            >
              Cotización
            </th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>
              {quote.folio}
            </td>
            <th
              className="w-[92px] px-2 py-1.5 text-left font-black uppercase"
              style={headerCell}
            >
              Empresa
            </th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>
              {quote.client_empresa || "-"}
            </td>
          </tr>

          <tr>
            <th
              className="px-2 py-1.5 text-left font-black uppercase"
              style={headerCell}
            >
              Contacto
            </th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>
              {quote.client_contacto || "-"}
            </td>
            <th
              className="px-2 py-1.5 text-left font-black uppercase"
              style={headerCell}
            >
              Teléfono
            </th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>
              {quote.client_telefono && quote.client_telefono !== "+56 9"
                ? quote.client_telefono
                : "-"}
            </td>
          </tr>

          <tr>
            <th
              className="px-2 py-1.5 text-left font-black uppercase"
              style={headerCell}
            >
              Mail
            </th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>
              {quote.client_correo || "-"}
            </td>
            <th
              className="px-2 py-1.5 text-left font-black uppercase"
              style={headerCell}
            >
              Dirección
            </th>
            <td className="px-2 py-1.5 font-semibold" style={cellBorder}>
              {quote.client_observaciones || city || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 grid w-[360px] grid-cols-2 text-[10.5px]">
        <QuoteField label="Abono 60%" value="SI" />
        <QuoteField label="Tipo Pago" value="CONTADO" />
      </div>

      <table className="mt-6 w-full table-fixed border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-white text-left text-[9.5px] uppercase tracking-[0.08em] text-slate-500">
            <th
              className="w-[82px] px-2 py-1.5 font-black"
              style={tableHeaderCell}
            >
              Color
            </th>

            <th
              className="w-[282px] px-2 py-1.5 font-black"
              style={tableHeaderCell}
            >
              Descripción
            </th>

            <th
              className="w-[122px] px-2 py-1.5 font-black"
              style={tableHeaderCell}
            >
              Talla
            </th>

            <th
              className="w-[58px] px-2 py-1.5 text-right font-black"
              style={tableHeaderCell}
            >
              Cantidad
            </th>

            <th
              className="w-[90px] px-2 py-1.5 text-right font-black"
              style={tableHeaderCell}
            >
              Valor unitario
            </th>

            <th
              className="w-[92px] px-2 py-1.5 text-right font-black"
              style={tableHeaderCell}
            >
              Total neto
            </th>
          </tr>
        </thead>

        <tbody>
          {quote.items.map((item, index) => {
            const sizeEntries = Object.entries(item.sizes || {}).filter(
              ([, quantity]) => quantity > 0,
            );

            return (
              <tr key={`${item.product}-${index}`} className="bg-white">
                <td
                  className="break-words px-2 py-1.5 align-top font-black uppercase"
                  style={cellBorder}
                >
                  {item.color}
                </td>

                <td
                  className="break-words px-2 py-1.5 align-top"
                  style={cellBorder}
                >
                  <p className="font-black uppercase leading-4">
                    {item.product}
                  </p>

                  <p className="mt-0.5 text-[9.5px] leading-3">
                    * Incluye logo {item.logoPosition.toLowerCase()}{" "}
                    {item.application.toLowerCase()}.
                  </p>

                  <p className="text-[9.5px] leading-3">
                    * Producto sujeto a disponibilidad de stock y color.
                  </p>
                </td>

                <td
                  className="break-words px-2 py-1.5 align-top text-[9.5px] leading-4"
                  style={cellBorder}
                >
                  {sizeEntries.map(([size, quantity], sizeIndex) => (
                    <span key={size} className="font-semibold">
                      {sizeIndex > 0 ? " | " : ""}
                      {size}/{quantity}
                    </span>
                  ))}
                </td>

                <td
                  className="px-2 py-1.5 text-right align-top font-black"
                  style={cellBorder}
                >
                  {item.totalUnits}
                </td>

                <td
                  className="whitespace-nowrap px-2 py-1.5 text-right align-top"
                  style={cellBorder}
                >
                  ${item.unitPrice.toLocaleString("es-CL")}
                </td>

                <td
                  className="whitespace-nowrap px-2 py-1.5 text-right align-top font-black"
                  style={cellBorder}
                >
                  ${item.subtotal.toLocaleString("es-CL")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-5 break-inside-avoid" style={cellBorder}>
        <div
          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em]"
          style={headerCell}
        >
          Condiciones y resumen financiero
        </div>

        <div className="grid grid-cols-[1fr_270px] items-stretch">
          <div
            className="min-w-0 px-3 py-3 text-[10px] leading-4"
            style={{ borderRight: "1px solid #000" }}
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              <div>
                <p className="font-black uppercase">Plazo</p>
                <p>2 semanas con diseño aprobado.</p>
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
                <p className="font-black uppercase">
                  Datos de transferencia
                </p>

                <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <PaymentLine label="Banco" value={brand?.bank_name} />
                  <PaymentLine label="Tipo" value={brand?.bank_account_type} />
                  <PaymentLine
                    label="Cuenta"
                    value={brand?.bank_account_number}
                  />
                  <PaymentLine
                    label="Titular"
                    value={brand?.bank_account_holder}
                  />
                  <PaymentLine label="RUT" value={brand?.bank_account_rut} />
                  <PaymentLine
                    label="Correo"
                    value={brand?.bank_account_email}
                  />
                </div>

                {brand?.payment_notes && (
                  <p className="mt-1.5 font-semibold">
                    {brand.payment_notes}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center p-3">
            <div className="grid grid-cols-[1fr_128px] text-[11px]">
              {discountTotal > 0 && (
                <>
                  <div
                    className="px-3 py-2 font-black uppercase"
                    style={headerCell}
                  >
                    Subtotal
                  </div>

                  <div
                    className="whitespace-nowrap px-3 py-2 text-right font-black"
                    style={cellBorder}
                  >
                    ${grossTotal.toLocaleString("es-CL")}
                  </div>

                  <div
                    className="px-3 py-2 font-black uppercase"
                    style={headerCell}
                  >
                    Descuento {effectiveDiscountPercent}%
                  </div>

                  <div
                    className="whitespace-nowrap px-3 py-2 text-right font-black"
                    style={cellBorder}
                  >
                    -${discountTotal.toLocaleString("es-CL")}
                  </div>
                </>
              )}

              <div
                className="px-3 py-2 font-black uppercase"
                style={headerCell}
              >
                Valor neto
              </div>

              <div
                className="whitespace-nowrap px-3 py-2 text-right font-black"
                style={cellBorder}
              >
                ${neto.toLocaleString("es-CL")}
              </div>

              <div
                className="px-3 py-2 font-black uppercase"
                style={headerCell}
              >
                {vatRate}%
              </div>

              <div
                className="whitespace-nowrap px-3 py-2 text-right font-black"
                style={cellBorder}
              >
                ${iva.toLocaleString("es-CL")}
              </div>

              <div
                className="px-3 py-2 text-[13px] font-black uppercase"
                style={headerCell}
              >
                Total
              </div>

              <div
                className="whitespace-nowrap px-3 py-2 text-right text-[14px] font-black"
                style={cellBorder}
              >
                ${total.toLocaleString("es-CL")}
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-3 py-1.5 text-[9.5px] leading-4"
          style={{ borderTop: "1px solid #000" }}
        >
          <p className="inline">
            <span className="font-black">
              Presupuesto válido por {validity} días corridos.
            </span>
          </p>

          <p className="inline">
            {" "}
            <span className="font-black">INCLUYE:</span> montaje de logos imagen
            digital, corrección de logo para técnica estampado o bordado. Foto
            montaje es utilizada como elemento de referencia.
          </p>
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between border-t border-black/8 pt-3 text-[9px] uppercase tracking-[0.14em]">
        <p className="font-bold text-[#0b8fa1]">ROKKO Vestuario Corporativo</p>
        <p className="font-bold">Documento generado para cotización comercial</p>
      </div>
    </div>
  );
}

function QuoteField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr]">
      <p className="border border-black bg-[#f2f2f2] px-2 py-1.5 font-black uppercase">
        {label}
      </p>

      <p className="border border-black px-2 py-1.5 font-semibold">
        {value || "-"}
      </p>
    </div>
  );
}

function PaymentLine({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <p>
      <span className="font-black">{label}: </span>
      {value}
    </p>
  );
}