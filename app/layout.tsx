import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROKKO Cotizador",
  description: "Sistema profesional de cotización ROKKO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}