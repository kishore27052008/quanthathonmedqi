"""
Quantum-assisted feature optimization layer (PennyLane / Qiskit).
Used offline during model training for feature selection & hyperparameter
tuning per the architecture diagram. Exposed here as a thin wrapper so the
API layer can report which features were quantum-optimized for a given
domain's active model (metadata only — this does NOT run quantum circuits
per-request in the hot prediction path).
"""
from app.ml.model_loader import get_expected_features


def get_quantum_optimization_metadata(domain: str) -> dict:
    features = get_expected_features(domain)
    return {
        "backend": "pennylane.default_qubit / qiskit_aer",
        "optimized_feature_count": len(features),
        "note": (
            "Quantum feature selection & model-parameter optimization is "
            "performed during offline training. This endpoint surfaces "
            "metadata for transparency in the clinician dashboard."
        ),
    }
