"use client";

import { Hash, CheckCircle2, ShieldAlert } from "lucide-react";

interface LedgerBlock {
  index: number;
  timestamp: string;
  ulpin: string;
  transaction_id: string;
  event_type: string;
  previous_hash: string;
  payload_hash: string;
  state_after_transition_hash: string;
  department_signatures: Record<string, string>;
  block_hash: string;
}

interface LedgerTimelineProps {
  blocks: LedgerBlock[];
}

export default function LedgerTimeline({ blocks }: LedgerTimelineProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs">
        No state transition blocks recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((b, idx) => (
        <div
          key={b.block_hash}
          className="relative pl-6 pb-4 border-l-2 border-emerald-500/40 last:border-l-0 last:pb-0"
        >
          {/* Timeline bullet */}
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[11px] font-bold text-emerald-400">
                Block #{b.index} • {b.event_type}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(b.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-300 space-y-1">
              <div className="truncate">
                <span className="text-slate-500">Block Hash: </span>
                <span className="text-slate-200">{b.block_hash}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-500">Prev Hash: </span>
                <span className="text-slate-400">{b.previous_hash}</span>
              </div>
              <div>
                <span className="text-slate-500">Tx ID: </span>
                <span className="text-slate-300 font-semibold">{b.transaction_id}</span>
              </div>
            </div>

            {/* Department Signatures */}
            {Object.keys(b.department_signatures).length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                {Object.entries(b.department_signatures).map(([dept, sig]) => (
                  <span
                    key={dept}
                    className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-[10px] text-emerald-300 font-mono"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{dept}: {sig}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
