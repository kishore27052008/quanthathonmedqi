"""
Seeds a handful of demo patients and runs each through every disease-domain
model so the dashboard has real data to display immediately after setup.

Run (after training models and starting the DB once):
  python scripts/seed_demo_data.py
"""
import sys
import os
import random
from datetime import date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import Base, engine, SessionLocal
from app.models.patient import Patient
from app.models import user, risk_assessment  # noqa: F401
from app.services.risk_service import predict_risk

Base.metadata.create_all(bind=engine)

DEMO_PATIENTS = [
    {"mrn": "MRN-1001", "full_name": "Priya Ramesh", "gender": "F",
     "date_of_birth": date(1994, 3, 12), "hospital_id": "SVCE-Hosp"},
    {"mrn": "MRN-1002", "full_name": "Arjun Nair", "gender": "M",
     "date_of_birth": date(1968, 7, 5), "hospital_id": "SVCE-Hosp"},
    {"mrn": "MRN-1003", "full_name": "Meena Iyer", "gender": "F",
     "date_of_birth": date(1988, 11, 20), "hospital_id": "SVCE-Hosp"},
    {"mrn": "MRN-1004", "full_name": "Suresh Kumar", "gender": "M",
     "date_of_birth": date(1975, 1, 30), "hospital_id": "SVCE-Hosp"},
]

SAMPLE_FEATURES = {
    "pregnancy_fetal_sepsis": {"maternal_age": 29, "gestational_age_weeks": 34,
        "maternal_heart_rate": 118, "maternal_temperature": 38.6, "wbc_count": 17,
        "lactate": 3.2, "systolic_bp": 100, "respiratory_rate": 24},
    "stroke": {"age": 67, "hypertension": 1, "heart_disease": 1,
        "avg_glucose_level": 210, "bmi": 31, "smoking_status": 2, "systolic_bp": 165},
    "coronary_heart_disease": {"age": 58, "cholesterol": 260, "systolic_bp": 148,
        "diastolic_bp": 92, "smoking": 1, "diabetes": 1, "bmi": 29, "resting_heart_rate": 88},
    "chronic_kidney_disease": {"age": 61, "blood_pressure": 150, "blood_glucose": 180,
        "serum_creatinine": 3.4, "hemoglobin": 9.2, "albumin": 3, "bmi": 27},
    "gestational_diabetes": {"maternal_age": 33, "bmi": 30, "fasting_glucose": 145,
        "family_history_diabetes": 1, "gestational_age_weeks": 26},
    "preeclampsia": {"maternal_age": 31, "systolic_bp": 158, "diastolic_bp": 102,
        "proteinuria": 2, "bmi": 28, "gestational_age_weeks": 30},
}


def run():
    db = SessionLocal()
    try:
        patients = []
        for p in DEMO_PATIENTS:
            existing = db.query(Patient).filter(Patient.mrn == p["mrn"]).first()
            if existing:
                patients.append(existing)
                continue
            patient = Patient(**p)
            db.add(patient)
            db.commit()
            db.refresh(patient)
            patients.append(patient)
            print(f"[patient] created {patient.full_name} ({patient.mrn})")

        for patient in patients:
            for domain, features in SAMPLE_FEATURES.items():
                # jitter values slightly per patient for varied demo results
                jittered = {k: v * random.uniform(0.85, 1.15) for k, v in features.items()}
                result = predict_risk(db, domain, patient.id, jittered)
                print(f"[assessment] {patient.full_name} | {domain} -> "
                      f"{result.risk_score}% ({result.risk_level})")
    finally:
        db.close()


if __name__ == "__main__":
    run()
    print("\nSeeding complete. Start the API and check /api/v1/dashboard/summary")
