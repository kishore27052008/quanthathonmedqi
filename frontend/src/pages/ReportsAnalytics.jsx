import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Activity, AlertTriangle, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDomain } from '../context/DomainContext';
import api from '../api/client';

export default function ReportsAnalytics() {
  const { activeDomain } = useDomain();
  const [timeRange, setTimeRange] = useState('Last 6 Months');
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({ low: 0, moderate: 0, high: 0 });
  const [trendData, setTrendData] = useState([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const summaryRes = await api.get('/dashboard/summary').catch(() => null);

      if (summaryRes?.data && summaryRes.data[activeDomain.id]) {
        setSummaryData(summaryRes.data[activeDomain.id]);
      } else if (summaryRes?.data && Object.keys(summaryRes.data).length > 0) {
        const agg = { low: 0, moderate: 0, high: 0 };
        Object.values(summaryRes.data).forEach((dom) => {
          agg.low += dom.low || 0;
          agg.moderate += dom.moderate || 0;
          agg.high += dom.high || 0;
        });
        setSummaryData(agg);
      } else {
        setSummaryData({ low: 0, moderate: 0, high: 0 });
      }

      // Trend data: no backend endpoint for monthly breakdown yet, show empty
      setTrendData([]);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeDomain.id]);

  const totalHigh = summaryData.high || 0;
  const totalMed = summaryData.moderate || 0;
  const totalLow = summaryData.low || 0;
  const total = totalHigh + totalMed + totalLow;

  const distributionData = [
    { name: 'High Risk', value: totalHigh, color: '#F04452' },
    { name: 'Medium Risk', value: totalMed, color: '#F5A623' },
    { name: 'Low Risk', value: totalLow, color: '#2FBF71' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Date Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Reports & Clinical Analytics</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Epidemiological population stratification for {activeDomain.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 shadow-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-semibold text-slate-200 bg-transparent focus:outline-none cursor-pointer"
            >
              <option className="bg-slate-900 text-white">Last 30 Days</option>
              <option className="bg-slate-900 text-white">Last 6 Months</option>
              <option className="bg-slate-900 text-white">Last 12 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Predictions</span>
            <Activity className="w-5 h-5 text-brand-400" />
          </div>
          <h3 className="text-3xl font-black text-white font-mono mt-3">{total}</h3>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{total > 0 ? '100% of analyzed cases' : 'No predictions yet'}</p>
        </div>

        <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Risk Cases</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-3xl font-black text-red-500 font-mono mt-3">{totalHigh}</h3>
          <p className="text-[11px] text-red-400 font-medium mt-1">
            {total > 0 ? `${((totalHigh / total) * 100).toFixed(1)}% of total volume` : 'No cases'}
          </p>
        </div>

        <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Medium Risk Cases</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-3xl font-black text-amber-500 font-mono mt-3">{totalMed}</h3>
          <p className="text-[11px] text-amber-400 font-medium mt-1">
            {total > 0 ? `${((totalMed / total) * 100).toFixed(1)}% of total volume` : 'No cases'}
          </p>
        </div>

        <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Risk Cases</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-black text-emerald-500 font-mono mt-3">{totalLow}</h3>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">
            {total > 0 ? `${((totalLow / total) * 100).toFixed(1)}% of total volume` : 'No cases'}
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Trend Over Time Card */}
        <div className="lg:col-span-8 bg-[#0F172A] rounded-2xl border border-slate-800/80 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Risk Trend Over Time</h3>
            <p className="text-xs text-slate-400">Monthly patient volume segmented by risk classification</p>
          </div>

          <div className="h-72 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#fff' }} />
                  <Line type="monotone" dataKey="High" stroke="#F04452" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Medium" stroke="#F5A623" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Low" stroke="#2FBF71" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend data available yet. Predictions will appear here as they are recorded.
              </div>
            )}
          </div>
        </div>

        {/* Overall Distribution Donut */}
        <div className="lg:col-span-4 bg-[#0F172A] rounded-2xl border border-slate-800/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Overall Distribution</h3>
              <p className="text-xs text-slate-400">Proportional risk breakdown</p>
            </div>

            <div className="h-56 relative flex items-center justify-center">
              {total > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={88}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-white font-mono">{total}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400">No predictions recorded yet.</div>
              )}
            </div>

            <div className="mt-4 space-y-2 pt-4 border-t border-slate-800">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-300">{item.name}</span>
                  </div>
                  <div className="font-mono font-semibold text-white">
                    {item.value} <span className="text-slate-400 font-normal">({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

