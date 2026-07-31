import React from 'react';

export default function RiskBadge({ level, score, showScore = false, className = '' }) {
  const normLevel = (level || 'low').toLowerCase();

  let styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';
  let label = 'Low Risk';

  if (normLevel === 'high') {
    styles = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
    label = 'High Risk';
  } else if (normLevel === 'medium' || normLevel === 'moderate') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
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
