from datetime import datetime
from typing import Optional, Dict, Any, Union
from pydantic import BaseModel


class RiskRequestBase(BaseModel):
    """Generic clinical input payload."""
    patient_id: Union[int, str] = 1
    features: Dict[str, Any]


class SimplePredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk_level: str
    message: str = "Prediction completed successfully"


class RiskResponse(BaseModel):
    id: int
    patient_id: Union[int, str]
    patient_name: Optional[str] = None
    patient_mrn: Optional[str] = None
    domain: str
    risk_score: float
    risk_level: str
    prediction: Optional[int] = 0
    probability: Optional[float] = 0.0
    message: Optional[str] = "Prediction completed successfully"
    model_version: Optional[str] = None
    shap_explanation: Optional[Dict[str, Any]] = None
    quantum_optimized: Optional[Union[Dict[str, Any], bool]] = None
    raw_input: Optional[Dict[str, Any]] = None
    recommendation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

