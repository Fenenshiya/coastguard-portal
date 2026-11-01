import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Radio, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Send, 
  Flag, 
  Eye, 
  Volume2, 
  Bell, 
  Phone,
  Layers,
  ChevronRight,
  TrendingUp,
  Flame,
  Check,
  X,
  LogOut
} from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { beachDataService } from '../../services/beachDataService';
import { authService } from '../../services/authService';
import { 
  IncidentReport, 
  HazardZone, 
  SafetyAlert, 
  FlagStatus, 
  IncidentStatus,
  AlertSeverity,
  AlertCategory
} from '../../types';
import { FLAG_CONFIG } from '../../components/common/Header';

export const LifeguardAdminCenter: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedBeachId, 
    beaches, 
    setSelectedBeachId, 
    currentUser, 
    getSelectedBeach, 
    setActiveTab
  } = useBeachStore();

  const currentBeach = getSelectedBeach();

  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [hazards, setHazards] = useState<HazardZone[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);

  // Resolution notes state
  const [resolutionText, setResolutionText] = useState('');

  // New alert form state
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertCategory, setAlertCategory] = useState<AlertCategory>('rip_current');
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>('warning');
  const [alertMessage, setAlertMessage] = useState('');

  // Audio alert simulator
  const playAlertChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext not allowed or silent
    }
  };

  useEffect(() => {
    const unsubInc = beachDataService.subscribeToIncidents(selectedBeachId, (items) => {
      setIncidents(items);
      setSelectedIncident((prev) => {
        if (!prev) return null;
        return items.find((i) => i.id === prev.id) || prev;
      });
      // If there's a newly submitted SOS, chime
      const hasNewSos = items.some(i => i.status === 'new' && i.type === 'sos_emergency');
      if (hasNewSos) {
        playAlertChime();
      }
    });

    const unsubHaz = beachDataService.subscribeToHazards(selectedBeachId, setHazards);
    const unsubAlt = beachDataService.subscribeToAlerts(selectedBeachId, setAlerts);

    return () => {
      unsubInc();
      unsubHaz();
      unsubAlt();
    };
  }, [selectedBeachId]);

  const handleFlagChange = (flag: FlagStatus) => {
    beachDataService.updateBeachFlag(selectedBeachId, flag);
    // Trigger audio notification of state change
    playAlertChime();
  };

  const handleStatusUpdate = async (incidentId: string, newStatus: IncidentStatus) => {
    await beachDataService.updateIncidentStatus(
      incidentId,
      newStatus,
      { uid: currentUser?.uid || 'staff', name: currentUser?.displayName || 'Lifeguard Officer' },
      resolutionText
    );
    setSelectedIncident((prev) => {
      if (!prev || prev.id !== incidentId) return prev;
      return {
        ...prev,
        status: newStatus,
        resolutionNotes: newStatus === 'resolved' ? (resolutionText || prev.resolutionNotes) : prev.resolutionNotes
      };
    });
    if (newStatus === 'resolved') {
      setResolutionText('');
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;

    beachDataService.createAlert({
      beachId: selectedBeachId,
      title: alertTitle.trim(),
      category: alertCategory,
      severity: alertSeverity,
      message: alertMessage.trim(),
      effectiveFrom: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 8).toISOString(), // 8 hours default
      isActive: true,
      issuedByUid: currentUser?.uid || 'staff',
      issuerName: currentUser?.displayName || 'Lifeguard Duty Officer'
    });

    setAlertTitle('');
    setAlertMessage('');
    setShowNewAlertModal(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/staff/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Top Admin Status Bar */}
      <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">Lifeguard Operations Center</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Command Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Officer: <strong>{currentUser?.displayName || 'Lifeguard Officer'}</strong> ({currentUser?.badgeNumber || 'LG-DUTY'}) • Station: <strong>{currentBeach?.name}</strong>
            </p>
          </div>
        </div>

        {/* Quick Beach Selector for Admin */}
        <div className="flex items-center gap-3">
          <select
            aria-label="Admin Station Beach"
            value={selectedBeachId}
            onChange={(e) => setSelectedBeachId(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-semibold focus:ring-2 focus:ring-ocean-500 outline-none"
          >
            {beaches.map(b => (
              <option key={b.id} value={b.id}>{b.name} Patrol</option>
            ))}
          </select>

          <Link
            to="/tourist"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Return to Tourist Portal
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold rounded-xl border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
            title="Log out of staff session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Flag Status Controller & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Flag Controller Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-ocean-600" />
              <span>Broadcast Safety Flag</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">Instant Public Sync</span>
          </div>

          <p className="text-xs text-slate-500">
            Click below to immediately update the safety flag displayed across all tourist devices:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(['green', 'yellow', 'red', 'double_red', 'purple'] as FlagStatus[]).map((f) => {
              const cfg = FLAG_CONFIG[f];
              const isSelected = currentBeach?.currentFlagStatus === f;
              return (
                <button
                  key={f}
                  onClick={() => handleFlagChange(f)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition flex items-center justify-between border ${
                    isSelected
                      ? `${cfg.bg} ${cfg.text} ring-2 ring-slate-900 shadow-md`
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="capitalize">{f.replace('_', ' ')} Flag</span>
                  {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-Time Beach Incident Statistics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Shift Operations & Incident Metrics</span>
            </h3>
            <p className="text-xs text-slate-500">Current active response queue and hazard statistics for today's shift</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
              <div className="text-2xl font-black text-rose-700">{activeIncidents.length}</div>
              <div className="text-[11px] font-bold text-rose-900/70 uppercase mt-0.5">Active Incidents</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
              <div className="text-2xl font-black text-amber-700">{hazards.length}</div>
              <div className="text-[11px] font-bold text-amber-900/70 uppercase mt-0.5">Marked Hazards</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
              <div className="text-2xl font-black text-blue-700">{alerts.length}</div>
              <div className="text-[11px] font-bold text-blue-900/70 uppercase mt-0.5">Active Advisories</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
              <div className="text-2xl font-black text-emerald-700">{resolvedCount}</div>
              <div className="text-[11px] font-bold text-emerald-900/70 uppercase mt-0.5">Resolved Today</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Emergency Channel: <strong>VHF Ch 16 / 468.2 MHz</strong></span>
            <button
              onClick={() => setShowNewAlertModal(true)}
              className="px-3 py-1.5 bg-ocean-600 hover:bg-ocean-700 text-white font-bold rounded-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Broadcast New Advisory</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Dual Console: Live Incident Queue & Dispatch Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Real-Time Incident Feed */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Live Tourist Incident Queue ({incidents.length})</span>
            </h3>
            <span className="text-[10px] text-slate-400">Click to dispatch</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {incidents.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
                No active incidents reported for {currentBeach?.name}.
              </div>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const isSos = inc.type === 'sos_emergency';

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setResolutionText(inc.resolutionNotes || '');
                    }}
                    className={`p-4 rounded-2xl border transition duration-200 cursor-pointer text-left space-y-2 relative overflow-hidden ${
                      isSelected
                        ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-md'
                        : isSos && inc.status === 'new'
                        ? 'border-rose-400 bg-rose-50/70 hover:bg-rose-100/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Urgency indicator strip */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                      inc.status === 'resolved' 
                        ? 'bg-emerald-500' 
                        : inc.status === 'responding'
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`} />

                    <div className="flex items-center justify-between pl-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        inc.status === 'new'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : inc.status === 'acknowledged'
                          ? 'bg-blue-100 text-blue-800'
                          : inc.status === 'responding'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inc.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="pl-1">
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        {isSos && <span className="text-rose-600 font-extrabold">🚨 SOS:</span>}
                        <span>{inc.type.replace('_', ' ').toUpperCase()}</span>
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                        {inc.description}
                      </p>
                    </div>

                    <div className="pl-1 pt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Reporter: <strong>{inc.reporter.contactName || 'Visitor'}</strong></span>
                      <span className="font-mono text-[10px] text-slate-400">{inc.id}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Incident Dispatch Console */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5 animate-scaleIn">
              
              {/* Header with quick close */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">ID: {selectedIncident.id}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Priority: {selectedIncident.priority}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {selectedIncident.type.replace('_', ' ').toUpperCase()}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description & Location */}
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Tourist Description</div>
                  <p className="text-xs text-slate-800 mt-1 leading-relaxed font-medium">
                    {selectedIncident.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-600" /> Location Coordinates
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                      {selectedIncident.location.lat.toFixed(5)}, {selectedIncident.location.lng.toFixed(5)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {selectedIncident.location.landmarkDescription || 'No extra landmark given'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Users className="w-3 h-3 text-ocean-600" /> Reporter Contact
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {selectedIncident.reporter.contactName || 'Anonymous Visitor'}
                    </div>
                    {selectedIncident.reporter.contactPhone ? (
                      <a 
                        href={`tel:${selectedIncident.reporter.contactPhone}`}
                        className="text-xs text-ocean-600 font-semibold hover:underline mt-0.5 block"
                      >
                        {selectedIncident.reporter.contactPhone}
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">No callback number</span>
                    )}
                  </div>
                </div>

                {/* Optional Tourist Uploaded Photo */}
                {selectedIncident.photoUrls && selectedIncident.photoUrls.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Attached Evidence Photo</div>
                    <div className="w-48 h-36 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={selectedIncident.photoUrls[0]} alt="Hazard" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Transition Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Update Response Status
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'new', label: '1. New', color: 'border-slate-300 hover:bg-slate-50' },
                    { id: 'acknowledged', label: '2. Acknowledge', color: 'border-blue-300 hover:bg-blue-50 text-blue-700' },
                    { id: 'responding', label: '3. Responding', color: 'border-amber-300 hover:bg-amber-50 text-amber-700' },
                    { id: 'resolved', label: '4. Resolved', color: 'border-emerald-300 hover:bg-emerald-50 text-emerald-700' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleStatusUpdate(selectedIncident.id, btn.id as IncidentStatus)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center ${
                        selectedIncident.status === btn.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow'
                          : btn.color
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Resolution Notes Box */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Lifeguard Resolution / Log Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rescue board deployed, swimmer brought safely to shore."
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs text-ocean-600 font-bold hover:underline"
                  >
                    View Marker on Beach Map &rarr;
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedIncident.id, 'resolved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete & Resolve</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Radio className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">No Incident Selected</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an incoming report from the queue on the left to review GPS coordinates, dispatch lifeguards, or mark as resolved.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Broadcast New Advisory Modal */}
      {showNewAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateAlert} className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-200 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-ocean-600" />
                <span>Broadcast Public Beach Advisory</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setShowNewAlertModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Advisory Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Flash Rip Current Warning"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  aria-label="Category"
                  value={alertCategory}
                  onChange={(e) => setAlertCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                >
                  <option value="rip_current">Rip Current</option>
                  <option value="severe_weather">Severe Weather</option>
                  <option value="beach_closure">Beach Closure</option>
                  <option value="marine_life">Marine Life / Pests</option>
                  <option value="water_quality">Water Quality</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Severity</label>
                <select
                  aria-label="Severity"
                  value={alertSeverity}
                  onChange={(e) => setAlertSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                >
                  <option value="advisory">Advisory (Notice)</option>
                  <option value="warning">Warning (Medium)</option>
                  <option value="critical">Critical (Urgent)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Public Safety Message *</label>
              <textarea
                rows={3}
                required
                placeholder="Clear instructions for beachgoers..."
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewAlertModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Broadcast to Public
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
