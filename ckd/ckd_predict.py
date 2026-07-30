import os
import sys

ckd_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(ckd_dir, "src")
if ckd_dir not in sys.path:
    sys.path.append(ckd_dir)
if src_dir not in sys.path:
    sys.path.append(src_dir)

try:
    from CKD.src.predict import predict_ckd_risk, load_artifacts, get_risk_category
except ModuleNotFoundError:
    from src.predict import predict_ckd_risk, load_artifacts, get_risk_category

__all__ = ["predict_ckd_risk", "load_artifacts", "get_risk_category"]

if __name__ == "__main__":
    sample_patient = {
        'age': 65.0, 'bp': 90.0, 'sg': 1.010, 'al': 3.0, 'su': 1.0,
        'rbc': 'abnormal', 'pc': 'abnormal', 'pcc': 'present', 'ba': 'present',
        'bgr': 250.0, 'bu': 75.0, 'sc': 4.8, 'sod': 128.0, 'pot': 5.2,
        'hemo': 8.5, 'pcv': 28.0, 'wc': '11000', 'rc': '3.8',
        'htn': 'yes', 'dm': 'yes', 'cad': 'no', 'appet': 'poor', 'pe': 'yes', 'ane': 'no'
    }
    models_dir = os.path.join(ckd_dir, "models")
    res = predict_ckd_risk(sample_patient, models_dir)
    print("CKD Prediction Result:")
    print(res["formatted_output"])
