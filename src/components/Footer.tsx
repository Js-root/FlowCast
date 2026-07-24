import React from 'react';
import { NavTab } from '../types';

interface FooterProps {
  setActiveTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#F2F0EB] text-[#1A1A1A]/80 text-xs border-t-2 border-[#1A1A1A] py-10 px-4 md:px-8 mt-16 w-full">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="font-serif font-black text-xl text-[#1A1A1A] tracking-tight cursor-pointer hover:text-[#D93B2D] transition-colors"
        >
          FlowCast
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-mono font-bold text-xs uppercase">
          <button onClick={() => setActiveTab('documentation')} className="hover:text-[#D93B2D] transition-colors cursor-pointer">
            Privacy Policy
          </button>
          <button onClick={() => setActiveTab('documentation')} className="hover:text-[#D93B2D] transition-colors cursor-pointer">
            Terms of Service
          </button>
          <button onClick={() => setActiveTab('documentation')} className="hover:text-[#D93B2D] transition-colors cursor-pointer">
            Data Sources
          </button>
          <button onClick={() => setActiveTab('documentation')} className="hover:text-[#D93B2D] transition-colors cursor-pointer">
            API Status
          </button>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right text-[11px] font-mono text-[#1A1A1A]/60">
          © 2026 FlowCast Predictive Systems. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
