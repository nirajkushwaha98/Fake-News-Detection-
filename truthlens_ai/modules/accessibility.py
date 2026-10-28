"""
TruthLens AI - Accessibility Module
Formats audio descriptions and text-to-speech scripts for visually impaired users.
Ensures screen-reader and voice synthesis reads:
  1. Category & Prediction / Assessment
  2. Risk score & tier
  3. Reason (Why this result)
  4. Evidence findings
  5. Actionable guidance for user
"""

import re
from typing import Dict, Any

class AccessibilityFormatter:
    def format_read_aloud_script(self, analysis_result: Dict[str, Any]) -> str:
        """
        Generates a clear, audible, well-paced script for Text-to-Speech synthesis.
        """
        assessment = analysis_result.get("assessment", "Analysis complete")
        risk_score = analysis_result.get("risk_score", 0)
        tier = analysis_result.get("tier", "")
        category = analysis_result.get("category", "")
        confidence = analysis_result.get("confidence_score")
        reasons = analysis_result.get("why_reasons", [])
        extracted_claim = analysis_result.get("extracted_claim", "")
        evidence_message = analysis_result.get("evidence_summary", "")
        actionable = analysis_result.get("actionable_guidance", [])

        script_parts = [
            "TruthLens AI verification summary."
        ]

        if category:
            script_parts.append(f"Domain category: {category}.")

        script_parts.append(
            f"Assessment: {assessment}. Misinformation risk score is {risk_score} out of 100, classified as {tier}."
        )

        if confidence:
            script_parts.append(f"Confidence score is {confidence} percent.")

        if extracted_claim:
            script_parts.append(f"Identified core claim: \"{extracted_claim}\".")

        if reasons:
            clean_reasons = []
            for r in reasons:
                c = re.sub(r'^[⚠️✓ℹ️]\s*', '', r)
                clean_reasons.append(c)
            script_parts.append("Key reasons for this assessment: " + "; ".join(clean_reasons) + ".")

        if actionable:
            clean_action = [re.sub(r'^[🚫🩺🛡️🔍⚠️✅📖]\s*', '', a) for a in actionable]
            script_parts.append("Recommended action: " + "; ".join(clean_action) + ".")

        if evidence_message:
            script_parts.append(f"Evidence status: {evidence_message}")

        script_parts.append("TruthLens reminder: Not finding evidence does not by itself prove that a claim is false.")

        return " ".join(script_parts)

if __name__ == "__main__":
    formatter = AccessibilityFormatter()
    demo = {
        "assessment": "High Misinformation Risk",
        "risk_score": 78,
        "tier": "HIGH RISK",
        "category": "Health & Medical",
        "confidence_score": 92,
        "why_reasons": ["⚠️ Sensational wording detected", "⚠️ Medical records contradict this claim"],
        "actionable_guidance": ["🚫 Do not forward this claim on social media."],
        "extracted_claim": "Drinking boiled lemon water cures cancer overnight",
        "evidence_summary": "Located 2 records: Conflicting evidence found."
    }
    print(formatter.format_read_aloud_script(demo))
