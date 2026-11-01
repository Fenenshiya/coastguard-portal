import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { UserRole } from '../../types';

interface ProtectedStaffRouteProps {
  children: React.ReactNode;
}

const AUTHORIZED_STAFF_ROLES: UserRole[] = ['lifeguard', 'beach_authority_admin', 'super_admin'];

export const ProtectedStaffRoute: React.FC<ProtectedStaffRouteProps> = ({ children }) => {
  const { currentUser, authLoading } = useBeachStore();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-500 shadow-2xl">
          <Shield className="w-8 h-8 animate-pulse text-rose-500" />
        </div>
        <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
          <span>Verifying Staff Credentials & Authorization...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  // Authenticated but not an authorized staff role (e.g. tourist)
  if (!AUTHORIZED_STAFF_ROLES.includes(currentUser.role)) {
    return (
      <Navigate 
        to="/staff/login" 
        state={{ from: location, unauthorized: true, role: currentUser.role }} 
        replace 
      />
    );
  }

  // Authorized staff member
  return <>{children}</>;
};
