import apiClient from "./apiClient";

// route key must match the FastAPI router prefixes in backend/app/api/v1/endpoints
export const DOMAIN_ROUTES = {
  pregnancy_fetal_sepsis: "pregnancy_fetal_sepsis",
  stroke: "stroke",
  coronary_heart_disease: "coronary_heart_disease",
  chronic_kidney_disease: "chronic_kidney_disease",
  gestational_diabetes: "gestational_diabetes",
  preeclampsia: "preeclampsia",
};

export async function predictRisk(domain, patientId, features) {
  const { data } = await apiClient.post(`/${DOMAIN_ROUTES[domain]}/predict`, {
    patient_id: patientId,
    features,
  });
  return data;
}

export async function getHistory(domain, patientId) {
  const { data } = await apiClient.get(`/${DOMAIN_ROUTES[domain]}/history/${patientId}`);
  return data;
}

export async function getDashboardSummary() {
  const { data } = await apiClient.get("/dashboard/summary");
  return data;
}

export async function getHighRiskPatients() {
  const { data } = await apiClient.get("/dashboard/high-risk-patients");
  return data;
}
