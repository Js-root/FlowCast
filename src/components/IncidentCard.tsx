import React from 'react';
import { Incident } from '../types';
import { ShieldAlert, AlertTriangle, ShieldCheck, MapPin, Layers } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  isSelected: boolean;
  onSelect: () => void;
  forecastMinutes: number;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  isSelected,
  onSelect,
  forecastMinutes,
}) => {
  const isConfirmed = incident.verificationStatus === 'confirmed';
  
  // Calculate adjusted startsIn minutes
  const rawStartsIn = incident.startsInMinutes - forecastMinutes;
  const startsIn = rawStartsIn <= 0 ? 0 : rawStartsIn;

  return (
    <div
      onClick={onSelect}
      className={`p-4 border transition-all duration-200 cursor-pointer flex flex-col gap-2 relative overflow-hidden select-none ${
        isSelected
          ? 'bg-[#F2F0EB] border-[#D93B2D] shadow-md translate-x-1'
          : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 hover:bg-[#FDFDFD]'
      }`}
    >
      {/* Selection Left Bar Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D93B2D]" />
      )}

      {/* Top Badges Row */}
      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1">
          {isConfirmed ? (
            <span className="bg-[#D93B2D] text-white px-2 py-0.5 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>CONFIRMED</span>
            </span>
          ) : (
            <span className="bg-[#D97706] text-white px-2 py-0.5 flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3 h-3 animate-pulse" />
              <span>UNVERIFIED WARNING</span>
            </span>
          )}
        </span>
        <span className="text-xs text-[#D93B2D] font-bold">
          +{incident.delayMinutes}m delay
        </span>
      </div>

      {/* Title & Area */}
      <div>
        <h4 className="font-serif font-bold text-sm text-[#1A1A1A] leading-tight mb-1">
          {incident.title}
        </h4>
        <div className="flex items-center gap-1 text-[11px] text-[#1A1A1A]/60 font-sans">
          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
          <span className="truncate">{incident.area}</span>
        </div>
      </div>

      {/* Middle Stats Section */}
      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[#1A1A1A]/10 text-[10px] font-mono">
        <div>
          <span className="text-[#1A1A1A]/50 block">Starts in</span>
          <span className={`font-bold ${startsIn === 0 ? 'text-[#D93B2D]' : 'text-[#1A1A1A]'}`}>
            {startsIn === 0 ? 'IMMEDIATE' : `${startsIn} min`}
          </span>
        </div>
        <div>
          <span className="text-[#1A1A1A]/50 block">Confidence</span>
          <span className="font-bold text-emerald-700">{incident.confidencePercent}%</span>
        </div>
        <div>
          <span className="text-[#1A1A1A]/50 block">Sources</span>
          <span className="font-bold text-[#1A1A1A]">{incident.sourcesCount} Reports</span>
        </div>
      </div>

      {/* Affected Roads Footer */}
      <div className="flex items-center gap-1.5 text-[9px] text-[#1A1A1A]/60 font-mono pt-1">
        <Layers className="w-3 h-3 text-[#1A1A1A]/40 shrink-0" />
        <span className="truncate">
          Roads: <span className="font-bold text-[#1A1A1A]">{incident.affectedRoads.join(', ')}</span>
        </span>
      </div>
    </div>
  );
};
