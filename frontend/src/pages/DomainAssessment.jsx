import React from "react";
import { useParams, Navigate } from "react-router-dom";
import RiskAssessmentForm from "../components/RiskAssessmentForm.jsx";
import { DOMAIN_SCHEMAS, DOMAIN_LIST } from "../config/domainSchemas.js";

export default function DomainAssessment() {
  const { routeKey } = useParams();
  const match = DOMAIN_LIST.find((d) => d.route === routeKey);

  if (!match) return <Navigate to="/" replace />;

  return (
    <div className="page">
      <RiskAssessmentForm domainKey={match.key} schema={DOMAIN_SCHEMAS[match.key]} />
    </div>
  );
}
