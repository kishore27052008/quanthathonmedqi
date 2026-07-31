from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    patients,
    dashboard,
    pregnancy_fetal_sepsis,
    stroke,
    coronary_heart_disease,
    chronic_kidney_disease,
    gestational_diabetes,
    preeclampsia,
    predict,
    history,
    overall_analysis,
)

api_router = APIRouter()

api_router.include_router(predict.router)
api_router.include_router(history.router)
api_router.include_router(overall_analysis.router)
api_router.include_router(auth.router)
api_router.include_router(patients.router)
api_router.include_router(dashboard.router)

# Disease-domain risk-prediction routers
api_router.include_router(pregnancy_fetal_sepsis.router)
api_router.include_router(stroke.router)
api_router.include_router(coronary_heart_disease.router)
api_router.include_router(chronic_kidney_disease.router)
api_router.include_router(gestational_diabetes.router)
api_router.include_router(preeclampsia.router)
