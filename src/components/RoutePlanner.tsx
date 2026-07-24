import React, { useState } from 'react';
import { RouteAnalysis } from '../types';
import { Sparkles, MapPin, Navigation, Clock } from 'lucide-react';

interface RoutePlannerProps {
  activeRouteAnalysis: RouteAnalysis | null;
  setActiveRouteAnalysis: (analysis: RouteAnalysis | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onNavigateToDashboard: () => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  activeRouteAnalysis,
  setActiveRouteAnalysis,
  loading,
  setLoading,
  onNavigateToDashboard,
}) => {
  const [origin, setOrigin] = useState('Connaught Place, New Delhi');
  const [destination, setDestination] = useState('Gurgaon Cyber City, Haryana');
  const [forecastHorizon, setForecastHorizon] = useState(30);

  const presetPairs = [
    { from: 'Connaught Place', to: 'Gurgaon Cyber City' },
    { from: 'Noida Sector 62', to: 'AIIMS Junction' },
    { from: 'Dwarka Sector 21', to: 'IGI Airport T3' },
    { from: 'Anand Vihar ISBT', to: 'Nehru Place' },
  ];

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/route-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          timeHorizonMins: forecastHorizon,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveRouteAnalysis(data);
        onNavigateToDashboard();
      }
    } catch (err) {
      console.error('Route analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto py-8 px-4 flex flex-col gap-8 animate-fade-up">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1A1A]/5 border border-[#1A1A1A]/20 text-[#D93B2D] text-xs font-mono font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#D93B2D]" />
          <span>PREDICTIVE ROUTE OPTIMIZER</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#1A1A1A] tracking-tight">
          Bypass Gridlock Before Maps Turn Red
        </h2>
        <p className="text-base font-serif text-[#1A1A1A]/70">
          Compare standard GPS routing against FlowCast's 30-minute predictive cascade algorithm.
        </p>
      </div>

      {/* Query Card */}
      <div className="bg-white border border-[#1A1A1A]/15 p-6 md:p-8 shadow-sm flex flex-col gap-6">
        {/* Origin / Destination Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase text-[#D93B2D] tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D93B2D]" />
              <span>Start Location (Origin)</span>
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-[#F2F0EB] border border-[#1A1A1A]/20 focus:border-[#D93B2D] px-4 py-3 text-sm font-sans text-[#1A1A1A] outline-none transition-colors"
              placeholder="e.g. Connaught Place"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-700" />
              <span>Destination</span>
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-[#F2F0EB] border border-[#1A1A1A]/20 focus:border-[#D93B2D] px-4 py-3 text-sm font-sans text-[#1A1A1A] outline-none transition-colors"
              placeholder="e.g. Cyber City Gurgaon"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1A1A1A]/10">
          <span className="text-xs text-[#1A1A1A]/60 font-mono font-bold uppercase mr-2">Popular Presets:</span>
          {presetPairs.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOrigin(pair.from);
                setDestination(pair.to);
              }}
              className="bg-[#F2F0EB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white border border-[#1A1A1A]/20 px-3 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer border-none"
            >
              {pair.from} → {pair.to}
            </button>
          ))}
        </div>

        {/* Time Horizon Slider + Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1A1A1A]/10">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#D93B2D]" />
            <div>
              <div className="text-xs font-bold font-mono text-[#1A1A1A] uppercase">Forecast Horizon:</div>
              <div className="text-xs text-[#1A1A1A]/60 font-sans">Predicting road conditions in +{forecastHorizon} mins</div>
            </div>
            <div className="flex items-center gap-1 bg-[#F2F0EB] p-1 border border-[#1A1A1A]/20 ml-2">
              {[15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setForecastHorizon(m)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold cursor-pointer transition-colors border-none ${
                    forecastHorizon === m ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                  }`}
                >
                  +{m}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#D93B2D] text-white px-8 py-3 font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors border-none"
          >
            <Sparkles className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Analyze AI Detours'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default RoutePlanner;
