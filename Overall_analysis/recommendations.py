"""Preventive Recommendations Layer for Overall Risk Analysis.

Extensible rule-based lookup table mapping active interaction pathways and high-risk disease states
to evidence-based preventive recommendations and clinical insights.
"""

import json
import os
from typing import Dict, List, Optional, Any

DEFAULT_RECOMMENDATIONS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "recommendations.json")


def load_recommendations_catalog(json_path: Optional[str] = None) -> Dict[str, Any]:
    """Load the preventive recommendations lookup table from JSON file.
    
    Parameters
    ----------
    json_path : str, optional
        Path to recommendations JSON file. Defaults to recommendations.json in package dir.
        
    Returns
    -------
    dict
        Dictionary containing 'pathway_recommendations' and 'high_risk_disease_recommendations'.
    """
    path = json_path or DEFAULT_RECOMMENDATIONS_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Recommendations lookup catalog not found at: {path}")
        
    with open(path, "r", encoding="utf-8") as f:
        catalog = json.load(f)
        
    return catalog


def generate_recommendations(
    active_interactions: List[Dict[str, Any]],
    posteriors: Dict[str, float],
    catalog: Optional[Dict[str, Any]] = None,
    high_risk_threshold: float = 0.50
) -> List[Dict[str, Any]]:
    """Generate structured, pathway-specific preventive clinical recommendations.
    
    Parameters
    ----------
    active_interactions : list of dict
        List of active cross-disease interaction dicts (from propagate_risk).
    posteriors : dict
        Updated posterior risk probabilities for the 5 disease nodes.
    catalog : dict, optional
        Loaded recommendations catalog. Loaded automatically if None.
    high_risk_threshold : float, optional
        Posterior threshold above which high-risk disease recommendations trigger (default: 0.50).
        
    Returns
    -------
    list of dict
        Deduplicated list of recommendation objects with title, pathway/disease, mechanism, and recommendations.
    """
    if catalog is None:
        catalog = load_recommendations_catalog()
        
    pathway_map = catalog.get("pathway_recommendations", {})
    high_risk_map = catalog.get("high_risk_disease_recommendations", {})
    
    recommendations_list = []
    seen_titles = set()
    
    # 1. Match Active Cross-Disease Interaction Pathways
    for interaction in active_interactions:
        src = interaction.get("source", "").lower()
        tgt = interaction.get("target", "").lower()
        key = f"{src}->{tgt}"
        
        if key in pathway_map:
            rec_obj = pathway_map[key]
            title = rec_obj.get("title", f"{src.upper()} to {tgt.upper()} Management")
            
            if title not in seen_titles:
                seen_titles.add(title)
                recommendations_list.append({
                    "category": "Pathway-Specific Risk Management",
                    "title": title,
                    "pathway": rec_obj.get("pathway", f"{src.upper()} -> {tgt.upper()}"),
                    "mechanism": rec_obj.get("mechanism", interaction.get("mechanism", "")),
                    "recommendations": rec_obj.get("recommendations", [])
                })

    # 2. Match High-Risk Individual Diseases (Posterior >= 0.50)
    for disease_code, posterior_val in posteriors.items():
        disease_clean = str(disease_code).lower()
        if posterior_val >= high_risk_threshold and disease_clean in high_risk_map:
            title = f"High Risk Management for {disease_clean.upper()}"
            if title not in seen_titles:
                seen_titles.add(title)
                recommendations_list.append({
                    "category": "High Disease Risk Alert",
                    "title": title,
                    "pathway": f"Standalone {disease_clean.upper()} High Risk ({posterior_val*100.0:.1f}%)",
                    "mechanism": "Elevated Individual Model Risk Score",
                    "recommendations": high_risk_map[disease_clean]
                })

    return recommendations_list
