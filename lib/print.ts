export function printElement(elementId: string) {
  const wrapper = document.getElementById(elementId);
  if (!wrapper) return;

  const content = wrapper.children[0] as HTMLElement;
  if (!content) return;

  const origin = window.location.origin;
  let html = content.outerHTML;

  // Convertir rutas Next.js Image a URLs directas para que el logo cargue
  html = html.replace(
    /src="\/_next\/image\?url=([^&"]+)/g,
    (_, encoded) => `src="${origin}${decodeURIComponent(encoded)}"`
  );
  // Rutas relativas → absolutas
  html = html.replace(/src="\//g, `src="${origin}/`);

  const pageStyles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules || [])
          .map((rule) => rule.cssText)
          .join("");
      } catch {
        return "";
      }
    })
    .join("");

  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cotización - ROKKO</title>
  <style>
    ${pageStyles}
  </style>
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    .no-print { display: none !important; }
    @page { margin: 0.6in; }
    @media print {
      body { background: #fff !important; }
      .shadow-2xl { box-shadow: none !important; }

      /* tabla: repetir encabezado y no cortar filas entre páginas */
      table { border-collapse: collapse; width: 100%; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; page-break-inside: avoid; }
      td, th { overflow-wrap: anywhere; word-break: normal; }
      .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${html}
  <script>
    window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); };
  <\/script>
</body>
</html>`);
  win.document.close();
}
