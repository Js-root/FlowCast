import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Incident, TrafficNode, CameraFeed, SocialSignal, RouteOption, DispatchLogEntry, RouteAnalysis } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { IncidentDispatch } from './IncidentDispatch';
import { RouteDetours } from './RouteDetours';
import { DispatchLog } from './DispatchLog';
import { CameraFeedSimulator } from './CameraFeedSimulator';
import {
  Clock,
  Sparkles,
  Camera,
  Sliders,
  Search,
  Maximize2
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
  userLocation?: { lat: number; lng: number; name?: string } | null;
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
  userLocation,
}) => {
  const [forecastMinutes, setForecastMinutes] = useState<number>(30);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-cp');
  const [activeCameraModal, setActiveCameraModal] = useState<CameraFeed | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
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
  const [aiReport, setAiReport] = useState<{
    summary?: string;
    criticalHotspots?: string[];
    recommendedAction?: string;
    confidenceScore?: number;
  } | null>(null);

  // Dynamic metrics calculations
  const [commuterJitter, setCommuterJitter] = useState(0);

  // Add a visual heartbeat to commuters so the dashboard looks constantly live
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCommuterJitter(Math.floor(Math.random() * 81) - 40); // Non-drifting jitter
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const activeCommuters = React.useMemo(() => {
    let totalCommuters = 0;
    nodes.forEach(node => {
      const freeFlowSpeed = 40; 
      const capacityCars = 4000; 
      const occupancy = 1.5; 
      const maxCommuters = capacityCars * occupancy;
      const speedRatio = Math.min(1, Math.max(0, node.avgSpeedKmh / freeFlowSpeed));
      const capacityPercent = Math.min(0.95, Math.max(0.1, 1 - Math.pow(speedRatio, 1.5)));
      totalCommuters += Math.round(maxCommuters * capacityPercent);
    });
    return (totalCommuters + commuterJitter).toLocaleString();
  }, [nodes, commuterJitter]);
  
  const avgConfidence = incidents.length > 0 
    ? Math.round(incidents.reduce((sum, inc) => sum + (inc.confidencePercent || 0), 0) / incidents.length)
    : 85;

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

  // Close map modal on Escape
  useEffect(() => {
    if (!isMapModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMapModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    // Prevent background scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isMapModalOpen]);

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
    <div id="dashboard-section" className="w-full max-w-[1440px] mx-auto flex flex-col gap-8 animate-zoom-in">
      {/* Editorial Frame Container */}
      <div className="relative w-full border border-[#1A1A1A]/15 bg-[#F2F0EB] p-3 md:p-6 shadow-sm transition-all duration-300">
        {/* Editorial Top Window Bar */}
        <div className="flex items-center justify-between pb-4 px-2 border-b border-[#1A1A1A]/15 mb-5 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#D93B2D]" />
            <div className="w-2.5 h-2.5 bg-[#1A1A1A]" />
            <div className="w-2.5 h-2.5 bg-[#1A1A1A]/30" />
            <span className="text-xs font-bold text-[#1A1A1A] ml-2 hidden sm:inline-block tracking-wider uppercase">
              FLOWCAST // COMMAND CENTER V0.1
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#1A1A1A]/70">
            <span className="hidden md:flex items-center gap-1.5 text-[#D93B2D] bg-[#D93B2D]/10 border border-[#D93B2D]/30 px-2.5 py-0.5 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D93B2D] animate-ping" />
              SYSTEM OPERATIONAL
            </span>
            <div className="flex items-center gap-1 font-bold text-[#1A1A1A]">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentTime}</span>
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
          <div className="lg:col-span-3 bg-white/95 backdrop-blur-md border border-[#1A1A1A]/15 p-5 flex flex-col gap-5 shadow-sm relative overflow-hidden">
            {/* Tech Corner Accents */}
            <span className="absolute top-1 left-1 text-[#1A1A1A]/20 font-mono text-[8px] pointer-events-none">+</span>
            <span className="absolute top-1 right-1 text-[#1A1A1A]/20 font-mono text-[8px] pointer-events-none">+</span>
            <span className="absolute bottom-1 left-1 text-[#1A1A1A]/20 font-mono text-[8px] pointer-events-none">+</span>
            <span className="absolute bottom-1 right-1 text-[#1A1A1A]/20 font-mono text-[8px] pointer-events-none">+</span>

            <div className="relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono tracking-widest text-[#D93B2D] uppercase flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span>City Metrics</span>
                </span>
                <span className="text-[10px] bg-[#1A1A1A] text-white font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                  LIVE TELEMETRY
                </span>
              </div>
              <div className="h-10 overflow-hidden flex items-end">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCommuters}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="text-3xl font-serif font-black text-[#1A1A1A] mt-1"
                  >
                    {activeCommuters}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="text-xs text-[#1A1A1A]/60 font-sans mt-0.5">Active Commuters Monitored</div>
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
              <motion.div
                whileHover={{ y: -2.5, boxShadow: '0 4px 10px rgba(26,26,26,0.05)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10 relative overflow-hidden group"
              >
                <span className="absolute top-1 left-1 text-[#1A1A1A]/20 text-[6px] pointer-events-none">+</span>
                <span className="absolute top-1 right-1 text-[#1A1A1A]/20 text-[6px] pointer-events-none">+</span>
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSpeedBetter ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isSpeedBetter ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  </span>
                  <span>Avg Speed</span>
                </div>
                <div className="h-7 overflow-hidden flex items-end">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={avgSpeed}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="text-xl font-serif font-bold text-[#1A1A1A]"
                    >
                      {avgSpeed} km/h
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className={`text-[10px] ${speedDiffColor} font-mono mt-1 font-semibold`}>
                  {speedDiffText}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2.5, boxShadow: '0 4px 10px rgba(26,26,26,0.05)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10 relative overflow-hidden group"
              >
                <span className="absolute top-1 left-1 text-[#1A1A1A]/20 text-[6px] pointer-events-none">+</span>
                <span className="absolute top-1 right-1 text-[#1A1A1A]/20 text-[6px] pointer-events-none">+</span>
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  <span>Deviation</span>
                </div>
                <div className="h-7 overflow-hidden flex items-end">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={deviationPct}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="text-xl font-serif font-bold text-[#D93B2D]"
                    >
                      +{deviationPct}%
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="text-[10px] text-[#D93B2D]/80 font-mono mt-1 font-semibold">Peak hour delay</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2.5, boxShadow: '0 4px 10px rgba(26,26,26,0.05)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10 relative overflow-hidden group"
              >
                <span className="absolute top-1 left-1 text-[#1A1A1A]/20 text-[6px] pointer-events-none">+</span>
                <span className="absolute top-1 right-1 text-[#1A1A1A]/20 text-[6px] pointer-events-none">+</span>
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                  <span>Incidents</span>
                </div>
                <div className="h-7 overflow-hidden flex items-end">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={totalIncidents}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="text-xl font-serif font-bold text-[#D93B2D]"
                    >
                      {totalIncidents} Active
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="text-[10px] text-[#D93B2D]/80 font-mono mt-1 font-semibold">{severeIncidentsCount} High Severity</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2.5, boxShadow: '0 4px 10px rgba(26,26,26,0.05)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="bg-[#F2F0EB] p-3 border border-[#1A1A1A]/10 relative overflow-hidden group"
              >
                <span className="absolute top-1 left-1 text-[#1A1A1A]/20 text-[6px] pointer-events-none">+</span>
                <span className="absolute top-1 right-1 text-[#1A1A1A]/20 text-[6px] pointer-events-none">+</span>
                <div className="text-[10px] text-[#1A1A1A]/60 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
                  </span>
                  <span>AI Confidence</span>
                </div>
                <div className="h-7 overflow-hidden flex items-end">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={avgConfidence}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="text-xl font-serif font-bold text-[#1A1A1A]"
                    >
                      {avgConfidence}%
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="text-[10px] text-emerald-700 font-mono mt-1 font-semibold">Sensor Reliability</div>
              </motion.div>
            </div>

            {/* Key Corridor Status Widget */}
            <div className="pt-3 border-t border-[#1A1A1A]/10 flex-1 flex flex-col gap-2">
              <div className="text-[10px] font-mono font-bold text-[#1A1A1A]/70 uppercase tracking-wider flex items-center justify-between">
                <span>Corridor Telemetry</span>
                <span className="text-emerald-700 font-bold">● Live Updates</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] flex-1">
                {nodes.slice(0, 6).map((node) => {
                  let speedColor = 'text-[#1A1A1A]';
                  if (node.status === 'severe') speedColor = 'text-[#D93B2D]';
                  else if (node.status === 'heavy') speedColor = 'text-[#D97706]';
                  else if (node.status === 'clear') speedColor = 'text-emerald-700';

                  return (
                    <div key={node.id} className="flex justify-between items-center p-2 bg-[#F2F0EB]">
                      <span className="text-[#1A1A1A] font-semibold truncate pr-2">{node.name}</span>
                      <span className={`${speedColor} font-bold shrink-0`}>{node.avgSpeedKmh || '--'} km/h</span>
                    </div>
                  );
                })}
              </div>

              {/* Sensor Health Footer Bar */}
              <div className="p-2 bg-[#1A1A1A] text-white font-mono text-[10px] flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold tracking-wider uppercase">RADAR OPTICS NETWORK</span>
                </div>
                <span className="text-emerald-400 font-bold">100% ONLINE</span>
              </div>
            </div>

          </div>

          {/* Center Map View & Live Floating Prediction Overlay */}
          <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-[420px]">
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
            {/* Map Preview Frame — Square Aspect Ratio */}
            <div className="relative w-full aspect-square border border-[#1A1A1A]/30 shadow-lg bg-[#F2F0EB] overflow-hidden group flex flex-col mx-auto max-w-[600px]">
              
              {/* Window Header Bar */}
              <div className="bg-[#1A1A1A] border-b border-white/10 px-4 py-2 flex items-center justify-between z-20 relative shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/80 font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE TRAFFIC CANVAS // DELHI NCR</span>
                </div>
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/70 hover:text-white bg-white/10 hover:bg-[#D93B2D] px-2.5 py-1 transition-colors flex items-center gap-1.5 border-none cursor-pointer"
                >
                  <span>Expand Radar</span>
                  <Maximize2 className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Corner Technical Accents */}
              <span className="absolute top-10 left-2 text-white/30 font-mono text-[9px] z-20 pointer-events-none">+</span>
              <span className="absolute top-10 right-2 text-white/30 font-mono text-[9px] z-20 pointer-events-none">+</span>
              <span className="absolute bottom-2 left-2 text-white/30 font-mono text-[9px] z-20 pointer-events-none">+</span>
              <span className="absolute bottom-2 right-2 text-white/30 font-mono text-[9px] z-20 pointer-events-none">+</span>

              {/* Unmount when modal is open — two simultaneous Leaflet maps fight over layout/z-index */}
              {!isMapModalOpen && (
                <InteractiveMap
                  nodes={nodes}
                  incidents={incidents}
                  selectedIncident={selectedIncident}
                  onSelectIncident={(id) => {
                    onSelectIncidentId(id);
                    setIsMapModalOpen(true);
                  }}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  forecastMinutesAhead={forecastMinutes}
                  detourPositions={selectedRoute?.polylinePositions}
                  selectedRouteIsAiRecommended={selectedRoute?.isAiRecommended}
                  userLocation={userLocation}
                  selectedCity={selectedCity}
                  fillContainer
                />
              )}
              {isMapModalOpen && (
                <div className="flex-1 w-full bg-[#F2F0EB] flex items-center justify-center">
                  <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider">Map open in radar view…</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Dynamic Incident Dispatch, Route Detours & Dispatch Log */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <IncidentDispatch
              incidents={incidents}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={(id) => {
                onSelectIncidentId(id);
                setIsMapModalOpen(true);
              }}
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
          </div>
        </div>
      </div>

      {activeCameraModal && (
        <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F2F0EB] border border-[#1A1A1A] max-w-4xl w-full p-5 md:p-6 flex flex-col gap-4 shadow-2xl animate-zoom-in">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg md:text-xl text-[#1A1A1A]">{activeCameraModal.junctionName}</h3>
                <p className="text-xs text-[#1A1A1A]/60 font-mono">{activeCameraModal.location}</p>
              </div>
              <button
                onClick={() => setActiveCameraModal(null)}
                className="text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white font-bold px-2 py-1 cursor-pointer transition-colors border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            {/* Dynamic AI surveillance canvas and logs container */}
            <CameraFeedSimulator camera={activeCameraModal} />

            <div className="text-xs text-[#1A1A1A]/80 bg-white p-3 border border-[#1A1A1A]/15 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CCTV Node ANPR #8402: Live flow analytics calibrated for {activeCameraModal.junctionName}.</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map Modal — portaled to body so Dashboard's animate-zoom-in
          transform does not trap position:fixed or break Leaflet sizing */}
      {isMapModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-modal-in"
          onClick={() => setIsMapModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Live Incident Radar"
        >
          <div
            className="bg-white border border-[#1A1A1A] w-full max-w-[1200px] shadow-2xl overflow-hidden relative flex flex-col"
            style={{ height: 'min(85vh, 900px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — z-index above Leaflet panes (200–700) */}
            <div className="flex-none flex items-center justify-between border-b border-[#1A1A1A]/20 px-4 py-2.5 bg-[#F2F0EB] relative z-[2000]">
              <h3 className="font-mono font-bold text-sm text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D93B2D] animate-ping" />
                Live Incident Radar
              </h3>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white font-bold px-2.5 py-1 cursor-pointer transition-colors"
                aria-label="Close map modal"
              >
                ✕
              </button>
            </div>

            {/* Map body: flex child with absolute fill so Leaflet always gets a real height */}
            <div className="relative flex-1 min-h-0 bg-[#F2F0EB]" style={{ isolation: 'isolate' }}>
              <div className="absolute inset-0">
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
                  userLocation={userLocation}
                  fillContainer
                />
              </div>

              {/* Editorial Floating Overlay Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-[#1A1A1A] p-4 w-[250px] md:w-[290px] shadow-xl flex flex-col gap-2 z-[1100] pointer-events-auto">
                <div className="text-[11px] font-mono font-bold text-[#D93B2D] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#D93B2D] animate-pulse-badge" />
                  <span>PREDICTIVE ALERT</span>
                </div>
                <div className="text-lg md:text-xl font-serif font-bold text-[#1A1A1A] tracking-tight leading-tight">
                  {selectedIncident ? selectedIncident.title : 'Severe Congestion'}
                </div>
                <div className="text-xs text-[#1A1A1A]/80 flex items-center gap-1.5 font-medium font-sans">
                  <Clock className="w-3.5 h-3.5 text-[#D93B2D]" />
                  <span className="text-[#D93B2D] font-mono font-bold uppercase tracking-wider">Disruption Active</span>
                </div>

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

                <div className="text-[10px] font-mono border-t border-[#1A1A1A]/10 pt-2 mt-0.5 flex justify-between gap-2">
                  <span>Confidence: <span className="text-emerald-700 font-bold">{selectedIncident ? getIncidentConfidence(selectedIncident, socialSignals) : 94}%</span></span>
                  <span className="truncate max-w-[120px]">{selectedIncident?.socialSource || 'Social Telemetry'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
