from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, Union
from pydantic import BaseModel

from app.core.database import get_db
from app.models.risk_assessment import RiskAssessment
from app.models.patient import Patient
from Overall_analysis.overall_risk_analysis import analyze_overall_risk

router = APIRouter(prefix="/overall", tags=["Multi-Disease Overall Risk Analysis"])


class OverallRiskPayload(BaseModel):
    patient_id: Optional[Union[int, str]] = None
    probabilities: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"


@router.post("/analyze", response_model=Dict[str, Any])
@router.post("/api/v1/overall/analyze", response_model=Dict[str, Any])
def analyze_overall_patient_risk(payload: OverallRiskPayload, db: Session = Depends(get_db)):
    """
    Run multi-disease pathway propagation, quantum QAOA optimization, and preventive recommendation analysis.
    """
    patient_probs = payload.probabilities if payload.probabilities else {}

    # If patient_id provided, query database for latest predictions across all domains
    if payload.patient_id:
        patient_str = str(payload.patient_id).strip()
        patient_rec = (
            db.query(Patient)
            .filter((Patient.id == int(patient_str)) if patient_str.isdigit() else (Patient.mrn == patient_str))
            .first()
        )
        if patient_rec:
            assessments = (
                db.query(RiskAssessment)
                .filter(RiskAssessment.patient_id == patient_rec.id)
                .order_by(RiskAssessment.created_at.desc())
                .all()
            )
            for ass in assessments:
                dom = ass.domain.lower()
                if dom not in patient_probs:
                    patient_probs[dom] = ass.risk_score / 100.0

    if not patient_probs:
        # Default representative baseline probabilities if no predictions found yet
        patient_probs = {
            "stroke": 0.25,
            "ckd": 0.15,
            "cad": 0.20,
            "gdm": 0.10,
            "preeclampsia": 0.05,
        }

    try:
        results = analyze_overall_risk(patient_probs, run_quantum=True)
        return {
            "status": "success",
            "message": "Multi-disease overall risk analysis completed successfully",
            "patient_id": payload.patient_id,
            "input_priors": patient_probs,
            **results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Overall risk analysis calculation error: {str(e)}"
        )
