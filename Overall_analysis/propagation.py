"""Risk Propagation Engine for overall risk analysis.

Propagates disease risk probabilities across clinical interaction graph edges to compute
posterior risk distributions and integrated risk score.
"""

from typing import Dict, List, Optional
from .risk_graph import load_graph, get_active_edges

DISEASE_KEYS = ["gdm", "preeclampsia", "stroke", "ckd", "cad"]

KEY_ALIASES = {
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


def _normalize_priors(priors: Dict[str, float]) -> Dict[str, float]:
    """Normalize input prior dictionary keys and constrain values to [0.0, 1.0]."""
    normalized = {k: 0.0 for k in DISEASE_KEYS}
    
    for key, raw_val in priors.items():
        clean_key = str(key).strip().lower()
        canonical_key = KEY_ALIASES.get(clean_key, clean_key)
        if canonical_key in normalized:
            try:
                val = float(raw_val)
                # If percentage passed (e.g. 85.0 instead of 0.85), convert to [0, 1]
                if val > 1.0 and val <= 100.0:
                    val = val / 100.0
                normalized[canonical_key] = max(0.0, min(1.0, val))
            except (ValueError, TypeError):
                continue

    return normalized


def propagate_risk(
    priors: Dict[str, float],
    graph: Optional[Dict] = None,
    activation_threshold: float = 0.20
) -> Dict:
    """Propagate prior disease risk probabilities across interaction graph edges.
    
    TUNABLE HYPERPARAMETER NOTICE:
    ------------------------------
    activation_threshold (default: 0.20) is a tunable mathematical parameter, NOT a fixed clinical constant.
    It determines the lower-bound prior probability at which cross-disease graph pathways activate.
    
    PLACEHOLDER MULTIPLIER NOTICE:
    ------------------------------
    Relative risk multipliers in graph edges are structural placeholders tagged with
    '# TODO: needs clinical literature citation'. The propagation engine evaluates directional risk
    flow dynamics using these parameters rather than treating them as authoritative clinical constants.
    
    Parameters
    ----------
    priors : dict
        Dict mapping disease names (e.g., 'gdm', 'preeclampsia', 'stroke', 'ckd', 'cad') to probabilities (0.0 - 1.0).
    graph : dict, optional
        Interaction graph object. Defaults to loaded interaction_graph.json if None.
    activation_threshold : float, optional
        Tunable prior probability threshold required to trigger pathway amplification (default: 0.20).
        
    Returns
    -------
    dict
        Contains:
        - 'integrated_risk_score': float (0.0 to 100.0)
        - 'posteriors': dict mapping condition to updated probability
        - 'priors': normalized input prior probabilities
        - 'cross_disease_interactions': list of active interaction details and explanations
    """
    if graph is None:
        graph = load_graph()
        
    norm_priors = _normalize_priors(priors)
    active_edges = get_active_edges(norm_priors, threshold=activation_threshold, graph=graph)
    
    # Initialize posteriors with priors
    posteriors = {k: norm_priors[k] for k in DISEASE_KEYS}
    
    cross_interactions = []
    
    # Calculate propagation effects
    for edge in active_edges:
        src = edge["source"].lower()
        tgt = edge["target"].lower()
        multiplier = float(edge["relative_risk_multiplier"])
        mechanism = edge["mechanism"]
        src_risk = norm_priors[src]
        
        # Calculate incremental risk amplification boost on target node
        amplification_factor = multiplier - 1.0
        current_target_risk = posteriors[tgt]
        risk_boost = src_risk * amplification_factor * (1.0 - current_target_risk)
        
        posteriors[tgt] = min(1.0, posteriors[tgt] + risk_boost)
        
        explanation = (
            f"{src.upper()} risk ({src_risk * 100.0:.1f}%) amplifies {tgt.upper()} risk "
            f"via {mechanism} (relative risk multiplier: {multiplier:.2f}x)."
        )
        
        cross_interactions.append({
            "source": src,
            "target": tgt,
            "source_risk": round(src_risk, 4),
            "multiplier": multiplier,
            "mechanism": mechanism,
            "explanation": explanation
        })
        
    # Calculate integrated multi-system risk score (0 to 100 scale)
    # Composite probability of system failure / non-event survival product formula
    survival_prod = 1.0
    for disease in DISEASE_KEYS:
        survival_prod *= (1.0 - posteriors[disease])
        
    integrated_risk_score = round((1.0 - survival_prod) * 100.0, 2)
    
    return {
        "integrated_risk_score": integrated_risk_score,
        "posteriors": {k: round(v, 4) for k, v in posteriors.items()},
        "priors": {k: round(v, 4) for k, v in norm_priors.items()},
        "cross_disease_interactions": cross_interactions
    }
