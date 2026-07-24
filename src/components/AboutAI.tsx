import React from 'react';
import { Sparkles, Cpu, Radio, Network, Send, CheckCircle2, XCircle } from 'lucide-react';

export const AboutAI: React.FC = () => {
  const pipelineStages = [
    {
      num: '01',
      title: 'Multimodal Signal Ingestion',
      icon: Radio,
      desc: 'Ingests real-time feeds from Delhi Traffic Police (@dtptraffic), X social posts, WhatsApp citizen channels, IMD rainfall radar, and FASTag toll sensors.',
    },
    {
      num: '02',
      title: 'Gemini NLP Event Extraction',
      icon: Cpu,
      desc: 'Extracts exact junction coordinates, affected carriage lanes, vehicle type stalls, and event severity using fine-tuned Gemini AI language models.',
    },
    {
      num: '03',
      title: 'Graph Network Cascade Simulation',
      icon: Network,
      desc: 'Models fluid dynamic traffic spillover across Delhi NCR road networks to forecast bottleneck formation 30 minutes before maps turn red.',
    },
    {
      num: '04',
      title: 'Pre-emptive Reroute Dispatch',
      icon: Send,
      desc: 'Calculates alternative arterial detours and broadcasts proactive warnings to commuters, delivery fleets, and traffic control rooms.',
    },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto py-8 px-4 flex flex-col gap-12 animate-fade-up">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/20 text-[#D93B2D] text-xs font-mono font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#D93B2D]" />
          <span>PREDICTIVE TRAFFIC ENGINE</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#F2F0EB] tracking-tight">
          How FlowCast Outsmarts Gridlock
        </h2>
        <p className="text-base font-serif text-[#F2F0EB]/75">
          Standard navigation apps tell you when you are already stuck. FlowCast forecasts disruptions before vehicles come to a halt.
        </p>
      </div>

      {/* Reactive vs Predictive Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional GPS */}
        <div className="bg-white border border-[#1A1A1A]/15 p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-3">
            <span className="font-serif font-bold text-lg text-[#1A1A1A]/80">Traditional GPS Navigation</span>
            <span className="text-[#D93B2D] bg-[#D93B2D]/10 text-xs px-2.5 py-0.5 font-mono font-bold uppercase border border-[#D93B2D]/20">REACTIVE</span>
          </div>
          <ul className="space-y-3 text-xs font-sans text-[#1A1A1A]/80">
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-[#D93B2D] shrink-0 mt-0.5" />
              <span>Relies solely on vehicle GPS speed drops AFTER traffic has accumulated.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-[#D93B2D] shrink-0 mt-0.5" />
              <span>Reroutes thousands of drivers onto the same narrow side street, creating secondary jams.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-[#D93B2D] shrink-0 mt-0.5" />
              <span>Blind to spontaneous events (waterlogging, rallies, VVIP movements) until 20+ mins later.</span>
            </li>
          </ul>
        </div>

        {/* FlowCast */}
        <div className="bg-white border-2 border-emerald-700 p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-3">
            <span className="font-serif font-bold text-lg text-[#1A1A1A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D93B2D]" />
              <span>FlowCast Engine</span>
            </span>
            <span className="text-emerald-800 bg-emerald-50 text-xs px-2.5 py-0.5 font-mono font-bold uppercase border border-emerald-700/30">PREDICTIVE</span>
          </div>
          <ul className="space-y-3 text-xs font-sans text-[#1A1A1A]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>Scans police alerts, citizen posts, and rain cell radar moments after an event occurs.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>Simulates traffic flow cascading across adjacent Ring Road flyovers 30 mins in advance.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>Provides pre-emptive detours BEFORE roads reach critical capacity.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4-Stage Pipeline Grid */}
      <div className="space-y-6">
        <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] text-center">4-Stage Intelligence Pipeline</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pipelineStages.map((stg) => {
            const Icon = stg.icon;
            return (
              <div key={stg.num} className="bg-white border border-[#1A1A1A]/15 p-6 flex flex-col gap-4 hover:border-[#D93B2D] transition-colors shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-[#D93B2D]">{stg.num}</span>
                  <div className="w-9 h-9 bg-[#F2F0EB] border border-[#1A1A1A]/20 flex items-center justify-center text-[#1A1A1A]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="font-serif font-bold text-base text-[#1A1A1A]">{stg.title}</h4>
                <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-sans">{stg.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Metrics Banner */}
      <div className="bg-[#F2F0EB] border border-[#1A1A1A]/20 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="space-y-1">
          <div className="text-4xl font-serif font-black text-emerald-700">94.2%</div>
          <div className="text-xs text-[#1A1A1A]/70 font-mono uppercase font-bold">Disruption Prediction Accuracy</div>
        </div>

        <div className="space-y-1">
          <div className="text-4xl font-serif font-black text-[#D93B2D]">32 Mins</div>
          <div className="text-xs text-[#1A1A1A]/70 font-mono uppercase font-bold">Average Early Warning Advance Time</div>
        </div>

        <div className="space-y-1">
          <div className="text-4xl font-serif font-black text-[#1A1A1A]">1.4M Liters</div>
          <div className="text-xs text-[#1A1A1A]/70 font-mono uppercase font-bold">Estimated Fuel Saved Annually</div>
        </div>
      </div>
    </div>
  );
};
