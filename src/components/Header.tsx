import React, { useState } from 'react';
import { NavTab } from '../types';
import { Menu, X, Radio, Navigation, Loader2, MapPin } from 'lucide-react';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  userLocation?: { lat: number; lng: number; name?: string } | null;
  onGetUserLocation?: () => void;
  isLocating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  userLocation, 
  onGetUserLocation, 
  isLocating 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'route-planner', label: 'Route Planner' },
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
          className="flex items-center gap-3 cursor-pointer group shrink-0"
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

        {/* Right-aligned Navigation & Location Controls */}
        <div className="flex items-center gap-4 sm:gap-6 ml-auto">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`text-xs font-bold uppercase tracking-widest transition-all duration-200 relative py-1 cursor-pointer font-mono whitespace-nowrap ${
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

          {/* User Location Button */}
          {onGetUserLocation && (
            <button
              onClick={onGetUserLocation}
              disabled={isLocating}
              className={`py-1.5 px-3 text-[11px] font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-200 border-none rounded-none ${
                userLocation
                  ? 'bg-[#1A1A1A]/5 text-[#1A1A1A] hover:bg-[#1A1A1A]/10'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#D93B2D]'
              }`}
              title={userLocation ? `Location: ${userLocation.name || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}` : 'Locate my position'}
            >
              {isLocating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <MapPin className={`w-3 h-3 ${userLocation ? 'text-[#D93B2D]' : ''}`} />
              )}
              <span className="hidden sm:inline truncate max-w-[130px]">
                {isLocating ? 'Locating...' : userLocation ? (userLocation.name || 'Located') : 'Locate'}
              </span>
              {userLocation && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D93B2D] animate-pulse shrink-0" />
              )}
            </button>
          )}

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

          {onGetUserLocation && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGetUserLocation();
              }}
              disabled={isLocating}
              className="mt-2 w-full bg-[#1A1A1A] text-white font-bold uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 text-xs font-mono"
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              <span className="truncate">{isLocating ? 'Locating...' : userLocation ? (userLocation.name || 'Update Location') : 'Use My Location'}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
