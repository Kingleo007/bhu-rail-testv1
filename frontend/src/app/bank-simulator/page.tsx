"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyTitleStatus, TitleVerificationResponse } from "@/lib/api";
import { 
  Landmark, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  Building,
  FileCheck,
  Award
} from "lucide-react";

function BankSimulatorContent() {
  const searchParams = useSearchParams();
  const initialUlpin = searchParams.get("ulpin") || "IN-HR-GGM-KDP-0101-0000";

  const [ulpin, setUlpin] = useState(initialUlpin);
  const [result, setResult] = useState<TitleVerificationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const handleVerify = async () => {
    try {
      setLoading(true);
      const start = performance.now();
      const res = await verifyTitleStatus(ulpin);
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to query Land UPI verification endpoint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Official Institutional Banner */}
      <div className="bg-white border border-[#cbd5e1] rounded-lg p-6 shadow-xs">
        <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#0b2545] mb-2">
          <Landmark className="w-4 h-4 text-[#107c41]" />
          <span>Institutional Banking Rail • Section 58 Transfer of Property Act</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#0b2545] tracking-tight">
          Land UPI: Real-Time Title & Collateral Appraisal
        </h1>
        <p className="mt-1 text-xs text-slate-600 max-w-3xl leading-relaxed">
          Demonstrating open Digital Public Infrastructure (DPI) in action. Instead of ordering 4-week physical Title Search Reports (TSR) across departmental offices, a lending institution's core banking system calls <code className="bg-slate-100 text-[#0b2545] px-1.5 py-0.5 rounded font-mono text-[11px]">GET /v1/verification/title-status</code> for instant machine-readable clearance.
        </p>
      </div>

      {/* Query Console */}
      <div className="bg-white border border-[#cbd5e1] rounded-lg p-5 shadow-xs space-y-4">
        <label className="block text-xs font-bold text-[#0b2545] uppercase tracking-wider">
          Target Parcel ULPIN (Bhu-Aadhaar)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={ulpin}
            onChange={(e) => setUlpin(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs font-mono text-[#0f172a] focus:outline-none focus:border-[#0b2545]"
            placeholder="Enter 14 or 26-digit ULPIN..."
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            className="px-6 py-2 bg-[#0b2545] hover:bg-[#134074] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            {loading ? (
              <span>Evaluating Land Rail...</span>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Execute Land UPI Check</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Test Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Sample Test Parcels:</span>
          <button
            onClick={() => setUlpin("IN-HR-GGM-KDP-0101-0000")}
            className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-slate-100 text-[#107c41] border border-[#cbd5e1] font-mono text-[11px] font-bold"
          >
            Plot 101 (Clean Freehold)
          </button>
          <button
            onClick={() => setUlpin("IN-HR-GGM-KDP-0102-0000")}
            className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-slate-100 text-[#d97706] border border-[#cbd5e1] font-mono text-[11px] font-bold"
          >
            Plot 102 (Active SBI Mortgage)
          </button>
          <button
            onClick={() => setUlpin("IN-HR-GGM-KDP-0104-0000")}
            className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-slate-100 text-[#d9381e] border border-[#cbd5e1] font-mono text-[11px] font-bold"
          >
            Plot 104 (Court Injunction Stay)
          </button>
        </div>
      </div>

      {/* Verification Result Output */}
      {result && (
        <div className="bg-white border border-[#cbd5e1] rounded-lg overflow-hidden shadow-xs">
          {/* Header Telemetry */}
          <div className="bg-[#f8fafc] px-6 py-2.5 border-b border-[#cbd5e1] flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-[#107c41] font-bold">STATUS 200 OK</span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-[#0b2545]" />
                <span>Response Time: <strong className="text-[#0b2545] font-mono">{latencyMs} ms</strong></span>
              </span>
            </div>
            <div className="font-mono text-[11px]">
              Provenance: <strong className="text-[#107c41]">{result.ledger_audit_status}</strong>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div
              className={`p-4 rounded border flex items-start space-x-3.5 ${
                result.transferrable
                  ? "bg-[#f0fdf4] border-[#86efac] text-[#14532d]"
                  : "bg-[#fef2f2] border-[#fca5a5] text-[#7f1d1d]"
              }`}
            >
              {result.transferrable ? (
                <CheckCircle2 className="w-6 h-6 text-[#107c41] flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-[#d9381e] flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-sm font-bold">
                  {result.transferrable
                    ? "Statutory Clearance: Clear Marketable Title Approved"
                    : "Statutory Disqualification: Mortgage Collateral Blocked by Rule Engine"}
                </h3>
                <p className="text-xs mt-0.5 text-slate-600">
                  {result.transferrable
                    ? "Verified zero prior hypothecations, no judicial injunctions, and registered freehold Patta holder."
                    : `Active statutory restrictions: ${result.active_locks.join(", ") || "Transfer freeze active."}`}
                </p>
              </div>
            </div>

            {/* 4 Boolean Flags Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Registered Ownership</span>
                <div className="flex items-center space-x-1.5 mt-1.5 font-bold">
                  {result.owner_verified ? <CheckCircle2 className="w-4 h-4 text-[#107c41]" /> : <XCircle className="w-4 h-4 text-[#d9381e]" />}
                  <span className="text-slate-900 font-mono">{result.owner_verified ? "VERIFIED" : "UNVERIFIED"}</span>
                </div>
                <div className="text-[10.5px] text-slate-500 mt-1 truncate">
                  {result.current_owners.join(", ") || "None"}
                </div>
              </div>

              <div className="bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Prior Mortgage Lien</span>
                <div className="flex items-center space-x-1.5 mt-1.5 font-bold">
                  {!result.active_mortgage ? <CheckCircle2 className="w-4 h-4 text-[#107c41]" /> : <AlertTriangle className="w-4 h-4 text-[#d97706]" />}
                  <span className="text-slate-900 font-mono">{result.active_mortgage ? "ACTIVE LIEN" : "CLEAR"}</span>
                </div>
                <div className="text-[10.5px] text-slate-500 mt-1">
                  {result.active_mortgage ? "Prior bank mortgage exists" : "Zero financial encumbrances"}
                </div>
              </div>

              <div className="bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Judicial Injunction</span>
                <div className="flex items-center space-x-1.5 mt-1.5 font-bold">
                  {!result.active_court_restriction ? <CheckCircle2 className="w-4 h-4 text-[#107c41]" /> : <XCircle className="w-4 h-4 text-[#d9381e]" />}
                  <span className="text-slate-900 font-mono">{result.active_court_restriction ? "ACTIVE STAY" : "CLEAR"}</span>
                </div>
                <div className="text-[10.5px] text-slate-500 mt-1">
                  {result.active_court_restriction ? "Judicial status quo in place" : "No pending litigation"}
                </div>
              </div>

              <div className="bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Zoning Use</span>
                <div className="text-slate-900 font-mono font-bold mt-1.5">
                  {result.land_use_category}
                </div>
                <div className="text-[10.5px] text-slate-500 mt-1">
                  Permissible Development
                </div>
              </div>
            </div>

            {/* Standard Machine-Readable Payload */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Standardized Land UPI Machine-Readable Payload (JSON)
              </span>
              <pre className="bg-[#0b2545] p-3.5 rounded text-[11px] font-mono text-emerald-300 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BankSimulatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading Land UPI Banking Rail...</div>}>
      <BankSimulatorContent />
    </Suspense>
  );
}
