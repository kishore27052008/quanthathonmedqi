"""Disease Interaction Graph module for overall risk analysis.

Encodes clinical relationships between GDM, Preeclampsia, Stroke, CKD, and CAD
as a directed, weighted graph.
"""

import json
import os
from typing import Dict, List, Optional

DEFAULT_GRAPH_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "interaction_graph.json")


def load_graph(json_path: Optional[str] = None) -> Dict:
    """Load clinical interaction graph from a JSON file.
    
    Parameters
    ----------
    json_path : str, optional
        Path to graph JSON file. If None, loads default interaction_graph.json.
        
    Returns
    -------
    dict
        Graph representation containing 'nodes' and 'edges'.
    """
    path = json_path or DEFAULT_GRAPH_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Interaction graph file not found at: {path}")
        
    with open(path, "r", encoding="utf-8") as f:
        graph = json.load(f)
        
    return graph


def get_active_edges(priors: Dict[str, float], threshold: float = 0.20, graph: Optional[Dict] = None) -> List[Dict]:
    """Identify graph edges where the source condition's prior risk exceeds activation threshold.
    
    TUNABLE HYPERPARAMETER NOTICE:
    ------------------------------
    `threshold` (default: 0.20) is a tunable algorithm hyperparameter, NOT a fixed clinical constant.
    It defines the lower-bound prior probability required to activate cross-disease graph pathways.
    
    PLACEHOLDER MULTIPLIER NOTICE:
    ------------------------------
    Edge multipliers loaded from interaction_graph.json are structural placeholders tagged for
    clinical literature review ('# TODO: needs clinical literature citation'). They are used to
    demonstrate propagation dynamics rather than serving as finalized clinical weights.
    
    Parameters
    ----------
    priors : dict
        Prior risk probabilities (0.0 to 1.0) keyed by disease name (e.g., 'gdm', 'cad').
    threshold : float, optional
        Tunable threshold for triggering edge activation (default: 0.20).
    graph : dict, optional
        Graph dictionary. Loaded automatically if None.
        
    Returns
    -------
    list of dict
        List of active edge dictionaries containing source, target, mechanism, relative_risk_multiplier,
        and current source prior risk.
    """
    if graph is None:
        graph = load_graph()
        
    # Standardize prior keys to lowercase
    norm_priors = {str(k).lower(): float(v) for k, v in priors.items()}
    
    active_edges = []
    for edge in graph.get("edges", []):
        src = edge["source"].lower()
        src_risk = norm_priors.get(src, 0.0)
        
        if src_risk >= threshold:
            active_edge = dict(edge)
            active_edge["source_risk"] = src_risk
            active_edges.append(active_edge)
            
    return active_edges
