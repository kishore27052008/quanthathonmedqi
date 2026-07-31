"""Integration Test Suite for overall_risk_analysis module (Step 3).

Covers:
1. All five disease probabilities provided.
2. Only 1-2 disease probabilities provided (partial screening).
3. All-zero risk patient profile.
4. All-high risk patient profile.
5. Malformed input validation (out-of-range or non-numeric probability values -> raises ValueError).
6. Pregnancy-specific edge case (high GDM + Preeclampsia, others absent).
"""

import unittest
from overall_risk_analysis import analyze_overall_risk


class TestOverallRiskAnalysisIntegration(unittest.TestCase):

    def test_scenario_1_all_five_provided(self):
        """Scenario 1: All five disease probabilities provided."""
        patient_probs = {
            "gdm": 0.83,
            "preeclampsia": 0.10,
            "stroke": 0.18,
            "ckd": 0.99,
            "cad": 0.17
        }
        res = analyze_overall_risk(patient_probs, run_quantum=True)
        
        self.assertEqual(len(res["missing_predictions"]), 0)
        self.assertGreater(res["integrated_risk_score"], 90.0)
        self.assertGreater(len(res["cross_disease_interactions"]), 0)
        self.assertFalse(res["quantum_pathway_analysis"]["fallback_triggered"])
        self.assertGreater(len(res["recommendations"]), 0)

    def test_scenario_2_partial_1_to_2_provided(self):
        """Scenario 2: Only 1-2 probabilities provided (e.g., GDM and CAD)."""
        patient_probs = {
            "gdm": 0.75,
            "cad": 0.60
        }
        res = analyze_overall_risk(patient_probs, run_quantum=True)
        
        self.assertEqual(len(res["missing_predictions"]), 3)
        self.assertIn("preeclampsia", res["missing_predictions"])
        self.assertIn("stroke", res["missing_predictions"])
        self.assertIn("ckd", res["missing_predictions"])
        self.assertNotIn("gdm", res["missing_predictions"])
        self.assertNotIn("cad", res["missing_predictions"])
        self.assertGreater(res["integrated_risk_score"], 70.0)

    def test_scenario_3_all_zero_risk(self):
        """Scenario 3: All-zero risk patient profile."""
        patient_probs = {
            "gdm": 0.0,
            "preeclampsia": 0.0,
            "stroke": 0.0,
            "ckd": 0.0,
            "cad": 0.0
        }
        res = analyze_overall_risk(patient_probs, run_quantum=True)
        
        self.assertEqual(res["integrated_risk_score"], 0.0)
        self.assertEqual(len(res["cross_disease_interactions"]), 0)
        self.assertEqual(len(res["recommendations"]), 0)
        self.assertEqual(res["quantum_pathway_analysis"]["dominant_bitstring"], "00000")

    def test_scenario_4_all_high_risk(self):
        """Scenario 4: All-high risk patient profile (all priors > 0.85)."""
        patient_probs = {
            "gdm": 0.95,
            "preeclampsia": 0.90,
            "stroke": 0.85,
            "ckd": 0.99,
            "cad": 0.92
        }
        res = analyze_overall_risk(patient_probs, run_quantum=True)
        
        self.assertAlmostEqual(res["integrated_risk_score"], 100.0, delta=0.5)
        self.assertGreaterEqual(len(res["cross_disease_interactions"]), 6)
        self.assertGreaterEqual(len(res["recommendations"]), 5)

    def test_scenario_5_malformed_input_validation(self):
        """Scenario 5: Malformed input validation (out-of-range or non-numeric probabilities).
        
        Expected: Clear ValueError raised, never proceeding silently.
        """
        # Out-of-range negative
        with self.assertRaises(ValueError) as ctx_neg:
            analyze_overall_risk({"gdm": -0.5, "cad": 0.50})
        self.assertIn("Out-of-range", str(ctx_neg.exception))

        # Out-of-range > 100%
        with self.assertRaises(ValueError) as ctx_high:
            analyze_overall_risk({"gdm": 150.0, "cad": 0.50})
        self.assertIn("Out-of-range", str(ctx_high.exception))

        # Non-numeric string
        with self.assertRaises(ValueError) as ctx_str:
            analyze_overall_risk({"gdm": "high_risk", "cad": 0.50})
        self.assertIn("Invalid non-numeric", str(ctx_str.exception))

    def test_scenario_6_pregnancy_specific_edge_case(self):
        """Scenario 6: Pregnancy-specific edge case (high GDM + Preeclampsia, others absent).
        
        Expected:
        - missing_predictions contains ['stroke', 'ckd', 'cad'].
        - GDM <-> Preeclampsia pathway activated.
        - Downstream CAD/CKD posteriors updated via propagation.
        - Pregnancy-specific preventive recommendations (postpartum OGTT, aspirin, BP monitoring) generated.
        """
        patient_probs = {
            "gdm": 0.85,
            "preeclampsia": 0.80
        }
        res = analyze_overall_risk(patient_probs, run_quantum=True)
        
        # Missing predictions check
        self.assertEqual(set(res["missing_predictions"]), {"stroke", "ckd", "cad"})
        
        # Pathway activation check
        interactions = res["cross_disease_interactions"]
        sources = {item["source"] for item in interactions}
        self.assertIn("gdm", sources)
        self.assertIn("preeclampsia", sources)
        
        # Verify GDM -> CAD and Preeclampsia -> CAD propagation occurred
        self.assertGreater(res["posteriors"]["cad"], 0.0)
        self.assertGreater(res["posteriors"]["ckd"], 0.0)
        
        # Verify pregnancy-specific recommendations present
        rec_titles = [r["title"] for r in res["recommendations"]]
        self.assertTrue(any("GDM" in title or "Preeclampsia" in title for title in rec_titles))


if __name__ == "__main__":
    unittest.main()
