import React from 'react';

export default function RiskBadge({ level, score, showScore = false, className = '' }) {
  const normLevel = (level || 'low').toLowerCase();

  let styles = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
  let dotColor = 'bg-emerald-400';
  let label = 'Low Risk';

  if (normLevel === 'high' || normLevel === 'high risk') {
    styles = 'bg-red-950/80 text-red-300 border-red-800';
    dotColor = 'bg-red-500';
    label = 'High Risk';
  } else if (normLevel === 'medium' || normLevel === 'moderate' || normLevel === 'moderate risk') {
    styles = 'bg-amber-950/80 text-amber-300 border-amber-800';
    dotColor = 'bg-amber-400';
    label = 'Medium Risk';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles} ${className}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
      {label}
      {showScore && score !== undefined && score !== null && (
        <span className="ml-1 opacity-85 font-mono">({Math.round(score)}%)</span>
      )}
    </span>
  );
}
