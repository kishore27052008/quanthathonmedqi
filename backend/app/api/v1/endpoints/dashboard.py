from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.risk_assessment import RiskAssessment

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    """Aggregate counts per domain and risk level for the doctor/admin
    dashboard overview cards."""
    rows = (
        db.query(
            RiskAssessment.domain,
            RiskAssessment.risk_level,
            func.count(RiskAssessment.id),
        )
        .group_by(RiskAssessment.domain, RiskAssessment.risk_level)
        .all()
    )

    result: dict[str, dict[str, int]] = {}
    for domain, level, count in rows:
        result.setdefault(domain, {"low": 0, "moderate": 0, "high": 0})
        result[domain][level] = count
    return result


@router.get("/high-risk-patients")
def high_risk_patients(db: Session = Depends(get_db)):
    """Ranked list of currently high-risk patients across all domains,
    powering the 'Automatically identifies and ranks high-risk patients'
    feature from the pitch deck."""
    rows = (
        db.query(RiskAssessment)
        .filter(RiskAssessment.risk_level == "high")
        .order_by(RiskAssessment.risk_score.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "patient_id": r.patient_id,
            "domain": r.domain,
            "risk_score": r.risk_score,
            "recommendation": r.recommendation,
            "created_at": r.created_at,
        }
        for r in rows
    ]
