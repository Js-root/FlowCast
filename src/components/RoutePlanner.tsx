import React, { useState } from 'react';
import { RouteOption } from '../types';
import { Sparkles, MapPin, Navigation, Clock, ShieldCheck, Zap } from 'lucide-react';

interface RoutePlannerProps {
  routes: RouteOption[];
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({ routes }) => {
  const [origin, setOrigin] = useState('Connaught Place, New Delhi');
  const [destination, setDestination] = useState('Gurgaon Cyber City, Haryana');
  const [forecastHorizon, setForecastHorizon] = useState(30);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

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
        setAiAnalysis(data);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/20 text-[#D93B2D] text-xs font-mono font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#D93B2D]" />
          <span>PREDICTIVE ROUTE OPTIMIZER</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#F2F0EB] tracking-tight">
          Bypass Gridlock Before Maps Turn Red
        </h2>
        <p className="text-base font-serif text-[#F2F0EB]/75">
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
          <span className="text-xs text-[#1A1A1A]/60 font-mono font-bold uppercase mr-2">Popular Arterials:</span>
          {presetPairs.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOrigin(pair.from);
                setDestination(pair.to);
              }}
              className="bg-[#F2F0EB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white border border-[#1A1A1A]/20 px-3 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer"
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
                  className={`px-2.5 py-1 text-xs font-mono font-bold cursor-pointer transition-colors ${
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
            className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#D93B2D] text-white px-8 py-3 font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
          >
            <Sparkles className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Simulating...' : 'Analyze AI Detours'}</span>
          </button>
        </div>
      </div>

      {/* AI Custom Analysis Output if available */}
      {aiAnalysis && (
        <div className="bg-white border-2 border-[#D93B2D] p-6 shadow-md flex flex-col gap-4 animate-fade-up">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-3">
            <span className="text-sm font-bold font-serif text-[#D93B2D] flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-700" />
              <span>Gemini AI Route Disruption Investigation</span>
            </span>
            <span className="bg-[#D93B2D] text-white px-3 py-1 font-mono font-bold text-xs uppercase">
              {aiAnalysis.riskLevel || 'High Risk on Standard GPS'}
            </span>
          </div>

          <div className="text-sm text-[#1A1A1A] leading-relaxed font-sans">
            {aiAnalysis.aiAnalysis}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#F2F0EB] p-4 border border-[#1A1A1A]/15">
              <div className="text-xs text-[#1A1A1A]/60 font-mono font-bold uppercase">Recommended AI Detour</div>
              <div className="text-base font-serif font-bold text-emerald-700 mt-1">{aiAnalysis.recommendedDetourName || 'Via Lodi Road & Dhaula Kuan Express'}</div>
            </div>

            <div className="bg-[#F2F0EB] p-4 border border-[#1A1A1A]/15">
              <div className="text-xs text-[#1A1A1A]/60 font-mono font-bold uppercase">Time Saved</div>
              <div className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1">
                {aiAnalysis.timeSavedMinutes || 18} Mins
              </div>
            </div>

            <div className="bg-[#F2F0EB] p-4 border border-[#1A1A1A]/15">
              <div className="text-xs text-[#1A1A1A]/60 font-mono font-bold uppercase">Avoid Chokepoints</div>
              <div className="text-xs text-[#D93B2D] mt-1 flex flex-wrap gap-1 font-mono font-bold">
                {(aiAnalysis.keyChokepointsToAvoid || ['AIIMS Junction', 'CP Regal Circle', 'Ring Road South']).map((pt: string, i: number) => (
                  <span key={i} className="bg-[#D93B2D]/10 px-2 py-0.5 border border-[#D93B2D]/30">
                    {pt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Route Options Comparison Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
          <span>AI Multi-Route Comparison</span>
          <span className="text-xs font-mono text-[#1A1A1A]/60 font-normal">({origin} to {destination})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.map((rt) => (
            <div
              key={rt.id}
              className={`p-6 bg-white border flex flex-col justify-between gap-4 transition-all shadow-sm ${
                rt.isAiRecommended
                  ? 'border-2 border-emerald-700 bg-[#F2F0EB]'
                  : 'border-[#1A1A1A]/15'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {rt.isAiRecommended ? (
                    <span className="bg-emerald-700 text-white text-[10px] uppercase font-mono font-bold px-2 py-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Recommended Detour</span>
                    </span>
                  ) : (
                    <span className="bg-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] uppercase font-mono font-bold px-2 py-0.5">
                      Standard GPS
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-[#1A1A1A]/60">{rt.distanceKm} km</span>
                </div>

                <h4 className="font-serif font-bold text-lg text-[#1A1A1A]">{rt.name}</h4>
                <p className="text-xs text-[#1A1A1A]/70 font-sans">{rt.viaRoads}</p>
              </div>

              <div className="pt-3 border-t border-[#1A1A1A]/15 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#1A1A1A]/60 font-mono">Predicted Time:</span>
                  <span className="text-2xl font-serif font-bold text-[#1A1A1A]">{rt.predictedTimeMins} min</span>
                </div>

                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#1A1A1A]/60">Expected Delay:</span>
                  <span className={rt.delayMins > 15 ? 'text-[#D93B2D] font-bold' : 'text-emerald-700 font-bold'}>
                    +{rt.delayMins} min
                  </span>
                </div>

                <div className="text-[11px] text-[#1A1A1A]/80 bg-[#F2F0EB] p-2.5 border border-[#1A1A1A]/15 mt-2 font-mono">
                  <span className="font-bold text-[#1A1A1A]">Key Points: </span>
                  {rt.congestionPoints.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
