import os
import pickle
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "heart_disease_xgboost.pkl")
PIPELINE_PATH = os.path.join(BASE_DIR, "models", "preprocessing_pipeline.pkl")

_MODEL_CACHE = None
_PIPELINE_CACHE = None


def load_cad_artifacts(model_path=MODEL_PATH, preprocessor_path=PIPELINE_PATH):
    """Load CAD XGBoost model and preprocessor pipeline with error handling and caching."""
    global _MODEL_CACHE, _PIPELINE_CACHE
    if _MODEL_CACHE is not None and _PIPELINE_CACHE is not None:
        return _MODEL_CACHE, _PIPELINE_CACHE

    if not os.path.exists(model_path):
        # Fallback to local root path if needed
        model_path_alt = os.path.join(BASE_DIR, "heart_disease_xgboost.pkl")
        if os.path.exists(model_path_alt):
            model_path = model_path_alt
        else:
            raise FileNotFoundError(f"CAD Model file missing at '{model_path}'. Run CAD/train_xgboost.py first.")

    if not os.path.exists(preprocessor_path):
        preprocessor_path_alt = os.path.join(BASE_DIR, "preprocessing_pipeline.pkl")
        if os.path.exists(preprocessor_path_alt):
            preprocessor_path = preprocessor_path_alt
        else:
            raise FileNotFoundError(f"CAD Preprocessor file missing at '{preprocessor_path}'. Run CAD/train_xgboost.py first.")

    with open(model_path, 'rb') as f:
        _MODEL_CACHE = pickle.load(f)
    with open(preprocessor_path, 'rb') as f:
        _PIPELINE_CACHE = pickle.load(f)

    return _MODEL_CACHE, _PIPELINE_CACHE


def get_risk_category(risk_prob: float) -> str:
    """Categorize risk percentage into standard risk bands."""
    risk_pct = risk_prob * 100.0
    if risk_pct <= 25.0:
        return "Low Risk"
    elif risk_pct <= 50.0:
        return "Moderate Risk"
    elif risk_pct <= 75.0:
        return "High Risk"
    else:
        return "Very High Risk"


def predict_heart_disease_risk(sample_data, model_path=MODEL_PATH, preprocessor_path=PIPELINE_PATH):
    """
    Prediction function taking sample input data (DataFrame, dict, or list of dicts) and returning
    JSON-serializable prediction output for Coronary Artery Disease (CAD).
    """
    model, preprocessor = load_cad_artifacts(model_path, preprocessor_path)

    if isinstance(sample_data, dict):
        sample_df = pd.DataFrame([sample_data])
        single_input = True
    elif isinstance(sample_data, list):
        sample_df = pd.DataFrame(sample_data)
        single_input = False
    elif isinstance(sample_data, pd.DataFrame):
        sample_df = sample_data.copy()
        single_input = len(sample_df) == 1
    else:
        raise ValueError("Input sample_data must be a dict, list of dicts, or pandas DataFrame.")

    # Drop metadata/target columns if present
    for col in ['id', 'num', 'target', 'dataset', 'Patient_Name']:
        if col in sample_df.columns:
            sample_df = sample_df.drop(columns=[col])

    X_processed = preprocessor.transform(sample_df)
    proba = model.predict_proba(X_processed)[:, 1]

    results = []
    for p in proba:
        pct = round(float(p) * 100.0, 1)
        cat = get_risk_category(p)
        
        formatted_str = (
            f"Coronary Artery Disease Risk\n"
            f"Risk Percentage: {pct}%\n"
            f"Risk Category: {cat.replace(' Risk', '')}"
        )
        
        results.append({
            'cad_risk_percentage': pct,
            'risk_percentage': f"{pct}%",
            'risk_category': cat,
            'probability': round(float(p), 4),
            'formatted_output': formatted_str
        })

    return results[0] if single_input else results


if __name__ == "__main__":
    sample_patient = {
        'age': 65, 'sex': 'Male', 'cp': 'asymptomatic', 'trestbps': 160, 'chol': 286,
        'fbs': 'TRUE', 'restecg': 'lv hypertrophy', 'thalch': 108, 'exang': 'TRUE', 'oldpeak': 2.5,
        'slope': 'flat', 'ca': 3.0, 'thal': 'reversable defect'
    }
    print("Testing CAD Prediction:")
    res = predict_heart_disease_risk(sample_patient)
    print(res["formatted_output"])
    print("\nFull JSON output:", res)
