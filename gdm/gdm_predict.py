# gdm/gdm_predict.py
"""Gestational Diabetes prediction wrapper.
Loads the XGBoost model and provides a predict function.
"""

import json
import joblib
import pandas as pd
from pathlib import Path

# Configuration – relative to repository root
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "gdm" / "models" / "gdm_xgboost.joblib"

# Feature columns expected by the trained model (as inspected from the model)
FEATURE_COLUMNS = [
    "Age",
    "No of Pregnancy",
    "Gestation in previous Pregnancy",
    "BMI",
    "HDL",
    "Family History",
    "unexplained prenetal loss",
    "Large Child or Birth Default",
    "PCOS",
    "Sys BP",
    "Dia BP",
    "OGTT",
    "Hemoglobin",
    "Sedentary Lifestyle",
    "Prediabetes",
]

def _load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"GDM model not found at {MODEL_PATH}")
    return joblib.load(str(MODEL_PATH))

def _prepare_dataframe(patient: dict) -> pd.DataFrame:
    """Create a DataFrame with columns in the exact order expected by the model.
    Missing columns are filled with NaN.
    """
    df = pd.DataFrame([patient])
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = float('nan')
    return df[FEATURE_COLUMNS]

def predict_gdm(patient: dict) -> dict:
    """Predict GDM risk for a single patient.
    Returns a dict with keys ``predicted_class`` (0/1), ``probability`` (float) and ``diagnosis`` string.
    """
    model = _load_model()
    df = _prepare_dataframe(patient)
    X = df.values
    prob = model.predict_proba(X)[:, 1][0]
    pred = int(prob >= 0.5)
    return {
        "predicted_class": pred,
        "probability": round(float(prob), 4),
        "diagnosis": "Gestational Diabetes" if pred else "No Gestational Diabetes",
    }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="GDM prediction CLI")
    parser.add_argument("--json", required=True, help="Patient JSON string or path to JSON file")
    args = parser.parse_args()
    if Path(args.json).exists():
        patient_data = json.loads(Path(args.json).read_text())
    else:
        patient_data = json.loads(args.json)
    result = predict_gdm(patient_data)
    print(json.dumps(result, indent=2))
