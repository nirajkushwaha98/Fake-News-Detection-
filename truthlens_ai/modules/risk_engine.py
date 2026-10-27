"""
TruthLens AI - Misinformation Risk Engine
Calculates transparent 0-100 composite risk score with weighted breakdown:
  - Text Signals: 30%
  - Evidence Cross-Check: 30%
  - Language Indicators: 20%
  - Source/Context Signals: 20%

Categorizes risk into:
  - LOW RISK (0–30): Potentially Reliable
  - MEDIUM RISK (31–60): Potentially Misleading
  - HIGH RISK (61–100): High Misinformation Risk

Adheres strictly to responsible labeling standards.
"""

from typing import Dict, List, Any

class RiskEngine:
    def compute_risk(
        self,
        linguistic_data: Dict[str, Any],
        evidence_data: Dict[str, Any],
        input_type: str = "text"
    ) -> Dict[str, Any]:
        """
        Computes composite misinformation risk score, assessment tier, and clear explanations.
        """
        sensational_score = linguistic_data.get("sensational_score", 20.0)
        suspicious_words = linguistic_data.get("suspicious_wording", [])
        excessive_punct = linguistic_data.get("excessive_punctuation", False)
        screaming_caps = linguistic_data.get("screaming_caps", False)
        credibility_ind = linguistic_data.get("credibility_indicators", [])

        # 1. Language Indicators (20% weight) -> scale to 0-100
        # Baselines on clickbait, hyperbole, exclamation
        lang_component = sensational_score
        if excessive_punct:
            lang_component = min(100.0, lang_component + 15.0)
        if screaming_caps:
            lang_component = min(100.0, lang_component + 15.0)

        # 2. Evidence Cross-Check (30% weight) -> scale to 0-100
        evidence_found = evidence_data.get("found", False)
        evidence_items = evidence_data.get("items", [])
        
        evidence_component = 50.0 # Neutral baseline
        if evidence_found and evidence_items:
            contradictions = [e for e in evidence_items if e.get("stance") == "Contradicting"]
            supporting = [e for e in evidence_items if e.get("stance") == "Supporting"]
            
            if contradictions:
                evidence_component = 85.0
            elif supporting:
                evidence_component = 15.0
            else:
                evidence_component = 45.0
        else:
            # Uncorroborated claim
            evidence_component = 55.0

        # 3. Text Signals (30% weight)
        # Lexical patterns, anomaly density, length
        word_count = linguistic_data.get("word_count", 20)
        if word_count < 6:
            text_signal_component = 45.0 # Insufficient context
        elif len(suspicious_words) >= 2:
            text_signal_component = 80.0
        elif credibility_ind:
            text_signal_component = 20.0
        else:
            text_signal_component = 40.0

        # 4. Source / Context Signals (20% weight)
        source_component = 50.0
        if "whatsapp" in linguistic_data.get("extracted_claim", "").lower() or "forwarded" in linguistic_data.get("extracted_claim", "").lower():
            source_component = 75.0
        elif credibility_ind:
            source_component = 20.0

        # Composite weighted sum (0-100)
        # Text 30%, Evidence 30%, Language 20%, Source 20%
        composite_score = (
            (text_signal_component * 0.30) +
            (evidence_component * 0.30) +
            (lang_component * 0.20) +
            (source_component * 0.20)
        )

        final_score = int(round(max(5.0, min(95.0, composite_score))))

        # Determine Assessment Tier
        if final_score <= 30:
            assessment = "Potentially Reliable"
            tier = "LOW RISK"
            color = "green"
        elif final_score <= 60:
            assessment = "Potentially Misleading"
            tier = "MEDIUM RISK"
            color = "amber"
        else:
            assessment = "High Misinformation Risk"
            tier = "HIGH RISK"
            color = "red"

        # Construct "Why this result?"
        why_explanations: List[str] = []
        if suspicious_words:
            why_explanations.append(f"⚠️ Sensational wording detected: {', '.join(suspicious_words[:3])}")
        if excessive_punct or screaming_caps:
            why_explanations.append("⚠️ Manufactured urgency through uppercase or excessive exclamation marks")
        
        if evidence_found and evidence_items:
            contradictions = [e for e in evidence_items if e.get("stance") == "Contradicting"]
            supporting = [e for e in evidence_items if e.get("stance") == "Supporting"]
            if contradictions:
                why_explanations.append("⚠️ External encyclopedic and fact-checking records contradict key elements of the claim")
            elif supporting:
                why_explanations.append("✓ Verifiable coverage found corroborating key narrative details")
        else:
            why_explanations.append("⚠️ Submitted claim could not be sufficiently corroborated by established reference sources")

        if credibility_ind:
            why_explanations.append("✓ Sourced institutional reporting or clinical citation structure observed")

        if not why_explanations:
            why_explanations.append("Content evaluated against baseline lexical and veracity parameters.")

        return {
            "risk_score": final_score,
            "assessment": assessment,
            "tier": tier,
            "color": color,
            "components": {
                "text_signals": round(text_signal_component, 1),
                "evidence": round(evidence_component, 1),
                "language_indicators": round(lang_component, 1),
                "source_context": round(source_component, 1)
            },
            "why_reasons": why_explanations,
            "input_type": input_type
        }

if __name__ == "__main__":
    re = RiskEngine()
    dummy_ling = {"sensational_score": 75, "suspicious_wording": ["miracle cure"], "excessive_punctuation": True, "word_count": 25}
    dummy_ev = {"found": True, "items": [{"stance": "Contradicting"}]}
    print(re.compute_risk(dummy_ling, dummy_ev))
