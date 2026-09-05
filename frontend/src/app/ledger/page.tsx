"use client";

import { useEffect, useState } from "react";
import { API_BASE, fetchLedgerAudit } from "@/lib/api";
import LedgerTimeline from "@/components/LedgerTimeline";
import { ShieldCheck, RefreshCw, Hash, Lock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function LedgerPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/v1/ledger/blocks?limit=50`, { cache: "no-store" });
      const data = await res.json();
      setBlocks(data);

      const auditData = await fetchLedgerAudit();
      setAudit(auditData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Hash className="w-4 h-4" />
          <span>Trust & Ledger Layer</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Permissioned SHA-256 Cryptographic Audit Chain
        </h1>
        <p className="mt-1 text-sm text-slate-300 max-w-3xl">
          Not putting raw GIS or PDFs on the blockchain, but anchoring hashes, state transitions, and institutional digital signatures. Guarantees tamper-evidence and independent departmental auditability.
        </p>
      </div>

      {/* Real-time Audit Stamp Banner */}
      {audit && (
        <div
          className={`p-5 rounded-xl border flex items-center justify-between ${
            audit.is_valid
              ? "bg-emerald-950/40 border-emerald-700 text-emerald-200"
              : "bg-rose-950/40 border-rose-700 text-rose-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            {audit.is_valid ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-rose-400 flex-shrink-0" />
            )}
            <div>
              <h3 className="text-sm font-bold">
                {audit.is_valid
                  ? "Ledger Chain Cryptographically Valid & Tamper-Free"
                  : "WARNING: Hash Chain Inconsistency Detected"}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Verified {audit.verified_blocks} of {audit.total_blocks} blocks • Tip: {audit.latest_block_hash.slice(0, 24)}...
              </p>
            </div>
          </div>

          <button
            onClick={loadLedger}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Verify Ledger</span>
          </button>
        </div>
      )}

      {/* Ledger Block Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Chronological State Transition Blocks
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Blocks: {blocks.length}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Auditing cryptographic chain from genesis...
          </div>
        ) : (
          <LedgerTimeline blocks={blocks} />
        )}
      </div>
    </div>
  );
}
