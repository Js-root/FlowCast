import React, { useState, useMemo } from 'react';
import { Incident, TrafficNode, CameraFeed, SocialSignal, RouteOption } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { verifyIncident, Verification } from '../lib/verify';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  Radio,
  Camera,
  ShieldAlert,
  Sliders,
  Search,
  ChevronRight
} from 'lucide-react';

const VerifyBadge: React.FC<{ v: Verification }> = ({ v }) =>
  v === 'confirmed' ? (
    <span className="text-[9px] font-mono font-bold uppercase bg-emerald-700 text-white px-1.5 py-0.5 whitespace-nowrap">
      ✓ Confirmed
    </span>
  ) : (
    <span className="text-[9px] font-mono font-bold uppercase bg-yellow-500 text-[#1A1A1A] px-1.5 py-0.5 whitespace-nowrap">
      ⚠ Unverified
    </span>
  );

interface DashboardProps {
  nodes: TrafficNode[];
  incidents: Incident[];
  cameras: CameraFeed[];
  socialSignals: SocialSignal[];
  routes: RouteOption[];
  onOpenDemoModal: () => void;
  onNavigateToRoutePlanner: () => void;
  onCorroborate: (inc: Incident) => void;
  dataLive: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  nodes,
  incidents,
  cameras,
  socialSignals,
  routes,
  onOpenDemoModal,
  onNavigateToRoutePlanner,
  onCorroborate,
  dataLive,
}) => {
  const [forecastMinutes, setForecastMinutes] = useState<number>(30);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('inc-1');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-cp');
  const [activeCameraModal, setActiveCameraModal] = useState<CameraFeed | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{
    summary?: string;
    criticalHotspots?: string[];
    recommendedAction?: string;
    confidenceScore?: number;
  } | null>(null);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  // Cross-validation gate: 1 signal = Unverified (yellow), >=2 or GPS drop = Confirmed (red).
  const verifications = useMemo(
    () =>
      Object.fromEntries(incidents.map((i) => [i.id, verifyIncident(i, socialSignals, nodes)])) as Record<
        string,
        Verification
      >,
    [incidents, socialSignals, nodes],
  );

  // Request AI Forecast from Backend
  const handleFetchAiForecast = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeIncidents: incidents,
          currentNodes: nodes,
          timeHorizonMinutes: forecastMinutes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiReport(data);
      }
    } catch (err) {
      console.error('Error fetching AI forecast:', err);
    } finally {
      setIsAiLoading(false);
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
            <span className={`hidden md:flex items-center gap-1.5 border px-2.5 py-0.5 font-bold uppercase tracking-wider ${
              dataLive ? 'text-emerald-700 bg-emerald-600/10 border-emerald-600/30' : 'text-[#D97706] bg-[#D97706]/10 border-[#D97706]/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${dataLive ? 'bg-emerald-600' : 'bg-[#D97706]'}`} />
              {dataLive ? 'LIVE DATA' : 'SIMULATION'}
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

        {/* Command Center Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Panel: Live Traffic Metrics */}
          <div className="lg:col-span-3 bg-white border border-[#1A1A1A]/15 p-5 flex flex-col gap-5 shadow-sm">
            {/* Headline Header */}
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
                <span className="text-[#1A1A1A]">Mod: 45%</span>
                <span className="text-emerald-700">Clear: 33%</span>
                <span className="text-[#D93B2D]">Heavy: 22%</span>
              </div>
              <div className="h-2 w-full bg-[#1A1A1A]/10 overflow-hidden flex">
                <div className="bg-[#1A1A1A] h-full" style={{ width: '45%' }} />
                <div className="bg-emerald-600 h-full" style={{ width: '33%' }} />
                <div className="bg-[#D93B2D] h-full" style={{ width: '22%' }} />
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10">
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider">Avg Speed</div>
                <div className="text-xl font-serif font-bold text-[#1A1A1A] mt-0.5">38 km/h</div>
                <div className="text-[10px] text-emerald-700 font-mono mt-1 font-semibold">
                  +2.4 km/h vs avg
                </div>
              </div>

              <div className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10">
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider">Deviation</div>
                <div className="text-xl font-serif font-bold text-[#D93B2D] mt-0.5">+14%</div>
                <div className="text-[10px] text-[#D93B2D]/80 font-mono mt-1 font-semibold">Peak hour delay</div>
              </div>

              <div className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10">
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider">Incidents</div>
                <div className="text-xl font-serif font-bold text-[#D93B2D] mt-0.5">18 Active</div>
                <div className="text-[10px] text-[#D93B2D]/80 font-mono mt-1 font-semibold">5 High Severity</div>
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
                <span className="text-[10px] text-[#1A1A1A]/50">Inspect</span>
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
            <div className="relative w-full border border-[#1A1A1A]/20 shadow-sm bg-[#101415] overflow-hidden">
              {/* Interactive Vector Map Canvas */}
              <InteractiveMap
                nodes={nodes}
                incidents={incidents}
                selectedIncidentId={selectedIncidentId}
                onSelectIncident={(id) => setSelectedIncidentId(id)}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
                forecastMinutesAhead={forecastMinutes}
                verifications={verifications}
              />

              {/* Editorial Floating Overlay Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-[#1A1A1A] p-4 w-[250px] md:w-[290px] shadow-xl flex flex-col gap-2 z-30 transition-all">
                <div className="text-[11px] font-mono font-bold text-[#D93B2D] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#D93B2D] animate-pulse-badge" />
                  <span>PREDICTIVE ALERT</span>
                  {selectedIncident && <span className="ml-auto"><VerifyBadge v={verifications[selectedIncident.id]} /></span>}
                </div>
                <div className="text-lg md:text-xl font-serif font-bold text-[#1A1A1A] tracking-tight leading-tight">
                  {selectedIncident ? selectedIncident.title : 'Severe Congestion'}
                </div>
                <div className="text-xs text-[#1A1A1A]/80 flex items-center gap-1.5 font-medium font-sans">
                  <Clock className="w-3.5 h-3.5 text-[#D93B2D]" />
                  <span>
                    Cascade starts in <span className="text-[#D93B2D] font-mono font-bold">{selectedIncident ? selectedIncident.startsInMinutes : 24} mins</span>
                  </span>
                </div>
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono border-t border-[#1A1A1A]/10 pt-2 mt-0.5">
                  Confidence: <span className="text-emerald-700 font-bold">{selectedIncident ? selectedIncident.confidencePercent : 94}%</span> ({selectedIncident?.socialSource || 'Multi-channel social feed'})
                </div>
                {selectedIncident && verifications[selectedIncident.id] === 'unverified' && (
                  <button
                    onClick={() => onCorroborate(selectedIncident)}
                    className="mt-1 text-[10px] font-mono font-bold uppercase bg-yellow-500 text-[#1A1A1A] px-2 py-1.5 hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
                  >
                    ⚠ Unverified — Corroborate with 2nd source
                  </button>
                )}
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

              {/* Slider / Time Selector Buttons */}
              <div className="flex items-center gap-1 bg-[#F2F0EB] p-1 border border-[#1A1A1A]/15">
                {[0, 15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setForecastMinutes(mins)}
                    className={`px-3 py-1 text-xs font-bold font-mono transition-all cursor-pointer ${
                      forecastMinutes === mins
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white'
                    }`}
                  >
                    {mins === 0 ? 'Now' : `+${mins}m`}
                  </button>
                ))}
              </div>

              {/* Generate AI Report Button */}
              <button
                onClick={handleFetchAiForecast}
                disabled={isAiLoading}
                className="bg-[#D93B2D] hover:bg-[#1A1A1A] text-white px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Sparkles className={`w-4 h-4 text-white ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>{isAiLoading ? 'Simulating...' : 'AI Forecast'}</span>
              </button>
            </div>

            {/* AI Real-time Report Banner if available */}
            {aiReport && (
              <div className="bg-white border border-[#D93B2D] p-5 flex flex-col gap-2 shadow-md animate-fade-up">
                <div className="flex items-center justify-between text-xs font-bold text-[#D93B2D] font-mono">
                  <span className="flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Llama 3.3 70B Forecast (+{forecastMinutes} mins)</span>
                  </span>
                  <span className="bg-[#D93B2D] text-white px-2 py-0.5 text-[10px]">
                    CONFIDENCE: {aiReport.confidenceScore || 94}%
                  </span>
                </div>
                <p className="text-xs text-[#1A1A1A] leading-relaxed font-sans">{aiReport.summary}</p>
                {aiReport.recommendedAction && (
                  <div className="text-xs text-[#1A1A1A] bg-[#F2F0EB] p-3 border-l-4 border-[#D93B2D] mt-1 font-mono font-medium">
                    💡 ACTION: {aiReport.recommendedAction}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Incident Reports & Route Alternatives */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Incident Reports Card */}
            <div className="bg-white border border-[#1A1A1A]/15 p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] font-serif flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#D93B2D]" />
                  <span>Incident Dispatch</span>
                </span>
                <span className="text-[10px] text-white bg-[#D93B2D] px-2 py-0.5 font-mono font-bold">
                  ● CRITICAL
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {incidents.map((inc) => {
                  const isSelected = selectedIncidentId === inc.id;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      className={`p-3 border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-[#F2F0EB] border-[#D93B2D] shadow-sm'
                          : 'bg-white border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-[#1A1A1A] font-serif leading-tight">{inc.title}</span>
                        <span className="text-xs font-mono font-bold text-[#D93B2D] bg-[#D93B2D]/10 border border-[#D93B2D]/20 px-1.5 py-0.5 whitespace-nowrap ml-2">
                          +{inc.delayMinutes}m
                        </span>
                      </div>
                      <div className="text-[11px] text-[#1A1A1A]/60 flex items-center justify-between font-sans">
                        <span className="flex items-center gap-1.5">
                          <VerifyBadge v={verifications[inc.id]} />
                          {inc.area}
                        </span>
                        <span className="text-[#D93B2D] font-mono text-[10px] font-bold">Starts in {inc.startsInMinutes}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Route Alternatives Card */}
            <div className="bg-white border border-[#1A1A1A]/15 p-4 flex flex-col gap-3 flex-grow shadow-sm">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] font-serif flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#D93B2D]" />
                  <span>Route Detours</span>
                </span>
                <button
                  onClick={onNavigateToRoutePlanner}
                  className="text-[11px] font-mono font-bold text-[#D93B2D] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Planner</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[11px] text-[#1A1A1A]/60 font-sans">
                AI-optimized detour paths with predicted travel times & bottlenecks.
              </p>

              {/* Preset Route Cards with Sparkline Visualizers */}
              <div className="space-y-2.5">
                {routes.map((rt) => (
                  <div
                    key={rt.id}
                    onClick={onNavigateToRoutePlanner}
                    className={`p-3 border transition-all cursor-pointer flex flex-col gap-2 ${
                      rt.isAiRecommended
                        ? 'bg-[#F2F0EB] border-emerald-600'
                        : 'bg-white border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {rt.isAiRecommended && (
                          <span className="text-[9px] uppercase font-bold font-mono bg-emerald-700 text-white px-1.5 py-0.5">
                            AI OPTIMAL
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#1A1A1A] font-serif truncate max-w-[170px]">{rt.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#1A1A1A]">
                        {rt.predictedTimeMins} mins
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#1A1A1A]/60 font-sans">
                      <span>{rt.viaRoads}</span>
                      <span className={rt.delayMins > 15 ? 'text-[#D93B2D] font-mono font-bold' : 'text-emerald-700 font-mono font-bold'}>
                        +{rt.delayMins}m delay
                      </span>
                    </div>

                    {/* Miniature Congestion Sparkline SVG */}
                    <div className="h-6 w-full pt-1">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20">
                        <polyline
                          fill="none"
                          stroke={rt.isAiRecommended ? '#047857' : '#D93B2D'}
                          strokeWidth="2"
                          points={rt.sparklineData.map((val, idx) => `${(idx / (rt.sparklineData.length - 1)) * 100},${20 - (val / 65) * 18}`).join(' ')}
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Social Signal Feed Ticker */}
        <div className="mt-5 pt-3 border-t border-[#1A1A1A]/15 flex flex-col sm:flex-row items-center gap-3 bg-white border border-[#1A1A1A]/15 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D93B2D] font-mono uppercase whitespace-nowrap">
            <Radio className="w-4 h-4 text-[#D93B2D] animate-pulse" />
            <span>AI SOCIAL TELEMETRY:</span>
          </div>

          <div className="flex-grow overflow-hidden relative w-full text-xs text-[#1A1A1A] font-sans">
            <div className="flex items-center gap-6 animate-fade-up">
              <span className="bg-[#1A1A1A] text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                {socialSignals[0].platform} ({socialSignals[0].timeAgo})
              </span>
              <span className="truncate max-w-[800px] text-[#1A1A1A]/80">{socialSignals[0].text}</span>
            </div>
          </div>

          <button
            onClick={onOpenDemoModal}
            className="text-xs font-bold font-mono text-[#D93B2D] hover:underline uppercase whitespace-nowrap cursor-pointer"
          >
            Simulate Disruption →
          </button>
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
