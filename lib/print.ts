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
      .my-8 { margin-top: 0 !important; margin-bottom: 0 !important; }
      .min-h-\\[1000px\\] { min-height: 100vh !important; }
      .p-12 { padding-left: 0 !important; padding-right: 0 !important; }
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
