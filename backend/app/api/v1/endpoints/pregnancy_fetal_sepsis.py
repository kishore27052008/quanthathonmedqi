from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.risk import RiskRequestBase, RiskResponse
from app.services.risk_service import predict_risk, get_patient_history, get_domain_history

DOMAIN = "pregnancy_fetal_sepsis"

router = APIRouter(prefix="/pregnancy_fetal_sepsis", tags=["Pregnancy & Fetal Sepsis"])


@router.post("/predict", response_model=RiskResponse)
def predict(payload: RiskRequestBase, db: Session = Depends(get_db)):
    """Run Pregnancy & Fetal Sepsis risk prediction."""
    return predict_risk(db, DOMAIN, payload.patient_id, payload.features)


@router.get("/history/all", response_model=List[RiskResponse])
def all_history(db: Session = Depends(get_db)):
    """Get all historical risk assessments for this domain."""
    return get_domain_history(db, DOMAIN)


@router.get("/history/{patient_id}", response_model=List[RiskResponse])
def history(patient_id: str, db: Session = Depends(get_db)):
    """Get historical risk assessments for a specific patient."""
    return get_patient_history(db, patient_id, DOMAIN)

