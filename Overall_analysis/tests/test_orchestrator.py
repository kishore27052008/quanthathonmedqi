"""Unit tests for analyze_overall_risk orchestrator.

Tests:
1. Full input profile with all 5 disease probabilities provided.
2. Partial input profile with missing predictions (verifying missing_predictions list and exclusion).
3. Recommendation list generation for active pathways and high-risk posteriors.
"""

import unittest
from overall_risk_analysis import analyze_overall_risk


class TestOrchestrator(unittest.TestCase):

    def test_full_patient_profile(self):
        """Test orchestrator with all 5 disease probabilities provided."""
        priors = {
            "gdm": 0.83,
            "preeclampsia": 0.10,
            "stroke": 0.18,
            "ckd": 0.99,
            "cad": 0.17
        }
        res = analyze_overall_risk(priors, run_quantum=True)
        
        self.assertIn("integrated_risk_score", res)
        self.assertIn("cross_disease_interactions", res)
        self.assertIn("quantum_pathway_analysis", res)
        self.assertIn("recommendations", res)
        self.assertIn("missing_predictions", res)
        
        self.assertEqual(len(res["missing_predictions"]), 0)
        self.assertGreater(res["integrated_risk_score"], 90.0)
        self.assertGreater(len(res["recommendations"]), 0)

    def test_partial_patient_profile(self):
        """Test orchestrator with missing predictions (e.g. only GDM and CAD provided).
        
        Expected: Missing predictions list contains ['preeclampsia', 'stroke', 'ckd'].
        Missing diseases excluded from graph propagation sources.
        """
        priors = {
            "gdm": 0.80,
            "cad": 0.70
        }
        res = analyze_overall_risk(priors, run_quantum=True)
        
        self.assertIn("preeclampsia", res["missing_predictions"])
        self.assertIn("stroke", res["missing_predictions"])
        self.assertIn("ckd", res["missing_predictions"])
        self.assertNotIn("gdm", res["missing_predictions"])
        self.assertNotIn("cad", res["missing_predictions"])
        
        self.assertEqual(len(res["missing_predictions"]), 3)
        self.assertGreater(res["integrated_risk_score"], 70.0)
        
        # Verify GDM -> CAD interaction triggered
        interactions = res["cross_disease_interactions"]
        self.assertTrue(any(item["source"] == "gdm" and item["target"] == "cad" for item in interactions))

    def test_empty_patient_profile(self):
        """Test orchestrator with empty input dictionary."""
        res = analyze_overall_risk({}, run_quantum=True)
        
        self.assertEqual(len(res["missing_predictions"]), 5)
        self.assertEqual(res["integrated_risk_score"], 0.0)
        self.assertEqual(len(res["cross_disease_interactions"]), 0)
        self.assertEqual(len(res["recommendations"]), 0)


if __name__ == "__main__":
    unittest.main()
