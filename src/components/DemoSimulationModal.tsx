import React, { useState } from 'react';
import { Sparkles, Zap, X, Check } from 'lucide-react';
import { Incident } from '../types';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

interface DemoSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerIncident: (newIncident: Incident) => void;
}

export const DemoSimulationModal: React.FC<DemoSimulationModalProps> = ({
  isOpen,
  onClose,
  onTriggerIncident,
}) => {
  const [selectedScenario, setSelectedScenario] = useState(0);

  if (!isOpen) return null;

  const handleApplyScenario = () => {
    const sc = DEMO_SCENARIOS[selectedScenario];
    const newInc: Incident = {
      id: `sim-${Date.now()}`,
      title: sc.title,
      area: sc.area,
      severity: 'severe',
      category: sc.category,
      delayMinutes: sc.delay,
      startsInMinutes: sc.startsIn,
      confidencePercent: 98,
      socialSource: 'LIVE DEMO SIMULATOR SIGNAL',
      description: sc.desc,
      coords: sc.coords,
      lat: sc.lat,
      lng: sc.lng,
      cascadingRoads: ['Ring Road South', 'August Kranti Marg', 'Aurobindo Marg'],
      affectedRoads: [sc.area],
      verificationStatus: 'confirmed',
      sourcesCount: 18
    };

    onTriggerIncident(newInc);
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
          {DEMO_SCENARIOS.map((sc, idx) => {
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
