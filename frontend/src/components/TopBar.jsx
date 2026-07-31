import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, ChevronRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';

export default function TopBar({ title }) {
  const { user } = useAuth();
  const { activeDomain } = useDomain();
  const location = useLocation();

  // Generate clean breadcrumb structure
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbNameMap = {
    dashboard: 'Dashboard',
    predict: 'Predict Risk',
    result: 'Result',
    patients: 'Patients',
    history: 'Prediction History',
    analytics: 'Analytics',
    profile: 'Profile',
    settings: 'Settings',
  };

  return (
    <header className="bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
          {title}
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-950/80 text-brand-300 border border-brand-800">
            {activeDomain.name}
          </span>
        </h2>
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
          <Link to="/dashboard" className="hover:text-slate-200">Home</Link>
          {pathSegments.map((segment, idx) => {
            const url = `/${pathSegments.slice(0, idx + 1).join('/')}`;
            const label = breadcrumbNameMap[segment] || segment;
            const isLast = idx === pathSegments.length - 1;

            return (
              <React.Fragment key={url}>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                {isLast ? (
                  <span className="text-slate-200 font-medium">{label}</span>
                ) : (
                  <Link to={url} className="hover:text-slate-200">{label}</Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-slate-900" />
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="w-10 h-10 rounded-full bg-brand-950 border border-brand-700 flex items-center justify-center text-brand-300 font-bold text-sm shadow-xs">
            {user?.full_name ? user.full_name.charAt(0) : 'D'}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white leading-tight">
              {user?.full_name || 'Dr. Sarah Johnson'}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              {user?.role || 'Obstetrician'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
