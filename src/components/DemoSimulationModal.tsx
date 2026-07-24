import React, { useState } from 'react';
import { Sparkles, Zap, X, Check } from 'lucide-react';
import { Incident, IncidentCategory } from '../types';

interface DemoSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerIncident: (newIncident: Incident, opts?: { fake?: boolean }) => void;
}

export const DemoSimulationModal: React.FC<DemoSimulationModalProps> = ({
  isOpen,
  onClose,
  onTriggerIncident,
}) => {
  const [selectedScenario, setSelectedScenario] = useState(0);

  if (!isOpen) return null;

  const scenarios: {
    title: string;
    area: string;
    category: IncidentCategory;
    delay: number;
    startsIn: number;
    desc: string;
    lat: number;
    lng: number;
    fake?: boolean;
  }[] = [
    {
      title: 'Monsoon Waterlogging & Pump Failure',
      area: 'Minto Road Bridge Underpass',
      category: 'waterlogging',
      delay: 52,
      startsIn: 12,
      desc: '1.8 feet water accumulation reported after torrential 20-minute cloudburst. Buses stalled near New Delhi Railway Station approach.',
      lat: 28.6330,
      lng: 77.2260,
    },
    {
      title: 'VVIP Delegation Convoy Movement',
      area: 'Sardar Patel Marg / Chanakyapuri',
      category: 'vip_movement',
      delay: 24,
      startsIn: 18,
      desc: '30-minute security traffic hold enforced between IGI Airport Express and Diplomatic Enclave.',
      lat: 28.5930,
      lng: 77.1860,
    },
    {
      title: 'Commercial Truck Breakdown & Fuel Spill',
      area: 'AIIMS Flyover Ramp towards Moti Bagh',
      category: 'collision',
      delay: 38,
      startsIn: 8,
      desc: 'Heavy axle breakdown blocking 2 central lanes on Ring Road. Diesel oil spill requires fire tender cleanup.',
      lat: 28.5672,
      lng: 77.2100,
    },
    {
      title: 'Viral "Road Blocked" Rumor',
      area: 'Karol Bagh Market',
      category: 'rally',
      delay: 20,
      startsIn: 14,
      desc: 'Unconfirmed WhatsApp forward claiming a large protest is blocking Ajmal Khan Road. No official source or GPS slowdown yet — stays UNVERIFIED until a second signal corroborates.',
      lat: 28.6512,
      lng: 77.1907,
      fake: true,
    },
  ];

  const handleApplyScenario = () => {
    const sc = scenarios[selectedScenario];
    const newInc: Incident = {
      id: `sim-${Date.now()}`,
      title: sc.title,
      area: sc.area,
      severity: sc.fake ? 'moderate' : 'severe',
      category: sc.category,
      delayMinutes: sc.delay,
      startsInMinutes: sc.startsIn,
      confidencePercent: sc.fake ? 44 : 98,
      socialSource: sc.fake ? 'Unverified WhatsApp forward' : 'LIVE DEMO SIMULATOR SIGNAL',
      description: sc.desc,
      lat: sc.lat,
      lng: sc.lng,
      cascadingRoads: ['Ring Road South', 'August Kranti Marg', 'Aurobindo Marg'],
    };

    onTriggerIncident(newInc, { fake: sc.fake });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up">
      <div className="bg-white border-2 border-[#1A1A1A] max-w-lg w-full p-6 shadow-2xl flex flex-col gap-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1A1A1A]/60 hover:text-[#1A1A1A] p-1 border border-transparent hover:border-[#1A1A1A]/20 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#D93B2D] bg-[#D93B2D]/10 px-2.5 py-1 border border-[#D93B2D]/30 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D93B2D]" />
            <span>DISRUPTIVE SCENARIO SIMULATOR</span>
          </div>
          <h3 className="text-2xl font-serif font-black text-[#1A1A1A] tracking-tight">Simulate Real-time Incident</h3>
          <p className="text-xs font-serif text-[#1A1A1A]/70">
            Inject a sudden traffic event to observe how FlowCast updates node forecasts & detour routes 30 mins in advance.
          </p>
        </div>

        {/* Scenarios List */}
        <div className="space-y-3">
          {scenarios.map((sc, idx) => {
            const isSelected = selectedScenario === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedScenario(idx)}
                className={`p-3.5 border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#F2F0EB] border-2 border-[#1A1A1A]'
                    : 'bg-white border-[#1A1A1A]/20 hover:border-[#1A1A1A]/50'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#1A1A1A]/30 bg-white'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-grow space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#1A1A1A]">{sc.title}</span>
                    <span className="text-xs font-mono font-bold text-[#D93B2D] bg-[#D93B2D]/10 px-1.5 py-0.5 border border-[#D93B2D]/30">
                      +{sc.delay}m
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#D93B2D]">{sc.area}</div>
                  <div className="text-[11px] font-sans text-[#1A1A1A]/70 leading-tight">{sc.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1A1A1A]/15">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-xs font-bold text-[#1A1A1A]/70 hover:text-[#1A1A1A] cursor-pointer uppercase"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyScenario}
            className="bg-[#1A1A1A] hover:bg-[#D93B2D] text-white px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4 text-white" />
            <span>Inject & Recalculate AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
