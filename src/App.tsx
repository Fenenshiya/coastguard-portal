import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/common/Header';
import { LandingPage } from './pages/LandingPage';
import { TouristPortalPage } from './pages/TouristPortalPage';
import { StaffLoginPage } from './features/auth/StaffLoginPage';
import { ProtectedStaffRoute } from './features/auth/ProtectedStaffRoute';
import { LifeguardAdminCenter } from './features/admin/LifeguardAdminCenter';
import { Waves } from 'lucide-react';
import { useBeachStore } from './store/useBeachStore';
import { authService } from './services/authService';

const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-ocean-500 selection:text-white">
      {/* Dynamic Header */}
      <Header />

      {/* Main Page Content Body */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        {children}
      </main>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs mt-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-ocean-600 flex items-center justify-center text-white">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm">CoastGuard Safety Network</span>
                <p className="text-[11px] text-slate-500">Real-time Beach Tourism & Hazard Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-slate-400">
              <span>Marine Data: Open-Meteo</span>
              <span>•</span>
              <span>Mapping: Google Maps Platform Ready</span>
              <span>•</span>
              <span>Backend: Cloud Firestore</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 text-[11px] text-slate-500">
            <p>© 2026 Interactive Beach Tourism & Safety Information Portal. Designed for public safety and lifeguard dispatch.</p>
            <div className="flex items-center gap-1">
              <span>Always obey lifeguard flags and advisories.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  const { setCurrentUser, setAuthLoading } = useBeachStore();

  // Listen to Firebase Auth state across the entire application
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user, loading) => {
      setCurrentUser(user);
      setAuthLoading(loading);
    });

    return () => unsubscribe();
  }, [setCurrentUser, setAuthLoading]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Entry / Landing Page at Root Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Tourist Portal Route */}
        <Route
          path="/tourist"
          element={
            <PortalLayout>
              <TouristPortalPage />
            </PortalLayout>
          }
        />

        {/* Staff & Lifeguard Dedicated Login Route */}
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* Lifeguard Operations & Command Center Route (Protected by Firebase Auth & Staff Roles) */}
        <Route
          path="/staff/command"
          element={
            <ProtectedStaffRoute>
              <PortalLayout>
                <LifeguardAdminCenter />
              </PortalLayout>
            </ProtectedStaffRoute>
          }
        />

        {/* Catch-all route -> redirect to entry page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
