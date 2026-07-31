from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Union
from pydantic import BaseModel

from app.core.database import get_db
from app.schemas.risk import RiskRequestBase, RiskResponse, SimplePredictionResponse
from app.services.risk_service import predict_risk, get_domain_history, get_patient_history

router = APIRouter(tags=["AI Model Predictions"])


class DirectPredictionRequest(BaseModel):
    patient_id: Union[int, str] = 1
    features: Dict[str, Any] = {}

    class Config:
        extra = "allow"


def _format_prediction_response(assessment) -> Dict[str, Any]:
    return {
        "prediction": getattr(assessment, "prediction", int(assessment.risk_score >= 50)),
        "probability": getattr(assessment, "probability", round(assessment.risk_score / 100.0, 4)),
        "risk_level": assessment.risk_level,
        "message": "Prediction completed successfully",
        "id": assessment.id,
        "patient_id": assessment.patient_id,
        "domain": assessment.domain,
        "risk_score": assessment.risk_score,
        "recommendation": assessment.recommendation,
        "created_at": assessment.created_at.isoformat() if hasattr(assessment.created_at, "isoformat") else str(assessment.created_at),
    }


@router.post("/predict/gdm", response_model=Dict[str, Any])
@router.post("/api/v1/predict/gdm", response_model=Dict[str, Any])
def predict_gdm_direct(payload: DirectPredictionRequest, db: Session = Depends(get_db)):
    """Run Gestational Diabetes Mellitus (GDM) AI model prediction."""
    patient_id = payload.patient_id
    features = payload.features if payload.features else payload.model_dump()
    assessment = predict_risk(db, "gestational_diabetes", patient_id, features)
    return _format_prediction_response(assessment)


@router.post("/predict/preeclampsia", response_model=Dict[str, Any])
@router.post("/api/v1/predict/preeclampsia", response_model=Dict[str, Any])
def predict_preeclampsia_direct(payload: DirectPredictionRequest, db: Session = Depends(get_db)):
    """Run Preeclampsia AI model prediction."""
    patient_id = payload.patient_id
    features = payload.features if payload.features else payload.model_dump()
    assessment = predict_risk(db, "preeclampsia", patient_id, features)
    return _format_prediction_response(assessment)
