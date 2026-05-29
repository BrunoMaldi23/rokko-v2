const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = "brunopsg061@gmail.com";

function buildItemRows(items: any[]) {
  return items
    .map(
      (item: any) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#0f172a">${item.product}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px">${item.color} · ${item.application} · ${item.logoPosition}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;text-align:center">${item.totalUnits}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#475569;text-align:right">$${item.unitPrice.toLocaleString("es-CL")}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;text-align:right">$${item.subtotal.toLocaleString("es-CL")}</td>
    </tr>`
    )
    .join("");
}

function buildQuoteEmail(folio: string, client_empresa: string, items: any[], total: number) {
  const vatRate = 19;
  const neto = Math.round(total / (1 + vatRate / 100));
  const iva = total - neto;

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <table style="width:100%;max-width:640px;margin:0 auto">
        <tr><td style="padding:32px 24px 0">
          <table style="width:100%;background:#fff;border-radius:12px 12px 0 0;box-shadow:0 2px 12px rgba(0,0,0,.06)">
            <tr>
              <td style="background:linear-gradient(135deg,#0891b2,#06b6d4);padding:28px 32px;border-radius:12px 12px 0 0">
                <table style="width:100%">
                  <tr>
                    <td>
                      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.02em">Nueva Cotización</h1>
                      <p style="color:#cffafe;margin:4px 0 0;font-size:15px">${folio}</p>
                    </td>
                    <td style="text-align:right;vertical-align:top">
                      <p style="color:#cffafe;font-size:12px;margin:0;font-weight:700">${client_empresa}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px">
                <table style="width:100%">
                  <tr>
                    <td style="padding-bottom:12px">
                      <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin:0">Detalle de Productos</p>
                    </td>
                  </tr>
                </table>
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                  <thead>
                    <tr style="background:#0891b2">
                      <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">Producto</th>
                      <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">Detalle</th>
                      <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">Cant.</th>
                      <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">P. Unit.</th>
                      <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${buildItemRows(items)}
                  </tbody>
                </table>
                <table style="width:100%;margin-top:16px">
                  <tr>
                    <td style="text-align:right;padding:8px 14px">
                      <table style="margin-left:auto;width:240px">
                        <tr><td style="padding:4px 0;color:#64748b;font-size:14px">Neto</td><td style="padding:4px 0;font-weight:600;color:#1e293b;text-align:right">$${neto.toLocaleString("es-CL")}</td></tr>
                        <tr><td style="padding:4px 0;color:#64748b;font-size:14px">IVA ${vatRate}%</td><td style="padding:4px 0;font-weight:600;color:#1e293b;text-align:right">$${iva.toLocaleString("es-CL")}</td></tr>
                        <tr><td style="padding:12px 0 4px;border-top:2px solid #e2e8f0"></td></tr>
                        <tr>
                          <td style="padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em">Saldo adeudado</td>
                          <td style="padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:20px;font-weight:900;color:#0891b2;text-align:right">$${total.toLocaleString("es-CL")}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <p style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center">
                  Cotización generada desde <strong style="color:#64748b">ROKKO</strong> · Vestuario Corporativo
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

    // Fallback: send only to admin if client failed (test domain restriction)
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

    if (type === "admin_response") {
      const { folio, client_empresa, client_correo, admin_notes, status } = body;
      const subject = `Tu cotización ${folio} ha sido respondida — ROKKO`;
      const html = buildResponseEmail(folio, client_empresa, admin_notes, status);
      const result = await trySend([client_correo], subject, html);
      if (!result.ok) return Response.json({ error: result.error }, { status: 500 });
      return Response.json({ ok: true });
    }

    // new_quote
    const { folio, client_empresa, client_correo, items, total } = body;
    const subject = `Cotización ${folio} — ${client_empresa}`;
    const html = buildQuoteEmail(folio, client_empresa, items, total);
    const result = await trySend([client_correo], subject, html);
    if (!result.ok) return Response.json({ error: result.error }, { status: 500 });

    return Response.json({ ok: true, delivered_to: [client_correo, ADMIN_EMAIL] });
  } catch (err) {
    console.error("send-quote error:", err);
    return Response.json({ error: `Error interno: ${err}` }, { status: 500 });
  }
}
