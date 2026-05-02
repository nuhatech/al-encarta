import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al-Encarta 2002 — Pionniers de la Civilisation",
  description: "Al-Encarta — encyclopédie multimédia arabo-musulmane augmentée par IA · édition DefendHack 2026",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/xp.css" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
