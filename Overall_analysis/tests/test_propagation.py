"""Unit tests for overall_risk_analysis risk propagation engine.

Tests risk propagation across 3 synthetic patient profiles:
1. Low Risk Patient Profile
2. Moderate Risk / Single Dominant Pathway Patient Profile
3. High Risk / Multiple Interacting Pathways Patient Profile
"""

import unittest
from overall_risk_analysis.risk_graph import load_graph, get_active_edges
from overall_risk_analysis.propagation import propagate_risk


class TestRiskPropagationEngine(unittest.TestCase):

    def setUp(self):
        self.graph = load_graph()

    def test_graph_loading(self):
        """Verify clinical graph loads correctly with nodes and edges."""
        self.assertIn("nodes", self.graph)
        self.assertIn("edges", self.graph)
        self.assertEqual(len(self.graph["nodes"]), 5)
        self.assertGreaterEqual(len(self.graph["edges"]), 10)

    def test_low_risk_patient(self):
        """Synthetic Profile 1: Low Risk Patient (all prior risks < 0.20).
        
        Expected: Zero active pathways, posteriors equal priors, low integrated risk score.
        """
        priors = {
            "gdm": 0.05,
            "preeclampsia": 0.04,
            "stroke": 0.03,
            "ckd": 0.05,
            "cad": 0.06
        }
        res = propagate_risk(priors, graph=self.graph, activation_threshold=0.20)
        
        self.assertIn("integrated_risk_score", res)
        self.assertLess(res["integrated_risk_score"], 22.0)
        self.assertEqual(len(res["cross_disease_interactions"]), 0)
        
        for k, v in priors.items():
            self.assertAlmostEqual(res["posteriors"][k], v, places=4)

    def test_moderate_risk_single_pathway(self):
        """Synthetic Profile 2: Moderate Risk Patient with Single Dominant Pathway (CAD = 0.70).
        
        Expected: Active CAD -> Stroke and CAD -> CKD pathways, amplifying Stroke and CKD risks.
        """
        priors = {
            "gdm": 0.05,
            "preeclampsia": 0.05,
            "stroke": 0.10,
            "ckd": 0.10,
            "cad": 0.70
        }
        res = propagate_risk(priors, graph=self.graph, activation_threshold=0.20)
        
        self.assertGreater(res["integrated_risk_score"], 70.0)
        
        active_targets = [item["target"] for item in res["cross_disease_interactions"]]
        self.assertIn("stroke", active_targets)
        self.assertIn("ckd", active_targets)
        
        # Verify CAD amplified Stroke and CKD posterior risks above base priors
        self.assertGreater(res["posteriors"]["stroke"], priors["stroke"])
        self.assertGreater(res["posteriors"]["ckd"], priors["ckd"])

    def test_high_risk_multiple_interacting_pathways(self):
        """Synthetic Profile 3: High Risk Patient with Multiple Interacting Pathways (GDM = 0.80, Preeclampsia = 0.75).
        
        Expected: Multi-pathway activation (GDM & Preeclampsia amplifying CAD, CKD, Stroke),
        resulting in high integrated risk score (> 95.0) and substantial posterior risk amplification.
        """
        priors = {
            "gdm": 0.80,
            "preeclampsia": 0.75,
            "stroke": 0.15,
            "ckd": 0.15,
            "cad": 0.25
        }
        res = propagate_risk(priors, graph=self.graph, activation_threshold=0.20)
        
        self.assertGreater(res["integrated_risk_score"], 95.0)
        self.assertGreaterEqual(len(res["cross_disease_interactions"]), 5)
        
        sources = {item["source"] for item in res["cross_disease_interactions"]}
        self.assertIn("gdm", sources)
        self.assertIn("preeclampsia", sources)
        
        # CAD, CKD, Stroke should show amplified posterior risks
        self.assertGreater(res["posteriors"]["cad"], priors["cad"])
        self.assertGreater(res["posteriors"]["ckd"], priors["ckd"])
        self.assertGreater(res["posteriors"]["stroke"], priors["stroke"])

    def test_edge_case_zero_priors(self):
        """Edge case: All zero prior probabilities."""
        priors = {"gdm": 0.0, "preeclampsia": 0.0, "stroke": 0.0, "ckd": 0.0, "cad": 0.0}
        res = propagate_risk(priors, graph=self.graph)
        self.assertEqual(res["integrated_risk_score"], 0.0)
        self.assertEqual(len(res["cross_disease_interactions"]), 0)

    def test_alias_and_percentage_handling(self):
        """Robustness test: Check key aliases and percentage input values (0-100)."""
        priors = {
            "GDM": 80.0,  # percentage
            "pcm": 75.0,  # alias for preeclampsia
            "stroke": 0.15,
            "ckd_risk": 0.15,
            "coronary_artery_disease": 0.25
        }
        res = propagate_risk(priors, graph=self.graph)
        self.assertAlmostEqual(res["priors"]["gdm"], 0.80, places=2)
        self.assertAlmostEqual(res["priors"]["preeclampsia"], 0.75, places=2)
        self.assertGreater(res["integrated_risk_score"], 95.0)


if __name__ == "__main__":
    unittest.main()
