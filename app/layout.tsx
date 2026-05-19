import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grillplatz.ch – Feuerstellen in der Schweiz",
  description:
    "Entdecke öffentliche Grillplätze und Feuerstellen in der Schweiz. Filtern nach Holz, Tisch, Wasser und WC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full">
      <body className="h-full flex flex-col bg-gray-50 font-sans antialiased">
        <header className="bg-brand-orange text-white px-4 py-3 flex items-center gap-3 shrink-0 shadow">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-lg tracking-tight">Grillplatz.ch</span>
          </a>
          <span className="text-orange-200 text-sm hidden sm:block">
            Feuerstellen &amp; Grillplätze in der Schweiz
          </span>
        </header>

        <main className="flex-1 overflow-hidden">{children}</main>

        <footer className="shrink-0 bg-white border-t border-gray-200 py-2 px-4 text-xs text-gray-400 text-center">
          Daten von{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            OpenStreetMap
          </a>{" "}
          (ODbL 1.0) · Kein Anspruch auf Vollständigkeit
        </footer>
      </body>
    </html>
  );
}
