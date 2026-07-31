# pcm/pcm_predict.py
"""Preeclampsia prediction wrapper.

Loads the full sklearn/imblearn pipeline saved as
`models/preeclampsia_pipeline.pkl` and returns a dictionary with the predicted
class (0/1) and a human‑readable risk description.
"""
import json
import joblib
import pandas as pd
from pathlib import Path

# ---------------------------------------------------------------------
# Configuration – relative to this file's location
# ---------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "preeclampsia" / "models" / "preeclampsia_pipeline.pkl"

# Feature column list – must match the columns used when the pipeline was
# trained (see `preeclampsia-test/realtest.py` for the canonical list).
FEATURE_COLUMNS = [
    "maternal_age",
    "pre_pregnancy_weight",
    "maternal_height",
    "bmi",
    "right_art_ut_ri",
    "right_art_ut_pi",
    "right_art_ut_psv",
    "left_art_ut_ri",
    "left_art_ut_pi",
    "left_art_ut_psv",
    "mean_ri",
    "mean_pi",
    "mean_psv",
    "bilateral_notch",
    "parity",
    "sflt1",
    "plgf",
    "sflt1_plgf_ratio",
]

def _load_pipeline():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Preeclampsia pipeline not found at {MODEL_PATH}")
    return joblib.load(MODEL_PATH)  # sklearn Pipeline instance

def _prepare_dataframe(patient_dict: dict) -> pd.DataFrame:
    df = pd.DataFrame([patient_dict])
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0.0
    return df[FEATURE_COLUMNS]

def predict_preclamp(patient: dict) -> dict:
    """Predict Preeclampsia risk for a single patient.

    Parameters
    ----------
    patient: dict
        Mapping of feature name → raw value (exact column names as in the
        training data).
    Returns
    -------
    dict with keys ``predicted_class`` (0/1), ``probability`` (float) and a
    ``diagnosis`` string.
    """
    pipeline = _load_pipeline()
    df = _prepare_dataframe(patient)
    prob = pipeline.predict_proba(df)[:, 1][0]
    pred = int(prob >= 0.5)
    return {
        "predicted_class": pred,
        "probability": round(float(prob), 4),
        "diagnosis": "Preeclampsia" if pred else "No Preeclampsia",
    }

# ---------------------------------------------------------------------
# Simple CLI for quick manual testing
# ---------------------------------------------------------------------
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Preeclampsia prediction CLI")
    parser.add_argument("--json", required=True, help="Patient JSON string or path to JSON file")
    args = parser.parse_args()
    # Load JSON (file or raw string)
    if Path(args.json).exists():
        patient_data = json.loads(Path(args.json).read_text())
    else:
        patient_data = json.loads(args.json)
    result = predict_preclamp(patient_data)
    print(json.dumps(result, indent=2))
