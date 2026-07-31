from datetime import datetime
from typing import Optional, Dict, Any, Union
from pydantic import BaseModel


class RiskRequestBase(BaseModel):
    """Generic clinical input payload."""
    patient_id: Union[int, str]
    features: Dict[str, Any]


class RiskResponse(BaseModel):
    id: int
    patient_id: Union[int, str]
    patient_name: Optional[str] = None
    patient_mrn: Optional[str] = None
    domain: str
    risk_score: float
    risk_level: str
    model_version: Optional[str] = None
    shap_explanation: Optional[Dict[str, Any]] = None
    quantum_optimized: Optional[Union[Dict[str, Any], bool]] = None
    raw_input: Optional[Dict[str, Any]] = None
    recommendation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

