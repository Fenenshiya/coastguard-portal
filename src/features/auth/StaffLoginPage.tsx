import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, User, ArrowLeft, AlertCircle, Loader2, MapPin, Waves } from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { authService } from '../../services/authService';

export const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { beaches, selectedBeachId, setSelectedBeachId, currentUser, authLoading, setCurrentUser } = useBeachStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [stationId, setStationId] = useState(selectedBeachId);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated with authorized staff role, redirect to command center
  useEffect(() => {
    if (!authLoading && currentUser && ['lifeguard', 'beach_authority_admin', 'super_admin'].includes(currentUser.role)) {
      navigate('/staff/command', { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  // Check if user was redirected from a protected route
  useEffect(() => {
    if ((location.state as any)?.unauthorized) {
      setError('Access Denied: Your account is not authorized to access the safety dashboard.');
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Authenticate via Firebase Auth and verify staff role in Firestore
      const staffUser = await authService.loginStaff(email.trim(), password);
      
      // Update global user state
      setCurrentUser(staffUser);

      // Select assigned station
      if (staffUser.assignedBeaches && staffUser.assignedBeaches.length > 0) {
        setSelectedBeachId(staffUser.assignedBeaches[0]);
      } else if (stationId) {
        setSelectedBeachId(stationId);
      }

      navigate('/staff/command', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-sky-50 via-teal-50/30 to-amber-50/20 text-slate-800">
      
      {/* Top Header Bar */}
      <header className="py-4 px-6 border-b border-slate-200/70 bg-white/70 backdrop-blur-xs">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <Link
            to="/tourist"
            className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-ocean-700 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to Portal</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-ocean-600 text-white flex items-center justify-center">
              <Waves className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800">CoastGuard Portal</span>
          </div>
        </div>
      </header>

      {/* Main Login Form Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-teal-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-ocean-500/5">
          
          {/* Header & Icon */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 bg-ocean-50 border border-ocean-100 rounded-2xl flex items-center justify-center mx-auto text-ocean-600 shadow-sm">
              <Shield className="w-7 h-7 text-ocean-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Staff / Admin Login
            </h1>
            <p className="text-xs text-slate-500">
              Sign in to access the safety dashboard.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Duty Station */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Duty Station
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  aria-label="Duty Station"
                  disabled={isSubmitting}
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition cursor-pointer disabled:opacity-60"
                >
                  {beaches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@beachsafety.gov"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition disabled:opacity-60"
                />
              </div>
            </div>

            {/* Badge / ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Badge / ID
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  placeholder="e.g. LS-904"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition disabled:opacity-60"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-3 bg-ocean-600 hover:bg-ocean-700 active:scale-[0.99] disabled:opacity-70 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-ocean-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/40">
        © 2026 Interactive Beach Tourism & Safety Information Portal
      </footer>

    </div>
  );
};

export default StaffLoginPage;
