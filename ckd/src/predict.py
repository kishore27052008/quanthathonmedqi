import os
import sys
import joblib
import pandas as pd
import numpy as np

src_dir = os.path.dirname(os.path.abspath(__file__))
if src_dir not in sys.path:
    sys.path.append(src_dir)

from data_preprocessing import clean_dataframe, NUMERICAL_COLS, CATEGORICAL_COLS

_PIPELINE_CACHE = None
_MODEL_CACHE = None
_MODELS_DIR = None


def get_risk_category(risk_percentage: float) -> str:
    """
    Categorizes CKD risk percentage into defined risk bands:
    - 0-25%   -> Low Risk
    - 26-50%  -> Moderate Risk
    - 51-75%  -> High Risk
    - 76-100% -> Very High Risk
    """
    if risk_percentage <= 25.0:
        return "Low Risk"
    elif risk_percentage <= 50.0:
        return "Moderate Risk"
    elif risk_percentage <= 75.0:
        return "High Risk"
    else:
        return "Very High Risk"


def load_artifacts(models_dir: str):
    """
    Loads saved preprocessing pipeline and trained XGBoost model.
    Uses caching to optimize REST API performance.
    """
    global _PIPELINE_CACHE, _MODEL_CACHE, _MODELS_DIR
    if _PIPELINE_CACHE is not None and _MODEL_CACHE is not None and _MODELS_DIR == models_dir:
        return _PIPELINE_CACHE, _MODEL_CACHE
        
    pipeline_path = os.path.join(models_dir, "preprocessing_pipeline.pkl")
    model_path = os.path.join(models_dir, "ckd_xgboost.pkl")
    
    if not os.path.exists(pipeline_path):
        raise FileNotFoundError(f"Preprocessing pipeline not found at: {pipeline_path}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model not found at: {model_path}")
        
    _PIPELINE_CACHE = joblib.load(pipeline_path)
    _MODEL_CACHE = joblib.load(model_path)
    _MODELS_DIR = models_dir
    
    return _PIPELINE_CACHE, _MODEL_CACHE


def predict_ckd_risk(input_data, models_dir: str = None):
    """
    Reusable prediction function for Chronic Kidney Disease (CKD) Risk.

    Parameters:
    -----------
    input_data : dict, list of dicts, or pandas.DataFrame
        Patient clinical feature data.
    models_dir : str, optional
        Path to directory containing saved model artifacts.
        
    Returns:
    --------
    dict (or list of dicts):
        Contains:
        - Risk Percentage (0.0% - 100.0%)
        - Risk Category ("Low Risk", "Moderate Risk", "High Risk", "Very High Risk")
        - Probabilities: {"ckd": float, "notckd": float}
        - Formatted Output String
    """
    if models_dir is None:
        models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
        
    pipeline, model = load_artifacts(models_dir)
    
    if isinstance(input_data, dict):
        df = pd.DataFrame([input_data])
        single_input = True
    elif isinstance(input_data, list):
        df = pd.DataFrame(input_data)
        single_input = False
    elif isinstance(input_data, pd.DataFrame):
        df = input_data.copy()
        single_input = len(df) == 1
    else:
        raise TypeError("input_data must be a Python dictionary, list of dictionaries, or pandas DataFrame.")
        
    cleaned_df = clean_dataframe(df)
    expected_cols = NUMERICAL_COLS + CATEGORICAL_COLS
    
    for col in expected_cols:
        if col not in cleaned_df.columns:
            cleaned_df[col] = np.nan
            
    X_features = cleaned_df[expected_cols]
    X_trans = pipeline.transform(X_features)
    probabilities = model.predict_proba(X_trans)
    
    results = []
    for i in range(len(probabilities)):
        prob_notckd = float(probabilities[i][0])
        prob_ckd = float(probabilities[i][1])
        
        risk_pct = round(prob_ckd * 100.0, 1)
        risk_cat = get_risk_category(risk_pct)
        
        formatted_str = (
            f"Chronic Kidney Disease Risk\n"
            f"Risk Percentage: {risk_pct}%\n"
            f"Risk Category: {risk_cat.replace(' Risk', '')}"
        )
        
        res = {
            "risk_percentage": risk_pct,
            "risk_category": risk_cat,
            "probability_ckd": round(prob_ckd, 4),
            "probability_notckd": round(prob_notckd, 4),
            "formatted_output": formatted_str
        }
        results.append(res)
        
    return results[0] if single_input else results


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "models")
    
    sample_patient = {
        'age': 65.0, 'bp': 90.0, 'sg': 1.010, 'al': 3.0, 'su': 1.0,
        'rbc': 'abnormal', 'pc': 'abnormal', 'pcc': 'present', 'ba': 'present',
        'bgr': 250.0, 'bu': 75.0, 'sc': 4.8, 'sod': 128.0, 'pot': 5.2,
        'hemo': 8.5, 'pcv': 28.0, 'wc': '11000', 'rc': '3.8',
        'htn': 'yes', 'dm': 'yes', 'cad': 'no', 'appet': 'poor', 'pe': 'yes', 'ane': 'no'
    }
    
    print("Testing sample patient prediction:")
    result = predict_ckd_risk(sample_patient, models_dir)
    print(result["formatted_output"])
    print("\nFull JSON Response:", result)
