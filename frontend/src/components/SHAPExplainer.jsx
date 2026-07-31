import React from "react";

export default function SHAPExplainer({ shapExplanation }) {
  if (!shapExplanation || (!shapExplanation.top_features && !shapExplanation.error)) return null;

  if (shapExplanation.error) {
    return <div className="card"><p className="muted">{shapExplanation.error}</p></div>;
  }

  const entries = Object.entries(shapExplanation.top_features);
  const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)), 0.001);

  return (
    <div className="card shap-explainer">
      <h4>Top Contributing Factors</h4>
      <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
        {shapExplanation.method === "shap"
          ? "SHAP values — how much each factor pushed the risk score up or down."
          : "Relative feature importance from the trained model."}
      </p>
      <ul>
        {entries.map(([feature, value]) => (
          <li key={feature}>
            <span className="feature-name">{feature.replace(/_/g, " ")}</span>
            <div className="bar-track">
              <div
                className={`bar-fill ${value >= 0 ? "positive" : "negative"}`}
                style={{ width: `${(Math.abs(value) / maxAbs) * 100}%` }}
              />
            </div>
            <span className={value >= 0 ? "positive" : "negative"}>
              {value >= 0 ? "+" : ""}{value.toFixed(3)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
