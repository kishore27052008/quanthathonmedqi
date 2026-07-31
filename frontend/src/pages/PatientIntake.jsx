import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const empty = { mrn: "", full_name: "", date_of_birth: "", gender: "F", contact_number: "", hospital_id: "" };
const emptyVitals = { heart_rate: "", systolic_bp: "", diastolic_bp: "", respiratory_rate: "", temperature: "", spo2: "", glucose: "" };

export default function PatientIntake() {
  const [patient, setPatient] = useState(empty);
  const [vitals, setVitals] = useState(emptyVitals);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const { data: createdPatient } = await apiClient.post("/patients/", patient);

      const vitalsPayload = Object.fromEntries(
        Object.entries(vitals)
          .filter(([, v]) => v !== "")
          .map(([k, v]) => [k, Number(v)])
      );
      if (Object.keys(vitalsPayload).length > 0) {
        await apiClient.post(`/patients/${createdPatient.id}/vitals`, vitalsPayload);
      }

      setStatus({ ok: true, msg: `Patient ${createdPatient.full_name} registered successfully.` });
      setPatient(empty);
      setVitals(emptyVitals);
    } catch (err) {
      setStatus({ ok: false, msg: err?.response?.data?.detail || "Registration failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1>Register New Patient</h1>
      <p className="muted">Add patient demographics and (optionally) current vitals.
        Once registered, you can run any disease-risk assessment for them.</p>

      <form onSubmit={handleSubmit} className="risk-form card" style={{ maxWidth: 560 }}>
        <h3>Demographics</h3>
        <div className="field-grid">
          <label className="field-row">
            <span>MRN (Medical Record No.)</span>
            <input value={patient.mrn} onChange={(e) => setPatient({ ...patient, mrn: e.target.value })} required />
          </label>
          <label className="field-row">
            <span>Full Name</span>
            <input value={patient.full_name} onChange={(e) => setPatient({ ...patient, full_name: e.target.value })} required />
          </label>
          <label className="field-row">
            <span>Date of Birth</span>
            <input type="date" value={patient.date_of_birth} onChange={(e) => setPatient({ ...patient, date_of_birth: e.target.value })} />
          </label>
          <label className="field-row">
            <span>Gender</span>
            <select value={patient.gender} onChange={(e) => setPatient({ ...patient, gender: e.target.value })}>
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="O">Other</option>
            </select>
          </label>
          <label className="field-row">
            <span>Contact Number</span>
            <input value={patient.contact_number} onChange={(e) => setPatient({ ...patient, contact_number: e.target.value })} />
          </label>
          <label className="field-row">
            <span>Hospital / Clinic ID</span>
            <input value={patient.hospital_id} onChange={(e) => setPatient({ ...patient, hospital_id: e.target.value })} />
          </label>
        </div>

        <h3>Current Vitals (optional)</h3>
        <div className="field-grid">
          <label className="field-row"><span>Heart Rate (bpm)</span>
            <input type="number" value={vitals.heart_rate} onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })} /></label>
          <label className="field-row"><span>Systolic BP (mmHg)</span>
            <input type="number" value={vitals.systolic_bp} onChange={(e) => setVitals({ ...vitals, systolic_bp: e.target.value })} /></label>
          <label className="field-row"><span>Diastolic BP (mmHg)</span>
            <input type="number" value={vitals.diastolic_bp} onChange={(e) => setVitals({ ...vitals, diastolic_bp: e.target.value })} /></label>
          <label className="field-row"><span>Respiratory Rate</span>
            <input type="number" value={vitals.respiratory_rate} onChange={(e) => setVitals({ ...vitals, respiratory_rate: e.target.value })} /></label>
          <label className="field-row"><span>Temperature (°C)</span>
            <input type="number" step="0.1" value={vitals.temperature} onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })} /></label>
          <label className="field-row"><span>SpO2 (%)</span>
            <input type="number" value={vitals.spo2} onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })} /></label>
          <label className="field-row"><span>Glucose (mg/dL)</span>
            <input type="number" value={vitals.glucose} onChange={(e) => setVitals({ ...vitals, glucose: e.target.value })} /></label>
        </div>

        {status && (
          <p className={status.ok ? "success-text" : "error-text"}>{status.msg}</p>
        )}

        <div className="form-actions">
          <button type="submit" disabled={saving}>{saving ? "Saving…" : "Register Patient"}</button>
          <button type="button" className="secondary" onClick={() => navigate("/patients")}>View All Patients</button>
        </div>
      </form>
    </div>
  );
}
