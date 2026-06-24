import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import AdminAccess from "@/components/AdminAccess";
import AccessibilityWidget from "@/components/AccessibilityWidget";

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
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">
          {children}
        </div>
        
        {/* Acceso flotante de administración */}
        <AdminAccess />
        <AccessibilityWidget />
      </body>
    </html>
  );
}
