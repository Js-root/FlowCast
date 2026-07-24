import React, { useState, useEffect } from 'react';
import { NavTab, TrafficNode, Incident, SocialSignal, RouteOption } from './types';
import { INITIAL_NODES, INITIAL_INCIDENTS, INITIAL_SOCIAL_SIGNALS, CAMERA_FEEDS, PRESET_ROUTES } from './data/delhiTrafficData';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Dashboard } from './components/Dashboard';
import { FeatureGrid } from './components/FeatureGrid';
import { RoutePlanner } from './components/RoutePlanner';
import { AboutAI } from './components/AboutAI';
import { Documentation } from './components/Documentation';
import { DemoSimulationModal } from './components/DemoSimulationModal';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [nodes, setNodes] = useState<TrafficNode[]>(INITIAL_NODES);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [socialSignals, setSocialSignals] = useState<SocialSignal[]>(INITIAL_SOCIAL_SIGNALS);
  const [routes, setRoutes] = useState<RouteOption[]>(PRESET_ROUTES);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const res = await fetch('/api/live-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.nodes) setNodes(data.nodes);
          if (data.incidents) setIncidents(data.incidents);
        }
      } catch (err) {
        console.error('Failed to fetch live data:', err);
      }
    };

    const interval = setInterval(fetchLiveData, 30000);
    // Fetch once immediately on mount
    fetchLiveData();
    return () => clearInterval(interval);
  }, [nodes]);

  // Trigger scenario handler
  const handleTriggerIncident = (newInc: Incident) => {
    setIncidents((prev) => [newInc, ...prev]);

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

    // Update routes
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === 'route-opt-2'
          ? { ...r, predictedTimeMins: r.predictedTimeMins + 25, delayMins: r.delayMins + 25 }
          : r
      )
    );

    setActiveTab('dashboard');
  };

  return (
    <div className="bg-[#101415] text-[#e0e3e5] min-h-screen flex flex-col font-sans selection:bg-[#3a8dff] selection:text-white">
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
              routes={routes}
              onOpenDemoModal={() => setDemoModalOpen(true)}
              onNavigateToRoutePlanner={() => setActiveTab('route-planner')}
            />
            <FeatureGrid />
          </>
        )}

        {activeTab === 'route-planner' && <RoutePlanner routes={routes} />}

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
