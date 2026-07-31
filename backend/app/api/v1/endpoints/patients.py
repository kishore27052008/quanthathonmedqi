from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.patient import Patient, Vitals
from app.schemas.patient import PatientCreate, PatientOut, VitalsInput

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/", response_model=PatientOut)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    if db.query(Patient).filter(Patient.mrn == payload.mrn).first():
        raise HTTPException(status_code=400, detail="Patient MRN already exists")
    patient = Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/", response_model=list[PatientOut])
def list_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/{patient_id}/vitals")
def add_vitals(patient_id: int, payload: VitalsInput, db: Session = Depends(get_db)):
    if not db.query(Patient).filter(Patient.id == patient_id).first():
        raise HTTPException(status_code=404, detail="Patient not found")
    vitals = Vitals(patient_id=patient_id, **payload.model_dump())
    db.add(vitals)
    db.commit()
    db.refresh(vitals)
    return vitals
