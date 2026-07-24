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
  const [dataLive, setDataLive] = useState(false);

  // Pull real data: TomTom traffic on nodes + Reddit/Groq incidents. Polls every 60s.
  // Silently keeps seed data if keys are missing or a fetch fails (demo stays alive).
  // ponytail: 60s poll x 12 nodes fits TomTom free tier for a demo; widen if it 429s.
  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const [t, i] = await Promise.all([
        fetch('/api/live-traffic').then((r) => r.json()).catch(() => null),
        fetch('/api/live-incidents').then((r) => r.json()).catch(() => null),
      ]);
      if (!alive) return;
      let live = false;
      if (t?.success && t.live && Array.isArray(t.nodes) && t.nodes.length) {
        setNodes(t.nodes);
        live = true;
      }
      if (i?.success) {
        if (Array.isArray(i.incidents) && i.incidents.length) setIncidents(i.incidents);
        if (Array.isArray(i.signals) && i.signals.length) setSocialSignals(i.signals);
        if (i.live) live = true;
      }
      setDataLive(live);
    };
    pull();
    const id = setInterval(pull, 60000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // Trigger scenario handler. opts.fake = unverified rumor: add a lone low-reliability
  // signal, no node/route change, so the cross-validation gate keeps it yellow.
  const handleTriggerIncident = (newInc: Incident, opts?: { fake?: boolean }) => {
    setIncidents((prev) => [newInc, ...prev]);

    if (opts?.fake) {
      const rumor: SocialSignal = {
        id: `sig-${Date.now()}`,
        timeAgo: 'Just now',
        platform: 'Citizen Report',
        handle: '@anon_forward',
        text: `UNVERIFIED: ${newInc.title} near ${newInc.area}? Forwarded on WhatsApp, no official source yet.`,
        sentiment: 'warning',
        reliabilityScore: 41,
        impactArea: newInc.area,
      };
      setSocialSignals((prev) => [rumor, ...prev]);
      setActiveTab('dashboard');
      return;
    }

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

  // Corroborate an unverified incident with a 2nd independent source -> flips it Confirmed.
  const handleCorroborate = (inc: Incident) => {
    const second: SocialSignal = {
      id: `sig-${Date.now()}`,
      timeAgo: 'Just now',
      platform: 'X / Twitter',
      handle: '@delhi_eyewitness',
      text: `Confirming ${inc.title} at ${inc.area} — visible from here, traffic building up.`,
      sentiment: 'negative',
      reliabilityScore: 86,
      impactArea: inc.area,
    };
    setSocialSignals((prev) => [second, ...prev]);
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
              onCorroborate={handleCorroborate}
              dataLive={dataLive}
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
