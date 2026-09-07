import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhu-Rail (भू-रेल) | National Land Digital Public Infrastructure",
  description: "Official Government of India Land Digital Public Infrastructure exposing standardized open APIs for parcel identity, geometry, bundle of rights, encumbrances, and governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#f1f5f9] text-[#0f172a] min-h-screen flex flex-col antialiased">
        {/* GovTech Singapore / Indian Masthead & Header */}
        <Navbar />

        {/* Official Statutory Notice Ticker */}
        <div className="bg-[#fffbeb] border-b border-[#fde68a] text-[11.5px] text-[#92400e] px-4 sm:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#fef3c7] border border-[#f59e0b] font-bold text-[10px] text-[#b45309] uppercase tracking-wider">
                GAZETTE NOTIFICATION
              </span>
              <span>
                Smart India Hackathon 2026 (SIH26014) • High-throughput Land DPI Pilot active for Gurugram district cadastral plots.
              </span>
            </div>
            <span className="hidden lg:inline text-[11px] font-mono text-[#b45309]">
              API Version: 1.0.0-PROD
            </span>
          </div>
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Official Government Footer (Singapore GovTech / SGDS Architecture) */}
        <footer className="bg-[#0b2545] text-white border-t-4 border-[#d9381e] mt-12">
          {/* Top Footer Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded bg-white text-[#0b2545] font-serif font-black flex items-center justify-center text-base">
                    भू
                  </div>
                  <span className="font-bold text-base tracking-tight font-serif">Bhu-Rail DPI</span>
                </div>
                <p className="text-slate-300 text-[11.5px] leading-relaxed">
                  National Digital Public Infrastructure transforming fragmented state records into verifiable, interoperable land digital assets.
                </p>
                <div className="text-[11px] text-slate-400">
                  Operated under the aegis of the Department of Land Resources (DoLR), Ministry of Rural Development.
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-white/10">
                  DPI Open Rails
                </h4>
                <ul className="space-y-2 text-slate-300 text-[11.5px]">
                  <li><a href="/bank-simulator" className="hover:text-emerald-400 transition-colors">Land UPI Verification Rail</a></li>
                  <li><a href="/court-registry" className="hover:text-emerald-400 transition-colors">Judicial Injunction Registry</a></li>
                  <li><a href="/surveyor-tools" className="hover:text-emerald-400 transition-colors">Directorate of Cadastral Survey</a></li>
                  <li><a href="/ledger" className="hover:text-emerald-400 transition-colors">Cryptographic Audit Ledger</a></li>
                  <li><a href="http://localhost:8000/docs" target="_blank" className="hover:text-emerald-400 transition-colors font-mono">OpenAPI Specification (Swagger)</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-white/10">
                  Standards & Laws
                </h4>
                <ul className="space-y-2 text-slate-300 text-[11.5px]">
                  <li><span className="text-slate-300">ULPIN Bhu-Aadhaar Guidelines (14-Digit)</span></li>
                  <li><span className="text-slate-300">Registration Act 1908 (Digital Mutation)</span></li>
                  <li><span className="text-slate-300">Transfer of Property Act 1882</span></li>
                  <li><span className="text-slate-300">Digital Personal Data Protection Act 2023</span></li>
                  <li><span className="text-slate-300">OGC Simple Features Specification</span></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-white/10">
                  Institutional Governance
                </h4>
                <div className="space-y-2 text-slate-300 text-[11.5px]">
                  <p>National Land Governance Council</p>
                  <p className="text-slate-400">Technical Support: National Informatics Centre (NIC) & GovTech Division</p>
                  <div className="pt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-white/10 text-emerald-300 font-mono text-[10px]">
                      Security Status: STQC Certified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-[#07192f] border-t border-white/10 py-4 px-4 sm:px-8 text-[11px] text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex flex-wrap gap-4">
                <span className="hover:underline cursor-pointer">Privacy Statement</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Terms of Use</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Report Vulnerability</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Accessibility</span>
              </div>
              <div>
                © 2026 Government of India • Last Updated: 07 Sep 2026
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
