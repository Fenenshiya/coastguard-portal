import React, { useEffect, useState } from 'react';
import { 
  Sun, 
  Wind, 
  Waves, 
  Thermometer, 
  Compass, 
  Clock, 
  AlertOctagon, 
  ShieldCheck, 
  PhoneCall, 
  Calendar,
  RefreshCw,
  Droplets,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { beachDataService } from '../../services/beachDataService';
import { SafetyAlert } from '../../types';

export const WeatherDashboard: React.FC = () => {
  const { 
    selectedBeachId, 
    weather, 
    isLoadingWeather, 
    refreshWeather, 
    getSelectedBeach, 
    setActiveTab 
  } = useBeachStore();

  const currentBeach = getSelectedBeach();
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);

  useEffect(() => {
    refreshWeather();
    const unsubAlerts = beachDataService.subscribeToAlerts(selectedBeachId, (items) => {
      setAlerts(items);
    });
    return () => unsubAlerts();
  }, [selectedBeachId]);

  if (!currentBeach) return null;

  return (
    <div className="space-y-6">
      {/* Active Alerts Banner Ticker */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-4 rounded-xl border flex items-start space-x-3 transition shadow-sm ${
                alert.severity === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <AlertOctagon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                alert.severity === 'critical' ? 'text-rose-600 animate-pulse' : 'text-amber-600'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm tracking-tight">{alert.title}</h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/80 border">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">{alert.message}</p>
                <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-3">
                  <span>Issued by: {alert.issuerName}</span>
                  <span>•</span>
                  <span>Effective until: {new Date(alert.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hero Banner: Beach Overview & Flag Status */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-white">
        <div className="h-56 md:h-64 w-full relative">
          <img 
            src={currentBeach.imageUrl} 
            alt={currentBeach.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => refreshWeather()}
              disabled={isLoadingWeather}
              title="Refresh live weather data"
              className="bg-white/80 backdrop-blur hover:bg-white text-slate-800 text-xs px-3 py-1.5 rounded-full font-medium shadow flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
              <span>{isLoadingWeather ? 'Updating...' : 'Live Sync'}</span>
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white">
                {currentBeach.city}, {currentBeach.state}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Lifeguards On Duty</span>
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{currentBeach.name}</h2>
            <p className="text-xs md:text-sm text-slate-200 max-w-2xl mt-1 line-clamp-2">
              {currentBeach.safetyOverview}
            </p>
          </div>
        </div>

        {/* Quick Patrol Details bar */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-ocean-600" />
            <span>Patrol Hours: <strong>{currentBeach.patrolHours.opensAt} - {currentBeach.patrolHours.closesAt}</strong> ({currentBeach.patrolHours.timezone})</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>Beach Emergency: <strong className="text-slate-900">{currentBeach.contactEmergency}</strong></span>
          </div>
          <button 
            onClick={() => setActiveTab('map')}
            className="text-ocean-600 hover:text-ocean-700 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Explore Hazards on Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-Time Beach Conditions Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Live Beach & Marine Conditions</span>
          <span className="text-[11px] font-normal text-slate-500">(Open-Meteo Marine Data)</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          
          {/* Card 1: Temperature */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Air & Water Temp</span>
              <Thermometer className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {weather?.temperatureC ?? '--'}°C
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Feels like {weather?.apparentTempC ?? '--'}°C
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-ocean-500" /> Water:
              </span>
              <span className="font-bold text-slate-800">{weather?.waterTemperatureC ?? '--'}°C</span>
            </div>
          </div>

          {/* Card 2: Waves & Rip Risk */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Wave & Swell</span>
              <Waves className="w-4 h-4 text-ocean-600" />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {weather?.waveHeightM ?? '--'}m
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Period: {weather?.wavePeriodSec ?? '--'}s intervals
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Rip Current Risk:</span>
              <span className={`font-bold uppercase px-1.5 py-0.5 rounded text-[10px] ${
                weather?.ripCurrentRiskIndex === 'high'
                  ? 'bg-rose-100 text-rose-700'
                  : weather?.ripCurrentRiskIndex === 'moderate'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {weather?.ripCurrentRiskIndex ?? 'Low'}
              </span>
            </div>
          </div>

          {/* Card 3: Wind & Direction */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Wind Conditions</span>
              <Wind className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {weather?.windSpeedKmh ?? '--'}<span className="text-sm font-normal text-slate-500 ml-1">km/h</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Direction: {weather?.windDirectionDeg ?? 0}°</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="text-slate-500">Gusts up to:</span>
              <span className="font-bold text-slate-800">{weather?.windGustsKmh ?? '--'} km/h</span>
            </div>
          </div>

          {/* Card 4: UV Index & Sun Safety */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">UV Exposure</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {weather?.uvIndex ?? '--'}
                </span>
                <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${
                  (weather?.uvIndex ?? 0) >= 8 
                    ? 'bg-purple-100 text-purple-800' 
                    : (weather?.uvIndex ?? 0) >= 6 
                    ? 'bg-rose-100 text-rose-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {weather?.uvDescription ?? 'Moderate'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {(weather?.uvIndex ?? 0) >= 8 ? 'Burn time: <15 mins' : 'Sun protection recommended'}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Apply SPF 50+ every 2 hours
            </div>
          </div>

        </div>
      </div>

      {/* Tide and Coastal Advice Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tide Forecast Card */}
        <div className="bg-gradient-to-br from-ocean-50 to-white p-4 rounded-xl border border-ocean-100 shadow-sm md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-ocean-900 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-ocean-600" />
              <span>Tide Cycle & Water Depth</span>
            </h4>
            <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-ocean-200 text-ocean-800">
              Tide is {weather?.tide.currentStatus ?? 'rising'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="bg-white/80 p-2.5 rounded-lg border border-ocean-100">
              <div className="text-[11px] text-slate-500">Current Water Height</div>
              <div className="text-base font-bold text-ocean-900 mt-0.5">{weather?.tide.heightM ?? 1.2}m</div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-ocean-100">
              <div className="text-[11px] text-slate-500">Next High Tide</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">{weather?.tide.nextHighTide ?? '14:30'}</div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-ocean-100">
              <div className="text-[11px] text-slate-500">Next Low Tide</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">{weather?.tide.nextLowTide ?? '20:45'}</div>
            </div>
          </div>

          <p className="text-xs text-ocean-800/80 mt-2">
            💡 <em>Tip: Strongest rip current velocities typically occur during mid-tide when water is receding rapidly.</em>
          </p>
        </div>

        {/* Quick Safety Rule Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Beach Safety Rule</span>
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Never swim alone or outside of patrol hours. If caught in a rip current, stay calm, float on your back, do not fight the current, and raise your arm for assistance.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('sos')}
            className="mt-4 w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Emergency / Report Hazard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
