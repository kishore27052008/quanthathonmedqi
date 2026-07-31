from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.risk import RiskRequestBase, RiskResponse
from app.services.risk_service import predict_risk, get_patient_history, get_domain_history

DOMAIN = "stroke"

router = APIRouter(prefix="/stroke", tags=["Stroke"])


@router.post("/predict", response_model=RiskResponse)
def predict(payload: RiskRequestBase, db: Session = Depends(get_db)):
    """Run Stroke risk prediction for a patient."""
    return predict_risk(db, DOMAIN, payload.patient_id, payload.features)


@router.get("/history/all", response_model=list[RiskResponse])
def all_history(db: Session = Depends(get_db)):
    """Get all historical risk assessments for this domain."""
    return get_domain_history(db, DOMAIN)


@router.get("/history/{patient_id}", response_model=list[RiskResponse])
def history(patient_id: str, db: Session = Depends(get_db)):
    return get_patient_history(db, patient_id, DOMAIN)

