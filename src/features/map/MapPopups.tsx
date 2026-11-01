import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Shield, 
  Phone, 
  Clock, 
  MapPin, 
  Trash2, 
  ExternalLink, 
  LifeBuoy 
} from 'lucide-react';
import { HazardZone, Facility, IncidentReport, HazardType } from '../../types';

interface HazardPopupProps {
  hazard: HazardZone;
  isStaff: boolean;
  onDelete?: (id: string) => void;
}

export const HazardPopupContent: React.FC<HazardPopupProps> = ({ hazard, isStaff, onDelete }) => {
  const getSafetyInstructions = (type: HazardType) => {
    switch (type) {
      case 'rip_current':
        return [
          'DO NOT fight the seaward current.',
          'Float on your back, stay calm, and conserve your energy.',
          'Swim parallel to the shoreline until you break free from the rip channel.',
          'If unable to escape, face the shore and raise one arm to signal lifeguards.'
        ];
      case 'jellyfish':
        return [
          'Avoid entering the water where bluebottles or stingers are washing ashore.',
          'Do NOT rub the affected area with sand, towels, or freshwater.',
          'Rinse sting thoroughly with ocean seawater.',
          'Report immediately to the nearest lifeguard tower for vinegar/heat treatment.'
        ];
      case 'submerged_rocks':
        return [
          'Maintain a minimum buffer of 30 meters from submerged reef shelves.',
          'Do not dive headfirst in shallow or fluctuating breakwaters.',
          'Wear protective reef footwear when traversing rocky intertidal zones.'
        ];
      case 'restricted_swimming':
        return [
          'Water is strictly closed to the public by authority order.',
          'No swimming, surfing, wading, or operating watercraft permitted in this sector.',
          'Violators are subject to municipal beach safety penalties.'
        ];
      default:
        return [
          'Strictly swim between the red and yellow patrol flags.',
          'Observe all posted beach warning signs and follow lifeguard instructions.'
        ];
    }
  };

  const severityBadge = {
    danger: { bg: 'bg-red-100 text-red-800 border-red-300', label: 'High Danger' },
    warning: { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Moderate Danger' },
    advisory: { bg: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Caution Advisory' }
  }[hazard.severity] || { bg: 'bg-slate-100 text-slate-800 border-slate-300', label: hazard.severity };

  const centerCoord = hazard.coordinates[0];

  return (
    <div className="p-3.5 max-w-[290px] sm:max-w-xs text-slate-800 select-text">
      {/* Category & Severity Banner */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          Hazard Zone
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityBadge.bg}`}>
          {severityBadge.label}
        </span>
      </div>

      {/* Hazard Title */}
      <div className="flex items-start gap-2 mb-1.5">
        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
        <h4 className="font-bold text-sm text-slate-900 leading-snug">
          {hazard.title}
        </h4>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        {hazard.description}
      </p>

      {/* Safety Instructions Checklist */}
      <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2.5 mb-2.5">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 mb-1.5 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          <span>Crucial Safety Instructions:</span>
        </div>
        <ul className="space-y-1 text-[11px] text-rose-950 leading-tight">
          {getSafetyInstructions(hazard.type).map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-rose-600 font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata & Coordinates */}
      <div className="text-[10px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
        <div className="flex justify-between">
          <span>Authority:</span>
          <span className="font-semibold text-slate-700">{hazard.reportedBy || 'CoastGuard Patrol'}</span>
        </div>
        {centerCoord && (
          <div className="flex justify-between font-mono text-[9px] text-slate-400">
            <span>Coordinates:</span>
            <span>{centerCoord.lat.toFixed(5)}, {centerCoord.lng.toFixed(5)}</span>
          </div>
        )}
      </div>

      {/* Staff Actions */}
      {isStaff && onDelete && (
        <button
          onClick={() => onDelete(hazard.id)}
          className="mt-3 w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Hazard Zone</span>
        </button>
      )}
    </div>
  );
};

interface LifeguardPopupProps {
  facility: Facility;
  emergencyContact?: string;
}

export const LifeguardPopupContent: React.FC<LifeguardPopupProps> = ({ facility, emergencyContact }) => {
  const isOpen = facility.status === 'open';

  return (
    <div className="p-3.5 max-w-[280px] sm:max-w-xs text-slate-800 select-text">
      {/* Category & Status */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
          Lifeguard Station
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
        }`}>
          {isOpen ? 'ACTIVE ON DUTY' : 'OFF DUTY'}
        </span>
      </div>

      {/* Station Name */}
      <div className="flex items-start gap-2 mb-1.5">
        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <h4 className="font-bold text-sm text-slate-900 leading-snug">
          {facility.name}
        </h4>
      </div>

      {/* Details */}
      <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">
        {facility.details || 'Staffed lifeguard observation and rapid rescue station.'}
      </p>

      {/* Operating Hours */}
      {facility.operatingHours && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Patrol Hours: <strong className="text-slate-800">{facility.operatingHours}</strong></span>
        </div>
      )}

      {/* Emergency Contact Button */}
      {emergencyContact && (
        <a
          href={`tel:${emergencyContact.replace(/\s+/g, '')}`}
          className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition mb-2"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Station ({emergencyContact})</span>
        </a>
      )}

      {/* Coordinates */}
      <div className="pt-1.5 border-t border-slate-100 flex justify-between font-mono text-[9px] text-slate-400">
        <span>GPS:</span>
        <span>{facility.location.lat.toFixed(5)}, {facility.location.lng.toFixed(5)}</span>
      </div>
    </div>
  );
};

