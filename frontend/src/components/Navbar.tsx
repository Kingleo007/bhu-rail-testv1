"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  Layers, 
  Landmark, 
  Scissors, 
  Link as LinkIcon, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [showMastheadDetail, setShowMastheadDetail] = useState(false);

  const links = [
    { href: "/", label: "Cadastral Explorer", icon: Layers },
    { href: "/bank-simulator", label: "Land UPI (Bank Portal)", icon: Landmark, badge: "Rail API" },
    { href: "/court-registry", label: "Judicial Enforcement", icon: ShieldCheck, badge: "Rule Engine" },
    { href: "/surveyor-tools", label: "Cadastral Subdivision", icon: Scissors, badge: "Spatial" },
    { href: "/ledger", label: "Cryptographic Ledger", icon: LinkIcon, badge: "Audit" },
    { href: "/sih-presentation.html", label: "SIH Deck (PDF)", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* 1. Official Singapore GovTech / SGDS Inspired Masthead */}
      <div className="bg-[#f0f3f6] border-b border-[#d8e0e8] text-[11px] text-[#475569] py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center space-x-2">
            {/* Lion / Government Crest */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-semibold text-[#1e293b]">An Official Government of India Digital Public Infrastructure Website</span>
            <button 
              onClick={() => setShowMastheadDetail(!showMastheadDetail)}
              className="text-[#0070e0] hover:underline font-medium inline-flex items-center gap-0.5 ml-2 cursor-pointer"
            >
              <span>How to identify</span>
              {showMastheadDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-[#475569]">
            <span className="hidden md:inline">Department of Land Resources (DoLR) • MoRD</span>
            <span className="font-semibold text-[#0f766e] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>DPI Rail: Operational</span>
            </span>
          </div>
        </div>

        {/* Expandable Masthead Drawer */}
        {showMastheadDetail && (
          <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-[#d8e0e8] grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-[#334155] animate-fadeIn pb-1">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-bold text-[9px] text-slate-700">🏛️</span>
              </div>
              <div>
                <strong>Official government digital rail</strong>
                <p className="text-slate-500">Government websites end with <strong>.gov.in</strong> or official departmental endpoints before logging in.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Secure connection (HTTPS)</strong>
                <p className="text-slate-500">Look for the padlock symbol in your browser's address bar to ensure encrypted transmission.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Official Agency Brand Header */}
      <div className="bg-white border-b border-[#e2e8f0] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3.5 group">
            {/* National Emblem Badge */}
            <div className="w-11 h-11 rounded-lg bg-[#0b2545] border border-[#0f3460] flex items-center justify-center text-white font-serif font-black text-xl shadow-inner group-hover:bg-[#134074] transition-colors">
              भू
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black tracking-tight text-xl text-[#0b2545] font-serif">Bhu-Rail</span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                  Land DPI
                </span>
                <span className="text-[10px] font-semibold text-slate-400 font-mono hidden sm:inline">v1.4</span>
              </div>
              <p className="text-xs text-[#64748b] font-medium tracking-tight">
                National Land Digital Public Infrastructure • Government of India
              </p>
            </div>
          </Link>

          {/* Header Utilities */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs text-[#334155] border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-[#f8fafc]">
              <span className="text-slate-400 font-mono">Standard:</span>
              <strong className="text-[#0b2545] font-mono">ULPIN Bhu-Aadhaar</strong>
            </div>

            <div className="flex items-center border border-[#cbd5e1] rounded-lg overflow-hidden text-xs font-semibold">
              <span className="px-2.5 py-1 bg-[#0b2545] text-white">English</span>
              <span className="px-2.5 py-1 bg-white text-[#475569] hover:bg-slate-50 cursor-pointer">हिन्दी</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Primary Government Navigation Bar (Singapore GovTech Deep Navy) */}
      <nav className="bg-[#0b2545] text-white px-4 sm:px-8 border-b-2 border-[#d9381e]">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-1 py-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#134074] text-white shadow-sm ring-1 ring-white/20"
                      : "text-slate-200 hover:bg-[#134074]/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-300" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-white/15 text-slate-200 border border-white/20">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono text-slate-300">
            <span>Pilot: Sohna Tehsil (HR)</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
