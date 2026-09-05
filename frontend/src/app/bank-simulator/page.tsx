"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyTitleStatus, TitleVerificationResponse } from "@/lib/api";
import { Landmark, CheckCircle2, XCircle, Clock, Zap, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

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
      {/* Header & DPI Context */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/60 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Zap className="w-4 h-4" />
          <span>Killer Demo #3 • Land UPI in Action</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Third-Party Banking Rail: Instant Collateral Appraisal
        </h1>
        <p className="mt-1 text-sm text-slate-300 max-w-3xl">
          Demonstrating that Bhu-Rail is not an internal government app, but an open Digital Public Infrastructure (DPI). A commercial bank app calls <code className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono text-xs">GET /v1/verification/title-status</code> and receives clean, instantaneous boolean verification flags in sub-100ms.
        </p>
      </div>

      {/* Input Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Target Parcel ULPIN for Collateral Verification
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={ulpin}
            onChange={(e) => setUlpin(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            placeholder="Enter ULPIN..."
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/30"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Querying DPI Rail...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Verify via Land UPI</span>
              </>
            )}
          </button>
        </div>

        {/* Quick select presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
          <span>Test Preset Scenarios:</span>
          <button
            onClick={() => setUlpin("IN-HR-GGM-KDP-0101-0000")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-mono text-[11px]"
          >
            Plot 101 (Clean Freehold)
          </button>
          <button
            onClick={() => setUlpin("IN-HR-GGM-KDP-0102-0000")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-mono text-[11px]"
          >
            Plot 102 (Active SBI Mortgage)
          </button>
          <button
            onClick={() => setUlpin("IN-HR-GGM-KDP-0104-0000")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 font-mono text-[11px]"
          >
            Plot 104 (Court Stay Freezed)
          </button>
        </div>
      </div>

      {/* Verification Result Output */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl animate-fadeIn">
          {/* Top API Telemetry Header */}
          <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-emerald-400 font-bold">API 200 OK</span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Latency: <strong className="text-white font-mono">{latencyMs} ms</strong></span>
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              Audit Status: <strong className="text-emerald-400">{result.ledger_audit_status}</strong>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Big Status Banner */}
            <div
              className={`p-5 rounded-xl border flex items-start space-x-4 ${
                result.transferrable
                  ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
                  : "bg-rose-950/40 border-rose-800/80 text-rose-200"
              }`}
            >
              {result.transferrable ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-lg font-bold">
                  {result.transferrable
                    ? "✓ Collateral Appraisal Approved (Clear Marketable Title)"
                    : "✗ Collateral Blocked by Land DPI Rule Engine"}
                </h3>
                <p className="text-xs mt-1 text-slate-300">
                  {result.transferrable
                    ? "No active court stays, no conflicting financial encumbrances, and verified registered freehold title."
                    : `Active restrictions detected: ${result.active_locks.join(", ") || "Transfer freeze in place."}`}
                </p>
              </div>
            </div>

            {/* Boolean Decision Flags Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Flag 1 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Owner Verified</span>
                <div className="flex items-center space-x-2 mt-2">
                  {result.owner_verified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className="text-sm font-bold text-white font-mono">
                    {result.owner_verified ? "TRUE" : "FALSE"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {result.current_owners.join(", ") || "None"}
                </div>
              </div>

              {/* Flag 2 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Active Mortgage</span>
                <div className="flex items-center space-x-2 mt-2">
                  {!result.active_mortgage ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="text-sm font-bold text-white font-mono">
                    {result.active_mortgage ? "TRUE (LIEN)" : "FALSE (CLEAR)"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {result.active_mortgage ? "Prior bank mortgage exists" : "Zero financial burdens"}
                </div>
              </div>

              {/* Flag 3 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Court Injunction</span>
                <div className="flex items-center space-x-2 mt-2">
                  {!result.active_court_restriction ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className="text-sm font-bold text-white font-mono">
                    {result.active_court_restriction ? "ACTIVE STAY" : "CLEAR"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {result.active_court_restriction ? "Judicial freeze active" : "No pending litigation"}
                </div>
              </div>

              {/* Flag 4 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Zoning Classification</span>
                <div className="text-sm font-bold text-emerald-400 mt-2 font-mono">
                  {result.land_use_category}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Permissible Development
                </div>
              </div>
            </div>

            {/* Raw JSON Response from DPI Rail */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Standardized Land UPI Response Payload (JSON)
              </span>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
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
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Land UPI Bank Console...</div>}>
      <BankSimulatorContent />
    </Suspense>
  );
}
