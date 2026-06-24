const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = "brunopsg061@gmail.com";

type QuoteItem = {
  product: string;
  color: string;
  application: string;
  logoPosition: string;
  sizes: Record<string, number>;
  totalUnits: number;
  unitPrice: number;
  subtotal: number;
};

type BrandEmailSettings = {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  footer?: string;
  bank_name?: string;
  bank_account_type?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  bank_account_rut?: string;
  bank_account_email?: string;
  payment_notes?: string;
};

type CommercialEmailSettings = {
  discount?: number;
  terms?: string;
  vat?: number;
  validity?: number;
};

function buildQuoteEmail(
  folio: string,
  client_empresa: string,
  client_rut: string,
  client_contacto: string,
  client_correo: string,
  client_telefono: string,
  client_observaciones: string,
  items: QuoteItem[],
  total: number,
  brand: BrandEmailSettings,
  commercial: CommercialEmailSettings
) {
  const vatRate = commercial?.vat ?? 19;
  const grossTotal = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const discountPercent = Math.max(0, Math.min(100, Number(commercial?.discount || 0)));
  const discountTotal = Math.max(0, grossTotal - total);
  const neto = Math.round(total / (1 + vatRate / 100));
  const iva = total - neto;
  const dateStr = new Date().toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" });
  const validity = commercial?.validity ?? 7;
  const paymentRows = [
    ["Banco", brand?.bank_name],
    ["Tipo de cuenta", brand?.bank_account_type],
    ["Numero de cuenta", brand?.bank_account_number],
    ["Titular", brand?.bank_account_holder],
    ["RUT", brand?.bank_account_rut],
    ["Correo", brand?.bank_account_email],
  ].filter(([, value]) => String(value || "").trim());
  const hasPaymentData = paymentRows.length > 0 || String(brand?.payment_notes || "").trim();

  const itemRows = items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-weight:700;text-align:center">${idx + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0f172a">${item.product}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px">${item.color} · ${item.application} · ${item.logoPosition}<br><span style="font-size:11px;color:#94a3b8">${Object.entries(item.sizes as Record<string, number>).filter(([, q]) => q > 0).map(([s, q]) => `${s}: ${q}`).join(" · ")}</span></td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;text-align:center">${item.totalUnits}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;text-align:right">$${item.unitPrice.toLocaleString("es-CL")}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;text-align:right">$${item.subtotal.toLocaleString("es-CL")}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table style="width:100%;max-width:680px;margin:0 auto;padding:24px">
    <tr>
      <td style="background:#fff;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,.06);padding:40px">

        <!-- HEADER -->
        <table style="width:100%">
          <tr>
            <td style="text-align:left;vertical-align:top">
              <h1 style="color:#0891b2;font-size:32px;font-weight:900;margin:0;letter-spacing:-0.02em">ROKKO</h1>
            </td>
            <td style="text-align:right;vertical-align:top">
              <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.3em;color:#94a3b8;margin:0">Cotización</p>
              <p style="font-size:22px;font-weight:900;color:#0f172a;margin:4px 0 0">${folio}</p>
              <p style="font-size:14px;color:#94a3b8;margin:2px 0 0">${dateStr}</p>
            </td>
          </tr>
        </table>

        <hr style="border:none;border-top:2px solid #0891b2;margin:24px 0">

        <!-- PARTIES -->
        <table style="width:100%">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:24px">
              <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#94a3b8;margin:0 0 8px">De</p>
              <p style="font-size:16px;font-weight:700;color:#0f172a;margin:0">${brand?.name || "ROKKO"}</p>
              <p style="font-size:14px;color:#64748b;margin:4px 0 0;line-height:1.5">
                ${brand?.email ? `<br>${brand.email}` : ""}
                ${brand?.phone ? `<br>${brand.phone}` : ""}
                ${brand?.city ? `<br>${brand.city}` : ""}
              </p>
            </td>
            <td style="width:50%;vertical-align:top;text-align:right;padding-left:24px">
              <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#94a3b8;margin:0 0 8px">Cobrar a</p>
              <p style="font-size:16px;font-weight:700;color:#0f172a;margin:0">${client_empresa}</p>
              <p style="font-size:14px;color:#64748b;margin:4px 0 0;line-height:1.5">
                ${client_rut ? `<br>RUT: ${client_rut}` : ""}
                ${client_contacto ? `<br>Att.: ${client_contacto}` : ""}
                ${client_correo ? `<br>${client_correo}` : ""}
                ${client_telefono && client_telefono !== "+56 9" ? `<br>${client_telefono}` : ""}
              </p>
            </td>
          </tr>
        </table>

        <!-- TABLE -->
        <table style="width:100%;border-collapse:collapse;margin-top:28px;font-size:14px">
          <thead>
            <tr style="background:#0891b2">
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">#</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">Producto</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">Detalle</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">Cant.</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">P. Unitario</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <!-- CONDITIONS -->
        ${commercial?.terms ? `
        <table style="width:100%;margin-top:20px">
          <tr><td style="padding:12px;background:#f8fafc;border-radius:8px">
            <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin:0 0 4px">Condiciones Comerciales</p>
            <p style="font-size:14px;color:#475569;margin:0">${commercial.terms}</p>
          </td></tr>
        </table>
        ` : ""}

        <!-- OBSERVACIONES -->
        ${client_observaciones ? `
        <table style="width:100%;margin-top:12px">
          <tr><td style="padding:12px;background:#f8fafc;border-radius:8px">
            <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin:0 0 4px">Observaciones</p>
            <p style="font-size:14px;color:#475569;margin:0">${client_observaciones}</p>
          </td></tr>
        </table>
        ` : ""}

        ${hasPaymentData ? `
        <table style="width:100%;margin-top:12px;border-collapse:collapse">
          <tr>
            <td style="padding:14px;background:#ecfeff;border:1px solid #bae6fd;border-radius:8px">
              <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#0891b2;margin:0 0 8px">Datos de transferencia</p>
              <table style="width:100%;border-collapse:collapse;font-size:13px;color:#475569">
                ${paymentRows.map(([label, value]) => `
                  <tr>
                    <td style="padding:3px 12px 3px 0;font-weight:800;color:#0f172a;width:130px">${label}</td>
                    <td style="padding:3px 0">${value}</td>
                  </tr>
                `).join("")}
              </table>
              ${brand?.payment_notes ? `<p style="font-size:13px;color:#475569;margin:8px 0 0">${brand.payment_notes}</p>` : ""}
            </td>
          </tr>
        </table>
        ` : ""}

        <!-- TOTALS -->
        <table style="width:100%;margin-top:20px">
          <tr>
            <td style="text-align:right">
              <table style="margin-left:auto;width:260px">
                ${discountPercent > 0 && discountTotal > 0 ? `
                <tr><td style="padding:4px 0;color:#64748b;font-size:14px">Subtotal</td><td style="padding:4px 0;font-weight:600;color:#1e293b;text-align:right">$${grossTotal.toLocaleString("es-CL")}</td></tr>
                <tr><td style="padding:4px 0;color:#0891b2;font-size:14px">Descuento (${discountPercent}%)</td><td style="padding:4px 0;font-weight:700;color:#0891b2;text-align:right">-$${discountTotal.toLocaleString("es-CL")}</td></tr>
                ` : ""}
                <tr><td style="padding:4px 0;color:#64748b;font-size:14px">Neto</td><td style="padding:4px 0;font-weight:600;color:#1e293b;text-align:right">$${neto.toLocaleString("es-CL")}</td></tr>
                <tr><td style="padding:4px 0;color:#64748b;font-size:14px">IVA (${vatRate}%)</td><td style="padding:4px 0;font-weight:600;color:#1e293b;text-align:right">$${iva.toLocaleString("es-CL")}</td></tr>
                <tr><td colspan="2" style="padding:0"><hr style="border:none;border-top:1px solid #e2e8f0"></td></tr>
                <tr>
                  <td style="padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em">Saldo adeudado</td>
                  <td style="padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:20px;font-weight:900;color:#0891b2;text-align:right">$${total.toLocaleString("es-CL")}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- FOOTER -->
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 20px">
        <table style="width:100%">
          <tr>
            <td style="vertical-align:bottom">
              <p style="font-size:14px;font-style:italic;color:#94a3b8;margin:0">${brand?.footer || "Gracias por preferirnos. La imagen de tu empresa comienza aquí."}</p>
              <p style="font-size:12px;color:#cbd5e1;margin:4px 0 0">Cotización válida por ${validity} días · Generada el ${new Date().toLocaleString("es-CL")}</p>
            </td>
            <td style="text-align:right;vertical-align:bottom">
              <svg width="120" height="30" viewBox="0 0 120 30" fill="none" style="color:#0891b2;display:block;margin-left:auto">
                <path d="M8 22 Q25 4 42 20 T78 12 T112 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              </svg>
              <p style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.3em;color:#94a3b8;margin:2px 0 0">Firma Autorizada</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(value: number) {
  return `$${Math.round(Number(value || 0)).toLocaleString("es-CL")}`;
}