interface FacilityPopupProps {
  facility: Facility;
}

export const FacilityPopupContent: React.FC<FacilityPopupProps> = ({ facility }) => {
  return (
    <div className="p-3.5 max-w-[280px] sm:max-w-xs text-slate-800 select-text">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-ocean-700">
          {facility.type.replace('_', ' ')}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          facility.status === 'open' 
            ? 'bg-emerald-100 text-emerald-800' 
            : 'bg-slate-100 text-slate-600'
        }`}>
          {facility.status.toUpperCase()}
        </span>
      </div>

      {/* Name */}
      <h4 className="font-bold text-sm text-slate-900 mb-1 leading-snug">
        {facility.name}
      </h4>

      {/* Details */}
      <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">
        {facility.details || 'Public beach safety and visitor amenity.'}
      </p>

      {/* Operating Hours */}
      {facility.operatingHours && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Hours: <strong className="text-slate-800">{facility.operatingHours}</strong></span>
        </div>
      )}

      {/* Coordinates */}
      <div className="pt-1.5 border-t border-slate-100 flex justify-between font-mono text-[9px] text-slate-400">
        <span>Location:</span>
        <span>{facility.location.lat.toFixed(5)}, {facility.location.lng.toFixed(5)}</span>
      </div>
    </div>
  );
};

interface IncidentPopupProps {
  incident: IncidentReport;
  isStaff: boolean;
  onViewDispatch?: () => void;
}

export const IncidentPopupContent: React.FC<IncidentPopupProps> = ({ incident, isStaff, onViewDispatch }) => {
  const isCritical = incident.priority === 'critical' || incident.priority === 'high';

  return (
    <div className="p-3.5 max-w-[290px] sm:max-w-xs text-slate-800 select-text">
      {/* Category & Status */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1">
          <LifeBuoy className="w-3 h-3 text-rose-600 animate-spin" />
          <span>Active Response</span>
        </span>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
          isCritical ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-amber-100 text-amber-800'
        }`}>
          {incident.priority.toUpperCase()}
        </span>
      </div>

      {/* Incident Title */}
      <h4 className="font-bold text-sm text-slate-900 mb-1 leading-snug">
        {incident.type === 'sos_emergency' ? 'Water Rescue in Progress' : incident.type.replace('_', ' ').toUpperCase()}
      </h4>

      {/* Public Landmark */}
      {incident.location?.landmarkDescription && (
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mb-1.5">
          <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
          <span>{incident.location.landmarkDescription}</span>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">
        {incident.description}
      </p>

      {/* Public Safety Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-900 mb-2.5">
        <strong>Public Safety Notice:</strong> Please give way to lifeguard rescue craft and emergency vehicles along this section.
      </div>

      {/* Reported Time & Status */}
      <div className="text-[10px] text-slate-500 space-y-1 pt-1.5 border-t border-slate-100">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="font-bold text-rose-700 uppercase">{incident.status}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Reported:</span>
          <span>{new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Staff Action Button */}
      {isStaff && onViewDispatch && (
        <button
          onClick={onViewDispatch}
          className="mt-3 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Manage in Dispatch Center</span>
        </button>
      )}
    </div>
  );
};
