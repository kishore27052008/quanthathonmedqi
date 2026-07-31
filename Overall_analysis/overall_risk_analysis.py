"""Orchestrator for Overall Risk Analysis module.

Provides single public entry point: analyze_overall_risk(patient_probabilities: dict) -> dict
No backend, database, or API dependencies -- pure Python computation ready for backend integration.
"""

from typing import Dict, List, Any, Optional
from .propagation import propagate_risk, DISEASE_KEYS
from .quantum_optimizer import solve_risk_qubo
from .recommendations import generate_recommendations

ALIAS_MAP = {
    "gdm": "gdm",
    "gestational_diabetes": "gdm",
    "preeclampsia": "preeclampsia",
    "pcm": "preeclampsia",
    "stroke": "stroke",
    "stroke_risk": "stroke",
    "ckd": "ckd",
    "ckd_risk": "ckd",
    "chronic_kidney_disease": "ckd",
    "cad": "cad",
    "cad_risk": "cad",
    "coronary_artery_disease": "cad",
    "heart_disease": "cad"
}


def analyze_overall_risk(
    patient_probabilities: Dict[str, Any],
    activation_threshold: float = 0.20,
    run_quantum: bool = True
) -> Dict[str, Any]:
    """Single public entry point for integrated multi-disease risk analysis.
    
    Parameters
    ----------
    patient_probabilities : dict
        Dict with any subset of keys: {'gdm', 'preeclampsia', 'stroke', 'ckd', 'cad'}.
        Missing keys are treated as 'not yet predicted' and excluded from graph propagation,
        not defaulted to 0. Out-of-range values (< 0 or > 100 or non-numeric) raise ValueError.
    activation_threshold : float, optional
        Tunable threshold for edge activation (default: 0.20).
    run_quantum : bool, optional
        Whether to execute QAOA quantum optimization layer (default: True).
        
    Returns
    -------
    dict
        {
            'integrated_risk_score': float (0.0 to 100.0),
            'posteriors': dict mapping disease codes to updated probability,
            'cross_disease_interactions': list of active pathway dicts,
            'quantum_pathway_analysis': dict of QAOA results,
            'recommendations': list of preventive recommendation dicts,
            'missing_predictions': list of disease codes not provided
        }
    """
    if not isinstance(patient_probabilities, dict):
        raise ValueError("patient_probabilities must be a Python dictionary.")

    # 1. Input Validation and Identification of Provided vs Missing Predictions
    provided_priors = {}
    missing_predictions = []

    # Clean and map raw input keys
    raw_keys_clean = {}
    for k, v in patient_probabilities.items():
        clean_k = ALIAS_MAP.get(str(k).strip().lower(), str(k).strip().lower())
        raw_keys_clean[clean_k] = v

    for disease in DISEASE_KEYS:
        if disease in raw_keys_clean and raw_keys_clean[disease] is not None:
            raw_val = raw_keys_clean[disease]
            try:
                val = float(raw_val)
            except (ValueError, TypeError):
                raise ValueError(
                    f"Invalid non-numeric probability value for '{disease}': '{raw_val}'. "
                    "Must be a numeric probability between 0.0 and 1.0 (or 0% to 100%)."
                )
                
            # Strict range validation: must be in [0, 1] or [0, 100]
            if val < 0.0 or val > 100.0:
                raise ValueError(
                    f"Out-of-range probability value for '{disease}': {val}. "
                    "Probability values must be between 0.0 and 1.0 (or 0% to 100%)."
                )
                
            # Normalize percentage input (e.g. 85.0 -> 0.85)
            if val > 1.0 and val <= 100.0:
                val = val / 100.0
                
            provided_priors[disease] = val
        else:
            missing_predictions.append(disease)

    # 2. Run Classical Risk Propagation Engine
    classical_res = propagate_risk(
        priors=provided_priors,
        activation_threshold=activation_threshold
    )

    # 3. Run QAOA Quantum Optimizer Layer
    if run_quantum and provided_priors:
        quantum_res = solve_risk_qubo(
            priors=provided_priors,
            activation_threshold=activation_threshold
        )
    else:
        quantum_res = {
            "dominant_bitstring": "N/A (Disabled or No Priors)",
            "selected_dominant_pathways": [],
            "bitstring_interpretation": "Quantum optimizer was skipped (disabled or no priors provided).",
            "classical_comparison": {},
            "qaoa_runtime_sec": 0.0,
            "fallback_triggered": True,
            "error_message": "Quantum optimizer skipped"
        }

    # 4. Generate Rule-Based Preventive Recommendations
    recommendations_list = generate_recommendations(
        active_interactions=classical_res["cross_disease_interactions"],
        posteriors=classical_res["posteriors"]
    )

    # 5. Assemble Final Unified Output Structure
    return {
        "integrated_risk_score": classical_res["integrated_risk_score"],
        "posteriors": classical_res["posteriors"],
        "cross_disease_interactions": classical_res["cross_disease_interactions"],
        "quantum_pathway_analysis": {
            "dominant_bitstring": quantum_res.get("dominant_bitstring"),
            "selected_dominant_pathways": quantum_res.get("selected_dominant_pathways"),
            "bitstring_interpretation": quantum_res.get("bitstring_interpretation"),
            "qubo_energy": quantum_res.get("qubo_energy"),
            "classical_comparison": quantum_res.get("classical_comparison"),
            "qaoa_runtime_sec": quantum_res.get("qaoa_runtime_sec"),
            "fallback_triggered": quantum_res.get("fallback_triggered")
        },
        "recommendations": recommendations_list,
        "missing_predictions": missing_predictions
    }
