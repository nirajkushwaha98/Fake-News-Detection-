"""
TruthLens AI - Accessibility Module
Formats audio descriptions and text-to-speech scripts for visually impaired users.
Ensures screen-reader and voice synthesis reads:
  1. Prediction / Assessment
  2. Risk score & tier
  3. Reason (Why this result)
  4. Evidence summary
"""

from typing import Dict, Any

class AccessibilityFormatter:
    def format_read_aloud_script(self, analysis_result: Dict[str, Any]) -> str:
        """
        Generates a clear, audible, well-paced script for Text-to-Speech synthesis.
        """
        assessment = analysis_result.get("assessment", "Analysis complete")
        risk_score = analysis_result.get("risk_score", 0)
        tier = analysis_result.get("tier", "")
        reasons = analysis_result.get("why_reasons", [])
        extracted_claim = analysis_result.get("extracted_claim", "")
        evidence_message = analysis_result.get("evidence_summary", "")

        script_parts = [
            f"TruthLens AI verification summary.",
            f"Assessment: {assessment}. Misinformation risk score is {risk_score} out of 100, which falls into the {tier} category."
        ]

        if extracted_claim:
            script_parts.append(f"Identified core claim: {extracted_claim}.")

        if reasons:
            clean_reasons = [r.replace("⚠️", "Warning:").replace("✓", "Positive signal:") for r in reasons]
            script_parts.append("Key reasons for this assessment: " + "; ".join(clean_reasons) + ".")

        if evidence_message:
            script_parts.append(f"Evidence findings: {evidence_message}")

        script_parts.append("TruthLens reminder: Not finding evidence does not by itself prove that a claim is false.")

        return " ".join(script_parts)

if __name__ == "__main__":
    formatter = AccessibilityFormatter()
    demo = {
        "assessment": "High Misinformation Risk",
        "risk_score": 78,
        "tier": "HIGH RISK",
        "why_reasons": ["⚠️ Sensational wording detected", "⚠️ Claim lacks supporting evidence"],
        "extracted_claim": "Drinking boiled lemon water cures cancer overnight",
        "evidence_summary": "Medical records contradict this claim."
    }
    print(formatter.format_read_aloud_script(demo))
