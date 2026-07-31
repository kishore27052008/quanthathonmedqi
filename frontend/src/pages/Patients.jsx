import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Stethoscope, Search, Building2, Phone } from 'lucide-react';
import api from '../api/client';
import { useDomain } from '../context/DomainContext';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { activeDomain } = useDomain();
  const navigate = useNavigate();

  // Registration Form State
  const [newPatient, setNewPatient] = useState({
    mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
    full_name: '',
    date_of_birth: '1995-04-12',
    gender: 'Female',
    contact_number: '+1 (555) 234-5678',
    hospital_id: 'HOSP-NORTH-01',
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patients/');
      setPatients(res.data && Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients/', newPatient);
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      console.error('Error registering patient:', err);
      alert(err.response?.data?.detail || 'Failed to register patient');
    }
  };

  const handlePredictForPatient = (patient) => {
    navigate('/predict', { state: { prefilledPatient: patient } });
  };

  const filteredPatients = patients.filter((p) =>
    (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.mrn || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Registered patients across clinical hospital network
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by Patient Name or MRN ID..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900"
        />
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading patient records...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No patients registered yet. Click "Register Patient" to add the first patient.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">MRN / Patient ID</th>
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">DOB / Gender</th>
                  <th className="py-3.5 px-6">Contact Number</th>
                  <th className="py-3.5 px-6">Hospital Facility</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">{p.mrn || `P-${p.id}`}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{p.full_name}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {p.date_of_birth} ({p.gender})
                    </td>
                    <td className="py-4 px-6 text-slate-600 flex items-center gap-1.5 mt-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.contact_number}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {p.hospital_id}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handlePredictForPatient(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-100 transition-all"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-brand-500" /> Predict Risk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Register New Patient</h3>
            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">MRN Code</label>
                <input
                  type="text"
                  required
                  value={newPatient.mrn}
                  onChange={(e) => setNewPatient({ ...newPatient, mrn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={newPatient.full_name}
                  onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newPatient.date_of_birth}
                    onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={newPatient.contact_number}
                  onChange={(e) => setNewPatient({ ...newPatient, contact_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital / Clinic ID</label>
                <input
                  type="text"
                  value={newPatient.hospital_id}
                  onChange={(e) => setNewPatient({ ...newPatient, hospital_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
