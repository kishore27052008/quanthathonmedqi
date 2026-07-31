import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DomainProvider } from "./context/DomainContext";

import AuthPage from "./pages/AuthPage";
import AppShell from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import PredictRisk from "./pages/PredictRisk";
import PredictionResult from "./pages/PredictionResult";
import PredictionHistory from "./pages/PredictionHistory";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import Patients from "./pages/Patients";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AuthProvider>
      <DomainProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<AuthPage />} />

            {/* Authenticated Application Shell Routes */}
            <Route element={<AppShell title="Clinical Dashboard" />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<AppShell title="Clinical Intake & Risk Model" />}>
              <Route path="/predict" element={<PredictRisk />} />
              <Route path="/predict/result" element={<PredictionResult />} />
            </Route>

            <Route element={<AppShell title="Patient Records" />}>
              <Route path="/patients" element={<Patients />} />
            </Route>

            <Route element={<AppShell title="Prediction History Log" />}>
              <Route path="/history" element={<PredictionHistory />} />
            </Route>

            <Route element={<AppShell title="Analytics & Population Reports" />}>
              <Route path="/analytics" element={<ReportsAnalytics />} />
            </Route>

            <Route element={<AppShell title="Practitioner Profile" />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<AppShell title="System Preferences" />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Default Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </DomainProvider>
    </AuthProvider>
  );
}
