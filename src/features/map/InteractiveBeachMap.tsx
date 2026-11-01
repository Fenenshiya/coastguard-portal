import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Plus, 
  AlertTriangle, 
  Activity, 
  RotateCcw,
  Compass,
  LifeBuoy,
  Shield,
  Info,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { beachDataService } from '../../services/beachDataService';
import { HazardZone, Facility, IncidentReport, LatLng, HazardType } from '../../types';
import { 
  createHazardIcon, 
  createLifeguardIcon, 
  createFacilityIcon, 
  createIncidentIcon, 
  createUserLocationIcon 
} from './mapIcons';
import { MapController } from './MapController';
import { MapLegend } from './MapLegend';
import { 
  HazardPopupContent, 
  LifeguardPopupContent, 
  FacilityPopupContent, 
  IncidentPopupContent 
} from './MapPopups';

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
  const isStaff = userRole !== 'tourist';
  const currentBeach = getSelectedBeach();

  // Data states from subscriptions
  const [hazards, setHazards] = useState<HazardZone[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // User GPS state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  // Programmatic map fly-to target
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom?: number; timestamp: number } | null>(null);

  // Staff Hazard Placement Mode
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [newHazardType, setNewHazardType] = useState<HazardType>('rip_current');
  const [newHazardTitle, setNewHazardTitle] = useState('');
  const [newHazardDesc, setNewHazardDesc] = useState('');
  const [placementNotice, setPlacementNotice] = useState<string | null>(null);

  // Subscribe to live Firestore / local data
  useEffect(() => {
    setIsLoadingData(true);
    const unsubH = beachDataService.subscribeToHazards(selectedBeachId, (data) => {
      setHazards(data);
      setIsLoadingData(false);
    });
    const unsubF = beachDataService.subscribeToFacilities(selectedBeachId, (data) => {
      setFacilities(data);
    });
    const unsubI = beachDataService.subscribeToIncidents(selectedBeachId, (data) => {
      setIncidents(data);
    });

    return () => {
      unsubH();
      unsubF();
      unsubI();
    };
  }, [selectedBeachId]);

  // Split facilities into Lifeguard Stations vs General Amenities
  const lifeguardStations = useMemo(() => {
    return facilities.filter(f => f.type === 'lifeguard_tower');
  }, [facilities]);

  const generalFacilities = useMemo(() => {
    return facilities.filter(f => f.type !== 'lifeguard_tower');
  }, [facilities]);

  // Separate valid coordinate items from missing coordinate records
  const validHazards = useMemo(() => {
    return hazards.filter(h => {
      if (!Array.isArray(h.coordinates) || h.coordinates.length === 0) return false;
      const first = h.coordinates[0];
      return typeof first?.lat === 'number' && !isNaN(first.lat) && typeof first?.lng === 'number' && !isNaN(first.lng);
    });
  }, [hazards]);

  const unmappedHazardsCount = hazards.length - validHazards.length;

  const validLifeguards = useMemo(() => {
    return lifeguardStations.filter(f => {
      return typeof f.location?.lat === 'number' && !isNaN(f.location.lat) && typeof f.location?.lng === 'number' && !isNaN(f.location.lng);
    });
  }, [lifeguardStations]);

  const validGeneralFacilities = useMemo(() => {
    return generalFacilities.filter(f => {
      return typeof f.location?.lat === 'number' && !isNaN(f.location.lat) && typeof f.location?.lng === 'number' && !isNaN(f.location.lng);
    });
  }, [generalFacilities]);

  const validIncidents = useMemo(() => {
    return incidents.filter(i => {
      const lat = i.location?.lat ?? i.latitude;
      const lng = i.location?.lng ?? i.longitude;
      return typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng) && (lat !== 0 || lng !== 0);
    });
  }, [incidents]);

  // Handle browser Geolocation "Locate Me"
  const handleLocateMe = () => {
    setLocationError(null);
    setLocationSuccessMsg(null);

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation API is not supported by your current browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newLoc = { lat: latitude, lng: longitude, accuracy };
        setUserLocation(newLoc);
        setIsLocating(false);
        setLocationSuccessMsg(
          `Location acquired with ±${Math.round(accuracy)}m precision. Map centered on your position.`
        );

        // Fly map to user GPS coordinates
        setFlyTarget({
          lat: latitude,
          lng: longitude,
          zoom: 16,
          timestamp: Date.now()
        });
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = 'Unable to retrieve your location.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Location access permission was denied. Please allow location permissions in your browser to view your position relative to beach hazards.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'GPS location is currently unavailable. Please verify your device GPS / network location settings.';
            break;
          case err.TIMEOUT:
            errorMsg = 'The request to acquire your GPS location timed out. Please try again.';
            break;
        }
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Reset View to Beach Center
  const handleResetToBeach = () => {
    if (!currentBeach) return;
    setFlyTarget({
      lat: currentBeach.center.lat,
      lng: currentBeach.center.lng,
      zoom: 15,
      timestamp: Date.now()
    });
  };

  // Staff Map Click to Place Hazard Zone
  const handleAdminMapClick = (lat: number, lng: number) => {
    if (!isDrawingMode || !currentBeach || !isStaff) return;

    let coords: LatLng[] = [{ lat, lng }];
    let geomType: 'polygon' | 'circle' = 'circle';

    if (newHazardType === 'rip_current') {
      geomType = 'polygon';
      coords = [
        { lat: lat + 0.0012, lng: lng - 0.0008 },
        { lat: lat + 0.0016, lng: lng + 0.0012 },
        { lat: lat - 0.0010, lng: lng + 0.0018 },
        { lat: lat - 0.0014, lng: lng - 0.0005 }
      ];
    }

    const defaultTitle = newHazardTitle.trim() || `Active ${newHazardType.replace('_', ' ').toUpperCase()} Zone`;
    const defaultDesc = newHazardDesc.trim() || 'Lifeguard flagged hazard sector. Exercise caution and follow instructions.';

    beachDataService.addHazardZone({
      beachId: currentBeach.id,
      type: newHazardType,
      title: defaultTitle,
      description: defaultDesc,
      severity: newHazardType === 'rip_current' ? 'danger' : 'warning',
      geometryType: geomType,
      coordinates: coords,
      circleRadiusMeters: 85,
      active: true,
      reportedBy: currentUser?.displayName || 'Lifeguard Admin'
    });

    setIsDrawingMode(false);
    setNewHazardTitle('');
    setNewHazardDesc('');
    setPlacementNotice(`Hazard zone "${defaultTitle}" successfully placed at coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}.`);
    setTimeout(() => setPlacementNotice(null), 5000);
  };

  const handleDeleteHazard = (id: string) => {
    beachDataService.deleteHazardZone(id);
  };

  if (!currentBeach) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">No Beach Selected</h3>
        <p className="text-xs text-slate-500">Please choose a beach from the top navigation bar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Beach Context & Live Flag Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {currentBeach.name} Interactive Safety Map
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {currentBeach.center.lat.toFixed(4)}, {currentBeach.center.lng.toFixed(4)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live OpenStreetMap navigation with real-time hazard zones and ocean safety facilities
            </p>
          </div>
        </div>

        {/* Layer Toggles & Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          
          {/* Layer Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Hazards Layer Toggle */}
            <button
              onClick={() => toggleMapFilter('showHazards')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                mapFilters.showHazards 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Toggle Hazard Zones & Warning Markers"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Hazards ({validHazards.length})</span>
            </button>

            {/* Lifeguards Layer Toggle */}
            <button
              onClick={() => toggleMapFilter('showLifeguards')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                mapFilters.showLifeguards 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Toggle Lifeguard Stations & Towers"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Lifeguards ({validLifeguards.length})</span>
            </button>

            {/* Facilities Layer Toggle */}
            <button
              onClick={() => toggleMapFilter('showFacilities')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                mapFilters.showFacilities 
                  ? 'bg-ocean-50 border-ocean-300 text-ocean-700 shadow-xs' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Toggle Amenities, Restrooms & Parking"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Facilities ({validGeneralFacilities.length})</span>
            </button>

            {/* Active Incidents / Active SOS Layer Toggle */}
            <button
              onClick={() => toggleMapFilter('showIncidents')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                mapFilters.showIncidents 
                  ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Toggle Active Incidents & Emergency SOS"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Active Incidents ({validIncidents.length})</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Action Buttons: Locate Me & Reset View */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                userLocation
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Acquire device GPS location and center map"
            >
              <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring GPS...' : userLocation ? 'GPS Active' : 'Locate Me'}</span>
            </button>

            <button
              onClick={handleResetToBeach}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Reset map view to beach center"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Center Beach</span>
            </button>

            {/* Staff Add Hazard Zone Toggle */}
            {isStaff && (
              <button
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  isDrawingMode
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isDrawingMode ? 'Cancel Placement' : 'Add Hazard Zone'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Geolocation Alerts / Feedback */}
      {locationError && (
        <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span><strong>GPS Notice:</strong> {locationError}</span>
          </div>
          <button 
            onClick={() => setLocationError(null)} 
            className="text-amber-700 hover:text-amber-900 font-bold p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {locationSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{locationSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setLocationSuccessMsg(null)} 
            className="text-emerald-700 hover:text-emerald-900 font-bold p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {placementNotice && (
        <div className="bg-blue-50 border border-blue-300 p-3 rounded-xl flex items-center justify-between text-xs text-blue-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{placementNotice}</span>
          </div>
          <button 
            onClick={() => setPlacementNotice(null)} 
            className="text-blue-700 hover:text-blue-900 font-bold p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Missing coordinates explanation banner if existing data lacks coordinates */}
      {unmappedHazardsCount > 0 && (
        <div className="bg-slate-100 border border-slate-300 p-3 rounded-xl flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span>
              <strong>Note:</strong> {unmappedHazardsCount} hazard record(s) currently lack geographic coordinates (requires <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">coordinates: LatLng[]</code>) and cannot be plotted as map markers.
            </span>
          </div>
        </div>
      )}

      {/* Staff Interactive Hazard Placement Banner */}
      {isDrawingMode && (
        <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-rose-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce flex-shrink-0" />
            <span><strong>Hazard Placement Mode Active:</strong> Click anywhere on the map to place a new hazard marker at those exact coordinates.</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Hazard Type"
              value={newHazardType}
              onChange={(e) => setNewHazardType(e.target.value as HazardType)}
              className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="rip_current">Rip Current Zone (Polygon)</option>
              <option value="jellyfish">Jellyfish Stinger Area (Circle)</option>
              <option value="submerged_rocks">Submerged Rocks Hazard</option>
              <option value="restricted_swimming">Restricted Beach Area</option>
            </select>
            <input
              type="text"
              placeholder="Title (optional)"
              value={newHazardTitle}
              onChange={(e) => setNewHazardTitle(e.target.value)}
              className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-xs text-slate-800 w-36"
            />
            <button 
              onClick={() => setIsDrawingMode(false)}
              className="text-rose-700 hover:text-rose-900 font-bold px-2 py-1 bg-rose-100 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Leaflet Geographical Map Container */}
      <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
        
        {/* Loading Overlay */}
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200 text-xs font-bold text-slate-700">
              <LifeBuoy className="w-4 h-4 text-ocean-600 animate-spin" />
              <span>Loading Live Beach Safety Data...</span>
            </div>
          </div>
        )}

        <MapContainer
          center={[currentBeach.center.lat, currentBeach.center.lng]}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full"
          attributionControl={true}
        >
          {/* Real OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Map Controller for programmatic flyTo, re-centering and staff clicks */}
          <MapController
            beachCenter={currentBeach.center}
            targetLocation={flyTarget}
            isDrawingMode={isDrawingMode}
            onMapClick={handleAdminMapClick}
            defaultZoom={15}
          />

          {/* ======================================================== */}
          {/* 1. HAZARD ZONES & MARKERS                                 */}
          {/* ======================================================== */}
          {mapFilters.showHazards && validHazards.map((hz) => {
            const hasPolygon = hz.geometryType === 'polygon' && hz.coordinates.length >= 3;
            const hasCircle = hz.geometryType === 'circle' && hz.coordinates.length >= 1;
            const centerPoint = hz.coordinates[0];

            return (
              <React.Fragment key={hz.id}>
                {/* Polygon Shape for Rip Current / Danger Areas */}
                {hasPolygon && (
                  <Polygon
                    positions={hz.coordinates.map(c => [c.lat, c.lng])}
                    pathOptions={{
                      color: hz.severity === 'danger' ? '#dc2626' : '#d97706',
                      fillColor: hz.severity === 'danger' ? '#ef4444' : '#f59e0b',
                      fillOpacity: 0.28,
                      weight: 2,
                      dashArray: '5, 5'
                    }}
                  >
                    <Popup>
                      <HazardPopupContent
                        hazard={hz}
                        isStaff={isStaff}
                        onDelete={handleDeleteHazard}
                      />
                    </Popup>
                  </Polygon>
                )}

                {/* Circle Shape for Stinger / Rock Warning Areas */}
                {hasCircle && (
                  <Circle
                    center={[centerPoint.lat, centerPoint.lng]}
                    radius={hz.circleRadiusMeters || 80}
                    pathOptions={{
                      color: hz.type === 'jellyfish' ? '#7e22ce' : '#d97706',
                      fillColor: hz.type === 'jellyfish' ? '#9333ea' : '#f59e0b',
                      fillOpacity: 0.22,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <HazardPopupContent
                        hazard={hz}
                        isStaff={isStaff}
                        onDelete={handleDeleteHazard}
                      />
                    </Popup>
                  </Circle>
                )}

                {/* Central Hazard Marker with Distinct Visual Style & Popups */}
                {centerPoint && (
                  <Marker
                    position={[centerPoint.lat, centerPoint.lng]}
                    icon={createHazardIcon(hz.type, hz.severity)}
                  >
                    <Popup>
                      <HazardPopupContent
                        hazard={hz}
                        isStaff={isStaff}
                        onDelete={handleDeleteHazard}
                      />
                    </Popup>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}

          {/* ======================================================== */}
          {/* 2. LIFEGUARD STATIONS                                     */}
          {/* ======================================================== */}
          {mapFilters.showLifeguards && validLifeguards.map((fac) => (
            <Marker
              key={fac.id}
              position={[fac.location.lat, fac.location.lng]}
              icon={createLifeguardIcon(fac.status === 'open')}
            >
              <Popup>
                <LifeguardPopupContent
                  facility={fac}
                  emergencyContact={currentBeach.contactEmergency}
                />
              </Popup>
            </Marker>
          ))}

          {/* ======================================================== */}
          {/* 3. BEACH FACILITIES (Amenities, Parking, First Aid)        */}
          {/* ======================================================== */}
          {mapFilters.showFacilities && validGeneralFacilities.map((fac) => (
            <Marker
              key={fac.id}
              position={[fac.location.lat, fac.location.lng]}
              icon={createFacilityIcon(fac.type)}
            >
              <Popup>
                <FacilityPopupContent facility={fac} />
              </Popup>
            </Marker>
          ))}

          {/* ======================================================== */}
          {/* 4. ACTIVE INCIDENTS / ACTIVE SOS (Safe Public Display)   */}
          {/* ======================================================== */}
          {mapFilters.showIncidents && validIncidents.map((inc) => {
            const lat = inc.location?.lat ?? inc.latitude!;
            const lng = inc.location?.lng ?? inc.longitude!;

            return (
              <Marker
                key={inc.id}
                position={[lat, lng]}
                icon={createIncidentIcon(inc.priority, inc.status)}
              >
                <Popup>
                  <IncidentPopupContent
                    incident={inc}
                    isStaff={isStaff}
                    onViewDispatch={() => setActiveTab('sos')}
                  />
                </Popup>
              </Marker>
            );
          })}

          {/* ======================================================== */}
          {/* 5. USER GPS LOCATION PIN & ACCURACY CIRCLE               */}
          {/* ======================================================== */}
          {userLocation && (
            <>
              {typeof userLocation.accuracy === 'number' && userLocation.accuracy > 0 && (
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={userLocation.accuracy}
                  pathOptions={{
                    color: '#2563eb',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.12,
                    weight: 1.5,
                    dashArray: '4, 4'
                  }}
                />
              )}
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={createUserLocationIcon()}
              >
                <Popup>
                  <div className="p-3 text-xs text-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-blue-700 mb-1">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      <span>Your Verified Location</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mb-2 leading-tight">
                      Acquired via browser Geolocation API.
                      {userLocation.accuracy ? ` Estimated accuracy: ±${Math.round(userLocation.accuracy)}m.` : ''}
                    </p>
                    <div className="font-mono text-[9px] text-slate-400 border-t pt-1">
                      {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>

        {/* Floating Map Legend (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
          <MapLegend showIncidentsLayer={mapFilters.showIncidents} />
        </div>

        {/* Floating Quick Compass / Center Badge (Top Right) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-semibold text-slate-700 hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OSM Tiles Active</span>
        </div>
      </div>

      {/* Map Guidelines Footer */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-ocean-600 flex-shrink-0" />
          <span>
            Click on any colored hazard polygon, warning circle, or facility marker to open detailed safety advisories and operating hours.
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span>Active Hazards: <strong className="text-rose-600">{validHazards.length}</strong></span>
          <span>•</span>
          <span>Lifeguards: <strong className="text-emerald-600">{validLifeguards.length}</strong></span>
          <span>•</span>
          <span>Incidents: <strong className="text-purple-600">{validIncidents.length}</strong></span>
        </div>
      </div>
    </div>
  );
};
