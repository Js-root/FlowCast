import React, { useState, useEffect, useRef } from 'react';
import { TrafficNode, Incident } from '../types';
import { AlertTriangle, Layers, Activity } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Circle, Polyline, Popup, Tooltip, LayerGroup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Circle as LeafletCircle } from 'leaflet';

import { AnimatedIncidentCircle } from './AnimatedIncidentCircle';
import { radiusAt, severityToColor } from '../utils/radiusAt';
import { isIncidentConfirmed } from '../utils/verification';
import { DELHI_CENTER, DELHI_NCR_BOUNDS, DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, TILE_LAYER_URL, TRAFFIC_FLOW_TILE_URL } from '../constants/map';
import { FEATURES } from '../constants/features';

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
  /** When true, map fills its parent instead of using a fixed aspect ratio (for modals). */
  fillContainer?: boolean;
  userLocation?: { lat: number; lng: number; name?: string } | null;
}

// Inner subcomponent to handle programmatic map viewport transitions
const MapController: React.FC<{ 
  selectedIncident: Incident | null;
  userLocation?: { lat: number; lng: number; name?: string } | null;
}> = ({ selectedIncident, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident) {
      map.flyTo([selectedIncident.lat, selectedIncident.lng], 13, {
        animate: true,
        duration: 1.2,
      });
    } else if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13.5, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedIncident, userLocation, map]);

  return null;
};

/** Invalidates Leaflet size after mount so tiles render correctly in flex/modal containers. */
const MapResizeHandler: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ animate: false });
    // After layout settles (modal open / flex resize)
    const t1 = window.setTimeout(invalidate, 50);
    const t2 = window.setTimeout(invalidate, 300);
    window.addEventListener('resize', invalidate);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', invalidate);
    };
  }, [map]);

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
  fillContainer = false,
  userLocation,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(FEATURES.heatmap);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState(FEATURES.detours);
  const [showTraffic, setShowTraffic] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' IST');
    };
    updateTime();
    const int = setInterval(updateTime, 60000);
    return () => clearInterval(int);
  }, []);

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

  const containerClass = fillContainer
    ? 'relative w-full h-full min-h-0 bg-[#16191A] overflow-hidden border-0 group select-none'
    : 'relative w-full aspect-[16/9] md:aspect-[16/8.5] bg-[#16191A] overflow-hidden border border-[#1A1A1A] group select-none';

  return (
    <div className={containerClass}>
      {/* Leaflet Map Container */}
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : DELHI_CENTER}
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
        <MapController selectedIncident={selectedIncident} userLocation={userLocation} />
        <MapResizeHandler />

        <TileLayer url={TILE_LAYER_URL} />

        {/* TomTom Live Traffic Flow Overlay */}
        {showTraffic && TRAFFIC_FLOW_TILE_URL && (
          <TileLayer
            url={TRAFFIC_FLOW_TILE_URL}
            opacity={0.7}
            zIndex={2}
          />
        )}

        {/* User Current Location Marker */}
        {userLocation && (
          <LayerGroup>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={400}
              pathOptions={{
                color: '#2563EB',
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '4, 4'
              }}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={10}
              pathOptions={{
                color: '#FFFFFF',
                fillColor: '#2563EB',
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]} className="font-mono text-xs font-bold border border-[#1A1A1A] shadow-md px-2 py-0.5 bg-white text-blue-700">
                📍 {userLocation.name || 'YOUR LOCATION'}
              </Tooltip>
              <Popup>
                <div className="font-mono text-xs p-1">
                  <div className="font-bold text-blue-600 uppercase flex items-center gap-1">
                    <span>📍 {userLocation.name || 'Your Current Location'}</span>
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">
                    Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </LayerGroup>
        )}

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
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </LayerGroup>


      </MapContainer>

      {/* Layer Controls Bar */}
      <div className="absolute bottom-3 left-3 bg-white/95 border border-[#1A1A1A] p-1.5 flex items-center gap-2 text-[11px] z-[1000] shadow-md font-mono">
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold border-none ${
            showTraffic ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <Activity className="w-3 h-3 text-emerald-600" />
          <span>Live Traffic</span>
        </button>

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

      </div>

      {/* User Location Active Badge (Top Left of Map) */}
      {userLocation && (
        <div className="absolute top-3 left-3 bg-white/95 border border-[#1A1A1A] px-3 py-1 text-[11px] font-mono text-[#1A1A1A] flex items-center gap-2 z-[1000] shadow-sm font-bold animate-fade-up">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
          <span className="text-blue-700 font-extrabold">GPS FIX:</span>
          <span className="uppercase text-[#1A1A1A] truncate max-w-[180px]">{userLocation.name || 'ACTIVE'}</span>
        </div>
      )}

      {/* Map Watermark & Live Time */}
      <div className="absolute top-3 right-3 bg-white/95 border border-[#1A1A1A] px-3 py-1 text-[11px] font-mono text-[#1A1A1A] flex items-center gap-2 z-[1000] shadow-sm font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-[#D93B2D] animate-pulse" />
        <span>DELHI VECTOR RADAR</span>
        <span className="text-[#D93B2D] font-bold">{currentTime}</span>
      </div>
    </div>
  );
};
export default InteractiveMap;
