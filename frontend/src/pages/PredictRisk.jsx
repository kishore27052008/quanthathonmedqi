import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, HelpCircle, RotateCcw, ArrowRight, Calculator } from 'lucide-react';
import { useDomain } from '../context/DomainContext';
import api from '../api/client';

export default function PredictRisk() {
  const { activeDomain, setLastPredictionResult } = useDomain();
  const navigate = useNavigate();

  // Basic Information state
  const [basicInfo, setBasicInfo] = useState({
    patient_id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
    patient_name: 'Emily Davis',
    age: '28',
    gestational_age_weeks: '32',
    gravida: '2',
    para: '1',
    gender: 'Female',
  });

  // Clinical Parameters state initialized from domain schema defaults
  const [clinicalParams, setClinicalParams] = useState({
    systolic_bp: '128',
    diastolic_bp: '84',
    heart_rate: '88',
    fetal_heart_rate: '144',
    body_temperature: '37.1',
    blood_glucose: '95',
    white_blood_cells: '10.2',
    hemoglobin: '12.1',
    height_cm: '165',
    weight_kg: '68',
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-brand-500" /> Predict Clinical Risk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Input patient clinical parameters to run the AI prediction model for{' '}
            <span className="font-bold text-slate-700">{activeDomain.name}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert(`Clinical Tip: Ensure vitals are measured at rest for higher model accuracy in ${activeDomain.name}.`)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl text-xs font-semibold hover:bg-brand-100 transition-all border border-brand-100"
        >
          <HelpCircle className="w-4 h-4 text-brand-500" />
          <span>Clinical Guidance Tips</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Main Intake Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Section 1: Basic Information */}
        <div className="p-6 border-b border-slate-100">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500" /> Section 1: Basic Patient Information
            </h3>
            <p className="text-xs text-slate-400">Demographic and patient tracking parameters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient ID / MRN</label>
              <input
                type="text"
                required
                value={basicInfo.patient_id}
                onChange={(e) => handleBasicChange('patient_id', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {activeDomain.basicFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-bold text-slate-700 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={basicInfo[field.key] || ''}
                    onChange={(e) => handleBasicChange(field.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Clinical Parameters */}
        <div className="p-6 bg-slate-50/50">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500" /> Section 2: Clinical Parameters & Vitals
            </h3>
            <p className="text-xs text-slate-400">Dynamic model inputs configured for {activeDomain.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activeDomain.clinicalFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {field.label} {field.unit && <span className="text-slate-400 font-normal">({field.unit})</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={clinicalParams[field.key] || ''}
                    onChange={(e) => handleClinicalChange(field.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500 cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                )}
              </div>
            ))}

            {/* Read-Only Derived BMI Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calculator className="w-3 h-3 text-brand-500" /> Computed BMI <span className="text-slate-400 font-normal">(kg/m²)</span>
              </label>
              <input
                type="text"
                disabled
                value={computedBmi}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
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
