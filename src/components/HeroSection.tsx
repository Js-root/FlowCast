import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onLaunchDemo: () => void;
  onExploreRoutePlanner: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLaunchDemo, onExploreRoutePlanner }) => {
  return (
    <section className="flex flex-col items-center text-center max-w-[960px] w-full mx-auto pt-8 pb-10 px-4 gap-6">
      {/* Editorial Eyebrow Tag */}
      <a
        href="#features"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById('features');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="animate-fade-up inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/15 hover:border-[#D93B2D] transition-all duration-300 group cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-[#D93B2D] animate-pulse" />
        <span className="text-[11px] font-bold text-[#D93B2D] uppercase tracking-[0.2em] font-mono">
          PREDICTIVE VS REACTIVE TRAFFIC INVESTIGATION →
        </span>
      </a>

      {/* Main Serif Headline */}
      <h1 className="font-serif font-black text-5xl sm:text-7xl md:text-8xl lg:text-[92px] leading-[0.92] tracking-tight text-[#F2F0EB] animate-fade-up">
        Predict{' '}
        <span className="text-[#D93B2D] italic font-serif font-normal">
          disruptions
        </span>
        <br />
        before they happen.
      </h1>

      {/* Editorial Subtitle */}
      <p className="text-base sm:text-xl text-[#F2F0EB]/75 font-serif max-w-[680px] leading-relaxed animate-fade-up">
        FlowCast synthesizes real-time social telemetry and neural cascade modeling to forecast municipal gridlock 30 minutes before maps turn red.
      </p>

      {/* Editorial CTA Buttons */}
      <div className="pt-2 animate-fade-up flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onLaunchDemo}
          className="bg-[#F2F0EB] text-[#1A1A1A] hover:bg-[#D93B2D] hover:text-white transition-all duration-300 px-8 py-4 font-bold text-xs uppercase tracking-widest flex items-center gap-3 cursor-pointer shadow-md w-full sm:w-auto justify-center font-mono group"
        >
          <Sparkles className="w-4 h-4 text-[#1A1A1A] group-hover:text-white transition-colors" />
          <span>Launch Live Demo</span>
        </button>

        <button
          onClick={onExploreRoutePlanner}
          className="bg-transparent text-[#F2F0EB] hover:bg-white/5 border border-white/20 transition-all duration-200 px-6 py-4 font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center font-mono"
        >
          <span>Plan AI Route</span>
          <ArrowRight className="w-4 h-4 text-[#F2F0EB]" />
        </button>
      </div>
    </section>
  );
};
