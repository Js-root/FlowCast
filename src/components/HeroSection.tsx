import React from 'react';
import { ArrowRight, MapPin, Activity, Cpu, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onViewMap: () => void;
  onExploreRoutePlanner: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onViewMap, onExploreRoutePlanner }) => {
  return (
    <section className="relative flex flex-col items-center text-center max-w-[1100px] w-full mx-auto pt-16 sm:pt-24 pb-16 sm:pb-24 px-4 gap-8 sm:gap-10 overflow-hidden z-0">
      
      {/* Premium Ambient Radial Glow Background */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#D93B2D]/15 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse duration-5000"
      />
      
      {/* Subtle Editorial Grid Backdrop */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10 opacity-70"
      />

      {/* Floating Status Badges */}
      <div className="hidden lg:flex justify-between w-full absolute top-8 left-0 right-0 px-6 pointer-events-none text-left z-10">
        <div className="animate-fade-up bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-2 text-[10px] font-mono text-[#F2F0EB]/90 flex items-center gap-2 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-[#D93B2D] animate-pulse" />
          <span>REAL-TIME GPS TELEMETRY</span>
        </div>
        <div className="animate-fade-up bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-2 text-[10px] font-mono text-[#F2F0EB]/90 flex items-center gap-2 shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>NEURAL CASCADE MODELING</span>
        </div>
      </div>

      {/* Foreground Hero Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10 w-full">
        
        {/* Editorial Eyebrow Badge */}
        <a
          href="#features"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById('features');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="animate-fade-up inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/5 border border-white/15 hover:border-[#D93B2D] transition-all duration-300 group cursor-pointer backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D93B2D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D93B2D]"></span>
          </span>
          <span className="text-[11px] font-bold text-[#D93B2D] uppercase tracking-[0.2em] font-mono group-hover:translate-x-0.5 transition-transform">
            PREDICTIVE VS REACTIVE TRAFFIC INVESTIGATION →
          </span>
        </a>

        {/* Serif Headline */}
        <h1 className="font-serif font-black text-5xl sm:text-7xl md:text-8xl lg:text-[96px] leading-[0.92] tracking-tight text-[#F2F0EB] animate-fade-up">
          Predict{' '}
          <span className="text-[#D93B2D] italic font-serif font-normal">
            disruptions
          </span>
          <br />
          before they happen.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-[#F2F0EB]/80 font-serif max-w-[720px] leading-relaxed animate-fade-up">
          FlowCast synthesizes real-time social telemetry and neural cascade modeling to forecast municipal gridlock 30 minutes before maps turn red.
        </p>

        {/* Micro Stats Pill */}
        <div className="animate-fade-up inline-flex items-center gap-6 px-5 py-2.5 bg-white/5 border border-white/10 text-xs font-mono text-[#F2F0EB] backdrop-blur-md shadow-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Accuracy: <strong className="text-white font-bold">98.4%</strong></span>
          </div>
          <div className="w-px h-3.5 bg-white/20" />
          <div>
            <span>Horizon: <strong className="text-[#D93B2D] font-bold">30 Mins Ahead</strong></span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="pt-2 animate-fade-up flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onViewMap}
            className="bg-[#F2F0EB] text-[#1A1A1A] hover:bg-[#D93B2D] hover:text-white transition-all duration-300 px-8 py-4 font-bold text-xs uppercase tracking-widest flex items-center gap-3 cursor-pointer shadow-lg w-full sm:w-auto justify-center font-mono group border-none"
          >
            <MapPin className="w-4 h-4 text-[#1A1A1A] group-hover:text-white transition-colors" />
            <span>View Interactive Map</span>
          </button>

          <button
            onClick={onExploreRoutePlanner}
            className="bg-transparent text-[#F2F0EB] hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200 px-7 py-4 font-bold text-xs uppercase tracking-widest flex items-center gap-2.5 cursor-pointer w-full sm:w-auto justify-center font-mono group backdrop-blur-md"
          >
            <span>Plan AI Route</span>
            <ArrowRight className="w-4 h-4 text-[#F2F0EB] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
