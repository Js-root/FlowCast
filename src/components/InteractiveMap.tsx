import React, { useState, useEffect, useRef } from 'react';
import { TrafficNode, Incident } from '../types';
import { AlertTriangle, Zap, Layers } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Circle, Polyline, Popup, LayerGroup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Circle as LeafletCircle } from 'leaflet';

import { AnimatedIncidentCircle } from './AnimatedIncidentCircle';
import { radiusAt, severityToColor } from '../utils/radiusAt';
import { isIncidentConfirmed } from '../utils/verification';
import { DELHI_CENTER, DELHI_NCR_BOUNDS, DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, TILE_LAYER_URL } from '../constants/map';
import { FEATURES } from '../constants/features';
import { CITIES } from '../constants/cities';

interface InteractiveMapProps {
  nodes: TrafficNode[];
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (id: string) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  forecastMinutesAhead: number;
  detourPositions?: [number, number][];
  selectedRouteIsAiRecommended?: boolean;
  selectedCity: string;
}

// Inner subcomponent to handle programmatic map viewport transitions
const MapController: React.FC<{ selectedIncident: Incident | null; selectedCity: string; center: [number, number] }> = ({ selectedIncident, selectedCity, center }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 12, {
      animate: true,
      duration: 1.5,
    });
  }, [selectedCity, center, map]);

  useEffect(() => {
    if (selectedIncident) {
      map.flyTo([selectedIncident.lat, selectedIncident.lng], 13, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedIncident, map]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  nodes,
  incidents,
  selectedIncident,
  onSelectIncident,
  selectedNodeId,
  onSelectNode,
  forecastMinutesAhead,
  detourPositions,
  selectedRouteIsAiRecommended,
  selectedCity,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(FEATURES.heatmap);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState(FEATURES.detours);

  const circleRef = useRef<LeafletCircle | null>(null);

  // Auto-open selected incident popup after glide transition finishes
  useEffect(() => {
    if (selectedIncident && circleRef.current) {
      const timer = setTimeout(() => {
        if (circleRef.current) {
          circleRef.current.openPopup();
        }
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [selectedIncident]);

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
      {/* Leaflet Map Container */}
      <MapContainer
        center={CITIES[selectedCity].center}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={DELHI_NCR_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* FlyTo Centering Controller */}
        <MapController selectedIncident={selectedIncident} selectedCity={selectedCity} center={CITIES[selectedCity].center} />

        <TileLayer url={TILE_LAYER_URL} />

        {/* Heatmap Overlay Layer */}
        {showHeatmap && (
          <LayerGroup>
            {incidents.map((inc) => {
              const baseRad = radiusAt(inc, forecastMinutesAhead);
              const opacity = 0.12 + (forecastMinutesAhead / 30) * 0.12;
              const color = severityToColor(inc.severity);
              return (
                <Circle
                  key={`heatmap-${inc.id}`}
                  center={[inc.lat, inc.lng]}
                  radius={baseRad}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: opacity,
                    color: 'transparent',
                  }}
                />
              );
            })}
          </LayerGroup>
        )}

        {/* Incidents Layer Group */}
        {showIncidents && (
          <LayerGroup>
            {incidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              const isConfirmed = isIncidentConfirmed(inc, [], nodes);
              const color = isConfirmed ? '#D93B2D' : '#D97706';
              const targetRadius = radiusAt(inc, forecastMinutesAhead);

              return (
                <React.Fragment key={inc.id}>
                  {/* Pulse Concentric Glow for Selected Marker */}
                  {isSelected && (
                    <CircleMarker
                      center={[inc.lat, inc.lng]}
                      radius={22}
                      pathOptions={{
                        color: color,
                        weight: 2,
                        fillColor: color,
                        fillOpacity: 0.15,
                        className: 'animate-pulse',
                      }}
                    />
                  )}

                  <AnimatedIncidentCircle
                    ref={isSelected ? circleRef : null}
                    center={[inc.lat, inc.lng]}
                    targetRadius={targetRadius}
                    color={color}
                    fillColor={color}
                    fillOpacity={isSelected ? 0.35 : 0.18}
                  >
                    <Popup>
                      <div className="p-1.5 text-[#1A1A1A] max-w-[210px] font-sans">
                        <div className="flex items-center gap-1 font-bold text-xs mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#D93B2D]" />
                          <span className="text-[11px] font-bold text-gray-900 leading-tight">{inc.title}</span>
                        </div>
                        <span className={`inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase text-white mb-2 ${isConfirmed ? 'bg-[#D93B2D]' : 'bg-[#D97706]'}`}>
                          {isConfirmed ? 'Confirmed' : 'Unverified Warning'}
                        </span>
                        <p className="text-[10px] m-0 mb-1.5 text-gray-700 leading-tight font-normal font-sans">
                          {inc.description}
                        </p>
                        <div className="text-[9px] font-mono text-gray-500 flex justify-between pt-1 border-t border-gray-200/80">
                          <span>Delay: +{inc.delayMinutes}m</span>
                          <span>In: {Math.max(0, inc.startsInMinutes - forecastMinutesAhead)}m</span>
                        </div>
                        <div className="text-[9px] font-mono text-gray-400 mt-0.5">
                          Source: {inc.socialSource}
                        </div>
                        <button
                          onClick={() => onSelectIncident(inc.id)}
                          className="w-full mt-2.5 bg-[#1A1A1A] text-white py-1 px-2 text-[9px] font-mono uppercase font-bold hover:bg-[#D93B2D] transition-colors border-none cursor-pointer"
                        >
                          Inspect Details
                        </button>
                      </div>
                    </Popup>
                  </AnimatedIncidentCircle>
                </React.Fragment>
              );
            })}
          </LayerGroup>
        )}

        {/* Traffic Node Markers */}
        <LayerGroup>
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const color = getNodeColor(node.status);

            return (
              <CircleMarker
                key={node.id}
                center={[node.lat, node.lng]}
                radius={isSelected ? 9 : 6.5}
                pathOptions={{
                  color: isSelected ? '#FFFFFF' : color,
                  fillColor: color,
                  fillOpacity: 0.9,
                  weight: isSelected ? 2.5 : 1.2,
                }}
                eventHandlers={{
                  click: () => onSelectNode(node.id),
                }}
              >
                <Popup>
                  <div className="p-1 text-[#1A1A1A] font-sans">
                    <div className="font-bold text-xs font-serif">{node.name}</div>
                    <div className="text-[10px] font-mono mt-1 flex justify-between gap-4">
                      <span>Status: <span className="font-bold uppercase" style={{ color }}>{node.status}</span></span>
                      <span>Speed: <b>{node.avgSpeedKmh} km/h</b></span>
                    </div>
                    <div className="text-[9px] font-mono text-gray-500 mt-0.5">
                      Delay: +{node.delayMinutes} mins
                    </div>
                    <button
                      onClick={() => onSelectNode(node.id)}
                      className="w-full mt-2 bg-[#1A1A1A] text-white py-1 px-2 text-[9px] font-mono uppercase font-bold hover:bg-[#D93B2D] transition-colors border-none cursor-pointer"
                    >
                      Inspect Node
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </LayerGroup>

        {/* Detour Routes Polyline */}
        {showAlternativeRoutes && detourPositions && detourPositions.length > 0 && (
          <Polyline
            positions={detourPositions}
            pathOptions={{
              color: selectedRouteIsAiRecommended ? '#10B981' : '#D93B2D',
              dashArray: '6, 6',
              weight: 3.5,
            }}
          />
        )}
      </MapContainer>

      {/* Layer Controls Bar */}
      <div className="absolute bottom-3 left-3 bg-white/95 border border-[#1A1A1A] p-1.5 flex items-center gap-2 text-[11px] z-[1000] shadow-md font-mono">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold border-none ${
            showHeatmap ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <Layers className="w-3 h-3 text-[#D93B2D]" />
          <span>Heatmap</span>
        </button>

        <button
          onClick={() => setShowIncidents(!showIncidents)}
          className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold border-none ${
            showIncidents ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-[#D93B2D]" />
          <span>Incidents</span>
        </button>

        <button
          onClick={() => setShowAlternativeRoutes(!showAlternativeRoutes)}
          className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold border-none ${
            showAlternativeRoutes ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <Zap className="w-3 h-3 text-emerald-600" />
          <span>AI Detours</span>
        </button>
      </div>

      {/* Map Watermark & Live Time */}
      <div className="absolute top-3 right-3 bg-white/95 border border-[#1A1A1A] px-3 py-1 text-[11px] font-mono text-[#1A1A1A] flex items-center gap-2 z-[1000] shadow-sm font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-[#D93B2D] animate-pulse" />
        <span>{CITIES[selectedCity].name.toUpperCase()} RADAR</span>
        <span className="text-[#D93B2D] font-bold">15:34 IST</span>
      </div>
    </div>
  );
};
export default InteractiveMap;
