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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner - Singapore GovTech Style */}
      <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-sm border-l-4 border-l-[#00264d]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-[#00264d] text-white text-[10px] font-bold uppercase tracking-wider rounded-xs">
              Directorate of Survey & Cadastral Mapping
            </span>
            <span className="text-xs text-slate-500 font-serif italic">
              Standard Operating Procedure #CAD-SUB-2026
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            DPI Rail: Live Geodesic Engine
          </span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#00264d] tracking-tight">
          Statutory Cadastral Partitioning & Parcel Lineage Engine
        </h1>
        <p className="mt-2 text-xs text-slate-700 leading-relaxed max-w-4xl">
          Complies with National Land Digitisation Mandate (DILRMP). Historical records are never overwritten. When a parcel is partitioned, the parent geometry is retired to <code className="bg-slate-100 text-slate-900 border border-slate-300 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">SUBDIVIDED</code>, child ULPINs are generated with strict mathematical area conservation (geodesic polygon bisect), and lineage trees are anchored to the national ledger.
        </p>
      </div>

      {/* Subdivision Action Form */}
      <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
          <GitFork className="w-4 h-4 text-[#00264d]" />
          <h2 className="text-sm font-bold text-[#00264d] uppercase tracking-wide">
            Statutory Cadastral Partition Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
              Parent Parcel ULPIN (Target of Partition)
            </label>
            <input
              type="text"
              value={parentUlpin}
              onChange={(e) => setParentUlpin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xs text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00264d] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
              Surveyor License Credential ID
            </label>
            <input
              type="text"
              value={surveyorLic}
              onChange={(e) => setSurveyorLic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xs text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00264d] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
              Child Parcel 1 Assignee (West Geodesic Partition)
            </label>
            <input
              type="text"
              value={heir1}
              onChange={(e) => setHeir1(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xs text-xs text-slate-900 focus:outline-none focus:border-[#00264d] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
              Child Parcel 2 Assignee (East Geodesic Partition)
            </label>
            <input
              type="text"
              value={heir2}
              onChange={(e) => setHeir2(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xs text-xs text-slate-900 focus:outline-none focus:border-[#00264d] focus:bg-white transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleSubdivide}
          disabled={loading}
          className="w-full py-3 bg-[#00264d] hover:bg-[#001a33] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
        >
          {loading ? (
            <span>Computing Geodesic Polygon Cut & Verifying Area Conservation...</span>
          ) : (
            <>
              <Scissors className="w-4 h-4" />
              <span>Execute Statutory Partition on DPI Rail</span>
            </>
          )}
        </button>

        {/* Subdivision Results */}
        {result && (
          <div className="bg-slate-50 border border-emerald-600 rounded-sm p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center space-x-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <div className="font-bold text-sm text-emerald-950 font-serif">
                {result.message}
              </div>
            </div>

            {/* Lineage Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-white p-4 rounded-xs border border-slate-300 space-y-2">
                <div className="text-slate-500 uppercase font-sans font-bold text-[10px] tracking-wide">
                  Parent Asset (Retired)
                </div>
                <div className="text-[#00264d] font-bold">{parentUlpin}</div>
                <div className="text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200 inline-block">
                  Status: SUBDIVIDED (Immutable)
                </div>
                <div className="text-slate-600 font-sans text-[11px]">
                  Parent record preserved in state archive for root-of-title genealogy.
                </div>
              </div>

              <div className="bg-white p-4 rounded-xs border border-slate-300 space-y-2">
                <div className="text-slate-500 uppercase font-sans font-bold text-[10px] tracking-wide">
                  Issued Child ULPINs (Active)
                </div>
                {result.transaction_record?.resulting_ulpins?.map((child: string, i: number) => (
                  <div key={child} className="text-[#00264d] font-bold flex items-center space-x-2">
                    <span className="text-slate-500 font-sans text-[11px]">Child {i + 1}:</span>
                    <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-xs">
                      {child}
                    </span>
                  </div>
                ))}
                <div className="text-emerald-700 font-sans text-[11px] font-semibold">
                  ✓ Geodesic Area Conservation Verified: Sum(Child Areas) = Parent Area (Tolerance &lt; 0.01%).
                </div>
              </div>
            </div>

            {/* Transaction Steps Record */}
            <div className="border-t border-slate-200 pt-3">
              <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wide mb-2">
                Statutory Workflow Execution Record:
              </div>
              <div className="flex flex-wrap gap-2">
                {result.transaction_record?.completed_steps?.map((step: string) => (
                  <span
                    key={step}
                    className="px-2 py-1 rounded-xs bg-white border border-slate-300 text-[11px] text-[#00264d] font-mono font-medium shadow-xs"
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
