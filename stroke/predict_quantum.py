import os
import joblib
import pandas as pd

from qiskit.circuit.library import ZZFeatureMap
from qiskit.primitives import StatevectorSampler as Sampler
from qiskit_machine_learning.state_fidelities import ComputeUncompute
from qiskit_machine_learning.kernels import FidelityQuantumKernel


def get_risk_category(risk_prob):
    """Categorize risk percentage into low, medium, high, veryhigh."""
    risk_pct = risk_prob * 100
    if risk_pct < 25.0:
        return "low"
    elif risk_pct < 50.0:
        return "medium"
    elif risk_pct < 75.0:
        return "high"
    else:
        return "veryhigh"


def _build_quantum_kernel(bundle):
    """Rebuild the same quantum kernel object used at training time."""
    feature_map = ZZFeatureMap(feature_dimension=bundle['n_qubits'], reps=bundle['feature_map_reps'])
    fidelity = ComputeUncompute(sampler=Sampler())
    return FidelityQuantumKernel(feature_map=feature_map, fidelity=fidelity)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class QuantumStrokePredictor:
    """Pre-loaded predictor class for FastAPI and production service integration."""
    def __init__(self, preprocessor_path=None, quantum_model_path=None):
        if preprocessor_path is None:
            preprocessor_path = os.path.join(BASE_DIR, 'models', 'preprocessing_pipeline.pkl')
        if quantum_model_path is None:
            quantum_model_path = os.path.join(BASE_DIR, 'models', 'quantum_kernel_svm.pkl')

        if isinstance(preprocessor_path, str):
            if not os.path.exists(preprocessor_path):
                raise FileNotFoundError(f"Preprocessor not found: {preprocessor_path}")
            self.pipeline_obj = joblib.load(preprocessor_path)
        else:
            self.pipeline_obj = preprocessor_path

        if isinstance(quantum_model_path, str):
            if not os.path.exists(quantum_model_path):
                raise FileNotFoundError(f"Quantum model not found: {quantum_model_path}")
            self.bundle = joblib.load(quantum_model_path)
        else:
            self.bundle = quantum_model_path

        self.preprocessor = self.pipeline_obj['preprocessor']
        self.feature_names = self.pipeline_obj['feature_names']
        self.svm = self.bundle['svm_model']
        self.scaler = self.bundle['scaler']
        self.selected_features = self.bundle['selected_features']
        self.X_train_scaled = self.bundle['X_train_scaled']
        self.quantum_kernel = _build_quantum_kernel(self.bundle)

    def predict(self, sample_data):
        if isinstance(sample_data, dict):
            sample_df = pd.DataFrame([sample_data])
        elif isinstance(sample_data, pd.DataFrame):
            sample_df = sample_data.copy()
        else:
            raise ValueError("Input sample_data must be a dictionary or pandas DataFrame.")

        for col in ['id', 'stroke', 'target']:
            if col in sample_df.columns:
                sample_df = sample_df.drop(columns=[col])

        for col in ('bmi', 'age', 'avg_glucose_level'):
            if col in sample_df.columns:
                sample_df[col] = pd.to_numeric(sample_df[col], errors='coerce')

        X_full = self.preprocessor.transform(sample_df)
        idx = [self.feature_names.index(f) for f in self.selected_features]
        X_q = X_full[:, idx]
        X_scaled = self.scaler.transform(X_q)
        K_new = self.quantum_kernel.evaluate(x_vec=X_scaled, y_vec=self.X_train_scaled)
        probabilities = self.svm.predict_proba(K_new)[:, 1]

        results = []
        for prob in probabilities:
            pct = round(float(prob) * 100, 2)
            cat = get_risk_category(prob)
            results.append({
                'risk_percentage': f"{pct}%",
                'risk_category': cat
            })
        return results if len(results) > 1 else results[0]


def predict_stroke_risk_quantum(sample_data, preprocessor_path=None, quantum_model_path=None):
    predictor = QuantumStrokePredictor(preprocessor_path, quantum_model_path)
    return predictor.predict(sample_data)


if __name__ == '__main__':
    # Demonstration on test sample patients
    print("Testing Stroke Risk Prediction Function (Quantum Kernel SVM)...")

    sample_low = {
        'gender': 'Female', 'age': 32, 'hypertension': 0, 'heart_disease': 0,
        'ever_married': 'No', 'work_type': 'Private', 'Residence_type': 'Urban',
        'avg_glucose_level': 85.0, 'bmi': 22.5, 'smoking_status': 'never smoked'
    }

    sample_high = {
        'gender': 'Male', 'age': 75, 'hypertension': 1, 'heart_disease': 1,
        'ever_married': 'Yes', 'work_type': 'Private', 'Residence_type': 'Urban',
        'avg_glucose_level': 221.29, 'bmi': 36.6, 'smoking_status': 'smokes'
    }

    res1 = predict_stroke_risk_quantum(sample_low)
    res2 = predict_stroke_risk_quantum(sample_high)

    print("\nPatient 1 Prediction (Low Risk Profile):")
    print(f"  Risk Percentage : {res1['risk_percentage']}")
    print(f"  Risk Category   : {res1['risk_category']}")

    print("\nPatient 2 Prediction (High Risk Profile):")
    print(f"  Risk Percentage : {res2['risk_percentage']}")
    print(f"  Risk Category   : {res2['risk_category']}")
