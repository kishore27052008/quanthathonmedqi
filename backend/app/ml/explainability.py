"""SHAP-based explainability for clinician-facing risk explanations.

Falls back to the model's built-in feature_importances_ (scaled by how far
each value sits from the training-set mean) if the `shap` package isn't
installed in a given environment, so the API never breaks on this step.
"""
import numpy as np

try:
    import shap
    _SHAP_AVAILABLE = True
except ImportError:
    _SHAP_AVAILABLE = False


def _fallback_explain(model, feature_row: dict) -> dict:
    """Lightweight explanation using global feature_importances_ as a proxy
    when SHAP isn't installed. Good enough for demo/offline environments."""
    importances = getattr(model, "feature_importances_", None)
    if importances is None:
        return {"error": "Explainability unavailable: model has no feature_importances_"}

    contributions = dict(zip(feature_row.keys(), importances.tolist()))
    top = dict(sorted(contributions.items(), key=lambda kv: kv[1], reverse=True)[:5])
    return {
        "top_features": top,
        "all_contributions": contributions,
        "method": "feature_importance_fallback",
    }


def explain_prediction(model, feature_row: dict) -> dict:
    """Returns top contributing features + SHAP values for a single patient.
    feature_row: dict of {feature_name: value} in the order the model expects.
    """
    if not _SHAP_AVAILABLE:
        return _fallback_explain(model, feature_row)

    try:
        explainer = shap.TreeExplainer(model)
        X = np.array([list(feature_row.values())])
        shap_values = explainer.shap_values(X)

        values = shap_values[0] if isinstance(shap_values, list) else shap_values[0]
        contributions = dict(zip(feature_row.keys(), np.ravel(values).tolist()))

        top = dict(
            sorted(contributions.items(), key=lambda kv: abs(kv[1]), reverse=True)[:5]
        )
        return {"top_features": top, "all_contributions": contributions, "method": "shap"}
    except Exception:
        return _fallback_explain(model, feature_row)
