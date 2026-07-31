import React, { useState, useEffect } from "react";
import { predictRisk, getHistory } from "../api/riskService";
import RiskScoreCard from "./RiskScoreCard.jsx";
import SHAPExplainer from "./SHAPExplainer.jsx";
import apiClient from "../api/apiClient";

function buildDefaults(fields) {
  const d = {};
  fields.forEach((f) => (d[f.key] = f.default ?? 0));
  return d;
}

export default function RiskAssessmentForm({ domainKey, schema }) {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [values, setValues] = useState(buildDefaults(schema.fields));
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get("/patients/").then((res) => setPatients(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setResult(null);
    if (patientId) {
      getHistory(domainKey, Number(patientId)).then(setHistory).catch(() => setHistory([]));
    } else {
      setHistory([]);
    }
  }, [patientId, domainKey]);

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      setError("Please select a patient first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await predictRisk(domainKey, Number(patientId), values);
      setResult(data);
      setHistory((prev) => [data, ...prev]);
    } catch (err) {
      setError(err?.response?.data?.detail || "Prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (f) => {
    if (f.type === "boolean") {
      return (
        <label key={f.key} className="field-row toggle">
          <span>{f.label}</span>
          <input
            type="checkbox"
            checked={!!values[f.key]}
            onChange={(e) => handleChange(f.key, e.target.checked ? 1 : 0)}
          />
        </label>
      );
    }
    if (f.type === "select") {
      return (
        <label key={f.key} className="field-row">
          <span>{f.label}</span>
          <select value={values[f.key]} onChange={(e) => handleChange(f.key, Number(e.target.value))}>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      );
    }
    return (
      <label key={f.key} className="field-row">
        <span>{f.label} {f.unit ? <em>({f.unit})</em> : null}</span>
        <input
          type="number"
          step={f.step || 1}
          min={f.min}
          max={f.max}
          value={values[f.key]}
          onChange={(e) => handleChange(f.key, Number(e.target.value))}
        />
      </label>
    );
  };

  return (
    <div className="assessment-layout">
      <form onSubmit={handleSubmit} className="risk-form card">
        <h2>{schema.label}</h2>
        <p className="muted">{schema.description}</p>

        <label className="field-row">
          <span>Patient</span>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
            <option value="">Select a patient…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name} ({p.mrn})</option>
            ))}
          </select>
        </label>

        <div className="field-grid">{schema.fields.map(renderField)}</div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing with AI model…" : "Run Risk Prediction"}
        </button>
      </form>

      <div className="assessment-results">
        {result ? (
          <>
            <RiskScoreCard result={result} />
            <SHAPExplainer shapExplanation={result?.shap_explanation} />
          </>
        ) : (
          <div className="card placeholder-card">
            <p className="muted">Run a prediction to see the AI risk score, level, and
              explainability breakdown here.</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="card history-card">
            <h4>Recent Assessments — {schema.label}</h4>
            <table>
              <thead><tr><th>Date</th><th>Score</th><th>Level</th></tr></thead>
              <tbody>
                {history.slice(0, 5).map((h, i) => (
                  <tr key={i}>
                    <td>{new Date(h.created_at).toLocaleString()}</td>
                    <td>{h.risk_score}%</td>
                    <td className={`level-${h.risk_level}`}>{h.risk_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
