"""
Loads pre-trained disease-risk models (XGBoost / RandomForest) from
MODEL_STORE_PATH. Since the AI models are already developed (per team),
this module just needs the actual .pkl/.json files dropped into
models_store/<domain>/model.pkl for each domain below.
"""
import os
import joblib
from functools import lru_cache

from app.core.config import settings

DOMAINS = [
    "pregnancy_fetal_sepsis",
    "stroke",
    "coronary_heart_disease",
    "chronic_kidney_disease",
    "gestational_diabetes",
    "preeclampsia",
]


class ModelNotFoundError(Exception):
    pass


@lru_cache(maxsize=len(DOMAINS))
def load_model(domain: str):
    if domain not in DOMAINS:
        raise ValueError(f"Unknown domain: {domain}")

    model_path = os.path.join(settings.MODEL_STORE_PATH, domain, "model.pkl")
    if not os.path.exists(model_path):
        raise ModelNotFoundError(
            f"No trained model found for '{domain}' at {model_path}. "
            f"Drop the exported .pkl there to activate predictions."
        )
    return joblib.load(model_path)


def get_expected_features(domain: str) -> list[str]:
    """Optionally load a features.json alongside the model describing
    the exact ordered feature list the model expects."""
    import json
    features_path = os.path.join(settings.MODEL_STORE_PATH, domain, "features.json")
    if os.path.exists(features_path):
        with open(features_path) as f:
            return json.load(f)
    return []
