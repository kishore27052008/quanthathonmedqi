import React from "react";

const levelMeta = {
  high: { color: "#e63946", label: "HIGH RISK", icon: "⚠️" },
  moderate: { color: "#f4a261", label: "MODERATE RISK", icon: "⚠" },
  low: { color: "#2a9d8f", label: "LOW RISK", icon: "✓" },
};

export default function RiskScoreCard({ result }) {
  if (!result) return null;
  const meta = levelMeta[result.risk_level] || levelMeta.low;

  return (
    <div className="card risk-card" style={{ borderColor: meta.color }}>
      <div className="risk-score-header">
        <div className="risk-gauge" style={{ "--pct": `${result.risk_score}%`, "--color": meta.color }}>
          <span>{result.risk_score}%</span>
        </div>
        <div>
          <p className="risk-level-tag" style={{ color: meta.color }}>{meta.icon} {meta.label}</p>
          <p className="muted">Model: {result.model_version || "n/a"}</p>
        </div>
      </div>
      <p className="recommendation">{result.recommendation}</p>
    </div>
  );
}
