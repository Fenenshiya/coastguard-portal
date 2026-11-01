import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Waves, 
  Shield, 
  MapPin, 
  AlertTriangle, 
  Radio,
  LifeBuoy,
  Lock,
  LogOut
} from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { authService } from '../../services/authService';
import { FlagStatus } from '../../types';

export const FLAG_CONFIG: Record<FlagStatus, { label: string; bg: string; text: string; description: string }> = {
  green: {
    label: 'Green Flag: Calm / Low Hazard',
    bg: 'bg-emerald-500',
    text: 'text-white',
    description: 'Calm ocean conditions. Low hazard. Exercise standard water safety.'
  },
  yellow: {
    label: 'Yellow Flag: Moderate Hazard',
    bg: 'bg-amber-500',
    text: 'text-slate-900',
    description: 'Moderate surf and/or currents. Weak swimmers should stay close to shore.'
  },
  red: {
    label: 'Red Flag: High Hazard',
    bg: 'bg-rose-600',
    text: 'text-white',
    description: 'Rough conditions, strong surf and high rip current risk. Swimming discouraged.'
  },
  double_red: {
    label: 'Double Red Flag: Water Closed',
    bg: 'bg-red-950',
    text: 'text-white',
    description: 'EXTREME DANGER: Water is strictly closed to the public by authority order.'
  },
  purple: {
    label: 'Purple Flag: Marine Pests',
    bg: 'bg-purple-600',
    text: 'text-white',
    description: 'Dangerous marine life present (jellyfish, stingers, sharks). Stay vigilant.'
  }
};

export const Header: React.FC = () => {
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith('/staff');
  const isCommandRoute = location.pathname === '/staff/command';

  const { 
    beaches, 
    selectedBeachId, 
    setSelectedBeachId, 
    activeTab, 
    setActiveTab, 
    getSelectedBeach 
  } = useBeachStore();

  const currentBeach = getSelectedBeach();
  const flagInfo = currentBeach ? FLAG_CONFIG[currentBeach.currentFlagStatus] : FLAG_CONFIG.green;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Banner: Real-Time Authority Status */}
      <div className={`${flagInfo.bg} ${flagInfo.text} px-4 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors duration-300`}>
        <div className="flex items-center space-x-2 container mx-auto">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="tracking-wide uppercase font-bold">{flagInfo.label}</span>
          <span className="hidden md:inline text-white/90 font-normal">| {flagInfo.description}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Authority Dispatch</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Portal Branding */}
          <div className="flex items-center justify-between">
            <Link 
              to="/tourist" 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-600 to-ocean-400 text-white flex items-center justify-center shadow-md shadow-ocean-500/20 group-hover:scale-105 transition-transform">
                <Waves className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                  CoastGuard Portal
                  <span className="text-[10px] uppercase tracking-wider bg-ocean-100 text-ocean-700 font-semibold px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </h1>
                <p className="text-xs text-slate-500">Interactive Beach Tourism & Safety Platform</p>
              </div>
            </Link>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center space-x-1.5">
              <Link
                to="/"
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200"
                title="Portal Gateway"
              >
                Home
              </Link>
              {isCommandRoute ? (
                <>
                  <Link
                    to="/tourist"
                    className="flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <LifeBuoy className="w-3.5 h-3.5 text-ocean-600" />
                    <span>Public</span>
                  </Link>
                  <button
                    onClick={() => authService.logout()}
                    className="flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/staff/login"
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  <span>Staff</span>
                </Link>
              )}
            </div>
          </div>

          {/* Beach Selector & Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Beach Selector Dropdown */}
            <div className="relative flex-1 md:w-64">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-600 pointer-events-none" />
              <select
                aria-label="Select Beach"
                value={selectedBeachId}
                onChange={(e) => setSelectedBeachId(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-100 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white transition cursor-pointer"
              >
                {beaches.map((beach) => (
                  <option key={beach.id} value={beach.id}>
                    {beach.name}, {beach.city} ({beach.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/"
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition"
                title="Return to Portal Gateway"
              >
                <span>Portal Home</span>
              </Link>

              {isCommandRoute ? (
                <>
                  <Link
                    to="/tourist"
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition"
                  >
                    <LifeBuoy className="w-3.5 h-3.5 text-ocean-600" />
                    <span>Public View</span>
                  </Link>
                  <button
                    onClick={() => authService.logout()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 transition cursor-pointer"
                    title="Sign Out of Command Session"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/staff/login"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition group"
                >
                  <Shield className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-300 transition" />
                  <span>Staff Portal</span>
                </Link>
              )}
            </div>

            {/* Emergency SOS Button (Directly switches to SOS reporting) */}
            {!isStaffRoute && (
              <button
                onClick={() => setActiveTab('sos')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span>SOS Alert</span>
              </button>
            )}
          </div>
        </div>

        {/* Tourist Navigation Tabs (Visible on public portal route) */}
        {!isStaffRoute && (
          <nav className="flex space-x-2 mt-3 pt-2 border-t border-slate-100 overflow-x-auto text-sm">
            {[
              { id: 'dashboard', label: 'Beach Dashboard' },
              { id: 'map', label: 'Interactive Map & Hazards' },
              { id: 'facilities', label: 'Amenities & Towers' },
              { id: 'reviews', label: 'Reviews & Crowd Tips' },
              { id: 'sos', label: 'Report Hazard / SOS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition text-xs md:text-sm cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-ocean-50 text-ocean-700 border border-ocean-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
