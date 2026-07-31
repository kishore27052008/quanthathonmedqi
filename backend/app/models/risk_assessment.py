from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class RiskAssessment(Base):
    """Stores prediction output for any disease domain."""
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    # domain: pregnancy_fetal_sepsis | stroke | coronary_heart_disease |
    #         chronic_kidney_disease | gestational_diabetes | preeclampsia
    domain = Column(String, index=True, nullable=False)

    risk_score = Column(Float, nullable=False)        # 0-100
    risk_level = Column(String, nullable=False)        # low | moderate | high
    model_version = Column(String, nullable=True)
    shap_explanation = Column(JSON, nullable=True)     # top contributing features
    quantum_optimized = Column(JSON, nullable=True)    # quantum feature selection metadata
    raw_input = Column(JSON, nullable=True)
    recommendation = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="risk_assessments")

    @property
    def patient_name(self) -> str:
        if self.patient and self.patient.full_name:
            return self.patient.full_name
        if isinstance(self.raw_input, dict):
            return self.raw_input.get("patient_name") or self.raw_input.get("full_name") or f"Patient #{self.patient_id}"
        return f"Patient #{self.patient_id}"

    @property
    def patient_mrn(self) -> str:
        if self.patient and self.patient.mrn:
            return self.patient.mrn
        return f"P-{self.patient_id}"

