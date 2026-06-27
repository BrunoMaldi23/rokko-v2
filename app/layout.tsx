import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import AdminAccess from "@/components/AdminAccess";

export const metadata: Metadata = {
  title: "ROKKO | Vestuario Corporativo Profesional",
  description:
    "Sistema profesional de cotización de vestuario corporativo. Diseña y cotiza poleras, polerones, cortavientos, polar, parkas y pantalones personalizados para tu empresa con precios mayoristas.",
  keywords: [
    "vestuario corporativo",
    "cotización ropa empresa",
    "uniformes personalizados",
    "ROKKO",
    "ropa de trabajo",
  ],
  authors: [{ name: "ROKKO" }],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f7f6",
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
      <body className="min-h-screen overflow-x-hidden bg-bg antialiased">
        <Header />

        <div className="min-h-[calc(100svh-96px)]">{children}</div>

        <AdminAccess />
      </body>
    </html>
  );
}
