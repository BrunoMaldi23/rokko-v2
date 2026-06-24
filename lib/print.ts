export function printElement(elementId: string) {
  const wrapper = document.getElementById(elementId);
  if (!wrapper) return;

  const content =
    (wrapper.querySelector("[data-quote-print-document]") as HTMLElement | null) ||
    (wrapper.children[0] as HTMLElement | undefined);
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
    html, body { margin: 0; padding: 0; width: 210mm; min-height: 297mm; }
    body { background: #fff; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    .no-print { display: none !important; }
    @page { size: A4 portrait; margin: 0; }
    [data-quote-print-document] {
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 auto !important;
      padding: 9mm 10mm 8mm !important;
      box-shadow: none !important;
      overflow: visible !important;
    }
    @media print {
      html, body { width: 210mm !important; min-height: 297mm !important; overflow: visible !important; }
      body { background: #fff !important; }
      .shadow-2xl { box-shadow: none !important; }
      [data-quote-print-document] {
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        padding: 9mm 10mm 8mm !important;
      }

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
    function waitForImages() {
      var images = Array.prototype.slice.call(document.images || []);
      return Promise.all(images.map(function(img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function(resolve) {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));
    }

    window.onload = function() {
      waitForImages().then(function() {
        setTimeout(function() {
          window.print();
          window.close();
        }, 250);
      });
    };
  <\/script>
</body>
</html>`);
  win.document.close();
}