function buildPrintableQuoteEmail(
  folio: string,
  client_empresa: string,
  client_rut: string,
  client_contacto: string,
  client_correo: string,
  client_telefono: string,
  client_observaciones: string,
  items: QuoteItem[],
  total: number,
  brand: BrandEmailSettings,
  commercial: CommercialEmailSettings,
  appOrigin: string
) {
  const vatRate = commercial?.vat ?? 19;
  const grossTotal = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const discountPercent = Math.max(0, Math.min(100, Number(commercial?.discount || 0)));
  const discountTotal = Math.max(0, grossTotal - total);
  const neto = Math.round(total / (1 + vatRate / 100));
  const iva = total - neto;
  const quoteDate = new Date().toLocaleDateString("es-CL");
  const city = brand?.city || "Temuco";
  const validity = commercial?.validity || 5;
  const paymentTerms = commercial?.terms || "60% al confirmar el trabajo, saldo contra entrega.";
  const logoUrl = `${appOrigin}/brand/rokko-navbar.png`;
  const paymentRows = [
    ["Banco", brand?.bank_name],
    ["Tipo", brand?.bank_account_type],
    ["Cuenta", brand?.bank_account_number],
    ["Titular", brand?.bank_account_holder],
    ["RUT", brand?.bank_account_rut],
    ["Correo", brand?.bank_account_email],
  ].filter(([, value]) => String(value || "").trim());

  const itemRows = items
    .map((item) => {
      const sizes = Object.entries(item.sizes || {})
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([size, quantity]) => `${escapeHtml(size)}/${escapeHtml(quantity)}`)
        .join(" | ");

      return `
        <tr>
          <td style="border:1px solid #000;padding:7px 8px;vertical-align:top;font-weight:800;text-transform:uppercase">${escapeHtml(item.color || "Sin color")}</td>
          <td style="border:1px solid #000;padding:7px 8px;vertical-align:top">
            <div style="font-weight:900;text-transform:uppercase">${escapeHtml(item.product)}</div>
            <div style="margin-top:3px;font-size:10px;line-height:1.35">* Incluye logo ${escapeHtml(String(item.logoPosition || "").toLowerCase())} ${escapeHtml(String(item.application || "").toLowerCase())}</div>
            <div style="font-size:10px;line-height:1.35">* Producto sujeto a disponibilidad de stock y color.</div>
          </td>
          <td style="border:1px solid #000;padding:7px 8px;vertical-align:top;font-weight:700">${sizes || "-"}</td>
          <td style="border:1px solid #000;padding:7px 8px;vertical-align:top;text-align:right;font-weight:900">${escapeHtml(item.totalUnits)}</td>
          <td style="border:1px solid #000;padding:7px 8px;vertical-align:top;text-align:right;white-space:nowrap">${formatMoney(item.unitPrice)}</td>
          <td style="border:1px solid #000;padding:7px 8px;vertical-align:top;text-align:right;white-space:nowrap;font-weight:900">${formatMoney(item.subtotal)}</td>
        </tr>`;
    })
    .join("");

  const paymentHtml = paymentRows.length
    ? `
      <div style="margin-top:10px;border-top:1px solid rgba(0,0,0,.18);padding-top:8px">
        <div style="font-weight:900;text-transform:uppercase">Datos de transferencia</div>
        <table style="width:100%;border-collapse:collapse;margin-top:4px;font-size:10px">
          ${paymentRows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="padding:1px 8px 1px 0;font-weight:900;width:54px">${label}:</td>
                  <td style="padding:1px 0">${escapeHtml(value)}</td>
                </tr>`
            )
            .join("")}
        </table>
        ${brand?.payment_notes ? `<div style="margin-top:5px;font-weight:700">${escapeHtml(brand.payment_notes)}</div>` : ""}
      </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:24px;background:#eef3f5;font-family:Arial,Helvetica,sans-serif;color:#000">
  <div style="max-width:794px;margin:0 auto;background:#fff;padding:34px 38px;box-shadow:0 18px 50px rgba(15,23,42,.12);box-sizing:border-box;font-size:11px;line-height:1.25">
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
      <tr>
        <td style="width:210px;vertical-align:top">
          <img src="${logoUrl}" alt="ROKKO" width="205" style="display:block;max-width:205px;height:auto">
        </td>
        <td style="vertical-align:top;text-align:center">
          <div style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#0b8fa1">Vestuario corporativo profesional</div>
          <div style="margin-top:5px;font-size:21px;font-weight:900;text-transform:uppercase">Cotizacion comercial</div>
          <div style="margin-top:4px;font-size:11px;font-weight:700;color:#4b5563">Nro. ${escapeHtml(folio)}</div>
        </td>
        <td style="width:150px;vertical-align:top">
          <table style="width:100%;border-collapse:collapse;font-size:10px">
            <tr><td style="border:1px solid #000;background:#f2f2f2;padding:4px 6px;font-weight:900;text-transform:uppercase">Fecha</td><td style="border:1px solid #000;padding:4px 6px;font-weight:700">${escapeHtml(quoteDate)}</td></tr>
            <tr><td style="border:1px solid #000;background:#f2f2f2;padding:4px 6px;font-weight:900;text-transform:uppercase">Ciudad</td><td style="border:1px solid #000;padding:4px 6px;font-weight:700">${escapeHtml(city)}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:12px">
      <tr>
        <th style="border:1px solid #000;background:#f2f2f2;padding:6px 8px;text-align:left;text-transform:uppercase">Cotizacion</th>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700">${escapeHtml(folio)}</td>
        <th style="border:1px solid #000;background:#f2f2f2;padding:6px 8px;text-align:left;text-transform:uppercase">Empresa</th>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700">${escapeHtml(client_empresa || "-")}</td>
      </tr>
      <tr>
        <th style="border:1px solid #000;background:#f2f2f2;padding:6px 8px;text-align:left;text-transform:uppercase">Contacto</th>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700">${escapeHtml(client_contacto || "-")}</td>
        <th style="border:1px solid #000;background:#f2f2f2;padding:6px 8px;text-align:left;text-transform:uppercase">Telefono</th>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700">${escapeHtml(client_telefono && client_telefono !== "+56 9" ? client_telefono : "-")}</td>
      </tr>
      <tr>
        <th style="border:1px solid #000;background:#f2f2f2;padding:6px 8px;text-align:left;text-transform:uppercase">Mail</th>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700">${escapeHtml(client_correo || "-")}</td>
        <th style="border:1px solid #000;background:#f2f2f2;padding:6px 8px;text-align:left;text-transform:uppercase">Direccion</th>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700">${escapeHtml(client_observaciones || city || "-")}</td>
      </tr>
      ${client_rut ? `<tr><th style="border:1px solid #000;background:#f2f2f2;padding:6px 8px;text-align:left;text-transform:uppercase">RUT</th><td colspan="3" style="border:1px solid #000;padding:6px 8px;font-weight:700">${escapeHtml(client_rut)}</td></tr>` : ""}
    </table>

    <table style="border-collapse:collapse;font-size:10.5px;margin-bottom:18px;width:360px">
      <tr>
        <td style="border:1px solid #000;background:#f2f2f2;padding:6px 8px;font-weight:900;text-transform:uppercase">Abono 60%</td>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700">SI</td>
        <td style="border:1px solid #000;background:#f2f2f2;padding:6px 8px;font-weight:900;text-transform:uppercase">Tipo Pago</td>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700">CONTADO</td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;font-size:10.5px">
      <thead>
        <tr>
          <th style="border:1px solid #000;background:#0b8fa1;color:#fff;padding:7px 8px;text-align:left;text-transform:uppercase;font-size:9.5px">Color</th>
          <th style="border:1px solid #000;background:#0b8fa1;color:#fff;padding:7px 8px;text-align:left;text-transform:uppercase;font-size:9.5px">Descripcion</th>
          <th style="border:1px solid #000;background:#0b8fa1;color:#fff;padding:7px 8px;text-align:left;text-transform:uppercase;font-size:9.5px">Talla</th>
          <th style="border:1px solid #000;background:#0b8fa1;color:#fff;padding:7px 8px;text-align:right;text-transform:uppercase;font-size:9.5px">Cantidad</th>
          <th style="border:1px solid #000;background:#0b8fa1;color:#fff;padding:7px 8px;text-align:right;text-transform:uppercase;font-size:9.5px">Valor unitario</th>
          <th style="border:1px solid #000;background:#0b8fa1;color:#fff;padding:7px 8px;text-align:right;text-transform:uppercase;font-size:9.5px">Total neto</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <table style="width:100%;border:1px solid #000;border-collapse:collapse;margin-top:18px;font-size:10px">
      <tr><td colspan="2" style="border:1px solid #000;background:#f2f2f2;padding:7px 10px;font-weight:900;text-transform:uppercase">Condiciones y resumen financiero</td></tr>
      <tr>
        <td style="border-right:1px solid #000;padding:12px;vertical-align:top;width:58%">
          <table style="width:100%;font-size:10px">
            <tr>
              <td style="vertical-align:top;width:50%;padding:0 10px 8px 0"><strong style="text-transform:uppercase">Plazo</strong><br>2 semanas con diseno aprobado.</td>
              <td style="vertical-align:top;width:50%;padding:0 0 8px 10px"><strong style="text-transform:uppercase">Pago</strong><br>${escapeHtml(paymentTerms)}</td>
            </tr>
            <tr>
              <td style="vertical-align:top;padding:0 10px 0 0"><strong style="text-transform:uppercase">Contacto</strong><br>${escapeHtml(brand?.name || "ROKKO-TCO")}<br>${escapeHtml(brand?.phone || "")}</td>
              <td style="vertical-align:top;padding:0 0 0 10px"><strong style="text-transform:uppercase">Inicio de trabajos</strong><br>${escapeHtml(brand?.name || "ROKKO-TCO")}<br>${escapeHtml(brand?.email || "")}</td>
            </tr>
          </table>
          ${paymentHtml}
        </td>
        <td style="padding:12px;vertical-align:middle;width:42%">
          <table style="margin-left:auto;border-collapse:collapse;font-size:11px;width:250px">
            ${
              discountPercent > 0 && discountTotal > 0
                ? `<tr><td style="border:1px solid #000;background:#f2f2f2;padding:8px 10px;font-weight:900;text-transform:uppercase">Subtotal</td><td style="border:1px solid #000;padding:8px 10px;text-align:right;font-weight:900">${formatMoney(grossTotal)}</td></tr>
                   <tr><td style="border:1px solid #000;background:#f2f2f2;padding:8px 10px;font-weight:900;text-transform:uppercase">Descuento ${discountPercent}%</td><td style="border:1px solid #000;padding:8px 10px;text-align:right;font-weight:900">-${formatMoney(discountTotal)}</td></tr>`
                : ""
            }
            <tr><td style="border:1px solid #000;background:#f2f2f2;padding:8px 10px;font-weight:900;text-transform:uppercase">Valor neto</td><td style="border:1px solid #000;padding:8px 10px;text-align:right;font-weight:900">${formatMoney(neto)}</td></tr>
            <tr><td style="border:1px solid #000;background:#f2f2f2;padding:8px 10px;font-weight:900;text-transform:uppercase">${vatRate}%</td><td style="border:1px solid #000;padding:8px 10px;text-align:right;font-weight:900">${formatMoney(iva)}</td></tr>
            <tr><td style="border:1px solid #000;background:#f2f2f2;padding:9px 10px;font-size:13px;font-weight:900;text-transform:uppercase">Total</td><td style="border:1px solid #000;padding:9px 10px;text-align:right;font-size:14px;font-weight:900">${formatMoney(total)}</td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border-top:1px solid #000;padding:7px 10px;font-size:9.5px;line-height:1.45">
          <strong>Presupuesto valido por ${escapeHtml(validity)} dias corridos.</strong>
          <strong> INCLUYE:</strong> montaje de logos imagen digital, correccion de logo para tecnica estampado o bordado. Foto montaje es utilizada como elemento de referencia.
        </td>
      </tr>
    </table>

    <table style="width:100%;margin-top:22px;border-collapse:collapse;font-size:9px;text-transform:uppercase;letter-spacing:.14em">
      <tr>
        <td style="font-weight:800;color:#0b8fa1">ROKKO Vestuario Corporativo</td>
        <td style="text-align:right;font-weight:800">Documento generado para cotizacion comercial</td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

