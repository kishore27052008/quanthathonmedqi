import React, { useEffect, useState } from 'react';
import { Eye, Download, Search, Filter, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useDomain } from '../context/DomainContext';
import RiskBadge from '../components/RiskBadge';

export default function PredictionHistory() {
  const { activeDomain, setLastPredictionResult } = useDomain();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Contract endpoint: GET /{domain}/history/{patient_id} or history listing
      const res = await api.get(`/${activeDomain.id}/history/all`).catch(() => {
        return api.get('/dashboard/high-risk-patients').catch(() => ({ data: [] }));
      });

      if (res.data && Array.isArray(res.data)) {
        setHistory(res.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeDomain.id]);

  // Client-side filtering logic
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.patient_id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      riskFilter === 'All' ||
      (item.risk_level || '').toLowerCase() === riskFilter.toLowerCase() ||
      (riskFilter === 'Medium' && item.risk_level === 'moderate');

    return matchesSearch && matchesRisk;
  });

  const handleViewItem = (item) => {
    setLastPredictionResult(item);
    navigate('/predict/result');
  };

  const handleDownloadItem = (item) => {
    alert(`Downloading prediction summary for ${item.patient_name || item.patient_id}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prediction History</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Historical log of clinical assessments for {activeDomain.name}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient ID or Name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Risk Level Dropdown */}
          <div className="shrink-0">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent focus:outline-none"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent focus:outline-none"
            />
          </div>

          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading history records...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No matching assessment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Patient ID</th>
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6">{activeDomain.keyMetricLabel}</th>
                  <th className="py-3.5 px-6">Risk Level</th>
                  <th className="py-3.5 px-6">Probability</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredHistory.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">{item.patient_mrn || item.patient_id}</td>
                    <td className="py-4 px-6 text-slate-900 font-semibold">{item.patient_name || `Patient #${item.patient_id}`}</td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(item.created_at || Date.now()).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {activeDomain.getKeyMetric(item.basicInfo || item.raw_input || {})}
                    </td>
                    <td className="py-4 px-6">
                      <RiskBadge level={item.risk_level} />
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {Math.round(item.risk_score || 0)}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewItem(item)}
                          className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                          title="View Full Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadItem(item)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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
