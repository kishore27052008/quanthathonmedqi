"""
Generates synthetic-but-clinically-plausible training data and trains an
XGBoost classifier per disease domain, so the API is fully functional
end-to-end out of the box. Replace these with your team's real trained
models later by overwriting the same model.pkl / features.json files —
no other code changes needed.

Run:  python scripts/train_demo_models.py
"""
import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier

MODEL_STORE = os.path.join(os.path.dirname(__file__), "..", "models_store")
RNG = np.random.default_rng(42)
N = 2000

# domain: (feature_name -> (low, high) sampling range), label rule (weights)
DOMAIN_SPECS = {
    "pregnancy_fetal_sepsis": {
        "features": {
            "maternal_age": (16, 45),
            "gestational_age_weeks": (20, 42),
            "maternal_heart_rate": (60, 140),
            "maternal_temperature": (36.0, 40.0),
            "wbc_count": (4, 25),          # x10^9/L
            "lactate": (0.5, 6.0),         # mmol/L
            "systolic_bp": (80, 160),
            "respiratory_rate": (10, 35),
        },
        "risk_weights": {
            "maternal_heart_rate": 0.015, "maternal_temperature": 0.9,
            "wbc_count": 0.08, "lactate": 0.5, "respiratory_rate": 0.05,
        },
    },
    "stroke": {
        "features": {
            "age": (18, 90),
            "hypertension": (0, 1),
            "heart_disease": (0, 1),
            "avg_glucose_level": (60, 300),
            "bmi": (15, 45),
            "smoking_status": (0, 2),  # 0 never,1 former,2 current
            "systolic_bp": (90, 200),
        },
        "risk_weights": {
            "age": 0.03, "hypertension": 1.2, "heart_disease": 1.3,
            "avg_glucose_level": 0.01, "bmi": 0.03, "smoking_status": 0.5,
            "systolic_bp": 0.015,
        },
    },
    "coronary_heart_disease": {
        "features": {
            "age": (25, 85),
            "cholesterol": (120, 320),
            "systolic_bp": (90, 200),
            "diastolic_bp": (60, 120),
            "smoking": (0, 1),
            "diabetes": (0, 1),
            "bmi": (15, 45),
            "resting_heart_rate": (50, 130),
        },
        "risk_weights": {
            "age": 0.03, "cholesterol": 0.012, "systolic_bp": 0.01,
            "smoking": 1.1, "diabetes": 1.0, "bmi": 0.025, "resting_heart_rate": 0.01,
        },
    },
    "chronic_kidney_disease": {
        "features": {
            "age": (18, 90),
            "blood_pressure": (60, 180),
            "blood_glucose": (60, 300),
            "serum_creatinine": (0.4, 10.0),
            "hemoglobin": (6, 17),
            "albumin": (0, 5),
            "bmi": (15, 45),
        },
        "risk_weights": {
            "serum_creatinine": 0.9, "albumin": 0.4, "blood_pressure": 0.012,
            "blood_glucose": 0.006, "hemoglobin": -0.25, "age": 0.02,
        },
    },
    "gestational_diabetes": {
        "features": {
            "maternal_age": (16, 45),
            "bmi": (15, 45),
            "fasting_glucose": (60, 200),
            "family_history_diabetes": (0, 1),
            "gestational_age_weeks": (10, 40),
        },
        "risk_weights": {
            "fasting_glucose": 0.03, "bmi": 0.05, "family_history_diabetes": 1.1,
            "maternal_age": 0.03,
        },
    },
    "preeclampsia": {
        "features": {
            "maternal_age": (16, 45),
            "systolic_bp": (90, 200),
            "diastolic_bp": (60, 130),
            "proteinuria": (0, 3),      # dipstick 0-3+
            "bmi": (15, 45),
            "gestational_age_weeks": (20, 42),
        },
        "risk_weights": {
            "systolic_bp": 0.02, "diastolic_bp": 0.02, "proteinuria": 1.0,
            "bmi": 0.03, "maternal_age": 0.02,
        },
    },
}


def synth_dataset(spec):
    feats = spec["features"]
    weights = spec["risk_weights"]
    cols = {}
    for name, (lo, hi) in feats.items():
        cols[name] = RNG.uniform(lo, hi, N)
    df = pd.DataFrame(cols)

    # linear risk score + noise -> sigmoid -> binary label
    score = sum(df[f] * w for f, w in weights.items())
    score = (score - score.mean()) / (score.std() + 1e-6)
    score += RNG.normal(0, 0.5, N)
    prob = 1 / (1 + np.exp(-score))
    labels = (prob > np.median(prob)).astype(int)
    return df, labels


def train_and_save(domain, spec):
    df, y = synth_dataset(spec)
    model = RandomForestClassifier(
        n_estimators=200, max_depth=6, random_state=42,
    )
    model.fit(df, y)
    model.version = "demo-v1"

    out_dir = os.path.join(MODEL_STORE, domain)
    os.makedirs(out_dir, exist_ok=True)
    joblib.dump(model, os.path.join(out_dir, "model.pkl"))
    with open(os.path.join(out_dir, "features.json"), "w") as f:
        json.dump(list(spec["features"].keys()), f, indent=2)

    print(f"[ok] {domain}: trained on {N} samples, {len(spec['features'])} features")


if __name__ == "__main__":
    for domain, spec in DOMAIN_SPECS.items():
        train_and_save(domain, spec)
    print("All demo models trained. Replace model.pkl per domain with your real model anytime.")
