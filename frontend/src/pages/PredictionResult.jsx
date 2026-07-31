import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download,
  ShieldAlert,
  Info,
  ArrowLeft,
  Cpu,
  UserCheck,
  BarChart2,
  FileSpreadsheet,
} from 'lucide-react';
import { useDomain } from '../context/DomainContext';
import RiskBadge from '../components/RiskBadge';

export default function PredictionResult() {
  const { lastPredictionResult, activeDomain } = useDomain();
  const navigate = useNavigate();

  // Fallback default sample data if user navigated directly
  const data = lastPredictionResult || {
    id: 'PRED-99824',
    patient_id: 'P-9842',
    patient_name: 'Emily Davis',
    domain: activeDomain.id,
    risk_score: 88.5,
    risk_level: 'high',
    model_version: 'v2.4-quantum-ensemble',
    quantum_optimized: true,
    recommendation:
      'High risk of maternal-fetal sepsis detected. Immediate clinical evaluation, continuous fetal monitoring, and maternal blood culture panel recommended.',
    shap_explanation: {
      top_features: {
        'Systolic Blood Pressure': 0.38,
        'WBC Count': 0.29,
        'Body Temperature': 0.18,
        'Gestational Age': 0.15,
      },
    },
    created_at: new Date().toISOString(),
    basicInfo: { age: 28, gestational_age_weeks: 32 },
    computedBmi: '25.0',
  };

  const handleDownloadReport = (format) => {
    alert(`Stub: Exporting prediction report PDF/CSV (${format}) for Patient ${data.patient_id}...`);
  };

  const riskLevel = (data.risk_level || 'low').toLowerCase();
  let barColor = 'bg-emerald-500';
  let bannerBg = 'bg-emerald-50 border-emerald-200 text-emerald-900';

  if (riskLevel === 'high') {
    barColor = 'bg-red-500';
    bannerBg = 'bg-red-50 border-red-200 text-red-900';
  } else if (riskLevel === 'medium' || riskLevel === 'moderate') {
    barColor = 'bg-amber-500';
    bannerBg = 'bg-amber-50 border-amber-200 text-amber-900';
  }

  const shapFeatures = data.shap_explanation?.top_features || {
    'Systolic Blood Pressure': 0.38,
    'WBC Count': 0.29,
    'Body Temp': 0.18,
    'Gestational Age': 0.15,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/predict')}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prediction Assessment Result</h1>
            <p className="text-xs text-slate-500 font-medium">
              ID: <span className="font-mono">{data.id || 'PRED-LIVE'}</span> • Domain: {activeDomain.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadReport('CSV')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" /> Export CSV
          </button>
          <button
            onClick={() => handleDownloadReport('PDF')}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
        </div>
      </div>

      {/* 3-Column Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Risk Level Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Risk Assessment</span>
              {data.quantum_optimized && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                  <Cpu className="w-3 h-3 text-purple-600" /> Quantum Enhanced
                </span>
              )}
            </div>

            <div className="text-center py-4">
              <RiskBadge level={data.risk_level} className="text-sm px-4 py-1.5 mb-4" />
              <div className="text-5xl font-black text-slate-900 font-mono tracking-tight my-2">
                {Math.round(data.risk_score || 0)}%
              </div>
              <p className="text-xs text-slate-400 font-medium">Calculated Risk Score Probability</p>

              {/* Horizontal Bar Visualizer */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-6">
                <div
                  className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(data.risk_score || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Model: {data.model_version || 'Ensemble v2'}</span>
            <span>{new Date(data.created_at || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Card 2: Patient Summary Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-brand-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Patient Summary</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Patient ID / MRN</span>
                <span className="font-mono font-bold text-slate-900">{data.patient_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Patient Name</span>
                <span className="font-bold text-slate-900">{data.patient_name || 'Emily Davis'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Age / Demographics</span>
                <span className="font-medium text-slate-800">{data.basicInfo?.age || '28'} yrs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">{activeDomain.keyMetricLabel}</span>
                <span className="font-medium text-slate-800">
                  {activeDomain.getKeyMetric(data.basicInfo || {})}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Computed BMI</span>
                <span className="font-mono font-bold text-slate-900">{data.computedBmi || '24.2'} kg/m²</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Prediction Date</span>
                <span className="font-medium text-slate-800">
                  {new Date(data.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Key Risk Factors Card (SHAP Explainability Output) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <BarChart2 className="w-4 h-4 text-brand-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Top Contributing Factors (SHAP)</h3>
            </div>

            <div className="space-y-3">
              {Object.entries(shapFeatures).map(([featureName, weight]) => {
                const pct = Math.round(weight * 100);
                return (
                  <div key={featureName} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{featureName}</span>
                      <span className="font-mono text-slate-500">+{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic mt-4">
            Feature importances extracted via tree SHAP explainer module.
          </p>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className={`rounded-2xl p-5 border ${bannerBg} shadow-sm flex items-start gap-4`}>
        <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-1">Clinical Decision Recommendation</h4>
          <p className="text-xs leading-relaxed font-medium">
            {data.recommendation || 'Close monitoring and further clinical evaluation is recommended based on patient parameters.'}
          </p>
        </div>
      </div>

      {/* Medical Disclaimer Note */}
      <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl text-slate-500 text-xs font-medium border border-slate-200/60">
        <Info className="w-4 h-4 shrink-0 text-slate-400" />
        <span>
          <strong>Disclaimer:</strong> This prediction is AI-generated and should be used only as a clinical decision support tool. Final diagnostic authority rests with the treating licensed physician.
        </span>
      </div>
    </div>
  );
}
