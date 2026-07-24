import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { TrafficNode, Incident } from '../types';
import { radiusAt } from '../lib/forecast';
import { AlertTriangle, Zap, Layers } from 'lucide-react';

interface InteractiveMapProps {
  nodes: TrafficNode[];
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  forecastMinutesAhead: number;
  verifications?: Record<string, 'confirmed' | 'unverified'>;
}

const DELHI: [number, number] = [28.61, 77.22];
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// Representative AI detour (CP -> Barakhamba -> Pragati -> Ring Road South).
// ponytail: one static illustrative detour, matches the old single SVG detour.
// Swap for a real routing engine (OSRM/Mapbox) in Phase 2.
const DEMO_DETOUR: [number, number][] = [
  [28.6315, 77.2167],
  [28.6290, 77.2250],
  [28.6180, 77.2430],
  [28.6000, 77.2400],
  [28.5760, 77.1740],
];

const nodeColor = (status: string) =>
  status === 'severe' ? '#D93B2D'
  : status === 'heavy' ? '#D97706'
  : status === 'moderate' ? '#2563EB'
  : '#059669';

const sevColor = (s: string) =>
  s === 'severe' ? '#D93B2D' : s === 'moderate' ? '#D97706' : '#eab308';

const incidentIcon = (selected: boolean, unverified: boolean) => {
  const c = unverified ? '234,179,8' : '217,59,45'; // yellow vs red
  return L.divIcon({
    className: '',
    html: `<div style="transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;width:26px;height:26px;background:rgba(${c},${
      selected ? '1' : '0.85'
    });border:2px solid #16191A;color:#fff;font-size:14px;font-weight:bold;box-shadow:0 0 8px rgba(${c},0.7)">${unverified ? '?' : '⚠'}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  nodes,
  incidents,
  selectedIncidentId,
  onSelectIncident,
  selectedNodeId,
  onSelectNode,
  forecastMinutesAhead,
  verifications = {},
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showDetours, setShowDetours] = useState(true);

  const t = Math.max(0, Math.min(30, forecastMinutesAhead)) / 30;
  const jamOpacity = 0.15 + t * 0.25;

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[16/8.5] bg-[#16191A] overflow-hidden border border-[#1A1A1A] select-none">
      <MapContainer
        center={DELHI}
        zoom={11}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', background: '#16191A' }}
      >
        <TileLayer url={DARK_TILES} attribution="&copy; OpenStreetMap &copy; CARTO" />

        {/* Jam impact zones (grow with forecast horizon; yellow until Confirmed) */}
        {showHeatmap &&
          incidents.map((inc) => {
            const color = verifications[inc.id] === 'unverified' ? '#eab308' : sevColor(inc.severity);
            return (
              <Circle
                key={`jam-${inc.id}`}
                center={[inc.lat, inc.lng]}
                radius={radiusAt(inc, forecastMinutesAhead)}
                pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: jamOpacity }}
              />
            );
          })}

        {/* AI detour */}
        {showDetours && (
          <Polyline positions={DEMO_DETOUR} pathOptions={{ color: '#10B981', weight: 3, dashArray: '8 6' }} />
        )}

        {/* Traffic nodes */}
        {nodes.map((node) => {
          const selected = selectedNodeId === node.id;
          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={selected ? 9 : 6}
              pathOptions={{ color: '#16191A', weight: 2, fillColor: nodeColor(node.status), fillOpacity: 1 }}
              eventHandlers={{ click: () => onSelectNode(node.id) }}
            >
              <Popup>
                <strong>{node.name}</strong>
                <br />
                <span style={{ color: nodeColor(node.status) }}>{node.avgSpeedKmh} km/h</span> · +{node.delayMinutes}m
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Incident markers */}
        {showIncidents &&
          incidents.map((inc) => {
            const unverified = verifications[inc.id] === 'unverified';
            return (
              <Marker
                key={inc.id}
                position={[inc.lat, inc.lng]}
                icon={incidentIcon(selectedIncidentId === inc.id, unverified)}
                eventHandlers={{ click: () => onSelectIncident(inc.id) }}
              >
                <Popup>
                  <span style={{ color: unverified ? '#a16207' : '#059669', fontWeight: 700, fontSize: 11 }}>
                    {unverified ? '⚠ UNVERIFIED WARNING' : '✓ CONFIRMED'}
                  </span>
                  <br />
                  <strong style={{ color: '#D93B2D' }}>{inc.title}</strong>
                  <br />
                  {inc.area}
                  <br />
                  Delay +{inc.delayMinutes}m · starts in {inc.startsInMinutes}m · {inc.confidencePercent}% conf
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Layer Controls Bar */}
      <div className="absolute bottom-3 left-3 bg-white/95 border border-[#1A1A1A] p-1.5 flex items-center gap-2 text-[11px] z-[1000] shadow-md font-mono">
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
          onClick={() => setShowDetours(!showDetours)}
          className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold ${
            showDetours ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <Zap className="w-3 h-3 text-emerald-600" />
          <span>AI Detours</span>
        </button>
      </div>

      {/* Map Watermark */}
      <div className="absolute top-3 right-3 bg-white/95 border border-[#1A1A1A] px-3 py-1 text-[11px] font-mono text-[#1A1A1A] flex items-center gap-2 z-[1000] shadow-sm font-bold pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#D93B2D] animate-pulse" />
        <span>DELHI LIVE RADAR</span>
        <span className="text-[#D93B2D] font-bold">+{forecastMinutesAhead}m</span>
      </div>
    </div>
  );
};
