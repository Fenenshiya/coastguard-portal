import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  Layers, 
  Eye, 
  EyeOff, 
  Plus, 
  AlertTriangle, 
  Activity, 
  X,
  Crosshair,
  Info,
  Car,
  Home,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { beachDataService } from '../../services/beachDataService';
import { HazardZone, Facility, IncidentReport, LatLng } from '../../types';

export const InteractiveBeachMap: React.FC = () => {
  const { 
    selectedBeachId, 
    currentUser, 
    mapFilters, 
    toggleMapFilter, 
    getSelectedBeach,
    setActiveTab 
  } = useBeachStore();

  const userRole = currentUser?.role || 'tourist';

  const currentBeach = getSelectedBeach();
  const [hazards, setHazards] = useState<HazardZone[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'hazard' | 'facility' | 'incident';
    data: any;
  } | null>(null);

  // User simulated/real GPS position
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Admin interactive hazard drawer state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [newHazardType, setNewHazardType] = useState<'rip_current' | 'jellyfish' | 'submerged_rocks'>('rip_current');
  const [newHazardTitle, setNewHazardTitle] = useState('');
  const [newHazardDesc, setNewHazardDesc] = useState('');

  useEffect(() => {
    const unsubH = beachDataService.subscribeToHazards(selectedBeachId, setHazards);
    const unsubF = beachDataService.subscribeToFacilities(selectedBeachId, setFacilities);
    const unsubI = beachDataService.subscribeToIncidents(selectedBeachId, setIncidents);

    return () => {
      unsubH();
      unsubF();
      unsubI();
    };
  }, [selectedBeachId]);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, snapping to beach center:', err);
          // Fallback slightly offset from beach center for testing
          if (currentBeach) {
            setUserLocation({
              lat: currentBeach.center.lat + 0.001,
              lng: currentBeach.center.lng + 0.001
            });
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else if (currentBeach) {
      setUserLocation({
        lat: currentBeach.center.lat + 0.001,
        lng: currentBeach.center.lng + 0.001
      });
      setIsLocating(false);
    }
  };

  // Convert geo coordinates to relative SVG percent coordinates based on beach bounds
  const getCoordinatesPct = (coords: LatLng) => {
    if (!currentBeach) return { x: 50, y: 50 };
    const { bounds } = currentBeach;
    const latSpan = bounds.north - bounds.south;
    const lngSpan = bounds.east - bounds.west;

    // Invert lat for SVG y (north is 0% y, south is 100% y)
    const yPct = ((bounds.north - coords.lat) / (latSpan || 0.01)) * 100;
    const xPct = ((coords.lng - bounds.west) / (lngSpan || 0.01)) * 100;

    // Clamp between 5% and 95%
    return {
      x: Math.min(92, Math.max(8, xPct)),
      y: Math.min(92, Math.max(8, yPct)),
    };
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingMode || !currentBeach) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXPct = (e.clientX - rect.left) / rect.width;
    const clickYPct = (e.clientY - rect.top) / rect.height;

    // Convert SVG percentage back to LatLng
    const { bounds } = currentBeach;
    const latSpan = bounds.north - bounds.south;
    const lngSpan = bounds.east - bounds.west;

    const clickedLat = bounds.north - (clickYPct * latSpan);
    const clickedLng = bounds.west + (clickXPct * lngSpan);

    // Create new hazard zone
    const created = beachDataService.addHazardZone({
      beachId: currentBeach.id,
      type: newHazardType,
      title: newHazardTitle || `Active ${newHazardType.replace('_', ' ').toUpperCase()}`,
      description: newHazardDesc || 'Lifeguard flagged hazard zone. Exercise extreme caution.',
      severity: newHazardType === 'rip_current' ? 'danger' : 'warning',
      geometryType: newHazardType === 'rip_current' ? 'polygon' : 'circle',
      coordinates: [
        { lat: clickedLat, lng: clickedLng },
        { lat: clickedLat - 0.001, lng: clickedLng + 0.001 },
        { lat: clickedLat - 0.002, lng: clickedLng - 0.001 },
      ],
      circleRadiusMeters: 80,
      active: true,
      reportedBy: 'Lifeguard Admin'
    });

    setIsDrawingMode(false);
    setNewHazardTitle('');
    setNewHazardDesc('');
    setSelectedEntity({ type: 'hazard', data: created });
  };

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Layer Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-ocean-600" /> Layers:
          </span>

          <button
            onClick={() => toggleMapFilter('showHazards')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
              mapFilters.showHazards 
                ? 'bg-rose-50 border-rose-300 text-rose-700' 
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Hazards ({hazards.length})</span>
          </button>

          <button
            onClick={() => toggleMapFilter('showFacilities')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
              mapFilters.showFacilities 
                ? 'bg-ocean-50 border-ocean-300 text-ocean-700' 
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>Facilities ({facilities.length})</span>
          </button>

          {userRole !== 'tourist' && (
            <button
              onClick={() => toggleMapFilter('showIncidents')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
                mapFilters.showIncidents 
                  ? 'bg-purple-50 border-purple-300 text-purple-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Active Incidents ({incidents.filter(i => i.status !== 'resolved').length})</span>
            </button>
          )}
        </div>

        {/* Map Actions (Locate Me & Lifeguard Zone Creator) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5 transition"
          >
            <Navigation className={`w-3.5 h-3.5 text-ocean-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          {userRole !== 'tourist' && (
            <button
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm ${
                isDrawingMode
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isDrawingMode ? 'Click Map to Place Hazard' : 'Add Hazard Zone'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Drawing Prompt Banner */}
      {isDrawingMode && (
        <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl flex items-center justify-between text-xs text-rose-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
            <span><strong>Hazard Placement Mode Active:</strong> Click anywhere on the map to define the hazard zone location.</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Hazard Type"
              value={newHazardType}
              onChange={(e) => setNewHazardType(e.target.value as any)}
              className="px-2 py-1 bg-white border border-rose-200 rounded text-xs font-medium text-slate-800"
            >
              <option value="rip_current">Rip Current Zone</option>
              <option value="jellyfish">Jellyfish Swarm Area</option>
              <option value="submerged_rocks">Submerged Rocks Hazard</option>
            </select>
            <button 
              onClick={() => setIsDrawingMode(false)}
              className="text-rose-700 hover:text-rose-900 font-bold ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Map Canvas */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 select-none">
        
        {/* Ocean Waves Aesthetic Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-8 left-10 w-96 h-1 rounded-full bg-white/40 blur-xs animate-pulse" />
          <div className="absolute top-24 right-16 w-80 h-1 rounded-full bg-white/30 blur-xs animate-pulse" />
          <div className="absolute top-44 left-28 w-96 h-1 rounded-full bg-white/30 blur-xs animate-pulse" />
        </div>

        {/* Shoreline Sand Transition */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-amber-200/90 via-amber-100/80 to-transparent pointer-events-none border-t border-amber-300/40">
          <div className="absolute top-2 left-6 text-[10px] uppercase tracking-wider font-bold text-amber-900/60">
            🏖️ Sandy Beach / Shoreline
          </div>
        </div>

        {/* Deep Water Label */}
        <div className="absolute top-3 left-4 text-[10px] uppercase tracking-wider font-extrabold text-white/80 drop-shadow">
          🌊 Deep Water / Surf Zone • {currentBeach?.name}
        </div>

        {/* SVG Interactive Overlay for Hazards, Zones, and Pins */}
        <svg 
          className={`w-full h-full ${isDrawingMode ? 'cursor-crosshair' : 'cursor-default'}`}
          onClick={handleMapClick}
        >
          {/* Render Hazard Polygons & Circles */}
          {mapFilters.showHazards && hazards.map((hz) => {
            if (hz.geometryType === 'polygon') {
              const pointsStr = hz.coordinates
                .map(c => {
                  const pct = getCoordinatesPct(c);
                  return `${pct.x}%,${pct.y}%`;
                })
                .join(' ');

              return (
                <g key={hz.id} className="cursor-pointer group" onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'hazard', data: hz }); }}>
                  <polygon
                    points={pointsStr}
                    className="fill-rose-500/30 stroke-rose-600 stroke-2 hover:fill-rose-500/50 transition duration-300 animate-pulse"
                  />
                  {/* Center Rip Warning Icon */}
                  {hz.coordinates[0] && (
                    <circle
                      cx={`${getCoordinatesPct(hz.coordinates[0]).x}%`}
                      cy={`${getCoordinatesPct(hz.coordinates[0]).y}%`}
                      r="12"
                      className="fill-rose-600 stroke-white stroke-2 shadow-lg"
                    />
                  )}
                </g>
              );
            } else {
              // Circle hazard (e.g. Jellyfish or Rocks)
              const centerPct = getCoordinatesPct(hz.coordinates[0] || currentBeach!.center);
              return (
                <g key={hz.id} className="cursor-pointer group" onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'hazard', data: hz }); }}>
                  <circle
                    cx={`${centerPct.x}%`}
                    cy={`${centerPct.y}%`}
                    r="40"
                    className={`${
                      hz.type === 'jellyfish' 
                        ? 'fill-purple-500/30 stroke-purple-600' 
                        : 'fill-amber-500/30 stroke-amber-600'
                    } stroke-2 hover:fill-opacity-50 transition duration-300`}
                  />
                  <circle
                    cx={`${centerPct.x}%`}
                    cy={`${centerPct.y}%`}
                    r="10"
                    className={`${hz.type === 'jellyfish' ? 'fill-purple-600' : 'fill-amber-600'} stroke-white stroke-2 shadow`}
                  />
                </g>
              );
            }
          })}

          {/* Render User GPS Pin */}
          {userLocation && (
            <g className="cursor-pointer">
              <circle
                cx={`${getCoordinatesPct(userLocation).x}%`}
                cy={`${getCoordinatesPct(userLocation).y}%`}
                r="18"
                className="fill-blue-500/30 animate-ping"
              />
              <circle
                cx={`${getCoordinatesPct(userLocation).x}%`}
                cy={`${getCoordinatesPct(userLocation).y}%`}
                r="8"
                className="fill-blue-600 stroke-white stroke-2 shadow-lg"
              />
            </g>
          )}

          {/* Render Facility Markers */}
          {mapFilters.showFacilities && facilities.map((fac) => {
            const pct = getCoordinatesPct(fac.location);
            return (
              <g 
                key={fac.id} 
                className="cursor-pointer group"
                onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'facility', data: fac }); }}
              >
                <circle
                  cx={`${pct.x}%`}
                  cy={`${pct.y}%`}
                  r="12"
                  className={`${
                    fac.type === 'lifeguard_tower' 
                      ? 'fill-emerald-600' 
                      : fac.type === 'first_aid'
                      ? 'fill-rose-600'
                      : 'fill-ocean-700'
                  } stroke-white stroke-2 group-hover:scale-125 transition-transform duration-200 shadow-md`}
                />
              </g>
            );
          })}

          {/* Render Active Incident Pins (Pulsing SOS in red) */}
          {mapFilters.showIncidents && incidents.filter(i => i.status !== 'resolved').map((inc) => {
            const pct = getCoordinatesPct(inc.location);
            return (
              <g 
                key={inc.id} 
                className="cursor-pointer group"
                onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'incident', data: inc }); }}
              >
                <circle
                  cx={`${pct.x}%`}
                  cy={`${pct.y}%`}
                  r="24"
                  className="fill-rose-600/40 animate-ping"
                />
                <circle
                  cx={`${pct.x}%`}
                  cy={`${pct.y}%`}
                  r="12"
                  className="fill-rose-700 stroke-white stroke-2 shadow-xl"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Map Legend (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-lg text-[11px] space-y-1.5 max-w-[200px]">
          <div className="font-bold text-slate-800 text-xs border-b pb-1 mb-1">Map Legend</div>
          <div className="flex items-center gap-2 text-rose-700 font-semibold">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span>Rip Current Danger</span>
          </div>
          <div className="flex items-center gap-2 text-purple-700 font-semibold">
            <span className="w-3 h-3 rounded-full bg-purple-600" />
            <span>Jellyfish Stinger Zone</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span>Lifeguard Station</span>
          </div>
          <div className="flex items-center gap-2 text-blue-700 font-semibold">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span>Your GPS Location</span>
          </div>
          {userRole !== 'tourist' && (
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <span className="w-3 h-3 rounded-full bg-rose-700 animate-pulse" />
              <span>Active SOS Emergency</span>
            </div>
          )}
        </div>

        {/* Selected Entity Detail Popover Card */}
        {selectedEntity && (
          <div className="absolute top-4 left-4 max-w-sm bg-white p-4 rounded-xl border border-slate-200 shadow-2xl z-30 animate-scaleIn">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {selectedEntity.type === 'hazard' && (
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-100 text-rose-800">
                    Hazard Zone
                  </span>
                )}
                {selectedEntity.type === 'facility' && (
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-ocean-100 text-ocean-800">
                    Beach Facility
                  </span>
                )}
                {selectedEntity.type === 'incident' && (
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-600 text-white animate-pulse">
                    Active SOS / Incident
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content for Hazard */}
            {selectedEntity.type === 'hazard' && (
              <div className="mt-2 space-y-1">
                <h4 className="font-bold text-sm text-slate-900">{selectedEntity.data.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedEntity.data.description}</p>
                <div className="pt-2 text-[10px] text-slate-500 border-t flex justify-between">
                  <span>Severity: <strong className="text-rose-600 uppercase">{selectedEntity.data.severity}</strong></span>
                  <span>Reported by: {selectedEntity.data.reportedBy}</span>
                </div>
                {userRole !== 'tourist' && (
                  <button
                    onClick={() => {
                      beachDataService.deleteHazardZone(selectedEntity.data.id);
                      setSelectedEntity(null);
                    }}
                    className="w-full mt-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded"
                  >
                    Delete Hazard Zone
                  </button>
                )}
              </div>
            )}

            {/* Content for Facility */}
            {selectedEntity.type === 'facility' && (
              <div className="mt-2 space-y-1">
                <h4 className="font-bold text-sm text-slate-900">{selectedEntity.data.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedEntity.data.details || 'Public beach amenity.'}</p>
                {selectedEntity.data.operatingHours && (
                  <div className="text-xs text-slate-500 font-medium">
                    Hours: {selectedEntity.data.operatingHours}
                  </div>
                )}
                <div className="pt-2 text-[10px] text-emerald-700 font-bold border-t">
                  Status: {selectedEntity.data.status.toUpperCase()}
                </div>
              </div>
            )}

            {/* Content for Incident */}
            {selectedEntity.type === 'incident' && (
              <div className="mt-2 space-y-2">
                <h4 className="font-bold text-sm text-rose-900">{selectedEntity.data.type.replace('_', ' ').toUpperCase()}</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedEntity.data.description}</p>
                <div className="text-xs text-slate-500">
                  Reporter: {selectedEntity.data.reporter.contactName || 'Anonymous'}
                </div>
                <div className="pt-2 text-[10px] text-slate-600 border-t flex justify-between">
                  <span>Status: <strong className="uppercase text-rose-700">{selectedEntity.data.status}</strong></span>
                  <span>{new Date(selectedEntity.data.createdAt).toLocaleTimeString()}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('sos');
                  }}
                  className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded"
                >
                  View in Incident Dispatch
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Guidelines Footer */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-ocean-600 flex-shrink-0" />
          <span>Click any marker or colored zone on the map to view detailed safety advisories and operating hours.</span>
        </div>
        <div className="text-slate-500 font-medium">
          Coordinates: {currentBeach?.center.lat.toFixed(4)}, {currentBeach?.center.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};
