"use client";

import Link from "next/link";
import { PropertyPassport } from "@/lib/api";
import { ShieldCheck, AlertTriangle, Landmark, Scale, FileText, CheckCircle2, XCircle, ArrowRight, Hash } from "lucide-react";

interface PropertyPassportCardProps {
  passport: PropertyPassport | null;
  loading: boolean;
}

export default function PropertyPassportCard({ passport, loading }: PropertyPassportCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[480px]">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-slate-500 font-medium">Fetching Canonical Property Passport...</p>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center min-h-[480px] flex flex-col items-center justify-center">
        <FileText className="w-12 h-12 text-slate-300 mb-3" />
        <h4 className="text-base font-semibold text-slate-700">No Parcel Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Click on any parcel on the cadastral map to inspect its standardized Land DPI Property Passport.
        </p>
      </div>
    );
  }

  const isClean = passport.title_verified && !passport.active_court_stay && passport.active_mortgage_count === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Standardized Property Passport
            </span>
            <h3 className="text-xl font-bold font-mono tracking-tight mt-1 text-white">
              {passport.ulpin}
            </h3>
            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
              <span>Asset ID: <strong className="text-slate-200 font-mono">{passport.asset_id}</strong></span>
              <span>•</span>
              <span>Version: <strong className="text-emerald-400 font-mono">v{passport.version}</strong></span>
              <span>•</span>
              <span>Status: <strong className="text-slate-200">{passport.status}</strong></span>
            </div>
          </div>

          <div className="text-right">
            {isClean ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Title Clean</span>
              </span>
            ) : passport.active_court_stay ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Court Injunction</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Encumbered</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Passport Body */}
      <div className="p-5 space-y-4 flex-1">
        {/* Core Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block">Survey Area</span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {passport.area_sq_meters.toLocaleString()} m²
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block">Permissible Zoning</span>
            <span className="text-sm font-semibold text-slate-800">
              {passport.land_use}
            </span>
          </div>
        </div>

        {/* Current Ownership */}
        <div className="border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Registered Freehold Ownership
          </div>
          <div className="text-sm font-bold text-slate-900">
            {passport.current_owners.join(", ") || "No Active Freehold Right"}
          </div>
        </div>

        {/* Encumbrances & Court Disputes Alerts */}
        {passport.active_court_stay && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900 flex items-start space-x-2.5">
            <Scale className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Active Judicial Stay Injunction</strong>
              <span>
                {passport.active_disputes[0]?.case_number} by {passport.active_disputes[0]?.adjudicating_authority}.
                All property sales and mortgages are strictly frozen by the Rule Engine.
              </span>
            </div>
          </div>
        )}

        {passport.active_mortgage_count > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start space-x-2.5">
            <Landmark className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Registered Institutional Mortgage</strong>
              <span>
                First-charge lien held by {passport.encumbrances[0]?.institution_name} for{" "}
                INR {passport.encumbrances[0]?.claim_amount_inr?.toLocaleString() || "N/A"}.
              </span>
            </div>
          </div>
        )}

        {/* Cryptographic Trust Stamp */}
        <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-xs font-mono border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            <span className="flex items-center space-x-1">
              <Hash className="w-3 h-3 text-emerald-400" />
              <span>Permissioned Ledger Fingerprint</span>
            </span>
            <span className="text-emerald-400 font-semibold">
              {passport.tamper_verified ? "TAMPER-VERIFIED ✓" : "WARNING: TAMPER DETECTED ✗"}
            </span>
          </div>
          <div className="truncate text-slate-300 font-mono text-[11px]">
            {passport.ledger_root_hash}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Last Transition Event: <strong className="text-slate-200">{passport.last_state_transition}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Demo Action Bar */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 grid grid-cols-2 gap-2 text-xs">
        <Link
          href={`/bank-simulator?ulpin=${encodeURIComponent(passport.ulpin)}`}
          className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm text-center"
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Test Bank UPI Rail</span>
        </Link>

        <Link
          href={`/court-registry?ulpin=${encodeURIComponent(passport.ulpin)}`}
          className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors shadow-sm text-center"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Fraud Prevention</span>
        </Link>
      </div>
    </div>
  );
}
