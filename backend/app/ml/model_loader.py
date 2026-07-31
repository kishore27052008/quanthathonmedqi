import os
import joblib
from pathlib import Path
from functools import lru_cache

from app.core.config import settings

BASE_DIR = Path(__file__).resolve().parents[3]
GDM_MODEL_PATH = BASE_DIR / "gdm" / "models" / "gdm_xgboost.joblib"
PREECLAMPSIA_MODEL_PATH = BASE_DIR / "preeclampsia" / "models" / "preeclampsia_pipeline.pkl"

DOMAINS = [
    "pregnancy_fetal_sepsis",
    "stroke",
    "coronary_heart_disease",
    "chronic_kidney_disease",
    "gestational_diabetes",
    "preeclampsia",
    "gdm",
]


class ModelNotFoundError(Exception):
    pass


@lru_cache(maxsize=16)
def load_model(domain: str):
    domain_clean = domain.lower().strip()

    if domain_clean in ["gdm", "gestational_diabetes"]:
        if GDM_MODEL_PATH.exists():
            return joblib.load(str(GDM_MODEL_PATH))

    if domain_clean in ["preeclampsia", "pcm"]:
        if PREECLAMPSIA_MODEL_PATH.exists():
            return joblib.load(str(PREECLAMPSIA_MODEL_PATH))

    # Fallback to models_store directory if model is placed there
    model_path = os.path.join(settings.MODEL_STORE_PATH, domain_clean, "model.pkl")
    if os.path.exists(model_path):
        return joblib.load(model_path)

    raise ModelNotFoundError(
        f"No trained model found for '{domain}'. "
        f"Checked GDM path ({GDM_MODEL_PATH}), Preeclampsia path ({PREECLAMPSIA_MODEL_PATH}), and {model_path}."
    )


def preload_models():
    """Pre-load all AI models into cache during startup so inference is zero-latency."""
    for dom in ["gdm", "preeclampsia"]:
        try:
            load_model(dom)
            print(f"[AI Model Loader] Pre-loaded model for '{dom}' successfully.")
        except Exception as e:
            print(f"[AI Model Loader] Warning pre-loading '{dom}': {e}")


def get_expected_features(domain: str) -> list[str]:
    domain_clean = domain.lower().strip()
    if domain_clean in ["gdm", "gestational_diabetes"]:
        return [
            "Age", "No of Pregnancy", "Gestation in previous Pregnancy", "BMI",
            "HDL", "Family History", "unexplained prenetal loss",
            "Large Child or Birth Default", "PCOS", "Sys BP", "Dia BP",
            "OGTT", "Hemoglobin", "Sedentary Lifestyle", "Prediabetes"
        ]
    if domain_clean in ["preeclampsia", "pcm"]:
        return [
            "maternal_age", "pre_pregnancy_weight", "maternal_height", "bmi",
            "right_art_ut_ri", "right_art_ut_pi", "right_art_ut_psv",
            "left_art_ut_ri", "left_art_ut_pi", "left_art_ut_psv",
            "mean_ri", "mean_pi", "mean_psv", "bilateral_notch",
            "parity", "sflt1", "plgf", "sflt1_plgf_ratio"
        ]

    features_path = os.path.join(settings.MODEL_STORE_PATH, domain_clean, "features.json")
    if os.path.exists(features_path):
        import json
        with open(features_path) as f:
            return json.load(f)
    return []
