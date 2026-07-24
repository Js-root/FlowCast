import React from 'react';
import { Incident } from '../types';
import { IncidentCard } from './IncidentCard';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface IncidentDispatchProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  forecastMinutes: number;
  onReloadIncidents?: () => void;
  onReportHinglish?: (text: string) => Promise<void>;
}

export const IncidentDispatch: React.FC<IncidentDispatchProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  forecastMinutes,
  onReloadIncidents,
  onReportHinglish,
}) => {
  const [hinglishText, setHinglishText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  return (
    <div className="bg-white border border-[#1A1A1A]/15 p-4 flex flex-col gap-3 shadow-sm select-none flex-1">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] font-serif flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-[#D93B2D]" />
          <span>Incident Dispatch</span>
        </span>
        <div className="flex items-center gap-2">
          {onReloadIncidents && (
            <button
              onClick={onReloadIncidents}
              title="Sync Live Sensors"
              className="p-1 border border-transparent hover:border-gray-200 text-gray-400 hover:text-[#D93B2D] cursor-pointer transition-colors bg-transparent"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] text-white bg-[#D93B2D] px-2 py-0.5 font-mono font-bold">
            ● CRITICAL
          </span>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-2.5 flex-1 min-h-[300px] overflow-y-auto pr-1">
        {incidents.length === 0 ? (
          <div className="text-xs text-[#1A1A1A]/50 font-mono py-8 text-center bg-gray-50 border border-dashed border-[#1A1A1A]/10">
            No active incidents detected.
          </div>
        ) : (
          incidents.map((inc) => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              isSelected={selectedIncidentId === inc.id}
              onSelect={() => onSelectIncident(inc.id)}
              forecastMinutes={forecastMinutes}
            />
          ))
        )}
      </div>

      {/* Hinglish Report Input */}
      {onReportHinglish && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!hinglishText.trim() || submitting) return;
            setSubmitting(true);
            try {
              await onReportHinglish(hinglishText);
              setHinglishText('');
            } catch (err) {
              console.error(err);
            } finally {
              setSubmitting(false);
            }
          }}
          className="pt-2 border-t border-[#1A1A1A]/10 mt-1 flex flex-col gap-1.5"
        >
          <div className="text-[9px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
            💡 Hinglish AI Report Ingest
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={hinglishText}
              onChange={(e) => setHinglishText(e.target.value)}
              disabled={submitting}
              placeholder="e.g. ito flyover par heavy jam lag gaya h"
              className="flex-grow bg-[#F2F0EB] text-[#1A1A1A] border border-gray-300 px-2 py-1 text-[11px] font-sans outline-none focus:border-emerald-700 transition-colors"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold font-mono px-3 py-1 cursor-pointer border-none uppercase transition-colors shrink-0"
            >
              {submitting ? "..." : "Ingest"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
