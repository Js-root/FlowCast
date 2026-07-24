import React, { useState, useEffect } from 'react';
import { Incident, TrafficNode, CameraFeed, SocialSignal, RouteOption, DispatchLogEntry, RouteAnalysis } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { IncidentDispatch } from './IncidentDispatch';
import { RouteDetours } from './RouteDetours';
import { DispatchLog } from './DispatchLog';
import {
  Clock,
  Sparkles,
  Camera,
  Sliders,
  Search
} from 'lucide-react';
import { radiusAt } from '../utils/radiusAt';
import { isIncidentConfirmed, getIncidentConfidence } from '../utils/verification';
import { calculateEstimatedVehicles, calculateImpactRadiusSqKm, calculateStartsInMinutes } from '../utils/forecast';
import { FEATURES } from '../constants/features';

interface DashboardProps {
  nodes: TrafficNode[];
  incidents: Incident[];
  cameras: CameraFeed[];
  socialSignals: SocialSignal[];
  
  // Lifted selection states & hook data
  selectedIncidentId: string | null;
  onSelectIncidentId: (id: string) => void;
  selectedRouteId: string | null;
  onSelectRouteId: (id: string) => void;
  selectedIncident: Incident | null;
  selectedRoute: RouteOption | null;
  availableRoutes: RouteOption[];
  dispatchLogs: DispatchLogEntry[];
  onDeployRoute: (route: RouteOption) => void;

  selectedCity: string;
  onSelectCity: (city: string) => void;

  onOpenDemoModal: () => void;
  onNavigateToRoutePlanner: () => void;
  onTriggerFakeNews?: () => void;
  activeRouteAnalysis: RouteAnalysis | null;
  onClearRouteAnalysis: () => void;
  onReloadIncidents?: () => void;
  onReportHinglish?: (text: string) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  nodes,
  incidents,
  cameras,
  socialSignals,
  
  selectedIncidentId,
  onSelectIncidentId,
  selectedRouteId,
  onSelectRouteId,
  selectedIncident,
  selectedRoute,
  availableRoutes,
  dispatchLogs,
  onDeployRoute,

  selectedCity,
  onSelectCity,

