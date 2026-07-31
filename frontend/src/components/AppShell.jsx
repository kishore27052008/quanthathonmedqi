import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../context/AuthContext';

export default function AppShell({ title = 'Dashboard' }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading MedQ AI Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-black text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        <TopBar title={title} />
        <main className="flex-1 p-8 overflow-y-auto bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
