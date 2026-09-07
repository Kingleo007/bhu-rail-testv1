"use client";

import Link from "next/link";
import { PropertyPassport } from "@/lib/api";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Landmark, 
  Scale, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Hash, 
  QrCode, 
  Award,
  ExternalLink
} from "lucide-react";

interface PropertyPassportCardProps {
  passport: PropertyPassport | null;
  loading: boolean;
}

export default function PropertyPassportCard({ passport, loading }: PropertyPassportCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#cbd5e1] p-10 shadow-sm flex flex-col items-center justify-center min-h-[540px]">
        <div className="w-8 h-8 border-3 border-[#0b2545] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-600 font-semibold">Retrieving Official Property Passport from Land Rail...</p>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-[#cbd5e1] p-10 text-center min-h-[540px] flex flex-col items-center justify-center">
        <FileText className="w-12 h-12 text-slate-300 mb-3" />
        <h4 className="text-sm font-bold text-[#0b2545]">Select a Cadastral Plot</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
          Click on any survey polygon on the cadastral map to inspect its statutory Land DPI Property Passport certificate.
        </p>
      </div>
    );
  }

  const isClean = passport.title_verified && !passport.active_court_stay && passport.active_mortgage_count === 0;

  return (
    <div className="bg-white rounded-lg border border-[#cbd5e1] shadow-sm overflow-hidden flex flex-col min-h-[540px] gov-seal-watermark">
      {/* Official Certificate Header */}
      <div className="bg-[#0b2545] text-white p-4 border-b-2 border-[#d9381e]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-emerald-300">
              <Award className="w-3.5 h-3.5" />
              <span>National Land DPI Standard Asset Certificate</span>
            </div>
            <h3 className="text-lg font-bold font-mono tracking-tight text-white mt-1">
              {passport.ulpin}
            </h3>
            <div className="flex items-center space-x-3 text-[11px] text-slate-300 mt-1 font-mono">
              <span>Asset: <strong className="text-white">{passport.asset_id}</strong></span>
              <span>•</span>
              <span>Version: <strong className="text-emerald-300">v{passport.version}</strong></span>
              <span>•</span>
              <span>Status: <strong className="text-white">{passport.status}</strong></span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            {isClean ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#107c41] text-white text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Title Clear</span>
              </span>
            ) : passport.active_court_stay ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#d9381e] text-white text-[11px] font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>Court Injunction</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#d97706] text-white text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Hypothecated</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Body (Government High-Density Grid) */}
      <div className="p-4 space-y-3.5 flex-1 text-xs relative z-10">
        {/* Core Attributes */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#f8fafc] p-2.5 rounded border border-slate-200">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Cadastral Survey Area</span>
            <span className="text-sm font-bold font-mono text-[#0b2545]">
              {passport.area_sq_meters.toLocaleString()} sq. meters
            </span>
          </div>

          <div className="bg-[#f8fafc] p-2.5 rounded border border-slate-200">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Statutory Land Use</span>
            <span className="text-xs font-bold text-[#0b2545]">
              {passport.land_use} (FAR 1.75)
            </span>
          </div>
        </div>

        {/* Freehold Ownership Record */}
        <div className="border border-slate-200 rounded p-2.5 bg-[#fdfefe]">
          <span className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">
            Registered Freehold Ownership (RoR / Patta)
          </span>
          <div className="text-xs font-bold text-[#0b2545]">
            {passport.current_owners.join(", ") || "Government Land (Unassigned)"}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Share Fraction: 1/1 • Issuing Authority: Sub-Registrar Sohna
          </div>
        </div>

        {/* Alerts / Injunctions Banner */}
        {passport.active_court_stay && (
          <div className="bg-[#fef2f2] border border-[#fca5a5] rounded p-2.5 text-[#991b1b] flex items-start space-x-2">
            <Scale className="w-4 h-4 text-[#d9381e] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-[11.5px]">Active Judicial Injunction Registered</strong>
              <span className="text-[11px] leading-tight">
                Case: {passport.active_disputes[0]?.case_number} ({passport.active_disputes[0]?.adjudicating_authority}).
                All sales and mortgages are strictly frozen by the Rule Engine.
              </span>
            </div>
          </div>
        )}

        {passport.active_mortgage_count > 0 && (
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded p-2.5 text-[#92400e] flex items-start space-x-2">
            <Landmark className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-[11.5px]">Institutional Charge Hypothecated</strong>
              <span className="text-[11px] leading-tight">
                First charge registered by {passport.encumbrances[0]?.institution_name} for{" "}
                INR {passport.encumbrances[0]?.claim_amount_inr?.toLocaleString() || "N/A"}.
              </span>
            </div>
          </div>
        )}

        {/* Cryptographic Ledger Proof */}
        <div className="bg-[#f8fafc] border border-slate-200 rounded p-2.5 font-mono text-[10.5px]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-[#0b2545]" />
              <span>Permissioned Ledger Root Hash</span>
            </span>
            <span className="text-[#107c41]">
              {passport.tamper_verified ? "TAMPER-VERIFIED ✓" : "TAMPER DETECTED ✗"}
            </span>
          </div>
          <div className="truncate text-slate-700 bg-white p-1.5 rounded border border-slate-200 font-mono text-[10px]">
            {passport.ledger_root_hash}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Last Event: <strong className="text-slate-800">{passport.last_state_transition}</strong>
          </div>
        </div>
      </div>

      {/* Government Action Bar */}
      <div className="bg-[#f8fafc] border-t border-[#cbd5e1] p-3 grid grid-cols-2 gap-2 text-xs">
        <Link
          href={`/bank-simulator?ulpin=${encodeURIComponent(passport.ulpin)}`}
          className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded bg-[#0b2545] hover:bg-[#134074] text-white font-bold transition-colors shadow-xs text-center"
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Bank Title Check</span>
        </Link>

        <Link
          href={`/court-registry?ulpin=${encodeURIComponent(passport.ulpin)}`}
          className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded bg-white hover:bg-slate-50 text-[#0b2545] border border-[#0b2545] font-bold transition-colors shadow-xs text-center"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Enforce Injunction</span>
        </Link>
      </div>
    </div>
  );
}
