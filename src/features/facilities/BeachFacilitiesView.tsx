import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Shield, 
  HeartPulse, 
  Car, 
  Droplets, 
  Accessibility, 
  ExternalLink,
  Navigation
} from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { beachDataService } from '../../services/beachDataService';
import { Facility, FacilityType } from '../../types';

const FACILITY_ICONS: Record<FacilityType, { icon: any; color: string; bg: string }> = {
  lifeguard_tower: { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  first_aid: { icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
  restroom: { icon: Droplets, color: 'text-ocean-600', bg: 'bg-ocean-50' },
  shower: { icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  parking: { icon: Car, color: 'text-amber-600', bg: 'bg-amber-50' },
  accessibility_mat: { icon: Accessibility, color: 'text-purple-600', bg: 'bg-purple-50' },
};

export const BeachFacilitiesView: React.FC = () => {
  const { selectedBeachId, getSelectedBeach, setActiveTab } = useBeachStore();
  const currentBeach = getSelectedBeach();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const unsub = beachDataService.subscribeToFacilities(selectedBeachId, setFacilities);
    return () => unsub();
  }, [selectedBeachId]);

  const filtered = filterType === 'all' 
    ? facilities 
    : facilities.filter(f => f.type === filterType);

  return (
    <div className="space-y-6">
      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Facilities & Safety Stations</h3>
          <p className="text-xs text-slate-500">
            Available amenities and staffed stations at {currentBeach?.name}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Amenities' },
            { id: 'lifeguard_tower', label: 'Towers' },
            { id: 'first_aid', label: 'First Aid' },
            { id: 'restroom', label: 'Restrooms' },
            { id: 'parking', label: 'Parking' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                filterType === item.id
                  ? 'bg-ocean-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fac) => {
          const config = FACILITY_ICONS[fac.type] || FACILITY_ICONS.restroom;
          const IconComponent = config.icon;

          return (
            <div 
              key={fac.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${config.bg} ${config.color} mb-3`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    fac.status === 'open' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {fac.status}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{fac.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {fac.details || 'Public beach infrastructure for visitor comfort and safety.'}
                </p>

                {fac.operatingHours && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Operating Hours: <strong>{fac.operatingHours}</strong></span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {fac.location.lat.toFixed(4)}, {fac.location.lng.toFixed(4)}
                </span>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-ocean-600 hover:text-ocean-700 font-bold flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Show on Map</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
