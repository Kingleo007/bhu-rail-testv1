"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { executeTransfer, fileDispute } from "@/lib/api";
import { 
  ShieldAlert, 
  Scale, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  FileText,
  Gavel,
  AlertTriangle
} from "lucide-react";

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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Official Judicial Header Banner */}
      <div className="bg-white border border-[#cbd5e1] rounded-lg p-6 shadow-xs">
        <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#0b2545] mb-2">
          <Gavel className="w-4 h-4 text-[#d9381e]" />
          <span>e-Courts Enforcement Rail • Section 52 Transfer of Property Act (Lis Pendens)</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#0b2545] tracking-tight">
          Judicial Injunction Enforcement & Fraud Interception
        </h1>
        <p className="mt-1 text-xs text-slate-600 max-w-3xl leading-relaxed">
          Demonstrating automated fraud interception. When a Revenue Court or Civil Tribunal issues an injunction, Bhu-Rail registers the stay directly on the parcel asset. Subsequent transfer requests are <strong>blocked at the API rail</strong>, citing the court order in milliseconds.
        </p>
      </div>

      {/* Part A: Attempt Transfer on Court-Stayed Plot */}
      <div className="bg-white border border-[#cbd5e1] rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
          <Lock className="w-4 h-4 text-[#d9381e]" />
          <h2 className="text-sm font-bold text-[#0b2545] uppercase tracking-wider">
            Test Case A: Attempt Transfer on Court-Stayed Parcel (e.g. Khasra 104)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Target Parcel ULPIN
            </label>
            <input
              type="text"
              value={targetUlpin}
              onChange={(e) => setTargetUlpin(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded font-mono text-slate-900 focus:outline-none focus:border-[#0b2545]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Purchaser Legal Name
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded text-slate-900 focus:outline-none focus:border-[#0b2545]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Sale Consideration (INR)
            </label>
            <input
              type="text"
              value={consideration}
              onChange={(e) => setConsideration(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded font-mono text-slate-900 focus:outline-none focus:border-[#0b2545]"
            />
          </div>
        </div>

        <button
          onClick={handleAttemptTransfer}
          disabled={transferLoading}
          className="w-full py-2.5 bg-[#d9381e] hover:bg-[#b91c1c] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center space-x-2 shadow-xs"
        >
          {transferLoading ? (
            <span>Evaluating Transaction against DPI Rule Engine...</span>
          ) : (
            <>
              <AlertOctagon className="w-4 h-4" />
              <span>Submit Transfer Deed to Sub-Registrar Rail</span>
            </>
          )}
        </button>

        {/* Transfer Result Banner */}
        {transferStatus && (
          <div
            className={`p-4 rounded border ${
              transferStatus.status === "REJECTED"
                ? "bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]"
                : "bg-[#f0fdf4] border-[#86efac] text-[#166534]"
            }`}
          >
            <div className="flex items-start space-x-3.5">
              {transferStatus.status === "REJECTED" ? (
                <ShieldAlert className="w-6 h-6 text-[#d9381e] flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#107c41] flex-shrink-0 mt-0.5" />
              )}

              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/10">
                    {transferStatus.status === "REJECTED" ? "TRANSACTION BLOCKED BY RULE ENGINE" : "COMMITTED TO LEDGER"}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Tx ID: {transferStatus.transaction_record?.transaction_id}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900">
                  {transferStatus.message}
                </div>

                {transferStatus.transaction_record?.rule_violations && (
                  <div className="bg-white p-2.5 rounded border border-red-200 text-slate-800 text-[11px] font-mono space-y-1">
                    <strong className="text-[#d9381e] block">Rule Engine Interception Details:</strong>
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
      <div className="bg-white border border-[#cbd5e1] rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
          <Scale className="w-4 h-4 text-[#0b2545]" />
          <h2 className="text-sm font-bold text-[#0b2545] uppercase tracking-wider">
            Test Case B: Judicial Console — Issue Interim Injunction on Any Parcel
          </h2>
        </div>

        <p className="text-xs text-slate-600">
          Simulate a Revenue Court or Civil Judge issuing a stay order on a clean plot (e.g. Khasra 101). Once submitted, attempt to transfer Khasra 101 to verify it becomes immediately locked.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target ULPIN</label>
            <input
              type="text"
              value={dispUlpin}
              onChange={(e) => setDispUlpin(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Court Case Number</label>
            <input
              type="text"
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Adjudicating Authority</label>
            <input
              type="text"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Petitioner Name</label>
            <input
              type="text"
              value={petitioner}
              onChange={(e) => setPetitioner(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded text-slate-900"
            />
          </div>
        </div>

        <button
          onClick={handleInjectInjunction}
          disabled={disputeLoading}
          className="w-full py-2.5 bg-[#0b2545] hover:bg-[#134074] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center space-x-2 shadow-xs"
        >
          {disputeLoading ? (
            <span>Signing Judicial Stay Order to Ledger...</span>
          ) : (
            <>
              <Scale className="w-4 h-4" />
              <span>Record Injunction Order in Land DPI Core</span>
            </>
          )}
        </button>

        {disputeSuccessMsg && (
          <div className="bg-[#f0fdf4] border border-[#86efac] rounded p-3 text-[#14532d] text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#107c41] flex-shrink-0" />
            <div className="font-bold">{disputeSuccessMsg}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourtRegistryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading Judicial Registry Console...</div>}>
      <CourtRegistryContent />
    </Suspense>
  );
}
