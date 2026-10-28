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

Provides deep explainability, confidence ratings, and actionable guidance.
"""

from typing import Dict, List, Any

class RiskEngine:
    def compute_risk(
        self,
        linguistic_data: Dict[str, Any],
        evidence_data: Dict[str, Any],
        raw_text: str = "",
        input_type: str = "text"
    ) -> Dict[str, Any]:
        """
        Computes composite misinformation risk score, assessment tier, and comprehensive analysis data.
        """
        sensational_score = float(linguistic_data.get("sensational_score", 15.0))
        suspicious_words = linguistic_data.get("suspicious_wording", [])
        excessive_punct = linguistic_data.get("excessive_punctuation", False)
        screaming_caps = linguistic_data.get("screaming_caps", False)
        credibility_ind = linguistic_data.get("credibility_indicators", [])
        absolute_claims = linguistic_data.get("absolute_claims", False)
        category = linguistic_data.get("category", "General News & Current Affairs")
        emotional_tone = linguistic_data.get("emotional_tone", "Neutral")
        urgency_level = linguistic_data.get("urgency_level", "NORMAL")
        ml_risk_score = linguistic_data.get("ml_risk_score")
        extracted_claim = linguistic_data.get("extracted_claim", "")
        full_text_lower = (raw_text or extracted_claim).lower()

        # -------------------------------------------------------------
        # 1. Language Indicators (20% weight) -> scale 0 - 100
        # -------------------------------------------------------------
        lang_component = sensational_score
        if excessive_punct:
            lang_component = min(100.0, lang_component + 10.0)
        if screaming_caps:
            lang_component = min(100.0, lang_component + 10.0)
        if absolute_claims:
            lang_component = min(100.0, lang_component + 15.0)

        # -------------------------------------------------------------
        # 4. Source & Context Signals (20% weight) -> scale 0 - 100
        # -------------------------------------------------------------
        is_forward_chain = any(w in full_text_lower for w in [
            "whatsapp", "forwarded", "forward to", "forward this", "share immediately", "share this",
            "before deleted", "before it gets deleted", "before it's deleted", "sabko bhejo",
            "groups", "10 groups", "group me", "turant share", "turant forward", "turant", "sabko",
            "facebook", "share this secret", "share this life-saving", "mainstream media is silent",
            "mainstream media is ordered", "they are banning", "deactivated by military",
            "shutting down tomorrow", "stock up now", "stock up on candles", "protect your bank",
            "stock up", "emergency food", "gharelu nuskha", "100% guarantee"
        ])
        if is_forward_chain:
            source_component = 85.0
        elif credibility_ind:
            source_component = 10.0
        else:
            source_component = 18.0

        # -------------------------------------------------------------
        # 2. Evidence Cross-Check (30% weight) -> scale 0 - 100
        # -------------------------------------------------------------
        evidence_found = evidence_data.get("found", False)
        evidence_items = evidence_data.get("items", [])

        if evidence_found and evidence_items:
            contradictions = [e for e in evidence_items if e.get("stance") == "Contradicting"]
            supportings = [e for e in evidence_items if e.get("stance") == "Supporting"]

            if contradictions:
                # Contradicting evidence strongly indicates misinformation
                evidence_component = 88.0 + min(len(contradictions) * 4.0, 8.0)
            elif supportings:
                # Supporting verified evidence gives very low risk
                evidence_component = max(6.0, 14.0 - (len(supportings) * 3.0))
            else:
                # Neutral / contextual records
                if absolute_claims or ("cancer" in full_text_lower and "cure" in full_text_lower) or is_forward_chain:
                    # Unproven miracle cure or panic chain without official confirmation
                    evidence_component = 78.0
                else:
                    evidence_component = 28.0
        else:
            # Uncorroborated claim:
            if absolute_claims or ("cancer" in full_text_lower and "cure" in full_text_lower) or len(suspicious_words) >= 2 or is_forward_chain:
                # Extraordinary claims or viral panic rumors without evidence require high risk flagging
                evidence_component = 82.0
            else:
                evidence_component = 38.0

        # -------------------------------------------------------------
        # 3. Text Signals (30% weight) -> scale 0 - 100
        # -------------------------------------------------------------
        if ml_risk_score is not None:
            text_signal_component = float(ml_risk_score)
        else:
            text_signal_component = 16.0  # Clean baseline

        if len(suspicious_words) >= 2 or absolute_claims:
            text_signal_component = max(text_signal_component, 82.0)
        elif len(suspicious_words) == 1:
            text_signal_component = max(text_signal_component, 55.0)

        if credibility_ind:
            text_signal_component = max(6.0, text_signal_component - 25.0)

        # -------------------------------------------------------------
        # Composite Weighted Sum:
        # Text 30%, Evidence 30%, Language 20%, Source 20%
        # -------------------------------------------------------------
        composite_score = (
            (text_signal_component * 0.30) +
            (evidence_component * 0.30) +
            (lang_component * 0.20) +
            (source_component * 0.20)
        )

        final_score = int(round(max(5.0, min(95.0, composite_score))))

        # Determine Assessment Tier & Level
        if final_score <= 30:
            assessment = "Potentially Reliable"
            tier = "LOW RISK"
            color = "green"
            credibility_rating = "High Credibility — Verifiable markers present"
        elif final_score <= 60:
            assessment = "Potentially Misleading"
            tier = "MEDIUM RISK"
            color = "amber"
            credibility_rating = "Moderate / Mixed — Requires independent verification"
        else:
            assessment = "High Misinformation Risk"
            tier = "HIGH RISK"
            color = "red"
            credibility_rating = "Low Credibility — High probability of manipulation"

        # Calculate Confidence Score (based on alignment of signals)
        signal_variance = abs(text_signal_component - evidence_component) + abs(lang_component - source_component)
        if signal_variance < 30:
            confidence_pct = 92
        elif signal_variance < 60:
            confidence_pct = 84
        else:
            confidence_pct = 75

        # Construct Detailed "Why this result?" Explainability Reasons
        why_explanations: List[str] = []

        if suspicious_words:
            why_explanations.append(f"⚠️ Sensational or clickbait terminology identified: {', '.join(suspicious_words[:3])}")
        if excessive_punct or screaming_caps:
            why_explanations.append("⚠️ Manufactured urgency through uppercase or excessive exclamation marks")
        if absolute_claims:
            why_explanations.append("⚠️ Extreme absolute claims ('100% cure', 'overnight') typical of fraudulent medical remedies")
        if is_forward_chain:
            why_explanations.append("⚠️ Virality and peer-forwarding triggers detected (characteristic of unverified social media chains)")

        if evidence_found and evidence_items:
            contradictions = [e for e in evidence_items if e.get("stance") == "Contradicting"]
            supportings = [e for e in evidence_items if e.get("stance") == "Supporting"]
            if contradictions:
                why_explanations.append(f"⚠️ Conflicting documentation found in reference archives ({contradictions[0].get('title', 'Reference')})")
            elif supportings:
                why_explanations.append(f"✓ Verifiable encyclopedic or scientific coverage corroborates core claim ({supportings[0].get('title', 'Reference')})")
            else:
                why_explanations.append("ℹ️ General contextual information located; specific assertion remains unindexed")
        else:
            why_explanations.append("ℹ️ No exact encyclopedic record located (absence of evidence does not alone indicate falsehood)")

        if credibility_ind:
            why_explanations.append(f"✓ Formal attribution to recognized institutions or clinical trials observed: {', '.join(credibility_ind[:2])}")
        elif not suspicious_words and final_score <= 30:
            why_explanations.append("✓ Factual, objective framing without manipulative or alarmist rhetorical devices")

        if not why_explanations:
            why_explanations.append("Evaluated across linguistic signals, source context, and external reference databases.")

        # Actionable Guidance / Recommendations for the User
        guidance: List[str] = []
        if tier == "HIGH RISK":
            guidance.append("🚫 Do not forward or amplify this claim on social media or messaging apps.")
            if category == "Health & Medical":
                guidance.append("🩺 Consult a qualified healthcare professional or consult WHO/ICMR before trying unverified treatments.")
            elif category in ["Financial & Economy", "Viral Hoax & Rumor"]:
                guidance.append("🛡️ Beware of phishing links or fraudulent messages impersonating authorities.")
            guidance.append("🔍 Check trusted fact-checking platforms such as PIB Fact Check, Alt News, or Reuters Fact Check.")
        elif tier == "MEDIUM RISK":
            guidance.append("⚠️ Exercise caution: Key claims are either partially accurate, lacking context, or unverified.")
            guidance.append("🔎 Search for official press releases from the mentioned organizations before sharing.")
        else:
            guidance.append("✅ Content aligns with verified sources and objective institutional standards.")
            guidance.append("📖 Safe to reference with proper contextual attribution.")

        return {
            "risk_score": final_score,
            "assessment": assessment,
            "tier": tier,
            "color": color,
            "confidence_score": confidence_pct,
            "credibility_rating": credibility_rating,
            "category": category,
            "emotional_tone": emotional_tone,
            "urgency_level": urgency_level,
            "components": {
                "text_signals": round(text_signal_component, 1),
                "evidence": round(evidence_component, 1),
                "language_indicators": round(lang_component, 1),
                "source_context": round(source_component, 1)
            },
            "why_reasons": why_explanations,
            "actionable_guidance": guidance,
            "input_type": input_type
        }

if __name__ == "__main__":
    re = RiskEngine()
    # Test low risk
    dummy_clean = {
        "sensational_score": 12.0, "suspicious_wording": [], "excessive_punctuation": False,
        "credibility_indicators": ["national weather service"], "category": "Science",
        "emotional_tone": "Objective", "urgency_level": "NORMAL"
    }
    dummy_ev_sup = {"found": True, "items": [{"stance": "Supporting", "title": "Weather Watch"}]}
    print("LOW RISK TEST:", re.compute_risk(dummy_clean, dummy_ev_sup))

    # Test high risk
    dummy_fake = {
        "sensational_score": 85.0, "suspicious_wording": ["miracle cure", "share immediately"],
        "excessive_punctuation": True, "screaming_caps": True, "absolute_claims": True,
        "category": "Health & Medical", "emotional_tone": "Alarmist", "urgency_level": "CRITICAL"
    }
    dummy_ev_contra = {"found": True, "items": [{"stance": "Contradicting", "title": "Debunked Cures"}]}
    print("HIGH RISK TEST:", re.compute_risk(dummy_fake, dummy_ev_contra))
