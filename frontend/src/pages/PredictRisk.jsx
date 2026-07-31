import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, HelpCircle, RotateCcw, ArrowRight, Calculator } from 'lucide-react';
import { useDomain } from '../context/DomainContext';
import api from '../api/client';

export default function PredictRisk() {
  const { activeDomain, setLastPredictionResult } = useDomain();
  const navigate = useNavigate();

  const location = useLocation();
  const prefilled = location.state?.prefilledPatient;

  // Basic Information state initialized from prefilled patient or clean defaults
  const [basicInfo, setBasicInfo] = useState({
    patient_id: prefilled?.mrn || prefilled?.id ? String(prefilled.mrn || prefilled.id) : '',
    patient_name: prefilled?.full_name || '',
    age: prefilled?.age || '',
    gestational_age_weeks: '',
    gravida: '',
    para: '',
    gender: prefilled?.gender || 'Female',
  });

  // Clinical Parameters state initialized clean
  const [clinicalParams, setClinicalParams] = useState({
    systolic_bp: '',
    diastolic_bp: '',
    heart_rate: '',
    fetal_heart_rate: '',
    body_temperature: '',
    blood_glucose: '',
    white_blood_cells: '',
    hemoglobin: '',
    height_cm: '',
    weight_kg: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Derived BMI auto-calculation
  const heightM = (parseFloat(clinicalParams.height_cm) || 0) / 100;
  const weightKg = parseFloat(clinicalParams.weight_kg) || 0;
  const computedBmi = heightM > 0 && weightKg > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '--';

  const handleBasicChange = (key, val) => {
    setBasicInfo((prev) => ({ ...prev, [key]: val }));
  };

  const handleClinicalChange = (key, val) => {
    setClinicalParams((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setClinicalParams({
      systolic_bp: '',
      diastolic_bp: '',
      heart_rate: '',
      fetal_heart_rate: '',
      body_temperature: '',
      blood_glucose: '',
      white_blood_cells: '',
      hemoglobin: '',
      height_cm: '',
      weight_kg: '',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Construct features payload merging basic and clinical values
    const features = {
      ...clinicalParams,
      ...basicInfo,
      computed_bmi: computedBmi,
    };

    try {
      // API request per contract: POST /{domain}/predict
      const response = await api.post(`/${activeDomain.id}/predict`, {
        patient_id: basicInfo.patient_id,
        features,
      });

      const resultData = {
        ...response.data,
        patient_name: basicInfo.patient_name,
        basicInfo,
        clinicalParams,
        computedBmi,
      };

      setLastPredictionResult(resultData);
      navigate('/predict/result');
    } catch (err) {
      console.error('Error predicting risk:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to analyze risk with prediction model.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-brand-400" /> Predict Clinical Risk
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Input patient clinical parameters to run the AI prediction model for{' '}
            <span className="font-bold text-slate-200">{activeDomain.name}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert(`Clinical Tip: Ensure vitals are measured at rest for higher model accuracy in ${activeDomain.name}.`)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-950/80 text-brand-300 rounded-xl text-xs font-semibold hover:bg-brand-900 transition-all border border-brand-800"
        >
          <HelpCircle className="w-4 h-4 text-brand-400" />
          <span>Clinical Guidance Tips</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-xs font-medium text-red-300">
          {error}
        </div>
      )}

      {/* Main Intake Form Container */}
      <form onSubmit={handleSubmit} className="bg-[#0F172A] rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden">
        {/* Section 1: Basic Information */}
        <div className="p-6 border-b border-slate-800">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-brand-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500" /> Section 1: Basic Patient Information
            </h3>
            <p className="text-xs text-slate-400">Demographic and patient tracking parameters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Patient ID / MRN</label>
              <input
                type="text"
                required
                value={basicInfo.patient_id}
                onChange={(e) => handleBasicChange('patient_id', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {activeDomain.basicFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-bold text-slate-300 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={basicInfo[field.key] || ''}
                    onChange={(e) => handleBasicChange(field.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    value={basicInfo[field.key] || ''}
                    onChange={(e) => handleBasicChange(field.key, e.target.value)}
                    placeholder={field.placeholder || 'Enter value'}
                    min={field.min}
                    max={field.max}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-brand-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Clinical Parameters */}
        <div className="p-6 bg-slate-950/40">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-brand-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500" /> Section 2: Clinical Parameters & Vitals
            </h3>
            <p className="text-xs text-slate-400">Dynamic model inputs configured for {activeDomain.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activeDomain.clinicalFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {field.label} {field.unit && <span className="text-slate-400 font-normal">({field.unit})</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={clinicalParams[field.key] || ''}
                    onChange={(e) => handleClinicalChange(field.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    value={clinicalParams[field.key] || ''}
                    onChange={(e) => handleClinicalChange(field.key, e.target.value)}
                    placeholder={field.placeholder || 'Enter value'}
                    step={field.step || '1'}
                    min={field.min}
                    max={field.max}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-brand-500"
                  />
                )}
              </div>
            ))}

            {/* Read-Only Derived BMI Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Calculator className="w-3 h-3 text-brand-400" /> Computed BMI <span className="text-slate-400 font-normal">(kg/m²)</span>
              </label>
              <input
                type="text"
                disabled
                value={computedBmi}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#0F172A] border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset Form
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Predict Risk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
