"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Layers, Landmark, Scissors, Link as LinkIcon, Database } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "DPI Explorer", icon: Layers },
    { href: "/bank-simulator", label: "Land UPI (Bank)", icon: Landmark, badge: "Demo 3" },
    { href: "/court-registry", label: "Fraud Prevention", icon: ShieldCheck, badge: "Demo 1" },
    { href: "/surveyor-tools", label: "Subdivision", icon: Scissors, badge: "Demo 2" },
    { href: "/ledger", label: "Trust Ledger", icon: LinkIcon },
    { href: "/sih-presentation.html", label: "SIH Deck (PDF)", icon: Database, badge: "Slides" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-inner group-hover:scale-105 transition-transform">
              भू
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-lg text-white">Bhu-Rail</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  Land DPI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">National Land Digital Public Infrastructure</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Rail Status Badge */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5"></span>
              <span className="text-[11px] font-semibold text-slate-200">Open API Rail v1</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
