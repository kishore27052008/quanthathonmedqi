import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/client';
import { useDomain } from '../context/DomainContext';
import RiskBadge from '../components/RiskBadge';

export default function Dashboard() {
  const { activeDomain } = useDomain();
  const [summary, setSummary] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [overallAnalysis, setOverallAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch summary statistics
      const summaryRes = await api.get('/dashboard/summary').catch(() => null);
      
      // Fetch overall multi-disease analysis
      const overallRes = await api.post('/overall/analyze', {}).catch(() => null);
      if (overallRes?.data) {
        setOverallAnalysis(overallRes.data);
      }

      // Fetch recent high risk assessments / history
      const historyRes = await api.get(`/${activeDomain.id}/history/all`).catch(async () => {
        return api.get('/dashboard/high-risk-patients').catch(() => ({ data: [] }));
      });

      if (summaryRes?.data && summaryRes.data[activeDomain.id]) {
        setSummary(summaryRes.data[activeDomain.id]);
      } else if (summaryRes?.data && Object.keys(summaryRes.data).length > 0) {
        // Aggregate across domains if specific domain key not found
        const agg = { low: 0, moderate: 0, high: 0 };
        Object.values(summaryRes.data).forEach((dom) => {
          agg.low += dom.low || 0;
          agg.moderate += dom.moderate || 0;
          agg.high += dom.high || 0;
        });
        setSummary(agg);
      } else {
        setSummary({ low: 0, moderate: 0, high: 0 });
      }

      if (historyRes?.data && Array.isArray(historyRes.data)) {
        setRecentAssessments(historyRes.data.slice(0, 6));
      } else {
        setRecentAssessments([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeDomain.id]);

  const lowCount = summary?.low || 0;
  const medCount = summary?.moderate || summary?.medium || 0;
  const highCount = summary?.high || 0;
  const totalCount = lowCount + medCount + highCount;

  const chartData = [
    { name: 'High Risk', value: highCount, color: '#F04452' },
    { name: 'Medium Risk', value: medCount, color: '#F5A623' },
    { name: 'Low Risk', value: lowCount, color: '#2FBF71' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Refresh Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Clinical Overview</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Real-time analytics and prediction monitoring for {activeDomain.name}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 shadow-xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Live Data
        </button>
      </div>

      {/* Row of 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Stat */}
        <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Predictions</span>
            <div className="p-2.5 rounded-xl bg-brand-950 text-brand-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-white font-mono">{totalCount}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-brand-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-time total assessments</span>
            </div>
          </div>
        </div>

        {/* High Risk Stat */}
        <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">High Risk Count</span>
            <div className="p-2.5 rounded-xl bg-red-950/60 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-red-500 font-mono">{highCount}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Requires immediate follow-up</span>
            </div>
          </div>
        </div>

        {/* Medium Risk Stat */}
        <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Medium Risk Count</span>
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-amber-500 font-mono">{medCount}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-400">
              <span>Close monitoring scheduled</span>
            </div>
          </div>
        </div>

        {/* Low Risk Stat */}
        <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Low Risk Count</span>
            <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-emerald-500 font-mono">{lowCount}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standard routine care</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Disease Integrated Risk & Quantum QAOA Pathway Card */}
      {overallAnalysis && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800/80 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                  Quantum Multi-Disease Graph Engine
                </span>
                <span className="text-xs text-slate-400 font-mono">QAOA Quantum Optimizer</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Cross-Disease Pathway Analysis</h2>
            </div>
            <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Integrated Risk Score:</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {overallAnalysis.integrated_risk_score !== undefined
                  ? `${overallAnalysis.integrated_risk_score.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
            {/* Posteriors Column */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Disease Posteriors</h3>
              <div className="space-y-2">
                {overallAnalysis.posteriors &&
                  Object.entries(overallAnalysis.posteriors).map(([dis, val]) => (
                    <div key={dis} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 uppercase font-mono">{dis}</span>
                      <span className="font-mono text-white font-bold">{(val * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quantum Optimization Column */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Quantum Pathway QAOA</h3>
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                {overallAnalysis.quantum_pathway_analysis?.bitstring_interpretation ||
                  'QAOA quantum optimizer executed pathway optimization across disease interaction graphs.'}
              </p>
              {overallAnalysis.quantum_pathway_analysis?.dominant_bitstring && (
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Optimal Bitstring:</span>
                  <span className="text-emerald-400 font-bold">{overallAnalysis.quantum_pathway_analysis.dominant_bitstring}</span>
                </div>
              )}
            </div>

            {/* Recommendations Column */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Preventive Pathway Recommendations</h3>
              <ul className="space-y-2">
                {overallAnalysis.recommendations && overallAnalysis.recommendations.length > 0 ? (
                  overallAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                      <span className="text-brand-400 font-bold">•</span>
                      <span>{typeof rec === 'object' ? rec.text || rec.title || JSON.stringify(rec) : rec}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[11px] text-slate-400">Standard clinical follow-up protocol.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Recent Predictions (~60%) & Risk Distribution (~40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Predictions (Left, ~60% width -> 7 cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] rounded-2xl border border-slate-800/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Recent Risk Assessments</h3>
                <p className="text-xs text-slate-400 font-medium">Latest clinical predictions</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading recent predictions...</div>
            ) : recentAssessments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No predictions recorded yet for this domain.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {recentAssessments.map((item, index) => (
                  <div key={item.id || index} className="py-3.5 flex items-center justify-between hover:bg-slate-800/50 px-2 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center font-mono">
                        {(item.patient_name || item.patient_id || 'P').charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {item.patient_name || `Patient ID: ${item.patient_id}`}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <RiskBadge level={item.risk_level} score={item.risk_score} showScore />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Risk Distribution Card (Right, ~40% width -> 5 cols) */}
        <div className="lg:col-span-5 bg-[#0F172A] rounded-2xl border border-slate-800/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Risk Distribution</h3>
              <p className="text-xs text-slate-400 font-medium">Overall patient stratification</p>
            </div>

            {/* Donut Chart Container */}
            <div className="h-56 relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Total Count in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-white font-mono">{totalCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend Listing Counts and Percentages */}
            <div className="mt-4 space-y-2 pt-4 border-t border-slate-800">
              {chartData.map((item) => {
                const percentage = totalCount > 0 ? ((item.value / totalCount) * 100).toFixed(1) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-300">{item.name}</span>
                    </div>
                    <div className="font-mono font-semibold text-white">
                      {item.value} <span className="text-slate-400 font-normal">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
