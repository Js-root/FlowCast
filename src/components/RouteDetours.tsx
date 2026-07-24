import React from 'react';
import { RouteOption } from '../types';
import { RouteCard } from './RouteCard';
import { TrendingUp, ChevronRight } from 'lucide-react';

interface RouteDetoursProps {
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRouteId: (id: string) => void;
  onDeployRoute: (route: RouteOption) => void;
  onNavigateToRoutePlanner: () => void;
}

export const RouteDetours: React.FC<RouteDetoursProps> = ({
  routes,
  selectedRouteId,
  onSelectRouteId,
  onDeployRoute,
  onNavigateToRoutePlanner,
}) => {
  return (
    <div className="bg-white border border-[#1A1A1A]/15 p-4 flex flex-col gap-3 shadow-sm select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] font-serif flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#D93B2D]" />
          <span>Route Detours</span>
        </span>
        <button
          onClick={onNavigateToRoutePlanner}
          className="text-[11px] font-mono font-bold text-[#D93B2D] hover:underline flex items-center gap-0.5 cursor-pointer border-none bg-transparent"
        >
          <span>Planner</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <p className="text-[11px] text-[#1A1A1A]/60 font-sans leading-tight">
        AI-optimized detour paths with predicted travel times & bottlenecks.
      </p>

      {/* Routes List */}
      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        {routes.length === 0 ? (
          <div className="text-xs text-[#1A1A1A]/50 font-mono py-8 text-center bg-gray-50 border border-dashed border-[#1A1A1A]/10">
            Select an incident to view alternative routes.
          </div>
        ) : (
          routes.map((rt) => (
            <RouteCard
              key={rt.id}
              route={rt}
              isSelected={selectedRouteId === rt.id}
              onSelect={() => onSelectRouteId(rt.id)}
              onDeploy={(e) => {
                e.stopPropagation();
                onDeployRoute(rt);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
