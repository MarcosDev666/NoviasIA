import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoviasIA — Chateá con personajes IA",
  description:
    "Turras, celosas, tóxicas, amigas y personajes de todo el mundo. Chats con IA que parecen de verdad.",
  keywords: ["IA", "chatbots", "personajes", "Argentina", "NoviasIA"],
  openGraph: {
    title: "NoviasIA",
    description: "Chats con personajes IA. Turras, celosas, tóxicas y más.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-ink-950 font-sans antialiased">{children}</body>
    </html>
  );
}
