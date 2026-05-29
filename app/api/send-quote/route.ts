const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = "brunopsg061@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { folio, client_empresa, client_correo, items, total } = body;

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY no configurada");
      return Response.json({ error: "Servicio de email no configurado" }, { status: 500 });
    }

    const itemRows = items
      .map(
        (item: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600">${item.product}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b">${item.color} · ${item.application} · ${item.logoPosition}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center">${item.totalUnits}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">$${item.subtotal.toLocaleString("es-CL")}</td>
      </tr>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
        <table style="width:100%;max-width:600px;margin:0 auto;padding:24px">
          <tr>
            <td style="background:linear-gradient(135deg,#0891b2,#06b6d4);padding:24px 32px;border-radius:16px 16px 0 0">
              <h1 style="color:#fff;margin:0;font-size:20px">Nueva Cotización — ${folio}</h1>
              <p style="color:#cffafe;margin:4px 0 0;font-size:14px">Cliente: ${client_empresa}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 12px rgba(0,0,0,.06)">
              <h2 style="font-size:16px;margin:0 0 12px;color:#0f172a">Datos del cliente</h2>
              <table style="width:100%;font-size:14px;color:#334155">
                <tr><td style="padding:4px 0;color:#94a3b8">Empresa</td><td style="padding:4px 0;font-weight:600">${client_empresa}</td></tr>
                <tr><td style="padding:4px 0;color:#94a3b8">Email cliente</td><td style="padding:4px 0">${client_correo || "—"}</td></tr>
              </table>
              <h2 style="font-size:16px;margin:24px 0 12px;color:#0f172a">Productos</h2>
              <table style="width:100%;font-size:13px;border-collapse:collapse">
                <thead>
                  <tr style="background:#f8fafc">
                    <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#94a3b8">Producto</th>
                    <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#94a3b8">Detalle</th>
                    <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#94a3b8">Und.</th>
                    <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#94a3b8">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
              <div style="border-top:2px solid #e2e8f0;margin-top:16px;padding-top:16px;text-align:right">
                <span style="font-size:24px;font-weight:800;color:#0891b2">$${total.toLocaleString("es-CL")}</span>
              </div>
              <p style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center">
                Cotización generada desde ROKKO · Vestuario Corporativo
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Con onboarding@resend.dev solo se puede enviar al correo verificado (brunopsg061@gmail.com)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ROKKO Cotizaciones <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `Cotización ${folio} — ${client_empresa}`,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend error response:", res.status, errBody);
      return Response.json(
        { error: `Resend error (${res.status}): ${errBody}` },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, delivered_to: ADMIN_EMAIL });
  } catch (err) {
    console.error("send-quote error:", err);
    return Response.json({ error: `Error interno: ${err}` }, { status: 500 });
  }
}
