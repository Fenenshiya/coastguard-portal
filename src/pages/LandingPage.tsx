import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, User, Shield } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-sky-50 via-teal-50/30 to-amber-50/30 text-slate-800">
      
      {/* Top Header */}
      <header className="py-6 px-6">
        <div className="container mx-auto max-w-4xl flex items-center justify-center sm:justify-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-ocean-600 text-white flex items-center justify-center shadow-md shadow-ocean-500/20">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">CoastGuard Portal</span>
            <span className="text-xs text-ocean-600 font-semibold block -mt-0.5">Beach Tourism & Safety</span>
          </div>
        </div>
      </header>

      {/* Main Content: Title & Two Large Choices */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full text-center">
        
        {/* Coastal Portal Icon */}
        <div className="w-20 h-20 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-ocean-500/10 flex items-center justify-center text-ocean-600 mb-8 mx-auto ring-8 ring-ocean-50/80">
          <Waves className="w-10 h-10 text-ocean-600" />
        </div>

        {/* Project Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-2xl leading-tight mb-12">
          Interactive Beach Tourism & Safety Information Portal
        </h1>

        {/* Two Large Choice Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
          
          {/* Choice 1: Tourist */}
          <button
            type="button"
            onClick={() => navigate('/tourist')}
            className="group py-6 px-8 bg-white hover:bg-ocean-600 text-slate-800 hover:text-white rounded-2xl border-2 border-ocean-200 hover:border-ocean-600 shadow-lg shadow-ocean-600/10 hover:shadow-xl hover:shadow-ocean-600/25 transition-all duration-200 flex flex-col items-center justify-center space-y-3 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-ocean-50 group-hover:bg-white/20 text-ocean-600 group-hover:text-white flex items-center justify-center transition-colors">
              <User className="w-7 h-7" />
            </div>
            <span className="text-xl font-bold tracking-tight">Tourist</span>
          </button>

          {/* Choice 2: Staff / Admin */}
          <button
            type="button"
            onClick={() => navigate('/staff/login')}
            className="group py-6 px-8 bg-white hover:bg-slate-900 text-slate-800 hover:text-white rounded-2xl border-2 border-teal-200 hover:border-slate-900 shadow-lg shadow-teal-600/10 hover:shadow-xl hover:shadow-slate-900/25 transition-all duration-200 flex flex-col items-center justify-center space-y-3 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-50 group-hover:bg-white/20 text-teal-700 group-hover:text-white flex items-center justify-center transition-colors">
              <Shield className="w-7 h-7" />
            </div>
            <span className="text-xl font-bold tracking-tight">Staff / Admin</span>
          </button>

        </div>

      </main>

      {/* Clean Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
        <p>© 2026 Interactive Beach Tourism & Safety Information Portal</p>
      </footer>

    </div>
  );
};

export default LandingPage;