  onOpenDemoModal,
  onNavigateToRoutePlanner,
  onTriggerFakeNews,
  activeRouteAnalysis,
  onClearRouteAnalysis,
  onReloadIncidents,
  onReportHinglish,
}) => {
  const [forecastMinutes, setForecastMinutes] = useState<number>(30);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-cp');
  const [activeCameraModal, setActiveCameraModal] = useState<CameraFeed | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [aiReport, setAiReport] = useState<{
    summary?: string;
    criticalHotspots?: string[];
    recommendedAction?: string;
    confidenceScore?: number;
  } | null>(null);

  // Dynamic metrics calculations
  const clearCount = nodes.filter(n => n.status === 'clear' || n.status === 'moderate').length;
  const heavyCount = nodes.filter(n => n.status === 'severe').length;
  const modCount = nodes.filter(n => n.status === 'heavy').length;
  
  const totalNodes = nodes.length || 1;
  const clearPct = Math.round((clearCount / totalNodes) * 100);
  const heavyPct = Math.round((heavyCount / totalNodes) * 100);
  const modPct = 100 - clearPct - heavyPct;

  const avgSpeed = Math.round(nodes.reduce((sum, n) => sum + n.avgSpeedKmh, 0) / totalNodes);
  const speedDiff = (avgSpeed - 35.6).toFixed(1);
  const isSpeedBetter = parseFloat(speedDiff) >= 0;
  const speedDiffText = isSpeedBetter ? `+${speedDiff} km/h vs avg` : `${speedDiff} km/h vs avg`;
  const speedDiffColor = isSpeedBetter ? 'text-emerald-700' : 'text-[#D93B2D]';

  const totalIncidents = incidents.length;
  const severeIncidentsCount = incidents.filter(inc => inc.severity === 'severe').length;
  const deviationPct = Math.round((heavyCount / totalNodes) * 45);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHasApiKey(data.hasApiKey))
      .catch(() => setHasApiKey(false));
  }, []);

  const handleFetchAiForecast = async () => {
    if (!FEATURES.aiForecast) return;
    setIsAiLoading(true);
    setAiReport(null);
    
    const steps = [
      "Analyzing social feed signals...",
      "Corroborating GPS flow telemetry...",
      "Calculating propagation cascade...",
      "Generating final prediction report..."
    ];

    try {
      const fetchPromise = fetch('/api/ai-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeIncidents: incidents,
          currentNodes: nodes,
          timeHorizonMinutes: forecastMinutes,
        }),
      }).then(res => res.json());

      for (const step of steps) {
        setAiLoadingStep(step);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      const data = await fetchPromise;
      if (data.success) {
        setAiReport(data);
      }
    } catch (err) {
      console.error('Error fetching AI forecast:', err);
    } finally {
      setIsAiLoading(false);
      setAiLoadingStep('');
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-8 animate-zoom-in">
      {/* Editorial Frame Container */}
      <div className="relative w-full border border-[#1A1A1A]/15 bg-[#F2F0EB] p-3 md:p-6 shadow-sm transition-all duration-300">
        {/* Editorial Top Window Bar */}
        <div className="flex items-center justify-between pb-4 px-2 border-b border-[#1A1A1A]/15 mb-5 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#D93B2D]" />
            <div className="w-2.5 h-2.5 bg-[#1A1A1A]" />
            <div className="w-2.5 h-2.5 bg-[#1A1A1A]/30" />
            <span className="text-xs font-bold text-[#1A1A1A] ml-2 hidden sm:inline-block tracking-wider uppercase">
              FLOWCAST // COMMAND CENTER V3.4
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#1A1A1A]/70">
            <span className="hidden md:flex items-center gap-1.5 text-[#D93B2D] bg-[#D93B2D]/10 border border-[#D93B2D]/30 px-2.5 py-0.5 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D93B2D] animate-ping" />
              SYSTEM OPERATIONAL
            </span>
            <div className="flex items-center gap-1 font-bold text-[#1A1A1A]">
              <Clock className="w-3.5 h-3.5" />
              <span>15:34 IST</span>
            </div>
            <div className="hidden lg:flex items-center gap-1 bg-white px-2.5 py-1 border border-[#1A1A1A]/15 text-[#1A1A1A]/70">
              <Search className="w-3 h-3 text-[#1A1A1A]" />
              <span>Search Grid...</span>
            </div>
          </div>
        </div>

        {/* API Keyless Warning Banner */}
        {hasApiKey === false && (
          <div className="bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] p-3 text-xs font-mono mb-5 flex items-center justify-between animate-fade-up">
            <span className="font-semibold">⚠️ GROQ_API_KEY missing. FlowCast is running on a deterministic fallback prediction model.</span>
            <span className="bg-[#D97706] text-white px-2.5 py-0.5 text-[9px] font-bold tracking-wider">FALLBACK MODE</span>
          </div>
        )}

        {/* Command Center Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Panel: Live Traffic Metrics */}
          <div className="lg:col-span-3 bg-white border border-[#1A1A1A]/15 p-5 flex flex-col gap-5 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono tracking-widest text-[#D93B2D] uppercase">City Metrics</span>
                <span className="text-[10px] bg-[#1A1A1A] text-white font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                  LIVE TELEMETRY
                </span>
              </div>
              <div className="text-3xl font-serif font-black text-[#1A1A1A] mt-1">54,312</div>
              <div className="text-xs text-[#1A1A1A]/60 font-sans">Active Commuters Monitored</div>
            </div>

            {/* Congestion Split Progress Bar */}
            <div className="space-y-2 pt-1 border-t border-[#1A1A1A]/10">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-[#1A1A1A]">Mod: {modPct}%</span>
                <span className="text-emerald-700">Clear: {clearPct}%</span>
                <span className="text-[#D93B2D]">Heavy: {heavyPct}%</span>
              </div>
              <div className="h-2 w-full bg-[#1A1A1A]/10 overflow-hidden flex">
                <div className="bg-[#1A1A1A] h-full" style={{ width: `${modPct}%` }} />
                <div className="bg-emerald-600 h-full" style={{ width: `${clearPct}%` }} />
                <div className="bg-[#D93B2D] h-full" style={{ width: `${heavyPct}%` }} />
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10">
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider">Avg Speed</div>
                <div className="text-xl font-serif font-bold text-[#1A1A1A] mt-0.5">{avgSpeed} km/h</div>
                <div className={`text-[10px] ${speedDiffColor} font-mono mt-1 font-semibold`}>
                  {speedDiffText}
                </div>
              </div>

              <div className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10">
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider">Deviation</div>
                <div className="text-xl font-serif font-bold text-[#D93B2D] mt-0.5">+{deviationPct}%</div>
                <div className="text-[10px] text-[#D93B2D]/80 font-mono mt-1 font-semibold">Peak hour delay</div>
              </div>

              <div className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10">
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider">Incidents</div>
                <div className="text-xl font-serif font-bold text-[#D93B2D] mt-0.5">{totalIncidents} Active</div>
                <div className="text-[10px] text-[#D93B2D]/80 font-mono mt-1 font-semibold">{severeIncidentsCount} High Severity</div>
              </div>

              <div className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10">
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider">ANPR Cams</div>
                <div className="text-xl font-serif font-bold text-[#1A1A1A] mt-0.5">642/650</div>
                <div className="text-[10px] text-emerald-700 font-mono mt-1 font-semibold">98.7% Online</div>
              </div>
            </div>

            {/* Camera Feeds Preview */}
            <div className="space-y-2 pt-2 border-t border-[#1A1A1A]/10">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] uppercase font-mono">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#D93B2D]" />
                  <span>Junction Optics</span>
                </span>
                <span className="text-[10px] text-[#1A1A1A]/50 font-sans">Inspect</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {cameras.slice(0, 2).map((cam) => (
                  <div
                    key={cam.id}
                    onClick={() => setActiveCameraModal(cam)}
                    className="relative group border border-[#1A1A1A]/20 cursor-pointer aspect-video bg-[#1A1A1A] overflow-hidden"
                  >
                    <img
                      src={cam.snapshotUrl}
                      alt={cam.junctionName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-1.5 flex flex-col justify-between">
                      <span className="text-[9px] font-mono font-bold text-white bg-[#D93B2D] px-1.5 py-0.2 w-fit">
                        ● LIVE
                      </span>
                      <span className="text-[10px] font-bold text-white truncate font-sans">{cam.junctionName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Map View & Live Floating Prediction Overlay */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {activeRouteAnalysis && (
              <div className="bg-emerald-700/10 border border-emerald-600/30 text-emerald-800 p-3 text-xs font-mono flex items-center justify-between animate-fade-up">
                <span className="font-semibold">📍 Live GPS Route Analysis active: Standard vs AI Bypass Detour.</span>
                <button
                  onClick={onClearRouteAnalysis}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider cursor-pointer border-none uppercase"
                >
                  Reset Map ✕
                </button>
              </div>
            )}
            <div className="relative w-full border border-[#1A1A1A]/20 shadow-sm bg-[#101415] overflow-hidden">
              {/* Interactive Vector Map Canvas */}
              <InteractiveMap
                nodes={nodes}
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={onSelectIncidentId}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                forecastMinutesAhead={forecastMinutes}
                detourPositions={selectedRoute?.polylinePositions}
                selectedRouteIsAiRecommended={selectedRoute?.isAiRecommended}
                selectedCity={selectedCity}
              />

              {/* Editorial Floating Overlay Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-[#1A1A1A] p-4 w-[250px] md:w-[290px] shadow-xl flex flex-col gap-2 z-[1001] transition-all">
                <div className="text-[11px] font-mono font-bold text-[#D93B2D] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#D93B2D] animate-pulse-badge" />
                  <span>PREDICTIVE ALERT</span>
                </div>
                <div className="text-lg md:text-xl font-serif font-bold text-[#1A1A1A] tracking-tight leading-tight">
                  {selectedIncident ? selectedIncident.title : 'Severe Congestion'}
                </div>
                <div className="text-xs text-[#1A1A1A]/80 flex items-center gap-1.5 font-medium font-sans">
                  <Clock className="w-3.5 h-3.5 text-[#D93B2D]" />
                  <span>
                    {selectedIncident && calculateStartsInMinutes(selectedIncident.startsInMinutes, forecastMinutes) === 0 ? (
                      <span className="text-[#D93B2D] font-mono font-bold uppercase tracking-wider">Disruption Active</span>
                    ) : (
                      <>
                        Cascade starts in <span className="text-[#D93B2D] font-mono font-bold">{selectedIncident ? calculateStartsInMinutes(selectedIncident.startsInMinutes, forecastMinutes) : 24} mins</span>
                      </>
                    )}
                  </span>
                </div>
                
                {/* Verification status and metrics details */}
                {selectedIncident && (
                  <div className="text-[10px] font-mono text-[#1A1A1A]/80 space-y-1 mt-1 pt-1 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span>STATUS:</span>
                      <span className={`font-bold ${isIncidentConfirmed(selectedIncident, socialSignals, nodes) ? 'text-[#D93B2D]' : 'text-[#D97706]'}`}>
                        {isIncidentConfirmed(selectedIncident, socialSignals, nodes) ? 'CONFIRMED' : 'UNVERIFIED WARNING'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>IMPACT AREA:</span>
                      <span className="text-emerald-700 font-bold">{calculateImpactRadiusSqKm(radiusAt(selectedIncident, forecastMinutes))} km²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EST. VEHICLES:</span>
                      <span className="text-[#1A1A1A] font-bold">{calculateEstimatedVehicles(selectedIncident.severity, selectedIncident.confidencePercent)}</span>
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-mono border-t border-[#1A1A1A]/10 pt-2 mt-0.5 flex justify-between">
                  <span>Confidence: <span className="text-emerald-700 font-bold">{selectedIncident ? getIncidentConfidence(selectedIncident, socialSignals) : 94}%</span></span>
                  <span className="truncate max-w-[120px]">{selectedIncident?.socialSource || 'Social Telemetry'}</span>
                </div>
              </div>
            </div>

            {/* Prediction Time Horizon Control Slider */}
            <div className="bg-white border border-[#1A1A1A]/15 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1A1A1A] flex items-center justify-center text-white">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                   <div className="text-xs font-bold font-mono uppercase text-[#1A1A1A]">Forecast Horizon</div>
                   <div className="text-[11px] text-[#1A1A1A]/60 font-sans">Simulate cascading disruptions ahead of time</div>
                </div>
              </div>

              {/* Native Range Slider */}
              {FEATURES.horizon && (
                <div className="flex flex-col gap-1 w-full max-w-[200px] sm:max-w-[220px] font-mono">
                  <div className="flex justify-between text-[9px] font-bold text-[#1A1A1A]/70">
                    <span>NOW</span>
                    <span>+15M</span>
                    <span>+30M</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="15"
                    value={forecastMinutes > 30 ? 30 : forecastMinutes}
                    onChange={(e) => setForecastMinutes(Number(e.target.value))}
                    className="w-full accent-[#D93B2D] cursor-pointer"
                  />
                </div>
              )}

              {/* Generate AI Report Button */}
              {FEATURES.aiForecast && (
                <button
                  onClick={handleFetchAiForecast}
                  disabled={isAiLoading}
                  className="bg-[#D93B2D] hover:bg-[#1A1A1A] text-white px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm border-none"
                >
                  <Sparkles className={`w-4 h-4 text-white ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span>{isAiLoading ? 'Predicting...' : 'AI Forecast'}</span>
                </button>
              )}
            </div>

            {/* Simulated AI Loading Steps */}
            {isAiLoading && (
              <div className="bg-white border border-[#1A1A1A]/10 p-4 shadow-sm flex items-center gap-3 font-mono text-xs text-[#D93B2D] animate-pulse">
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#D93B2D] animate-spin" />
                <span>[AI ENGINE]: {aiLoadingStep}</span>
              </div>
            )}

            {/* AI Real-time Report Banner if available */}
            {aiReport && (
              <div className="bg-white border-2 border-[#D93B2D] p-5 flex flex-col gap-3 shadow-md animate-fade-up">
                <div className="flex items-center justify-between text-xs font-bold text-[#D93B2D] font-mono">
                  <span className="flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Llama 3.3 70B Forecast (+{forecastMinutes} mins)</span>
                  </span>
                  <span className="bg-[#D93B2D] text-white px-2.5 py-0.5 text-[10px] font-bold">
                    CONFIDENCE: {aiReport.confidenceScore || 94}%
                  </span>
                </div>
                
                <p className="text-xs text-[#1A1A1A] leading-relaxed font-sans font-medium">{aiReport.summary}</p>
                
                {/* Metrics details on cause and start time */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 pt-1 border-t border-gray-200">
                  <div className="bg-[#F2F0EB] p-2 border border-gray-300/30">
                    <div className="text-[9px] font-mono text-gray-500 uppercase">Primary Cause</div>
                    <div className="text-xs font-bold font-serif text-[#1A1A1A] mt-0.5">
                      {selectedIncident ? selectedIncident.category.replace('_', ' ').toUpperCase() : 'CONGESTION'}
                    </div>
                  </div>
                  <div className="bg-[#F2F0EB] p-2 border border-gray-300/30">
                    <div className="text-[9px] font-mono text-gray-500 uppercase">Congestion Start</div>
                    <div className="text-xs font-bold font-mono text-[#D93B2D] mt-0.5">
                      {selectedIncident ? `In ${calculateStartsInMinutes(selectedIncident.startsInMinutes, forecastMinutes)} min` : 'Immediate'}
                    </div>
                  </div>
                  <div className="bg-[#F2F0EB] p-2 border border-gray-300/30 col-span-2 sm:col-span-1">
                    <div className="text-[9px] font-mono text-gray-500 uppercase">Impact Footprint</div>
                    <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">
                      {selectedIncident ? `${calculateImpactRadiusSqKm(radiusAt(selectedIncident, forecastMinutes))} km²` : 'N/A'}
                    </div>
                  </div>
                </div>

                {aiReport.recommendedAction && (
                  <div className="text-xs text-[#1A1A1A] bg-[#F2F0EB] p-3 border-l-4 border-[#D93B2D] mt-1 font-mono font-medium">
                    💡 RECOMMENDED DETOUR: {aiReport.recommendedAction}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Dynamic Incident Dispatch, Route Detours & Dispatch Log */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <IncidentDispatch
              incidents={incidents}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={onSelectIncidentId}
              forecastMinutes={forecastMinutes}
              onReloadIncidents={onReloadIncidents}
              onReportHinglish={onReportHinglish}
            />

            <RouteDetours
              routes={availableRoutes}
              selectedRouteId={selectedRouteId}
              onSelectRouteId={onSelectRouteId}
              onDeployRoute={onDeployRoute}
              onNavigateToRoutePlanner={onNavigateToRoutePlanner}
            />

            <DispatchLog logs={dispatchLogs} />
          </div>
        </div>

        {/* Live Social Signal Feed Ticker */}
        <div className="mt-5 pt-3 border-t border-[#1A1A1A]/15 flex flex-col sm:flex-row items-center gap-3 bg-white border border-[#1A1A1A]/15 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D93B2D] font-mono uppercase whitespace-nowrap">
            <Clock className="w-4 h-4 text-[#D93B2D] animate-pulse" />
            <span>AI SOCIAL TELEMETRY:</span>
          </div>

          <div className="flex-grow overflow-hidden relative w-full text-xs text-[#1A1A1A] font-sans">
            <div className="flex items-center gap-6 animate-fade-up">
              <span className="bg-[#1A1A1A] text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                {socialSignals[0].platform} ({socialSignals[0].timeAgo})
              </span>
              <span className="truncate max-w-[600px] text-[#1A1A1A]/80">{socialSignals[0].text}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onOpenDemoModal}
              className="text-xs font-bold font-mono text-[#D93B2D] hover:underline uppercase whitespace-nowrap cursor-pointer border-none bg-transparent"
            >
              Simulate Disruption →
            </button>
            {FEATURES.fakeNews && onTriggerFakeNews && (
              <button
                onClick={onTriggerFakeNews}
                className="text-xs font-bold font-mono text-[#D97706] hover:underline uppercase whitespace-nowrap cursor-pointer border-none bg-transparent"
              >
                Inject Unverified Post ⚠️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera Feed Modal */}
      {activeCameraModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F2F0EB] border border-[#1A1A1A] max-w-lg w-full p-6 flex flex-col gap-4 shadow-2xl animate-zoom-in">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-3">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1A1A1A]">{activeCameraModal.junctionName}</h3>
                <p className="text-xs text-[#1A1A1A]/60 font-mono">{activeCameraModal.location}</p>
              </div>
              <button
                onClick={() => setActiveCameraModal(null)}
                className="text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white font-bold px-2 py-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="relative overflow-hidden aspect-video border border-[#1A1A1A]">
              <img src={activeCameraModal.snapshotUrl} alt="Camera view" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-[#D93B2D] text-white px-2 py-1 text-[10px] font-mono font-bold">
                ● LIVE FEED ({activeCameraModal.lastUpdated})
              </div>
              <div className="absolute bottom-2 right-2 bg-[#1A1A1A] text-white px-2.5 py-1 text-xs font-mono">
                Speed: {activeCameraModal.avgSpeed} km/h
              </div>
            </div>

            <div className="text-xs text-[#1A1A1A]/80 bg-white p-3 border border-[#1A1A1A]/15 font-mono">
              ANPR Optics #8402 detecting velocity drops, vehicle tailbacks, and lane queue formation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
