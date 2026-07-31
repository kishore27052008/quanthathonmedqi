from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.risk_assessment import RiskAssessment
from app.models.patient import Patient

router = APIRouter(tags=["Prediction History"])


def _format_history_item(item: RiskAssessment) -> Dict[str, Any]:
    patient_mrn = item.patient.mrn if item.patient else f"P-{item.patient_id}"
    patient_name = item.patient.full_name if item.patient else f"Patient #{item.patient_id}"
    return {
        "id": item.id,
        "patient_id": item.patient_id,
        "patient_mrn": patient_mrn,
        "patient_name": patient_name,
        "domain": item.domain,
        "risk_score": item.risk_score,
        "risk_level": item.risk_level,
        "prediction": int(item.risk_score >= 50),
        "probability": round(item.risk_score / 100.0, 4),
        "model_version": item.model_version,
        "shap_explanation": item.shap_explanation,
        "quantum_optimized": item.quantum_optimized,
        "raw_input": item.raw_input,
        "recommendation": item.recommendation,
        "created_at": item.created_at.isoformat() if hasattr(item.created_at, "isoformat") else str(item.created_at),
    }


@router.get("/history", response_model=List[Dict[str, Any]])
@router.get("/api/v1/history", response_model=List[Dict[str, Any]])
def get_all_history(db: Session = Depends(get_db)):
    """Retrieve full history log of clinical risk predictions across all patients."""
    records = db.query(RiskAssessment).order_by(RiskAssessment.created_at.desc()).all()
    return [_format_history_item(rec) for rec in records]


@router.get("/history/{assessment_id}", response_model=Dict[str, Any])
@router.get("/api/v1/history/{assessment_id}", response_model=Dict[str, Any])
def get_history_by_id(assessment_id: int, db: Session = Depends(get_db)):
    """Retrieve a single prediction assessment by ID."""
    record = db.query(RiskAssessment).filter(RiskAssessment.id == assessment_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction assessment with ID {assessment_id} not found",
        )
    return _format_history_item(record)