function buildResponseEmail(folio: string, client_empresa: string, admin_notes: string, status: string) {
  const statusLabel = status === "respondida" ? "APROBADA" : "CERRADA";
  const statusColor = status === "respondida" ? "#059669" : "#dc2626";
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <table style="width:100%;max-width:600px;margin:0 auto">
        <tr><td style="padding:32px 24px">
          <table style="width:100%;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
            <tr>
              <td style="text-align:center;padding:32px 32px 0">
                <span style="display:inline-block;background:${statusColor};color:#fff;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;padding:6px 16px;border-radius:20px">${statusLabel}</span>
                <h1 style="color:#0f172a;margin:16px 0 4px;font-size:20px;font-weight:900">Respuesta a tu Cotización</h1>
                <p style="color:#64748b;margin:0;font-size:14px">${folio} · ${client_empresa}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px">
                  <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin:0 0 8px">Mensaje del equipo ROKKO</p>
                  <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:0;white-space:pre-wrap">${admin_notes}</p>
                </div>
                <p style="margin-top:20px;font-size:13px;color:#64748b;text-align:center">
                  Si tienes dudas, responde este correo o contáctanos directamente.
                </p>
                <p style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center">
                  <strong style="color:#64748b">ROKKO</strong> · Vestuario Corporativo
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

async function trySend(to: string[], subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ROKKO Cotizaciones <onboarding@resend.dev>",
      to,
      bcc: [ADMIN_EMAIL],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Resend error response:", res.status, errBody);

    if (to[0] !== ADMIN_EMAIL) {
      console.log("Fallback: sending only to admin");
      return trySend([ADMIN_EMAIL], subject, html);
    }

    return { ok: false, error: `Resend error (${res.status}): ${errBody}` };
  }

  return { ok: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!RESEND_API_KEY) {
      return Response.json({ error: "Servicio de email no configurado" }, { status: 500 });
    }

    const type = body.type || "new_quote";
    const appOrigin = new URL(request.url).origin;

    if (type === "admin_response") {
      const { folio, client_empresa, client_correo, admin_notes, status } = body;
      const subject = `Tu cotización ${folio} ha sido respondida — ROKKO`;
      const html = buildResponseEmail(folio, client_empresa, admin_notes, status);
      const result = await trySend([client_correo], subject, html);
      if (!result.ok) return Response.json({ error: result.error }, { status: 500 });
      return Response.json({ ok: true });
    }

    // new_quote
    const {
      folio,
      client_empresa,
      client_rut = "",
      client_contacto = "",
      client_correo,
      client_telefono = "",
      client_observaciones = "",
      items,
      total,
      brand = {},
      commercial = {},
    } = body;

    const subject = `Cotización ${folio} — ${client_empresa}`;
    const html = buildPrintableQuoteEmail(
      folio,
      client_empresa,
      client_rut,
      client_contacto,
      client_correo,
      client_telefono,
      client_observaciones,
      items,
      total,
      brand,
      commercial,
      appOrigin
    );
    const result = await trySend([client_correo], subject, html);
    if (!result.ok) return Response.json({ error: result.error }, { status: 500 });

    return Response.json({ ok: true, delivered_to: [client_correo, ADMIN_EMAIL] });
  } catch (err) {
    console.error("send-quote error:", err);
    return Response.json({ error: `Error interno: ${err}` }, { status: 500 });
  }
}
