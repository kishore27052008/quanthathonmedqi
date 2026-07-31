import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Info,
  ArrowLeft,
  Cpu,
  UserCheck,
  BarChart2,
} from 'lucide-react';
import { useDomain } from '../context/DomainContext';
import RiskBadge from '../components/RiskBadge';

export default function PredictionResult() {
  const { lastPredictionResult, activeDomain } = useDomain();
  const navigate = useNavigate();

  if (!lastPredictionResult) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <BarChart2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Assessment Selected</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please run a risk assessment from the Predict Risk form or select an existing assessment record from the Prediction History.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/predict')}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
          >
            Run New Prediction
          </button>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
          >
            View History
          </button>
        </div>
      </div>
    );
  }

  const data = lastPredictionResult;

  const riskLevel = (data.risk_level || 'low').toLowerCase();
  let barColor = 'bg-emerald-500';
  let bannerBg = 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300';

  if (riskLevel === 'high' || riskLevel === 'high risk') {
    barColor = 'bg-red-500';
    bannerBg = 'bg-red-950/60 border-red-800/80 text-red-300';
  } else if (riskLevel === 'medium' || riskLevel === 'moderate' || riskLevel === 'moderate risk') {
    barColor = 'bg-amber-500';
    bannerBg = 'bg-amber-950/60 border-amber-800/80 text-amber-300';
  }

  const shapFeatures = data.shap_explanation?.top_features || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/predict')}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Prediction Assessment Result</h1>
            <p className="text-xs text-slate-400 font-medium">
              ID: <span className="font-mono">{data.id || 'PRED-LIVE'}</span> • Domain: {activeDomain.name}
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Risk Level Card */}
        <div className="bg-[#0F172A] rounded-2xl p-6 border border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Risk Assessment</span>
              {data.quantum_optimized && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-bold border border-purple-800">
                  <Cpu className="w-3 h-3 text-purple-400" /> Quantum Enhanced
                </span>
              )}
            </div>

            <div className="text-center py-4">
              <RiskBadge level={data.risk_level} className="text-sm px-4 py-1.5 mb-4" />
              <div className="text-5xl font-black text-white font-mono tracking-tight my-2">
                {Math.round(data.risk_score || (data.probability ? data.probability * 100 : 0))}%
              </div>
              <p className="text-xs text-slate-400 font-medium">Calculated Risk Score Probability</p>

              {/* Horizontal Bar Visualizer */}
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden mt-6 border border-slate-800">
                <div
                  className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(data.risk_score || (data.probability ? data.probability * 100 : 0), 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Model: {data.model_version || 'Ensemble v2'}</span>
            <span>{new Date(data.created_at || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Card 2: Patient Summary Card */}
        <div className="bg-[#0F172A] rounded-2xl p-6 border border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
              <UserCheck className="w-4 h-4 text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Patient Summary</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Patient ID / MRN</span>
                <span className="font-mono font-bold text-white">{data.patient_id || data.patient_mrn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Patient Name</span>
                <span className="font-bold text-white">{data.patient_name || `Patient #${data.patient_id}`}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Age / Demographics</span>
                <span className="font-medium text-slate-200">{data.basicInfo?.age || '30'} yrs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">{activeDomain.keyMetricLabel}</span>
                <span className="font-medium text-slate-200">
                  {activeDomain.getKeyMetric(data.basicInfo || {})}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Computed BMI</span>
                <span className="font-mono font-bold text-white">{data.computedBmi || '24.2'} kg/m²</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Prediction Date</span>
                <span className="font-medium text-slate-200">
                  {new Date(data.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Key Risk Factors Card (SHAP Explainability Output) */}
        <div className="bg-[#0F172A] rounded-2xl p-6 border border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
              <BarChart2 className="w-4 h-4 text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Top Contributing Factors (SHAP)</h3>
            </div>

            <div className="space-y-3">
              {Object.keys(shapFeatures).length > 0 ? (
                Object.entries(shapFeatures).map(([featureName, weight]) => {
                  const pct = Math.round(weight * 100);
                  return (
                    <div key={featureName} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-200">{featureName}</span>
                        <span className="font-mono text-slate-400">+{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-brand-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-4">AI model factors calculated directly from vitals panel.</p>
              )}
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
      <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl text-slate-400 text-xs font-medium border border-slate-800">
        <Info className="w-4 h-4 shrink-0 text-slate-500" />
        <span>
          <strong>Disclaimer:</strong> This prediction is AI-generated and should be used only as a clinical decision support tool. Final diagnostic authority rests with the treating licensed physician.
        </span>
      </div>
    </div>
  );
}
