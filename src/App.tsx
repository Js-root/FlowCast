import React, { useState } from 'react';
import { NavTab, TrafficNode, Incident, SocialSignal, RouteOption, DispatchLogEntry, RouteAnalysis } from './types';
import { INITIAL_INCIDENTS, INITIAL_SOCIAL_SIGNALS, CAMERA_FEEDS } from './data/delhiTrafficData';
import { CITIES } from './constants/cities';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Dashboard } from './components/Dashboard';
import { FeatureGrid } from './components/FeatureGrid';
import { RoutePlanner } from './components/RoutePlanner';
import { AboutAI } from './components/AboutAI';
import { Documentation } from './components/Documentation';
import { DemoSimulationModal } from './components/DemoSimulationModal';
import { Footer } from './components/Footer';
import { useRouteSelection } from './hooks/useRouteSelection';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedCity, setSelectedCity] = useState<string>('delhi');
  const [nodes, setNodes] = useState<TrafficNode[]>(CITIES.delhi.nodes);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [socialSignals, setSocialSignals] = useState<SocialSignal[]>(INITIAL_SOCIAL_SIGNALS);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Route analysis states
  const [activeRouteAnalysis, setActiveRouteAnalysis] = useState<RouteAnalysis | null>(null);
  const [routeAnalysisLoading, setRouteAnalysisLoading] = useState(false);
  const [selectedRouteIdOverride, setSelectedRouteIdOverride] = useState<string | null>(null);

  // Custom Selection Hook
  const {
    selectedIncidentId,
    setSelectedIncidentId,
    selectedRouteId,
    setSelectedRouteId,
    selectedIncident,
    selectedRoute,
    availableRoutes,
  } = useRouteSelection(incidents);

  // Load live TomTom incidents on mount / city change
  React.useEffect(() => {
    const fetchLiveIncidents = async () => {
      try {
        const cityConfig = CITIES[selectedCity];
        const res = await fetch(`/api/live-incidents?bbox=${encodeURIComponent(cityConfig.bbox)}`);
        if (!res.ok) throw new Error('Live incidents request failed');
        const data = await res.json();
        if (data.success && data.incidents) {
          let finalIncidents = data.incidents;
          if (finalIncidents.length === 0) {
            // Generate 2 realistic mock incidents for the selected city
            const center = cityConfig.center;
            finalIncidents = [
              {
                id: `${selectedCity}-mock-1`,
                title: `Minor Collision near City Center`,
                area: `${cityConfig.name} Arterial Road`,
                severity: 'moderate',
                category: 'collision',
                delayMinutes: 15,
                startsInMinutes: 0,
                confidencePercent: 95,
                socialSource: "Citizen Report",
                description: `Stalled vehicle causing single lane blockage.`,
                coords: { x: 45, y: 48 },
                lat: center[0] + 0.005,
                lng: center[1] - 0.005,
                cascadingRoads: [`Primary Corridor`],
                affectedRoads: [`Primary Corridor`],
                verificationStatus: 'confirmed',
                sourcesCount: 3
              },
              {
                id: `${selectedCity}-mock-2`,
                title: `Road Construction Delay`,
                area: `${cityConfig.name} Bypass Link`,
                severity: 'heavy',
                category: 'construction',
                delayMinutes: 32,
                startsInMinutes: 0,
                confidencePercent: 98,
                socialSource: "Municipal Alert",
                description: `Flyover repair works blocking two right lanes.`,
                coords: { x: 60, y: 70 },
                lat: center[0] - 0.008,
                lng: center[1] + 0.008,
                cascadingRoads: [`Bypass Loop`],
                affectedRoads: [`Bypass Loop`],
                verificationStatus: 'confirmed',
                sourcesCount: 12
              }
            ];
          }
          setIncidents(finalIncidents);
          
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          setDispatchLogs((prev) => [
            {
              id: `log-live-load-${Date.now()}`,
              time: timeStr,
              title: `Live Telemetry Loaded (${cityConfig.name})`,
              details: `Synced ${finalIncidents.length} active incidents for ${cityConfig.name} via TomTom.`,
              type: 'system'
            },
            ...prev
          ]);
        }
      } catch (err) {
        console.warn('Failed to load live TomTom incidents. Defaulting to mock incidents.', err);
        const cityConfig = CITIES[selectedCity];
        const center = cityConfig.center;
        const mockIncidents = [
          {
            id: `${selectedCity}-mock-1`,
            title: `Minor Collision near City Center`,
            area: `${cityConfig.name} Arterial Road`,
            severity: 'moderate' as const,
            category: 'collision' as const,
            delayMinutes: 15,
            startsInMinutes: 0,
            confidencePercent: 95,
            socialSource: "Citizen Report",
            description: `Stalled vehicle causing single lane blockage.`,
            coords: { x: 45, y: 48 },
            lat: center[0] + 0.005,
            lng: center[1] - 0.005,
            cascadingRoads: [`Primary Corridor`],
            affectedRoads: [`Primary Corridor`],
            verificationStatus: 'confirmed' as const,
            sourcesCount: 3
          },
          {
            id: `${selectedCity}-mock-2`,
            title: `Road Construction Delay`,
            area: `${cityConfig.name} Bypass Link`,
            severity: 'heavy' as const,
            category: 'construction' as const,
            delayMinutes: 32,
            startsInMinutes: 0,
            confidencePercent: 98,
            socialSource: "Municipal Alert",
            description: `Flyover repair works blocking two right lanes.`,
            coords: { x: 60, y: 70 },
            lat: center[0] - 0.008,
            lng: center[1] + 0.008,
            cascadingRoads: [`Bypass Loop`],
            affectedRoads: [`Bypass Loop`],
            verificationStatus: 'confirmed' as const,
            sourcesCount: 12
          }
        ];
        setIncidents(mockIncidents);
      }
    };
    
    // Set nodes for city
    setNodes(CITIES[selectedCity].nodes);
    // Reset selected route override/analysis on city change
    setActiveRouteAnalysis(null);
    setSelectedRouteIdOverride(null);

    fetchLiveIncidents();
  }, [selectedCity]);

  const handleReloadLiveIncidents = async () => {
    const cityConfig = CITIES[selectedCity];
    triggerToast(`Syncing with TomTom Live Traffic Sensors (${cityConfig.name})...`);
    try {
      const res = await fetch(`/api/live-incidents?bbox=${encodeURIComponent(cityConfig.bbox)}`);
      if (!res.ok) throw new Error('Live incidents request failed');
      const data = await res.json();
      if (data.success && data.incidents) {
        let finalIncidents = data.incidents;
        if (finalIncidents.length === 0) {
          triggerToast(`✓ Synchronized. No new active incidents in ${cityConfig.name}.`);
          return;
        }
        setIncidents(finalIncidents);
        
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setDispatchLogs((prev) => [
          {
            id: `log-live-refresh-${Date.now()}`,
            time: timeStr,
            title: `Live Telemetry Synced (${cityConfig.name})`,
            details: `Refreshed ${finalIncidents.length} active incidents.`,
            type: 'system'
          },
          ...prev
        ]);
        triggerToast(`✓ Synchronized ${finalIncidents.length} live traffic events.`);
      }
    } catch (err) {
      console.warn(err);
      triggerToast("⚠️ Sync Failed: defaulting to offline mock database.");
    }
  };

  // Auto-select first TomTom route when analysis completes
  React.useEffect(() => {
    if (activeRouteAnalysis) {
      setSelectedRouteIdOverride('rt-tomtom-ai');
    } else {
      setSelectedRouteIdOverride(null);
    }
  }, [activeRouteAnalysis]);

  // Translate TomTom Live Route Analysis into RouteOption[] format
  const currentRoutes = React.useMemo<RouteOption[]>(() => {
    if (activeRouteAnalysis) {
      return [
        {
          id: 'rt-tomtom-ai',
          name: `Option 1: AI Recommended Detour`,
          distanceKm: activeRouteAnalysis.aiRoute.distanceKm,
          normalTimeMins: activeRouteAnalysis.aiRoute.etaMinutes - activeRouteAnalysis.aiRoute.delayMinutes,
          predictedTimeMins: activeRouteAnalysis.aiRoute.etaMinutes,
          delayMins: activeRouteAnalysis.aiRoute.delayMinutes,
          isAiRecommended: true,
          congestionPoints: ['TomTom Dynamic Detour Path'],
          sparklineData: [8, 12, 10, 9, 8],
          viaRoads: activeRouteAnalysis.aiRoute.viaRoads,
          etaMinutes: activeRouteAnalysis.aiRoute.etaMinutes,
          predictedDelayMinutes: activeRouteAnalysis.aiRoute.delayMinutes,
          savedMinutes: activeRouteAnalysis.comparison.savedMinutes,
          risk: activeRouteAnalysis.comparison.riskLevel,
          arrivalProbability: 95,
          polylinePositions: activeRouteAnalysis.aiRoute.polylinePositions
        },
        {
          id: 'rt-tomtom-standard',
          name: `Option 2: Standard GPS Route`,
          distanceKm: activeRouteAnalysis.standardRoute.distanceKm,
          normalTimeMins: activeRouteAnalysis.standardRoute.etaMinutes - activeRouteAnalysis.standardRoute.delayMinutes,
          predictedTimeMins: activeRouteAnalysis.standardRoute.etaMinutes,
          delayMins: activeRouteAnalysis.standardRoute.delayMinutes,
          isAiRecommended: false,
          congestionPoints: ['Live Congested Corridors'],
          sparklineData: [15, 28, 42, 50, 48],
          viaRoads: activeRouteAnalysis.standardRoute.viaRoads,
          etaMinutes: activeRouteAnalysis.standardRoute.etaMinutes,
          predictedDelayMinutes: activeRouteAnalysis.standardRoute.delayMinutes,
          savedMinutes: 0,
          risk: 'high',
          arrivalProbability: 60,
          polylinePositions: activeRouteAnalysis.standardRoute.polylinePositions
        }
      ];
    }
    return availableRoutes;
  }, [activeRouteAnalysis, availableRoutes]);

  const activeRouteId = selectedRouteIdOverride || selectedRouteId;
  const activeRoute = React.useMemo(() => {
    return currentRoutes.find((r) => r.id === activeRouteId) || currentRoutes[0] || null;
  }, [currentRoutes, activeRouteId]);

  const handleSelectRouteId = (id: string) => {
    if (activeRouteAnalysis) {
      setSelectedRouteIdOverride(id);
    } else {
      setSelectedRouteId(id);
    }
  };

  // Live Operations Dispatch Log
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLogEntry[]>([
    {
      id: 'log-init-1',
      time: '15:20',
      title: 'System Initialized',
      details: 'Active sensors mapping Delhi NCR bounds.',
      type: 'system'
    },
    {
      id: 'log-init-2',
      time: '15:24',
      title: 'Llama AI Engine Online',
      details: 'Fastag and telemetry streams connected.',
      type: 'system'
    }
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 6000);
  };

  const handleReportHinglish = async (text: string) => {
    triggerToast("Hinglish NLP: Extracting location and disruption details...");
    try {
      const res = await fetch('/api/parse-hinglish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success && data.incident) {
        const inc = data.incident;
        setIncidents((prev) => [inc, ...prev]);
        setSelectedIncidentId(inc.id);

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        setDispatchLogs((prev) => [
          {
            id: `log-hinglish-${Date.now()}`,
            time: timeStr,
            title: 'Hinglish AI Ingested',
            details: `Parsed location: "${inc.area}" | ${inc.description}`,
            type: 'alert'
          },
          ...prev
        ]);
        
        triggerToast(`✓ AI Ingested: ${inc.title}`);
        
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`Disruption report ingested. ${inc.title}. estimated delay: ${inc.delayMinutes} minutes.`);
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast("⚠️ Hinglish parsing failed.");
    }
  };

  // Dispatch selected AI Route
  const handleDeployRoute = (route: RouteOption) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLog: DispatchLogEntry = {
      id: `log-deploy-${Date.now()}`,
      time: timeStr,
      title: 'AI Route Deployed',
      details: `${route.name} via ${route.viaRoads}.`,
      meta: `14 Vehicles Updated | saved ${route.savedMinutes} min`,
      type: 'deploy'
    };

    setDispatchLogs((prev) => [newLog, ...prev]);
    triggerToast(`✓ AI Route Deployed: 14 Fleet Vehicles updated. ETA improved by ${route.savedMinutes} mins.`);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const areaText = activeRouteAnalysis ? "analysis corridor" : (selectedIncident?.area || 'incident area');
      const sentence = `Attention. Congestion predicted near ${areaText}. Recommended detour via ${route.viaRoads}. Estimated time saved: ${route.savedMinutes} minutes.`;
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger scenario handler
  const handleTriggerIncident = (newInc: Incident) => {
    // Add startsInMinutes, affectedRoads, verificationStatus and sourcesCount
    const processedInc: Incident = {
      ...newInc,
      verificationStatus: 'confirmed',
      sourcesCount: 18,
      affectedRoads: [newInc.area]
    };

    setIncidents((prev) => [processedInc, ...prev]);

    // Update nodes status to severe
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === 'node-cp' || n.id === 'node-aiims' || n.id === 'node-nh44') {
          return { ...n, status: 'severe', avgSpeedKmh: Math.max(8, n.avgSpeedKmh - 12), delayMinutes: n.delayMinutes + 20 };
        }
        return n;
      })
    );

    // Add corresponding social signal
    const newSignal: SocialSignal = {
      id: `sig-${Date.now()}`,
      timeAgo: 'Just now',
      platform: 'Delhi Traffic Police',
      handle: '@dtptraffic',
      text: `SIMULATION ALERT: ${newInc.title} at ${newInc.area}. Estimated delay +${newInc.delayMinutes} mins. Diversions active.`,
      sentiment: 'warning',
      reliabilityScore: 100,
      impactArea: newInc.area,
    };
    setSocialSignals((prev) => [newSignal, ...prev]);

    // Log incident alert in ledger
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const alertLog: DispatchLogEntry = {
      id: `log-alert-${Date.now()}`,
      time: timeStr,
      title: 'Telemetry Alert Injected',
      details: `${newInc.title} at ${newInc.area}.`,
      type: 'alert'
    };
    setDispatchLogs((prev) => [alertLog, ...prev]);

    // Trigger visual toast
    triggerToast(`Heavy congestion expected at ${newInc.area} in ${newInc.startsInMinutes} mins. Delay: +${newInc.delayMinutes}m.`);

    // Spoken Warning via Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Warning: Heavy congestion expected near ${newInc.area} in ${newInc.startsInMinutes} minutes.`);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }

    setActiveTab('dashboard');
  };

  // Fake-News inject simulation state
  const handleTriggerFakeNews = () => {
    const exists = incidents.some((inc) => inc.id === 'fake-chanakyapuri');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!exists) {
      // First click: inject unverified warning
      const fakeInc: Incident = {
        id: 'fake-chanakyapuri',
        title: 'Reported Road Cave-in at Chanakyapuri',
        area: 'Chanakyapuri (Near Diplomatic Enclave)',
        severity: 'heavy',
        category: 'construction',
        delayMinutes: 20,
        startsInMinutes: 25,
        confidencePercent: 50,
        socialSource: 'Citizen Alert',
        description: 'Single uncorroborated post reporting a sudden road collapse near Chanakyapuri. Status: Unverified Warning.',
        coords: { x: 36, y: 58 },
        lat: 28.5930,
        lng: 77.1860,
        cascadingRoads: ['Sardar Patel Marg'],
        affectedRoads: ['Sardar Patel Marg'],
        verificationStatus: 'warning',
        sourcesCount: 1
      };

      const fakeSignal: SocialSignal = {
        id: 'sig-fake-1',
        timeAgo: 'Just now',
        platform: 'Citizen Report',
        handle: '@delhicommuter_fake',
        text: 'Hearing rumors of a major road cave-in at Chanakyapuri. Traffic starting to slow down?',
        sentiment: 'neutral',
        reliabilityScore: 40,
        impactArea: 'Chanakyapuri (Near Diplomatic Enclave)',
        incidentId: 'fake-chanakyapuri',
      };

      setIncidents((prev) => [fakeInc, ...prev]);
      setSocialSignals((prev) => [fakeSignal, ...prev]);

      const alertLog: DispatchLogEntry = {
        id: `log-fake-warning-${Date.now()}`,
        time: timeStr,
        title: 'Unverified Warning Logged',
        details: 'Reports of road cave-in at Chanakyapuri.',
        type: 'alert'
      };
      setDispatchLogs((prev) => [alertLog, ...prev]);

      triggerToast(`Unverified Warning: Reported Road Cave-in at Chanakyapuri. Delay: +20m.`);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Warning: Unverified social reports of a road cave in near Chanakyapuri.`);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // Second click: corroborate (add second post to turn it Confirmed)
      const corroboratingSignal: SocialSignal = {
        id: `sig-fake-corrob-${Date.now()}`,
        timeAgo: 'Just now',
        platform: 'Delhi Traffic Police',
        handle: '@dtptraffic',
        text: 'ALERT: Confirmed road cave-in on Sardar Patel Marg, Chanakyapuri. Inner lane blocked. Heavy congestion expected.',
        sentiment: 'warning',
        reliabilityScore: 99,
        impactArea: 'Chanakyapuri (Near Diplomatic Enclave)',
        incidentId: 'fake-chanakyapuri',
      };

      setSocialSignals((prev) => [corroboratingSignal, ...prev]);
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === 'fake-chanakyapuri'
            ? {
                ...inc,
                title: 'CONGESTION: Chanakyapuri Road Cave-in',
                severity: 'severe',
                confidencePercent: 95,
                socialSource: '@dtptraffic + Citizen',
                description: 'Confirmed road cave-in at Chanakyapuri. Traffic diversion details published by police.',
                verificationStatus: 'confirmed',
                sourcesCount: 12
              }
            : inc
        )
      );
      
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === 'node-gurgaon') {
            return { ...n, status: 'heavy', avgSpeedKmh: 20, delayMinutes: n.delayMinutes + 15 };
          }
          return n;
        })
      );

      const alertLog: DispatchLogEntry = {
        id: `log-fake-corrob-log-${Date.now()}`,
        time: timeStr,
        title: 'Incident Verified & Confirmed',
        details: 'Chanakyapuri road cave-in corroborated by police dispatch.',
        type: 'alert'
      };
      setDispatchLogs((prev) => [alertLog, ...prev]);

      triggerToast(`ALERT Confirmed: Chanakyapuri Road Cave-in. Gurgaon delay: +15m.`);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Alert: Road cave in confirmed near Chanakyapuri. Rerouting traffic.`);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="bg-[#101415] text-[#e0e3e5] min-h-screen flex flex-col font-sans selection:bg-[#3a8dff] selection:text-white relative">
      {/* Visual Alert Toast Overlay */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] bg-white border-l-4 border-[#D93B2D] px-4 py-3 shadow-2xl flex items-center gap-3 animate-fade-up max-w-sm border border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#D93B2D]/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#D93B2D]" />
          </div>
          <div className="flex-grow">
            <div className="text-[10px] font-mono font-bold text-[#D93B2D] uppercase tracking-wider">AI DISRUPTION FORECAST</div>
            <div className="text-xs font-bold text-[#1A1A1A] mt-0.5 leading-tight">{toastMessage}</div>
          </div>
          <button 
            onClick={() => setToastMessage(null)} 
            className="text-gray-400 hover:text-gray-600 text-sm pl-2 font-bold cursor-pointer border-none bg-transparent"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLaunchDemo={() => setDemoModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 md:px-8 w-full max-w-[1440px] mx-auto overflow-hidden gap-10">
        {/* Render Content based on Active Tab */}
        {activeTab === 'dashboard' && (
          <>
            <HeroSection
              onLaunchDemo={() => setDemoModalOpen(true)}
              onExploreRoutePlanner={() => setActiveTab('route-planner')}
            />
            <Dashboard
              nodes={nodes}
              incidents={incidents}
              cameras={CAMERA_FEEDS}
              socialSignals={socialSignals}
              
              selectedIncidentId={selectedIncidentId}
              onSelectIncidentId={setSelectedIncidentId}
              selectedRouteId={activeRouteId}
              onSelectRouteId={handleSelectRouteId}
              selectedIncident={selectedIncident}
              selectedRoute={activeRoute}
              availableRoutes={currentRoutes}
              dispatchLogs={dispatchLogs}
              onDeployRoute={handleDeployRoute}
 
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
 
              onOpenDemoModal={() => setDemoModalOpen(true)}
              onNavigateToRoutePlanner={() => setActiveTab('route-planner')}
              onTriggerFakeNews={handleTriggerFakeNews}
              activeRouteAnalysis={activeRouteAnalysis}
              onClearRouteAnalysis={() => setActiveRouteAnalysis(null)}
              onReloadIncidents={handleReloadLiveIncidents}
              onReportHinglish={handleReportHinglish}
            />
            <FeatureGrid />
          </>
        )}

        {activeTab === 'route-planner' && (
          <RoutePlanner
            activeRouteAnalysis={activeRouteAnalysis}
            setActiveRouteAnalysis={setActiveRouteAnalysis}
            loading={routeAnalysisLoading}
            setLoading={setRouteAnalysisLoading}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            selectedCity={selectedCity}
          />
        )}

        {activeTab === 'about-ai' && <AboutAI />}

        {activeTab === 'documentation' && <Documentation />}
      </main>

      {/* Simulation Trigger Modal */}
      <DemoSimulationModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onTriggerIncident={handleTriggerIncident}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
