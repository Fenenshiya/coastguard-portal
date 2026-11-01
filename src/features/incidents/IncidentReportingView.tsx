import React, { useState } from 'react';
import { 
  AlertOctagon, 
  MapPin, 
  Camera, 
  Send, 
  CheckCircle2, 
  PhoneCall, 
  ShieldAlert, 
  Navigation, 
  HelpCircle,
  UploadCloud,
  X
} from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { beachDataService } from '../../services/beachDataService';
import { IncidentType, IncidentPriority } from '../../types';

export const IncidentReportingView: React.FC = () => {
  const { getSelectedBeach, setActiveTab } = useBeachStore();
  const currentBeach = getSelectedBeach();

  const [incidentType, setIncidentType] = useState<IncidentType>('sos_emergency');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsCapturingGps(false);
        },
        (err) => {
          console.warn('GPS error, using beach center:', err);
          if (currentBeach) {
            setCoordinates({
              lat: currentBeach.center.lat,
              lng: currentBeach.center.lng
            });
          }
          setIsCapturingGps(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else if (currentBeach) {
      setCoordinates({
        lat: currentBeach.center.lat,
        lng: currentBeach.center.lng
      });
      setIsCapturingGps(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBeach) {
      setSubmitError('Please select a beach before submitting an incident report.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const lat = coordinates?.lat ?? currentBeach.center.lat;
    const lng = coordinates?.lng ?? currentBeach.center.lng;

    const priority: IncidentPriority = incidentType === 'sos_emergency' ? 'critical' : 'high';

    try {
      const newInc = await beachDataService.submitIncident({
        beachId: currentBeach.id,
        beachName: currentBeach.name,
        type: incidentType,
        priority,
        location: {
          lat,
          lng,
          accuracyMeters: coordinates ? 8 : 25,
          landmarkDescription: landmark || 'Reported from mobile portal'
        },
        description: description.trim() || (incidentType === 'sos_emergency' ? 'Emergency assistance requested via Beach Safety Portal.' : 'Hazard reported by beach visitor.'),
        photoUrls: imagePreview ? [imagePreview] : [],
        reporter: {
          isAnonymous,
          contactName: isAnonymous ? 'Anonymous' : (contactName.trim() || 'Beach Visitor'),
          contactPhone: isAnonymous ? undefined : (contactPhone.trim() || undefined)
        }
      });

      setSubmittedId(newInc.id);
    } catch (err: any) {
      console.error('[IncidentReporting] Submission failed:', err);
      setSubmitError(err?.message || 'Failed to transmit incident to lifeguards. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-emerald-200 shadow-xl text-center space-y-4 animate-scaleIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Incident Dispatched to Lifeguards!</h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Your report has been broadcast to on-duty beach patrol at <strong>{currentBeach?.name}</strong>. Lifeguard dispatch has been alerted with your coordinates.
        </p>
        <div className="p-3 bg-slate-50 border rounded-xl text-xs text-slate-500 font-mono">
          Tracking ID: <span className="font-bold text-slate-900">{submittedId}</span>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setActiveTab('map')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Track Incident on Map
          </button>
          <button
            onClick={() => {
              setSubmittedId(null);
              setDescription('');
              setImagePreview(null);
              setSubmitError(null);
            }}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* High Urgency Top Warning */}
      <div className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide">Emergency Beach Incident Reporting</h3>
            <p className="text-xs text-rose-100">Live priority channel connected to lifeguard patrol</p>
          </div>
        </div>
        <a 
          href={`tel:${currentBeach?.contactEmergency || '911'}`}
          className="bg-white text-rose-600 font-black text-xs uppercase px-3 py-2 rounded-xl shadow hover:bg-rose-50 flex items-center gap-1.5 transition"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Tower</span>
        </a>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5">
        
        {/* Incident Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Nature of Incident / Hazard *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'sos_emergency', label: '🆘 SOS Emergency', desc: 'Swimmer in distress / Drowning' },
              { id: 'hazard_sighting', label: '⚠️ Rip Current', desc: 'Active undertow spotted' },
              { id: 'marine_pest', label: '🪼 Jellyfish / Pests', desc: 'Stingers in water' },
              { id: 'first_aid_need', label: '🩹 First Aid Need', desc: 'Cuts, trauma, heatstroke' },
              { id: 'missing_person', label: '🔍 Missing Person', desc: 'Lost child or companion' },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setIncidentType(t.id as any)}
                className={`p-3 text-left rounded-xl border transition duration-200 flex flex-col justify-between ${
                  incidentType === t.id
                    ? 'border-rose-600 bg-rose-50/70 shadow-sm ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <span className="font-bold text-xs text-slate-900">{t.label}</span>
                <span className="text-[10px] text-slate-500 mt-1 leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* GPS Location Grab */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Incident Location *
            </label>
            <button
              type="button"
              onClick={handleCaptureGps}
              disabled={isCapturingGps}
              className="text-xs text-ocean-600 hover:text-ocean-700 font-bold flex items-center gap-1"
            >
              <Navigation className={`w-3.5 h-3.5 ${isCapturingGps ? 'animate-spin' : ''}`} />
              <span>{isCapturingGps ? 'Grabbing GPS...' : 'Auto-Detect My GPS'}</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>
                {coordinates 
                  ? `GPS Locked: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
                  : `Default: ${currentBeach?.name} Center (${currentBeach?.center.lat.toFixed(4)}, ${currentBeach?.center.lng.toFixed(4)})`
                }
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {coordinates ? 'High Accuracy' : 'Beach Perimeter'}
            </span>
          </div>

          <input
            type="text"
            placeholder="Specific Landmark / Beach Area (e.g., Near Tower 2, 50m north of Pavilion)"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition"
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description of Hazard or Person in Need
          </label>
          <textarea
            rows={3}
            placeholder="Briefly describe what happened (e.g. Swimmer caught in current unable to return, wearing yellow rashvest)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition"
          />
        </div>

        {/* Optional Image Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Attach Photo (Optional)
          </label>
          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
              <Camera className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-600">Take or Upload Hazard Photo</span>
              <span className="text-[10px] text-slate-400">JPEG, PNG up to 5MB</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Contact Info / Anonymous Toggle */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Reporter Details</span>
            <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Submit Anonymously</span>
            </label>
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <input
                type="text"
                placeholder="Your Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
              />
              <input
                type="tel"
                placeholder="Your Phone Number (Optional for callback)"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
              />
            </div>
          )}
        </div>

        {/* Submission Error Banner */}
        {submitError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
            <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Transmission Failed</span>
              <span>{submitError}</span>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition"
        >
          <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
          <span>{isSubmitting ? 'Transmitting to Patrol...' : 'Transmit Incident to Lifeguards'}</span>
        </button>
      </form>
    </div>
  );
};
