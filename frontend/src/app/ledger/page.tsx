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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner - Singapore GovTech Style */}
      <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-sm border-l-4 border-l-[#00264d]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-[#00264d] text-white text-[10px] font-bold uppercase tracking-wider rounded-xs">
              National Cadastral Audit Authority
            </span>
            <span className="text-xs text-slate-500 font-serif italic">
              Public Sector Cryptographic Provenance Registry
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SHA-256 Merkle Verification Active</span>
          </span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#00264d] tracking-tight">
          Permissioned Institutional Audit Ledger & Root-of-Title
        </h1>
        <p className="mt-2 text-xs text-slate-700 leading-relaxed max-w-4xl">
          Complies with National Public Data Trust standard. Bhu-Rail separates heavy spatial vectors from state commitments: raw geometry remains high-performance GeoJSON while state transitions, ULPIN lifecycle hashes, and multi-department cryptographic seals are anchored to this immutable chronological ledger.
        </p>
      </div>

      {/* Real-time Audit Stamp Banner */}
      {audit && (
        <div
          className={`p-4 rounded-sm border flex items-center justify-between shadow-xs ${
            audit.is_valid
              ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
              : "bg-rose-50 border-rose-300 text-rose-950"
          }`}
        >
          <div className="flex items-center space-x-3">
            {audit.is_valid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
            )}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide font-serif">
                {audit.is_valid
                  ? "Ledger Chain Cryptographically Verified • Zero Tamper Detected"
                  : "WARNING: Hash Chain Inconsistency Detected"}
              </h3>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                Verified {audit.verified_blocks} of {audit.total_blocks} state blocks • Genesis-to-Tip Hash: {audit.latest_block_hash.slice(0, 32)}...
              </p>
            </div>
          </div>

          <button
            onClick={loadLedger}
            className="px-3 py-1.5 rounded-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Re-Verify Cryptographic Tip</span>
          </button>
        </div>
      )}

      {/* Ledger Block Stream */}
      <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#00264d]" />
            <h2 className="text-xs font-bold text-[#00264d] uppercase tracking-wider font-serif">
              Immutable Cadastral State Transition Journal
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Total Validated Blocks: {blocks.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-serif">
            Auditing cryptographic chain from genesis block...
          </div>
        ) : (
          <LedgerTimeline blocks={blocks} />
        )}
      </div>
    </div>
  );
}
