"""
stroke_quantum_router.py
-------------------------
FastAPI route for the Stroke Quantum Kernel SVM model.

HOW TO WIRE THIS INTO YOUR EXISTING APP:

In your main FastAPI file (e.g. main.py / app.py), add:

    from stroke_quantum_router import router as stroke_quantum_router
    app.include_router(stroke_quantum_router)

Adjust the import path above to match wherever this file lives relative
to your main app (e.g. `from routers.stroke_quantum_router import router`
if you keep routers in a subfolder).

Adjust MODEL_DIR below to point at your actual stroke/models folder.
"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal

from predict_quantum import QuantumStrokePredictor

router = APIRouter(prefix="/stroke", tags=["Stroke - Quantum Model"])

# ------------------------------------------------------------------
# Loaded ONCE when this module is imported (i.e. when the FastAPI app
# starts up) -- NOT on every request. This is what makes the quantum
# kernel usable in an API: the expensive setup happens once, and every
# request only pays for the actual per-patient kernel evaluation.
# ------------------------------------------------------------------
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

quantum_predictor = QuantumStrokePredictor(
    preprocessor_path=os.path.join(MODEL_DIR, "preprocessing_pipeline.pkl"),
    quantum_model_path=os.path.join(MODEL_DIR, "quantum_kernel_svm.pkl"),
)


class StrokePatientInput(BaseModel):
    """This is what the user (your app's frontend / API caller) sends in."""
    gender: Literal["Male", "Female", "Other"]
    age: float = Field(..., ge=0, le=120)
    hypertension: Literal[0, 1]
    heart_disease: Literal[0, 1]
    ever_married: Literal["Yes", "No"]
    work_type: Literal["Private", "Self-employed", "Govt_job", "children", "Never_worked"]
    Residence_type: Literal["Urban", "Rural"]
    avg_glucose_level: float = Field(..., gt=0)
    bmi: float = Field(..., gt=0)
    smoking_status: Literal["formerly smoked", "never smoked", "smokes", "Unknown"]

    class Config:
        json_schema_extra = {
            "example": {
                "gender": "Male",
                "age": 67,
                "hypertension": 1,
                "heart_disease": 0,
                "ever_married": "Yes",
                "work_type": "Private",
                "Residence_type": "Urban",
                "avg_glucose_level": 178.5,
                "bmi": 29.4,
                "smoking_status": "formerly smoked"
            }
        }


class StrokeRiskOutput(BaseModel):
    risk_percentage: str
    risk_category: str


@router.post("/predict/quantum", response_model=StrokeRiskOutput)
def predict_stroke_quantum(patient: StrokePatientInput):
    """
    Takes real patient input submitted by a user (via your MedQ frontend)
    and returns the Quantum Kernel SVM's stroke risk prediction.
    """
    try:
        result = quantum_predictor.predict(patient.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quantum prediction failed: {e}")
