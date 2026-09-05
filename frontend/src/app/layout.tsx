import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhu-Rail (भू-रेल) | Land Digital Public Infrastructure",
  description: "Universal parcel-centric Digital Public Infrastructure exposing open standardized APIs for land identity, geometry, rights, and lifecycle governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
          Bhu-Rail Land Digital Public Infrastructure • Smart India Hackathon Prototype • Open API v1
        </footer>
      </body>
    </html>
  );
}
