from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    mrn = Column(String, unique=True, index=True, nullable=False)  # medical record no.
    full_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    hospital_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    risk_assessments = relationship("RiskAssessment", back_populates="patient")


class Vitals(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    heart_rate = Column(Float, nullable=True)
    systolic_bp = Column(Float, nullable=True)
    diastolic_bp = Column(Float, nullable=True)
    respiratory_rate = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    spo2 = Column(Float, nullable=True)
    glucose = Column(Float, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
