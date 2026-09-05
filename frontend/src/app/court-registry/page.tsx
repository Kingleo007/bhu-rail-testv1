"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { executeTransfer, fileDispute } from "@/lib/api";
import { ShieldAlert, Scale, AlertOctagon, CheckCircle2, ArrowRight, Lock, FileText } from "lucide-react";

function CourtRegistryContent() {
  const searchParams = useSearchParams();
  const defaultUlpin = searchParams.get("ulpin") || "IN-HR-GGM-KDP-0104-0000";

  // Transfer simulation state
  const [targetUlpin, setTargetUlpin] = useState(defaultUlpin);
  const [buyerName, setBuyerName] = useState("Vikas Oberoi");
  const [consideration, setConsideration] = useState("7500000");
  const [transferStatus, setTransferStatus] = useState<any>(null);
  const [transferLoading, setTransferLoading] = useState(false);

  // Dispute injection state
  const [dispUlpin, setDispUlpin] = useState("IN-HR-GGM-KDP-0101-0000");
  const [caseNo, setCaseNo] = useState("CIVIL/GGM/2026/891");
  const [authority, setAuthority] = useState("Civil Court Gurugram (Senior Division)");
  const [petitioner, setPetitioner] = useState("Anand Swaroop & Co-heirs");
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeSuccessMsg, setDisputeSuccessMsg] = useState<string | null>(null);

  const handleAttemptTransfer = async () => {
    try {
      setTransferLoading(true);
      setTransferStatus(null);
      const res = await executeTransfer({
        ulpin: targetUlpin,
        seller_identity_hash: "sha256:current_seller_hash",
        buyer_name: buyerName,
        buyer_identity_hash: "sha256:vikas_oberoi_aadhaar_hash",
        sale_consideration_inr: parseFloat(consideration) || 5000000,
        deed_doc_hash: "sha256:deed_document_digital_hash_9912"
      });
      setTransferStatus(res);
    } catch (err: any) {
      console.error(err);
      alert("Transfer request failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleInjectInjunction = async () => {
    try {
      setDisputeLoading(true);
      setDisputeSuccessMsg(null);
      const res = await fileDispute({
        ulpin: dispUlpin,
        case_number: caseNo,
        adjudicating_authority: authority,
        petitioner: petitioner,
        respondent: "Current Freehold Owner",
        claimed_area_sq_meters: 250.0,
        stay_order_doc_hash: "sha256:court_stay_signed_order_2026",
        freeze_transfer: true,
        freeze_mortgage: true
      });
      setDisputeSuccessMsg(res.message);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to register court dispute");
    } finally {
      setDisputeLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border border-rose-800/60 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Killer Demo #1 • Fraud Prevention & Judicial Injunction</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Cryptographic Fraud Interception via Rule Engine
        </h1>
        <p className="mt-1 text-sm text-slate-300 max-w-3xl">
          In legacy systems, sellers frequently sell land under court stay by exploiting paper silos. Under Bhu-Rail DPI, when a court issues an injunction, it is committed to the Land Asset Core. Any subsequent transfer or mortgage request is <strong>instantly blocked and rejected</strong> with the judicial citation.
        </p>
      </div>

      {/* Part A: Attempt Fraudulent Transfer on Court-Stayed Parcel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <Lock className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white">
            Scenario A: Attempt Transfer on Court-Stayed Plot (e.g. Plot 104)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Target Parcel ULPIN
            </label>
            <input
              type="text"
              value={targetUlpin}
              onChange={(e) => setTargetUlpin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Intended Buyer
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Sale Consideration (INR)
            </label>
            <input
              type="text"
              value={consideration}
              onChange={(e) => setConsideration(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <button
          onClick={handleAttemptTransfer}
          disabled={transferLoading}
          className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg shadow-rose-900/40"
        >
          {transferLoading ? (
            <span>Evaluating Transaction against DPI Rule Engine...</span>
          ) : (
            <>
              <AlertOctagon className="w-4 h-4" />
              <span>Submit Transfer to Sub-Registrar Rail</span>
            </>
          )}
        </button>

        {/* Transfer Result Banner */}
        {transferStatus && (
          <div
            className={`p-5 rounded-xl border animate-fadeIn ${
              transferStatus.status === "REJECTED"
                ? "bg-rose-950/60 border-rose-600 text-rose-100"
                : "bg-emerald-950/60 border-emerald-600 text-emerald-100"
            }`}
          >
            <div className="flex items-start space-x-4">
              {transferStatus.status === "REJECTED" ? (
                <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              )}

              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded">
                    {transferStatus.status === "REJECTED" ? "TRANSACTION BLOCKED" : "TRANSACTION COMMITTED"}
                  </span>
                  <span className="font-mono text-xs opacity-75">
                    Tx ID: {transferStatus.transaction_record?.transaction_id}
                  </span>
                </div>

                <div className="text-base font-extrabold leading-snug">
                  {transferStatus.message}
                </div>

                {transferStatus.transaction_record?.rule_violations && (
                  <div className="bg-black/30 p-3 rounded-lg text-xs space-y-1 font-mono text-rose-300">
                    <div className="text-[10px] text-rose-400 font-sans uppercase font-bold tracking-wider">
                      Rule Engine Interception Details:
                    </div>
                    {transferStatus.transaction_record.rule_violations.map((v: string, i: number) => (
                      <div key={i}>{v}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Part B: Inject Court Stay on any parcel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <Scale className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Scenario B: Judicial Console — Issue Interim Injunction on Any Parcel
          </h2>
        </div>

        <p className="text-xs text-slate-400">
          Simulate a Revenue Court or District Magistrate issuing a stay order on a clean plot (e.g. Plot 101). Once submitted, test transferring Plot 101 to verify it becomes immediately frozen.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Target ULPIN
            </label>
            <input
              type="text"
              value={dispUlpin}
              onChange={(e) => setDispUlpin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Court Case Number
            </label>
            <input
              type="text"
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Adjudicating Authority
            </label>
            <input
              type="text"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Petitioner Name
            </label>
            <input
              type="text"
              value={petitioner}
              onChange={(e) => setPetitioner(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <button
          onClick={handleInjectInjunction}
          disabled={disputeLoading}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-900/40"
        >
          {disputeLoading ? (
            <span>Signing Judicial Stay Order to Ledger...</span>
          ) : (
            <>
              <Scale className="w-4 h-4" />
              <span>Commit Injunction Order to Land DPI Ledger</span>
            </>
          )}
        </button>

        {disputeSuccessMsg && (
          <div className="bg-amber-950/60 border border-amber-600 rounded-xl p-4 text-amber-200 text-xs flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="font-semibold">{disputeSuccessMsg}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourtRegistryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Judicial Console...</div>}>
      <CourtRegistryContent />
    </Suspense>
  );
}
