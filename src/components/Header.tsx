import React, { useState } from 'react';
import { NavTab } from '../types';
import { Menu, X, Radio, ArrowRight } from 'lucide-react';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onLaunchDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onLaunchDemo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'route-planner', label: 'Route Planner' },
    { id: 'about-ai', label: 'About AI' },
    { id: 'documentation', label: 'Documentation' },
  ];

  const handleTabClick = (id: NavTab) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#F2F0EB]/95 backdrop-blur-md border-b border-[#1A1A1A]/15 sticky top-0 z-50 transition-all duration-200">
      <div className="flex justify-between items-center h-20 px-4 md:px-8 w-full max-w-[1440px] mx-auto">
        {/* Editorial Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-[#1A1A1A] text-white flex items-center justify-center group-hover:bg-[#D93B2D] transition-colors">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="font-extrabold text-xl md:text-2xl tracking-tight text-[#1A1A1A] uppercase font-serif group-hover:text-[#D93B2D] transition-colors">
              FLOWCAST
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/60 font-semibold -mt-1 hidden sm:block font-mono">
              Volume 01 // Predictive Disruption Radar
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`text-xs font-bold uppercase tracking-widest transition-all duration-200 relative py-1 cursor-pointer font-mono ${
                  isActive
                    ? 'text-[#D93B2D] font-extrabold border-b-2 border-[#D93B2D]'
                    : 'text-[#1A1A1A]/65 hover:text-[#1A1A1A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchDemo}
            className="bg-[#1A1A1A] text-white hover:bg-[#D93B2D] transition-all duration-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hidden md:flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#1A1A1A] p-2 hover:bg-[#1A1A1A]/5 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F2F0EB] border-b border-[#1A1A1A]/20 px-4 pt-2 pb-6 flex flex-col gap-3 animate-fade-up">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`text-left px-4 py-3 text-sm font-bold uppercase tracking-wider font-mono transition-colors ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white border-l-4 border-[#D93B2D]'
                    : 'text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/10 hover:text-[#1A1A1A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onLaunchDemo();
            }}
            className="mt-2 w-full bg-[#D93B2D] text-white font-bold uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 shadow-sm text-xs"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
