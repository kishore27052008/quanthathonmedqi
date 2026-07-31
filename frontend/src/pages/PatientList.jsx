import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import { DOMAIN_LIST } from "../config/domainSchemas.js";

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/patients/")
      .then((res) => setPatients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Patients</h1>
        <Link to="/patients/new"><button>+ Register Patient</button></Link>
      </div>

      {loading ? (
        <p className="muted">Loading patients…</p>
      ) : patients.length === 0 ? (
        <div className="card placeholder-card">
          <p className="muted">No patients yet. Register your first patient to get started.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr><th>MRN</th><th>Name</th><th>Gender</th><th>Hospital</th><th>Run Assessment</th></tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.mrn}</td>
                <td>{p.full_name}</td>
                <td>{p.gender}</td>
                <td>{p.hospital_id}</td>
                <td>
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) window.location.href = `/domains/${e.target.value}`; }}
                  >
                    <option value="" disabled>Choose domain…</option>
                    {DOMAIN_LIST.map((d) => (
                      <option key={d.key} value={d.route}>{d.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
