"use client";

import { useEffect, useState } from "react";
import { fetchBrandSettings, fetchCommercialSettings, type BrandSettings, type CommercialSettings } from "@/lib/settings";
import type { QuoteRecord } from "@/lib/quotes";

type Props = {
  quote: QuoteRecord;
};

export default function QuoteSummary({ quote }: Props) {
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [commercial, setCommercial] = useState<CommercialSettings | null>(null);

  useEffect(() => {
    fetchBrandSettings().then(setBrand);
    fetchCommercialSettings().then(setCommercial);
  }, []);

  const neto = Math.round(quote.total / (1 + (commercial?.vat || 19) / 100));
  const iva = quote.total - neto;

  return (
    <div className="mx-auto max-w-4xl bg-white print:shadow-none">
      <div id="quote-print" className="p-8 print:p-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b-2 border-cyan-600 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{brand?.name || "ROKKO"}</h1>
            <p className="mt-1 text-sm text-slate-500">Vestuario corporativo</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">Cotización</p>
            <p className="text-lg font-black text-slate-900">{quote.folio}</p>
            <p className="text-xs text-slate-400">
              {new Date(quote.created_at).toLocaleDateString("es-CL")}
            </p>
          </div>
        </div>

        {/* Info empresa + cliente */}
        <div className="mt-6 grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Empresa</p>
            <p className="mt-1 font-bold text-slate-900">{brand?.name || "ROKKO"}</p>
            {brand && (
              <div className="mt-1 space-y-0.5 text-sm text-slate-600">
                <p>{brand.phone}</p>
                <p>{brand.email}</p>
                <p>{brand.city}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cliente</p>
            <p className="mt-1 font-bold text-slate-900">{quote.client_empresa}</p>
            <div className="mt-1 space-y-0.5 text-sm text-slate-600">
              {quote.client_rut && <p>RUT: {quote.client_rut}</p>}
              {quote.client_contacto && <p>Contacto: {quote.client_contacto}</p>}
              {quote.client_correo && <p>{quote.client_correo}</p>}
              {quote.client_telefono && <p>{quote.client_telefono}</p>}
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y-2 border-slate-200 bg-slate-50">
              <th className="py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Producto</th>
              <th className="py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Detalle</th>
              <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Und.</th>
              <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Precio</th>
              <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quote.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4 pr-4">
                  <p className="font-bold text-slate-900">{item.product}</p>
                </td>
                <td className="py-4 pr-4">
                  <p className="text-xs text-slate-500">
                    {item.color} · {item.application} · {item.logoPosition}
                  </p>
                  <p className="text-xs text-slate-400">
                    {Object.entries(item.sizes)
                      .filter(([, q]) => q > 0)
                      .map(([s, q]) => `${s}: ${q}`)
                      .join(" · ")}
                  </p>
                </td>
                <td className="py-4 text-right font-bold text-slate-900">{item.totalUnits}</td>
                <td className="py-4 text-right text-slate-600">${item.unitPrice.toLocaleString("es-CL")}</td>
                <td className="py-4 text-right font-bold text-slate-900">${item.subtotal.toLocaleString("es-CL")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="mt-6 ml-auto w-72 space-y-2 border-t-2 border-slate-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Neto</span>
            <span className="font-bold text-slate-900">${neto.toLocaleString("es-CL")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">IVA ({commercial?.vat || 19}%)</span>
            <span className="font-bold text-slate-900">${iva.toLocaleString("es-CL")}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-lg">
            <span className="font-bold text-slate-900">Total</span>
            <span className="font-black text-cyan-700">${quote.total.toLocaleString("es-CL")}</span>
          </div>
        </div>

        {/* Condiciones */}
        {commercial?.terms && (
          <div className="mt-8 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Condiciones</p>
            <p className="mt-1 text-sm text-slate-600">{commercial.terms}</p>
          </div>
        )}

        {/* Footer */}
        {brand?.footer && (
          <div className="mt-8 border-t border-slate-200 pt-4 text-center">
            <p className="text-xs italic text-slate-400">{brand.footer}</p>
          </div>
        )}

        <p className="mt-4 text-center text-[10px] text-slate-300">
          Documento generado el {new Date().toLocaleString("es-CL")} · Válido por {commercial?.validity || 7} días
        </p>
      </div>
    </div>
  );
}
