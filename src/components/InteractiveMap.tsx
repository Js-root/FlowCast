import React, { useState } from 'react';
import { TrafficNode, Incident } from '../types';
import { AlertTriangle, Zap, Layers } from 'lucide-react';

interface InteractiveMapProps {
  nodes: TrafficNode[];
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  forecastMinutesAhead: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  nodes,
  incidents,
  selectedIncidentId,
  onSelectIncident,
  selectedNodeId,
  onSelectNode,
  forecastMinutesAhead,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState(true);

  // Helper for node status color
  const getNodeColor = (status: string) => {
    switch (status) {
      case 'severe': return '#D93B2D';
      case 'heavy': return '#D97706';
      case 'moderate': return '#2563EB';
      default: return '#059669';
    }
  };

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[16/8.5] bg-[#16191A] overflow-hidden border border-[#1A1A1A] group select-none">
      {/* Background SVG Grid & Delhi Map Network */}
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="gridPattern" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(242,240,235,0.06)" strokeWidth="0.2" />
          </pattern>

          {/* Glowing Filters */}
          <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid lines */}
        <rect width="100" height="100" fill="url(#gridPattern)" />

        {/* Yamuna River Curve */}
        <path
          d="M 68 0 Q 64 25, 62 45 T 70 80 T 78 100"
          fill="none"
          stroke="#00354a"
          strokeWidth="2.5"
          strokeDasharray="1,0.5"
          opacity="0.8"
        />
        <text x="68" y="15" fill="#38bdf8" fontSize="2" opacity="0.7" className="font-mono font-bold">
          Yamuna River
        </text>

        {/* Outer Ring Road (Large Oval) */}
        <ellipse
          cx="50"
          cy="50"
          rx="32"
          ry="28"
          fill="none"
          stroke="#333A3D"
          strokeWidth="1.2"
        />

        {/* Inner Ring Road */}
        <ellipse
          cx="48"
          cy="48"
          rx="22"
          ry="18"
          fill="none"
          stroke="#444C50"
          strokeWidth="1"
        />

        {/* Major Delhi Arterials */}
        {/* NH44 / GT Karnal */}
        <path d="M 34 0 L 34 25 L 48 38" fill="none" stroke={forecastMinutesAhead >= 30 ? "#D93B2D" : "#D97706"} strokeWidth="1" opacity="0.9" />
        {/* Connaught Place Radial Spikes */}
        <line x1="48" y1="38" x2="38" y2="34" stroke="#3B82F6" strokeWidth="0.8" />
        <line x1="48" y1="38" x2="60" y2="42" stroke="#D93B2D" strokeWidth="1.2" />
        <line x1="48" y1="38" x2="50" y2="64" stroke="#D93B2D" strokeWidth="1.4" />
        <line x1="48" y1="38" x2="72" y2="58" stroke="#D97706" strokeWidth="1" />

        {/* Ring Road South */}
        <path
          d="M 38 52 C 42 62, 50 64, 62 68"
          fill="none"
          stroke={forecastMinutesAhead >= 30 ? "#D93B2D" : "#D97706"}
          strokeWidth="1.4"
          filter="url(#glowRed)"
        />

        {/* DND Flyway */}
        <path
          d="M 62 68 L 72 58 L 80 52"
          fill="none"
          stroke="#D97706"
          strokeWidth="1.2"
        />

        {/* Gurgaon Highway */}
        <path
          d="M 38 52 L 26 82"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1"
        />

        {/* AI Detour Route Highlight */}
        {showAlternativeRoutes && (
          <path
            d="M 48 38 Q 62 38, 60 50 T 62 68"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.2"
            strokeDasharray="1.5,1"
            className="animate-pulse"
          />
        )}

        {/* Heatmap Overlays */}
        {showHeatmap && (
          <>
            <circle cx="48" cy="38" r="7" fill="#D93B2D" opacity={0.25 + (forecastMinutesAhead / 100) * 0.1} />
            <circle cx="34" cy="18" r="8" fill="#D93B2D" opacity={0.25} />
            <circle cx="50" cy="64" r="9" fill="#D93B2D" opacity={0.25} />
            <circle cx="72" cy="58" r="6" fill="#D97706" opacity={0.2} />
          </>
        )}

