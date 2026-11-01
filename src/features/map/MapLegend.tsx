import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Info 
} from 'lucide-react';

interface MapLegendProps {
  showIncidentsLayer: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({ showIncidentsLayer }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300 max-w-[280px] sm:max-w-xs text-xs">
      {/* Legend Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition border-b border-slate-200 cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-ocean-600" />
          <span className="font-bold text-slate-800 tracking-wide text-xs">Map Safety Legend</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {/* Legend Content */}
      {isExpanded && (
        <div className="p-3 space-y-2.5 text-[11px] max-h-72 overflow-y-auto">
          {/* Hazards */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Hazard Classifications
            </div>
            
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-red-200 flex-shrink-0 animate-pulse" />
              <div className="leading-tight">
                <span className="font-bold text-red-700">Rip Current / High Danger</span>
                <p className="text-[10px] text-slate-500">Hazardous seaward flow; no swimming</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-purple-600 ring-2 ring-purple-200 flex-shrink-0" />
              <div className="leading-tight">
                <span className="font-bold text-purple-700">Jellyfish / Marine Life</span>
                <p className="text-[10px] text-slate-500">Stinger risk; vinegar stations active</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-amber-200 flex-shrink-0" />
              <div className="leading-tight">
                <span className="font-bold text-amber-800">Caution / Submerged Rocks</span>
                <p className="text-[10px] text-slate-500">Shallow reef flats & hidden boulders</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Safety & Amenities
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 ring-2 ring-emerald-200 flex-shrink-0 flex items-center justify-center text-white text-[8px] font-bold">
                ✓
              </span>
              <div className="leading-tight">
                <span className="font-bold text-emerald-800">Lifeguard Station</span>
                <p className="text-[10px] text-slate-500">Staffed patrol tower & defibrillator</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 ring-2 ring-rose-200 flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold">
                +
              </span>
              <div className="leading-tight">
                <span className="font-bold text-rose-700">First-Aid Station</span>
                <p className="text-[10px] text-slate-500">Stinger treatment & minor injuries</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-ocean-600 ring-2 ring-ocean-200 flex-shrink-0" />
              <div className="leading-tight">
                <span className="font-bold text-ocean-700">Beach Facilities</span>
                <p className="text-[10px] text-slate-500">Restrooms, showers, parking</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-blue-300 animate-ping" />
              <div className="leading-tight">
                <span className="font-bold text-blue-700">Your GPS Location</span>
                <p className="text-[10px] text-slate-500">Real-time device position</p>
              </div>
            </div>
          </div>

          {showIncidentsLayer && (
            <div className="border-t border-slate-100 pt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-700 ring-4 ring-rose-300 animate-pulse flex-shrink-0" />
                <div className="leading-tight">
                  <span className="font-bold text-rose-900">Active Incident / SOS</span>
                  <p className="text-[10px] text-slate-500">Verified emergency response in progress</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
