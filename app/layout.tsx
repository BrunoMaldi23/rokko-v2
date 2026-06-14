import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import AdminAccess from "@/components/AdminAccess";
import ThreePatch from "@/components/ThreePatch";

// Configuración de metadatos optimizada para SEO y OpenGraph
export const metadata: Metadata = {
  title: "ROKKO | Vestuario Corporativo Profesional",
  description:
    "Sistema profesional de cotización de vestuario corporativo. Diseña y cotiza poleras, polerones, parkas y pantalones personalizados para tu empresa con precios mayoristas.",
  keywords: ["vestuario corporativo", "cotización ropa empresa", "uniformes personalizados", "ROKKO", "ropa de trabajo"],
  authors: [{ name: "ROKKO" }],
  robots: {
    index: true,
    follow: true,
  },
};

// Control de responsive y colores del sistema/navegador
export const viewport: Viewport = {
  themeColor: "#f4f6f7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(){
                  // Skip if already patched
                  if(typeof HTMLCanvasElement.prototype.__rokkoWebglPatched !== 'undefined') return;
                  
                  // Patch WebGL texImage2D to skip calls where source is null (≤6 args)
                  var _origGetCtx = HTMLCanvasElement.prototype.getContext;
                  HTMLCanvasElement.prototype.getContext = function(type, attrs) {
                    var ctx = _origGetCtx.call(this, type, attrs);
                    if(ctx && (type==='webgl'||type==='webgl2'||type==='experimental-webgl') && !ctx.__rokkoTexPatched) {
                      ctx.__rokkoTexPatched = true;
                      var origTexImage = ctx.texImage2D;
                      ctx.texImage2D = function() {
                        try {
                          var n = arguments.length;
                          if(n <= 6) {
                            var src = arguments[n - 1];
                            if(src === null || src === undefined) { return null; }
                          }
                          return origTexImage.apply(ctx, arguments);
                        } catch(e) { return null; }
                      };
                    }
                    return ctx;
                  };
                  HTMLCanvasElement.prototype.__rokkoWebglPatched = true;

                  // Global error handler — swallow WebGL texture errors
                  var origOnError = window.onerror;
                  window.onerror = function(msg, url, line, col, err) {
                    if(msg && (msg+'').indexOf('texImage2D') >= 0) return true;
                    if(msg && (msg+'').indexOf('image.png') >= 0) return true;
                    if(msg && (msg+'').indexOf('does not support image input') >= 0) return true;
                    if(origOnError) return origOnError.apply(this, arguments);
                    return false;
                  };
                  window.addEventListener('unhandledrejection', function(e) {
                    var m = (e.reason+'' || '');
                    if(m.indexOf('texImage2D') >= 0 || m.indexOf('image.png') >= 0 || m.indexOf('does not support image input') >= 0) {
                      e.preventDefault();
                    }
                  });
                })();
              `,
            }}
          />
        </head>
      <body className="flex min-h-screen flex-col">
        <ThreePatch />
        <Header />
        <div className="flex-1">
          {children}
        </div>
        
        {/* Acceso flotante de administración */}
        <AdminAccess />
      </body>
    </html>
  );
}