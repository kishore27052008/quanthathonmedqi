import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  History,
  BarChart3,
  FileText,
  User,
  Settings,
  LogOut,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const { domains, activeDomain, setSelectedDomainId } = useDomain();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Predict Risk', path: '/predict', icon: Stethoscope },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Prediction History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/analytics', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg tracking-tight leading-tight">MedQ AI</h1>
          <p className="text-[11px] text-slate-400 font-medium">Clinical Decision Support</p>
        </div>
      </div>

      {/* Domain Selector */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Layers className="w-3 h-3 text-brand-500" /> Clinical Domain
        </label>
        <select
          value={activeDomain.id}
          onChange={(e) => setSelectedDomainId(e.target.value)}
          className="w-full text-xs bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          {domains.map((dom) => (
            <option key={dom.id} value={dom.id}>
              {dom.name}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
