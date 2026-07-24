import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Oficina ERP",
  description: "MVP de gestão simples para oficinas mecânicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full bg-slate-50 text-slate-900">
      <body className="h-full antialiased">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
