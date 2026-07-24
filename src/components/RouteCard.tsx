import React from 'react';
import { RouteOption } from '../types';
import { Sparkles, Route, Check, ShieldAlert } from 'lucide-react';

interface RouteCardProps {
  route: RouteOption;
  isSelected: boolean;
  onSelect: () => void;
  onDeploy: (e: React.MouseEvent) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected,
  onSelect,
  onDeploy,
}) => {
  const riskColors = {
    low: 'text-emerald-700 bg-emerald-50 border-emerald-200/50',
    medium: 'text-[#D97706] bg-[#D97706]/5 border-[#D97706]/20',
    high: 'text-[#D93B2D] bg-[#D93B2D]/5 border-[#D93B2D]/20',
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 border transition-all duration-200 cursor-pointer flex flex-col gap-3 relative overflow-hidden select-none ${
        isSelected
          ? 'bg-[#F2F0EB] border-emerald-600 shadow-md translate-x-1'
          : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 hover:bg-[#FDFDFD]'
      }`}
    >
      {/* Selection Left Bar Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
      )}

      {/* Top Badge & Status */}
      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1">
          {route.isAiRecommended ? (
            <span className="bg-emerald-700 text-white px-2 py-0.5 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-white" />
              <span>AI RECOMMENDED</span>
            </span>
          ) : (
            <span className="bg-gray-700 text-white px-2 py-0.5 flex items-center gap-1 font-semibold">
              <Route className="w-3 h-3" />
              <span>STANDARD PATH</span>
            </span>
          )}
        </span>
        
        {isSelected ? (
          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
            <Check className="w-3.5 h-3.5" />
            <span>ACTIVE ROUTE</span>
          </span>
        ) : (
          <span className="text-[#1A1A1A]/40 font-semibold group-hover:text-[#1A1A1A]/60">
            [Select]
          </span>
        )}
      </div>

      {/* Title & Via Landmarks */}
      <div>
        <h4 className="font-serif font-bold text-sm text-[#1A1A1A] leading-tight">
          {route.name}
        </h4>
        <p className="text-[10px] text-[#1A1A1A]/55 font-mono mt-0.5 truncate">
          Via: {route.viaRoads}
        </p>
      </div>

      {/* Sparkline SVG Visualizer */}
      <div className="h-6 w-full pt-1 border-t border-b border-[#1A1A1A]/10 py-1">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={route.isAiRecommended ? '#047857' : '#D93B2D'}
            strokeWidth="2"
            points={route.sparklineData.map((val, idx) => `${(idx / (route.sparklineData.length - 1)) * 100},${20 - (val / 65) * 18}`).join(' ')}
          />
        </svg>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
        <div>
          <span className="text-[#1A1A1A]/50 block">ETA</span>
          <span className="font-bold text-[#1A1A1A] text-xs">{route.etaMinutes} min</span>
        </div>
        <div>
          <span className="text-[#1A1A1A]/50 block">Saved</span>
          <span className="font-bold text-emerald-700 text-xs">
            {route.savedMinutes > 0 ? `-${route.savedMinutes}m` : '0m'}
          </span>
        </div>
        <div>
          <span className="text-[#1A1A1A]/50 block">Risk</span>
          <span className={`font-bold uppercase text-[9px] px-1 border block text-center mt-0.5 ${riskColors[route.risk]}`}>
            {route.risk}
          </span>
        </div>
        <div>
          <span className="text-[#1A1A1A]/50 block">On-Time</span>
          <span className="font-bold text-emerald-700 text-xs">{route.arrivalProbability}%</span>
        </div>
      </div>

      {/* Deploy Button */}
      {isSelected && (
        <button
          onClick={onDeploy}
          className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold font-mono uppercase tracking-wider py-2 shadow-sm transition-colors cursor-pointer border-none flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deploy AI Route</span>
        </button>
      )}
    </div>
  );
};
