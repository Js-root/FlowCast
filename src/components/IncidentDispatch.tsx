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
}

export const IncidentDispatch: React.FC<IncidentDispatchProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  forecastMinutes,
  onReloadIncidents,
}) => {
  return (
    <div className="bg-white border border-[#1A1A1A]/15 p-4 flex flex-col gap-3 shadow-sm select-none">
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
      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
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
    </div>
  );
};
