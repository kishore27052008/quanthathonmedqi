import React, { createContext, useContext, useState } from 'react';

export const CLINICAL_DOMAINS = [
  {
    id: 'pregnancy_fetal_sepsis',
    name: 'Pregnancy & Fetal Risk',
    badge: 'Maternal Care',
    description: 'Assess maternal-fetal sepsis, preeclampsia risk, and gestational health factors.',
    basicFields: [
      { key: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'e.g. Emily Davis', required: true },
      { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 28', min: 14, max: 55, required: true },
      { key: 'gestational_age_weeks', label: 'Gestational Age (weeks)', type: 'number', placeholder: 'e.g. 32', min: 4, max: 42, required: true },
      { key: 'gravida', label: 'Gravida (Total Pregnancies)', type: 'number', placeholder: 'e.g. 2', min: 1, max: 15 },
      { key: 'para', label: 'Para (Deliveries)', type: 'number', placeholder: 'e.g. 1', min: 0, max: 15 },
    ],
    clinicalFields: [
      { key: 'systolic_bp', label: 'Systolic BP', unit: 'mmHg', type: 'number', placeholder: '120', min: 70, max: 220, required: true },
      { key: 'diastolic_bp', label: 'Diastolic BP', unit: 'mmHg', type: 'number', placeholder: '80', min: 40, max: 140, required: true },
      { key: 'heart_rate', label: 'Maternal Heart Rate', unit: 'bpm', type: 'number', placeholder: '82', min: 40, max: 180, required: true },
      { key: 'fetal_heart_rate', label: 'Fetal Heart Rate', unit: 'bpm', type: 'number', placeholder: '142', min: 80, max: 210, required: true },
      { key: 'body_temperature', label: 'Body Temp', unit: '°C', type: 'number', placeholder: '36.8', step: '0.1', min: 34, max: 42, required: true },
      { key: 'blood_glucose', label: 'Fasting Glucose', unit: 'mg/dL', type: 'number', placeholder: '92', min: 50, max: 350, required: true },
      { key: 'white_blood_cells', label: 'WBC Count', unit: 'x10^3/µL', type: 'number', placeholder: '9.5', step: '0.1', min: 2, max: 35, required: true },
      { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', type: 'number', placeholder: '12.4', step: '0.1', min: 5, max: 20 },
      { key: 'height_cm', label: 'Height', unit: 'cm', type: 'number', placeholder: '165', min: 120, max: 220 },
      { key: 'weight_kg', label: 'Weight', unit: 'kg', type: 'number', placeholder: '68', min: 30, max: 200 },
    ],
    keyMetricLabel: 'Gestational Age',
    getKeyMetric: (features) => `${features.gestational_age_weeks || '--'} wks`,
  },
  {
    id: 'preeclampsia',
    name: 'Preeclampsia Screening',
    badge: 'Hypertension',
    description: 'Predict early and late onset preeclampsia risk based on biomarker profiles.',
    basicFields: [
      { key: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'e.g. Maria Santos', required: true },
      { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 31', required: true },
      { key: 'gestational_age_weeks', label: 'Gestational Age (weeks)', type: 'number', placeholder: 'e.g. 24', required: true },
      { key: 'nulliparous', label: 'First Pregnancy?', type: 'select', options: ['Yes', 'No'] },
    ],
    clinicalFields: [
      { key: 'systolic_bp', label: 'Mean Arterial BP (Systolic)', unit: 'mmHg', type: 'number', placeholder: '135', required: true },
      { key: 'diastolic_bp', label: 'Diastolic BP', unit: 'mmHg', type: 'number', placeholder: '88', required: true },
      { key: 'urine_protein', label: 'Urine Protein Dipstick', unit: 'grade', type: 'select', options: ['Negative', 'Trace', '1+', '2+', '3+'], required: true },
      { key: 'plgf_level', label: 'PlGF Level', unit: 'pg/mL', type: 'number', placeholder: '45', step: '0.1' },
      { key: 'sflt_1_ratio', label: 'sFlt-1 / PlGF Ratio', unit: 'ratio', type: 'number', placeholder: '38', step: '0.1' },
      { key: 'height_cm', label: 'Height', unit: 'cm', type: 'number', placeholder: '162' },
      { key: 'weight_kg', label: 'Weight', unit: 'kg', type: 'number', placeholder: '74' },
    ],
    keyMetricLabel: 'Gestational Age',
    getKeyMetric: (features) => `${features.gestational_age_weeks || '--'} wks`,
  },
  {
    id: 'stroke',
    name: 'Stroke Risk Assessment',
    badge: 'Neurology',
    description: 'Evaluates 10-year ischemic and hemorrhagic cerebrovascular accident likelihood.',
    basicFields: [
      { key: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'e.g. Robert Vance', required: true },
      { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 64', required: true },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { key: 'smoking_status', label: 'Smoking Status', type: 'select', options: ['Never', 'Formerly', 'Currently'] },
    ],
    clinicalFields: [
      { key: 'systolic_bp', label: 'Systolic Blood Pressure', unit: 'mmHg', type: 'number', placeholder: '148', required: true },
      { key: 'diastolic_bp', label: 'Diastolic Blood Pressure', unit: 'mmHg', type: 'number', placeholder: '92', required: true },
      { key: 'avg_glucose_level', label: 'Average Glucose', unit: 'mg/dL', type: 'number', placeholder: '115', step: '0.1', required: true },
      { key: 'heart_disease', label: 'History of Heart Disease', type: 'select', options: ['No', 'Yes'], required: true },
      { key: 'hypertension', label: 'Diagnosed Hypertension', type: 'select', options: ['No', 'Yes'], required: true },
      { key: 'height_cm', label: 'Height', unit: 'cm', type: 'number', placeholder: '178' },
      { key: 'weight_kg', label: 'Weight', unit: 'kg', type: 'number', placeholder: '85' },
    ],
    keyMetricLabel: 'Primary Risk Factor',
    getKeyMetric: (features) => features.hypertension === 'Yes' ? 'Hypertensive' : 'Standard',
  },
  {
    id: 'coronary_heart_disease',
    name: 'Coronary Heart Disease',
    badge: 'Cardiology',
    description: 'Framingham and AI-enhanced cardiovascular risk stratification model.',
    basicFields: [
      { key: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'e.g. David Miller', required: true },
      { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 58', required: true },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], required: true },
    ],
    clinicalFields: [
      { key: 'total_cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', type: 'number', placeholder: '210', required: true },
      { key: 'hdl_cholesterol', label: 'HDL Cholesterol', unit: 'mg/dL', type: 'number', placeholder: '48', required: true },
      { key: 'ldl_cholesterol', label: 'LDL Cholesterol', unit: 'mg/dL', type: 'number', placeholder: '138', required: true },
      { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', type: 'number', placeholder: '160', required: true },
      { key: 'systolic_bp', label: 'Systolic BP', unit: 'mmHg', type: 'number', placeholder: '138', required: true },
      { key: 'resting_heart_rate', label: 'Resting Heart Rate', unit: 'bpm', type: 'number', placeholder: '74' },
      { key: 'height_cm', label: 'Height', unit: 'cm', type: 'number', placeholder: '172' },
      { key: 'weight_kg', label: 'Weight', unit: 'kg', type: 'number', placeholder: '82' },
    ],
    keyMetricLabel: 'Total Cholesterol',
    getKeyMetric: (features) => `${features.total_cholesterol || '--'} mg/dL`,
  },
  {
    id: 'chronic_kidney_disease',
    name: 'Chronic Kidney Disease',
    badge: 'Nephrology',
    description: 'Estimates eGFR decline and stage Progression of renal insufficiency.',
    basicFields: [
      { key: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'e.g. Susan Chen', required: true },
      { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 61', required: true },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male'], required: true },
    ],
    clinicalFields: [
      { key: 'serum_creatinine', label: 'Serum Creatinine', unit: 'mg/dL', type: 'number', placeholder: '1.4', step: '0.1', required: true },
      { key: 'blood_urea_nitrogen', label: 'BUN', unit: 'mg/dL', type: 'number', placeholder: '24', required: true },
      { key: 'egfr', label: 'Estimated GFR', unit: 'mL/min/1.73m²', type: 'number', placeholder: '52', required: true },
      { key: 'haemoglobin', label: 'Hemoglobin', unit: 'g/dL', type: 'number', placeholder: '11.2', step: '0.1' },
      { key: 'height_cm', label: 'Height', unit: 'cm', type: 'number', placeholder: '160' },
      { key: 'weight_kg', label: 'Weight', unit: 'kg', type: 'number', placeholder: '65' },
    ],
    keyMetricLabel: 'eGFR Score',
    getKeyMetric: (features) => `${features.egfr || '--'} mL/min`,
  },
  {
    id: 'gestational_diabetes',
    name: 'Gestational Diabetes',
    badge: 'Endocrinology',
    description: 'Screening for impaired glucose tolerance during second and third trimesters.',
    basicFields: [
      { key: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'e.g. Rachel Green', required: true },
      { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 33', required: true },
      { key: 'gestational_age_weeks', label: 'Gestational Age (weeks)', type: 'number', placeholder: 'e.g. 26', required: true },
    ],
    clinicalFields: [
      { key: 'fasting_glucose', label: 'Fasting Plasma Glucose', unit: 'mg/dL', type: 'number', placeholder: '98', required: true },
      { key: 'one_hour_ogtt', label: '1-Hour OGTT', unit: 'mg/dL', type: 'number', placeholder: '185', required: true },
      { key: 'two_hour_ogtt', label: '2-Hour OGTT', unit: 'mg/dL', type: 'number', placeholder: '158', required: true },
      { key: 'family_history_diabetes', label: 'Family History of Diabetes', type: 'select', options: ['No', 'Yes'] },
      { key: 'height_cm', label: 'Height', unit: 'cm', type: 'number', placeholder: '168' },
      { key: 'weight_kg', label: 'Weight', unit: 'kg', type: 'number', placeholder: '79' },
    ],
    keyMetricLabel: 'Fasting Glucose',
    getKeyMetric: (features) => `${features.fasting_glucose || '--'} mg/dL`,
  },
];

const DomainContext = createContext(null);

export const DomainProvider = ({ children }) => {
  const [selectedDomainId, setSelectedDomainId] = useState('pregnancy_fetal_sepsis');
  const [lastPredictionResult, setLastPredictionResult] = useState(null);

  const activeDomain = CLINICAL_DOMAINS.find((d) => d.id === selectedDomainId) || CLINICAL_DOMAINS[0];

  return (
    <DomainContext.Provider
      value={{
        domains: CLINICAL_DOMAINS,
        activeDomain,
        selectedDomainId,
        setSelectedDomainId,
        lastPredictionResult,
        setLastPredictionResult,
      }}
    >
      {children}
    </DomainContext.Provider>
  );
};

export const useDomain = () => {
  const context = useContext(DomainContext);
  if (!context) throw new Error('useDomain must be used within a DomainProvider');
  return context;
};
