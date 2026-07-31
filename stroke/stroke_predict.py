import os
import sys

stroke_dir = os.path.dirname(os.path.abspath(__file__))
if stroke_dir not in sys.path:
    sys.path.append(stroke_dir)

from .predict import predict_stroke_risk, load_artifacts, generate_recommendations, format_prediction_output
try:
    from .predict_quantum import predict_stroke_risk_quantum
except Exception:
    predict_stroke_risk_quantum = None

__all__ = [
    "predict_stroke_risk",
    "predict_stroke_risk_quantum",
    "load_artifacts",
    "generate_recommendations",
    "format_prediction_output"
]

if __name__ == "__main__":
    sample_patient = {
        "gender": "Male",
        "age": 75.0,
        "hypertension": 1,
        "heart_disease": 1,
        "ever_married": "Yes",
        "work_type": "Private",
        "Residence_type": "Urban",
        "avg_glucose_level": 221.29,
        "bmi": 36.6,
        "smoking_status": "smokes"
    }

    print("Testing Classical Stroke Risk Prediction:")
    res_class = predict_stroke_risk(sample_patient)
    print(format_prediction_output(res_class))

    print("\nTesting Quantum Stroke Risk Prediction:")
    res_quant = predict_stroke_risk_quantum(sample_patient)
    print(res_quant)
