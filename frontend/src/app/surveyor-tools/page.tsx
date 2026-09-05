"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { executeSubdivide } from "@/lib/api";
import { Scissors, CheckCircle2, GitFork, ArrowRight, Layers, MapPin } from "lucide-react";

function SurveyorToolsContent() {
  const searchParams = useSearchParams();
  const defaultUlpin = searchParams.get("ulpin") || "IN-HR-GGM-KDP-0108-0000";

  const [parentUlpin, setParentUlpin] = useState(defaultUlpin);
  const [heir1, setHeir1] = useState("Balwant Singh (Elder Son)");
  const [heir2, setHeir2] = useState("Balwant Singh (Younger Son)");
  const [surveyorLic, setSurveyorLic] = useState("SURV-LIC-HR-2024-991");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubdivide = async () => {
    try {
      setLoading(true);
      setResult(null);
      const res = await executeSubdivide({
        parent_ulpin: parentUlpin,
        splitting_line_coordinates: [], // Spatial engine bisects intelligently
        child_owners: [
          { owner_name: heir1, share: "1/1" },
          { owner_name: heir2, share: "1/1" }
        ],
        surveyor_license_no: surveyorLic,
        revenue_officer_approval_id: "REV-APPR-SOHNA-482"
      });
      setResult(res);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Subdivision failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-800/60 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Scissors className="w-4 h-4" />
          <span>Killer Demo #2 • Spatial Subdivision & Parcel Lineage</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          OGC Spatial Engine: Cadastral Partitioning & Genealogy
        </h1>
        <p className="mt-1 text-sm text-slate-300 max-w-3xl">
          Never overwrite history. When a parcel is split, the parent geometry is retired to <code className="bg-slate-800 text-blue-400 px-2 py-0.5 rounded font-mono text-xs">SUBDIVIDED</code>, new child ULPINs are generated, area conservation is mathematically verified, and the full genealogy tree is committed to the ledger.
        </p>
      </div>

      {/* Subdivision Action Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <GitFork className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">
            Configure Cadastral Parcel Partition
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Parent Parcel ULPIN
            </label>
            <input
              type="text"
              value={parentUlpin}
              onChange={(e) => setParentUlpin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Surveyor License Credential
            </label>
            <input
              type="text"
              value={surveyorLic}
              onChange={(e) => setSurveyorLic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Child Parcel 1 Assignee (West Parcel)
            </label>
            <input
              type="text"
              value={heir1}
              onChange={(e) => setHeir1(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Child Parcel 2 Assignee (East Parcel)
            </label>
            <input
              type="text"
              value={heir2}
              onChange={(e) => setHeir2(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleSubdivide}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/40"
        >
          {loading ? (
            <span>Computing Geodesic Polygon Cut & Verifying Area Conservation...</span>
          ) : (
            <>
              <Scissors className="w-4 h-4" />
              <span>Execute Spatial Subdivision on DPI Rail</span>
            </>
          )}
        </button>

        {/* Subdivision Results */}
        {result && (
          <div className="bg-slate-950 border border-blue-600/80 rounded-xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div className="font-bold text-base text-white">
                {result.message}
              </div>
            </div>

            {/* Lineage Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-400 uppercase font-sans font-semibold text-[10px]">
                  Parent Asset (Retired)
                </div>
                <div className="text-white font-bold">{parentUlpin}</div>
                <div className="text-amber-400">Status: SUBDIVIDED</div>
                <div className="text-slate-400 text-[11px]">
                  Parent record preserved immutably in ledger for historical genealogy.
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-400 uppercase font-sans font-semibold text-[10px]">
                  Generated Child ULPINs (Active)
                </div>
                {result.transaction_record?.resulting_ulpins?.map((child: string, i: number) => (
                  <div key={child} className="text-emerald-400 font-bold flex items-center space-x-2">
                    <span className="text-slate-500">Child {i + 1}:</span>
                    <span>{child}</span>
                  </div>
                ))}
                <div className="text-slate-400 text-[11px]">
                  Area conservation verified: Sum(Child Areas) = Parent Area.
                </div>
              </div>
            </div>

            {/* Transaction Steps Record */}
            <div className="border-t border-slate-800 pt-3">
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-2">
                Workflow Audit Execution Steps:
              </div>
              <div className="flex flex-wrap gap-2">
                {result.transaction_record?.completed_steps?.map((step: string) => (
                  <span
                    key={step}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-emerald-400 font-mono"
                  >
                    ✓ {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SurveyorToolsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Surveyor Console...</div>}>
      <SurveyorToolsContent />
    </Suspense>
  );
}
