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
        dom_clean = str(domain).lower().strip()
        result.setdefault(dom_clean, {"low": 0, "moderate": 0, "high": 0})
        lvl_str = str(level).lower()
        if "high" in lvl_str:
            result[dom_clean]["high"] += count
        elif "mod" in lvl_str or "med" in lvl_str:
            result[dom_clean]["moderate"] += count
        else:
            result[dom_clean]["low"] += count
    return result


@router.get("/high-risk-patients")
def high_risk_patients(db: Session = Depends(get_db)):
    """Ranked list of currently high-risk patients across all domains."""
    rows = (
        db.query(RiskAssessment)
        .filter((RiskAssessment.risk_score >= 50) | (RiskAssessment.risk_level.ilike("%high%")))
        .order_by(RiskAssessment.risk_score.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "patient_name": r.patient.full_name if r.patient else f"Patient #{r.patient_id}",
            "patient_mrn": r.patient.mrn if r.patient else f"P-{r.patient_id}",
            "domain": r.domain,
            "risk_score": r.risk_score,
            "risk_level": r.risk_level,
            "recommendation": r.recommendation,
            "created_at": r.created_at,
        }
        for r in rows
    ]
