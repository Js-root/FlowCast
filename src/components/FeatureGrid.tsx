import React from 'react';
import { Radar, TrendingUp, Navigation } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="w-full max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 pb-10">
      {/* Card 1: AI Detection */}
      <div className="flex flex-col p-8 bg-white border border-[#1A1A1A]/15 gap-4 transition-all duration-300 hover:border-[#D93B2D] shadow-sm group">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[#D93B2D] uppercase tracking-widest">01 // SIGNAL EXTRACTION</span>
          <div className="w-10 h-10 bg-[#1A1A1A] text-white flex items-center justify-center group-hover:bg-[#D93B2D] transition-colors">
            <Radar className="w-5 h-5 animate-pulse text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] group-hover:text-[#D93B2D] transition-colors">
          AI Signal Detection
        </h3>
        <p className="text-sm text-[#1A1A1A]/70 leading-relaxed font-sans">
          Continuously scans thousands of social feeds, police broadcasts, and municipal sensor channels to identify spontaneous road events moments after occurrence.
        </p>
      </div>

      {/* Card 2: Rule-based Forecasts */}
      <div className="flex flex-col p-8 bg-white border border-[#1A1A1A]/15 gap-4 transition-all duration-300 hover:border-[#D93B2D] shadow-sm group">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[#D93B2D] uppercase tracking-widest">02 // CASCADE MODELING</span>
          <div className="w-10 h-10 bg-[#1A1A1A] text-white flex items-center justify-center group-hover:bg-[#D93B2D] transition-colors">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] group-hover:text-[#D93B2D] transition-colors">
          Cascade Forecasts
        </h3>
        <p className="text-sm text-[#1A1A1A]/70 leading-relaxed font-sans">
          Applies fluid-dynamic road network rules and historical traffic models to predict spillover bottlenecks across adjacent Ring Road intersections.
        </p>
      </div>

      {/* Card 3: Route Alternatives */}
      <div className="flex flex-col p-8 bg-white border border-[#1A1A1A]/15 gap-4 transition-all duration-300 hover:border-[#D93B2D] shadow-sm group">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[#D93B2D] uppercase tracking-widest">03 // PRE-EMPTIVE DETOURS</span>
          <div className="w-10 h-10 bg-[#1A1A1A] text-white flex items-center justify-center group-hover:bg-[#D93B2D] transition-colors">
            <Navigation className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] group-hover:text-[#D93B2D] transition-colors">
          Proactive Detours
        </h3>
        <p className="text-sm text-[#1A1A1A]/70 leading-relaxed font-sans">
          Instantly calculates and dispatches alternative arterial routes to commuters and logistics drivers before standard GPS maps register congestion.
        </p>
      </div>
    </section>
  );
};
