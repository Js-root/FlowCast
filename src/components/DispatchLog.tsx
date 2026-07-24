import React from 'react';
import { DispatchLogEntry } from '../types';
import { Terminal, Clock, Activity } from 'lucide-react';

interface DispatchLogProps {
  logs: DispatchLogEntry[];
}

export const DispatchLog: React.FC<DispatchLogProps> = ({ logs }) => {
  const badgeColors = {
    system: 'bg-gray-100 text-gray-700 border-gray-200',
    alert: 'bg-amber-100 text-amber-700 border-amber-200',
    deploy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="bg-white border border-[#1A1A1A]/15 p-4 flex flex-col gap-3 shadow-sm select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] font-serif flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-emerald-700" />
          <span>Dispatch Log</span>
        </span>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#1A1A1A]/50">
          <Clock className="w-3 h-3 text-[#1A1A1A]/40" />
          <span>Live Ops Ledger</span>
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-[10px] text-[#1A1A1A]/40 text-center py-6 border border-dashed border-[#1A1A1A]/10 bg-gray-50">
            No dispatch records recorded.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 border-b border-gray-100 pb-2.5 last:border-0 last:pb-0"
            >
              {/* Timestamp */}
              <span className="text-[#1A1A1A]/40 text-[10px] font-bold shrink-0 pt-0.5">
                {log.time}
              </span>

              {/* Dot indicator */}
              <div className="flex flex-col gap-1.5 flex-grow">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#1A1A1A] leading-tight text-[11px]">
                    {log.title}
                  </span>
                  <span className={`px-1.5 py-0.2 text-[8px] font-bold border rounded uppercase ${badgeColors[log.type]}`}>
                    {log.type}
                  </span>
                </div>
                
                <p className="text-[10px] text-[#1A1A1A]/60 leading-tight">
                  {log.details}
                </p>

                {log.meta && (
                  <span className="text-[9px] font-bold text-emerald-700 mt-0.5 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 w-fit">
                    {log.meta}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
