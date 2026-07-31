// Mirrors backend/models_store/<domain>/features.json exactly.
// If you retrain a model with a different feature set, update both
// the backend features.json AND this file's `fields` list to match.

export const DOMAIN_SCHEMAS = {
  pregnancy_fetal_sepsis: {
    label: "Pregnancy & Fetal Sepsis",
    route: "pregnancy-fetal-sepsis",
    description: "Screens for early sepsis warning signs in high-risk pregnancies.",
    fields: [
      { key: "maternal_age", label: "Maternal Age", unit: "years", min: 15, max: 50, default: 28 },
      { key: "gestational_age_weeks", label: "Gestational Age", unit: "weeks", min: 4, max: 42, default: 30 },
      { key: "maternal_heart_rate", label: "Maternal Heart Rate", unit: "bpm", min: 40, max: 200, default: 90 },
      { key: "maternal_temperature", label: "Maternal Temperature", unit: "°C", min: 34, max: 42, step: 0.1, default: 37.0 },
      { key: "wbc_count", label: "WBC Count", unit: "x10⁹/L", min: 1, max: 40, step: 0.1, default: 9 },
      { key: "lactate", label: "Lactate", unit: "mmol/L", min: 0, max: 12, step: 0.1, default: 1.5 },
      { key: "systolic_bp", label: "Systolic BP", unit: "mmHg", min: 60, max: 220, default: 110 },
      { key: "respiratory_rate", label: "Respiratory Rate", unit: "breaths/min", min: 5, max: 50, default: 16 },
    ],
  },
  stroke: {
    label: "Stroke",
    route: "stroke",
    description: "Predicts stroke risk from cardiovascular and metabolic indicators.",
    fields: [
      { key: "age", label: "Age", unit: "years", min: 1, max: 110, default: 55 },
      { key: "hypertension", label: "Hypertension", type: "boolean", default: 0 },
      { key: "heart_disease", label: "Existing Heart Disease", type: "boolean", default: 0 },
      { key: "avg_glucose_level", label: "Avg Glucose Level", unit: "mg/dL", min: 40, max: 400, default: 100 },
      { key: "bmi", label: "BMI", unit: "kg/m²", min: 10, max: 60, step: 0.1, default: 24 },
      { key: "smoking_status", label: "Smoking Status", type: "select",
        options: [{ value: 0, label: "Never" }, { value: 1, label: "Former" }, { value: 2, label: "Current" }], default: 0 },
      { key: "systolic_bp", label: "Systolic BP", unit: "mmHg", min: 60, max: 240, default: 120 },
    ],
  },
  coronary_heart_disease: {
    label: "Coronary Heart Disease",
    route: "coronary-heart-disease",
    description: "Estimates CHD risk from lipid, pressure, and lifestyle factors.",
    fields: [
      { key: "age", label: "Age", unit: "years", min: 1, max: 110, default: 50 },
      { key: "cholesterol", label: "Total Cholesterol", unit: "mg/dL", min: 80, max: 400, default: 190 },
      { key: "systolic_bp", label: "Systolic BP", unit: "mmHg", min: 60, max: 240, default: 120 },
      { key: "diastolic_bp", label: "Diastolic BP", unit: "mmHg", min: 40, max: 150, default: 80 },
      { key: "smoking", label: "Smoker", type: "boolean", default: 0 },
      { key: "diabetes", label: "Diabetes", type: "boolean", default: 0 },
      { key: "bmi", label: "BMI", unit: "kg/m²", min: 10, max: 60, step: 0.1, default: 24 },
      { key: "resting_heart_rate", label: "Resting Heart Rate", unit: "bpm", min: 30, max: 180, default: 72 },
    ],
  },
  chronic_kidney_disease: {
    label: "Chronic Kidney Disease",
    route: "chronic-kidney-disease",
    description: "Assesses CKD risk from renal function and metabolic markers.",
    fields: [
      { key: "age", label: "Age", unit: "years", min: 1, max: 110, default: 55 },
      { key: "blood_pressure", label: "Blood Pressure", unit: "mmHg", min: 40, max: 220, default: 120 },
      { key: "blood_glucose", label: "Blood Glucose", unit: "mg/dL", min: 40, max: 400, default: 100 },
      { key: "serum_creatinine", label: "Serum Creatinine", unit: "mg/dL", min: 0.2, max: 15, step: 0.1, default: 1.0 },
      { key: "hemoglobin", label: "Hemoglobin", unit: "g/dL", min: 3, max: 20, step: 0.1, default: 13.5 },
      { key: "albumin", label: "Albumin (dipstick)", unit: "0-5", min: 0, max: 5, default: 0 },
      { key: "bmi", label: "BMI", unit: "kg/m²", min: 10, max: 60, step: 0.1, default: 24 },
    ],
  },
  gestational_diabetes: {
    label: "Gestational Diabetes",
    route: "gestational-diabetes",
    description: "Screens for gestational diabetes mellitus risk during pregnancy.",
    fields: [
      { key: "maternal_age", label: "Maternal Age", unit: "years", min: 15, max: 50, default: 28 },
      { key: "bmi", label: "Pre-pregnancy BMI", unit: "kg/m²", min: 10, max: 60, step: 0.1, default: 24 },
      { key: "fasting_glucose", label: "Fasting Glucose", unit: "mg/dL", min: 40, max: 300, default: 90 },
      { key: "family_history_diabetes", label: "Family History of Diabetes", type: "boolean", default: 0 },
      { key: "gestational_age_weeks", label: "Gestational Age", unit: "weeks", min: 4, max: 42, default: 24 },
    ],
  },
  preeclampsia: {
    label: "Preeclampsia",
    route: "preeclampsia",
    description: "Predicts preeclampsia risk from blood pressure and proteinuria trends.",
    fields: [
      { key: "maternal_age", label: "Maternal Age", unit: "years", min: 15, max: 50, default: 28 },
      { key: "systolic_bp", label: "Systolic BP", unit: "mmHg", min: 60, max: 240, default: 120 },
      { key: "diastolic_bp", label: "Diastolic BP", unit: "mmHg", min: 40, max: 150, default: 80 },
      { key: "proteinuria", label: "Proteinuria (dipstick)", unit: "0-3+", min: 0, max: 3, default: 0 },
      { key: "bmi", label: "BMI", unit: "kg/m²", min: 10, max: 60, step: 0.1, default: 24 },
      { key: "gestational_age_weeks", label: "Gestational Age", unit: "weeks", min: 4, max: 42, default: 28 },
    ],
  },
};

export const DOMAIN_LIST = Object.entries(DOMAIN_SCHEMAS).map(([key, v]) => ({ key, ...v }));