        {/* Animated Traffic Particles */}
        <circle cx="48" cy="38" r="0.6" fill="#ffffff">
          <animate attributeName="cx" values="48;50;62" dur="4s" repeatCount="indefinite" />
          <animate attributeName="cy" values="38;64;68" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="72" cy="58" r="0.6" fill="#10B981">
          <animate attributeName="cx" values="80;72;62" dur="3s" repeatCount="indefinite" />
          <animate attributeName="cy" values="52;58;68" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Map Node Badges & Markers */}
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const color = getNodeColor(node.status);

        return (
          <div
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            style={{ left: `${node.coords.x}%`, top: `${node.coords.y}%` }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${
              isSelected ? 'scale-125 z-20' : 'hover:scale-110'
            }`}
          >
            {/* Glowing Ring */}
            <div
              style={{ backgroundColor: color }}
              className={`w-3.5 h-3.5 rounded-full border-2 border-[#16191A] shadow-md flex items-center justify-center ${
                node.status === 'severe' ? 'animate-ping' : ''
              }`}
            />
            {/* Dot Core */}
            <div
              style={{ backgroundColor: color }}
              className="absolute inset-0 w-3.5 h-3.5 rounded-full border border-white/80"
            />

            {/* Editorial Label Badge */}
            <div className="mt-1 -ml-6 bg-white border border-[#1A1A1A] px-2 py-0.5 whitespace-nowrap shadow-md flex items-center gap-1.5 text-[10px]">
              <span className="font-serif font-bold text-[#1A1A1A]">{node.name}</span>
              <span style={{ color }} className="font-bold font-mono">
                {node.avgSpeedKmh}km/h
              </span>
            </div>
          </div>
        );
      })}

      {/* Incident Markers */}
      {showIncidents &&
        incidents.map((inc) => {
          const isSelected = selectedIncidentId === inc.id;

          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc.id)}
              style={{ left: `${inc.coords.x}%`, top: `${inc.coords.y}%` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-30 ${
                isSelected ? 'scale-125' : 'hover:scale-110'
              }`}
            >
              <div className="relative group/inc">
                {/* Pulse Ring */}
                <div className="w-6 h-6 bg-[#D93B2D]/30 animate-pulse-badge flex items-center justify-center border border-[#D93B2D]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D93B2D]" />
                </div>

                {/* Quick Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-7 bg-white border border-[#1A1A1A] p-2.5 shadow-2xl w-48 text-left text-xs pointer-events-none opacity-0 group-hover/inc:opacity-100 transition-opacity z-40">
                  <div className="font-serif font-bold text-[#D93B2D] text-xs truncate">{inc.title}</div>
                  <div className="text-[10px] text-[#1A1A1A]/70 font-mono flex items-center justify-between mt-1">
                    <span>Delay: +{inc.delayMinutes}m</span>
                    <span className="text-[#D93B2D] font-bold">In {inc.startsInMinutes}m</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      {/* Layer Controls Bar */}
      <div className="absolute bottom-3 left-3 bg-white/95 border border-[#1A1A1A] p-1.5 flex items-center gap-2 text-[11px] z-30 shadow-md font-mono">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold ${
            showHeatmap ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <Layers className="w-3 h-3 text-[#D93B2D]" />
          <span>Heatmap</span>
        </button>

        <button
          onClick={() => setShowIncidents(!showIncidents)}
          className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold ${
            showIncidents ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-[#D93B2D]" />
          <span>Incidents</span>
        </button>

        <button
          onClick={() => setShowAlternativeRoutes(!showAlternativeRoutes)}
          className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold ${
            showAlternativeRoutes ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <Zap className="w-3 h-3 text-emerald-600" />
          <span>AI Detours</span>
        </button>
      </div>

      {/* Map Watermark & Live Time */}
      <div className="absolute top-3 right-3 bg-white/95 border border-[#1A1A1A] px-3 py-1 text-[11px] font-mono text-[#1A1A1A] flex items-center gap-2 z-30 shadow-sm font-bold">
        <span className="w-2 h-2 rounded-full bg-[#D93B2D] animate-pulse" />
        <span>DELHI VECTOR RADAR</span>
        <span className="text-[#D93B2D] font-bold">15:34 IST</span>
      </div>
    </div>
  );
};
