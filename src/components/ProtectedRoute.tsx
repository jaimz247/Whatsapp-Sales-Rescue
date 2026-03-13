import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl animate-pulse"></div>
          <div className="relative w-full h-full bg-white rounded-2xl border border-neutral-200 flex items-center justify-center shadow-sm">
            <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] animate-pulse">
          Verifying Credentials
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/access" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
