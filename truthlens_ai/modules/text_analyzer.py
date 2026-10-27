"""
TruthLens AI - Text Analysis Module
Analyzes headline, article, social media post, or WhatsApp forward.
Identifies suspicious wording, sensational language, excessive punctuation, and extracts core claims.
"""

import re
from typing import Dict, List, Any

# Sensational and clickbait phrase lexicon
SENSATIONAL_PATTERNS = [
    r"\b(shocking|unbelievable|miracle|secret|furious|conspiracy|exposed|banned|they don'?t want you to know)\b",
    r"\b(100% (guaranteed|cure|effective|proven)|cures? (cancer|diabetes|overnight))\b",
    r"\b(forward this|share (immediately|before it'?s deleted)|urgent warning|act now)\b",
    r"\b(deactivated|military secret|classified leak|mainstream media is silent)\b",
    r"\b(disaster|collapse|catastrophe|doomsday|apocalypse)\b"
]

SUSPICIOUS_PHRASES = [
    "share before it gets deleted",
    "secret government memo",
    "miracle cure",
    "doctors are stunned",
    "what they are hiding",
    "forward to all contacts",
    "nasa confirmed total darkness",
    "drinking hot water kills virus",
    "unesco declared best anthem"
]

CREDIBLE_INDICATORS = [
    r"\b(according to (the|a)? (official|report|study|reuters|ap news|statement|peer-reviewed))\b",
    r"\b(published in|clinical trial|data indicates|confirmed by authorities|spokesperson)\b",
    r"\b(statistical analysis|investigation found|press conference|federal|ministry of)\b"
]

class TextAnalyzer:
    def __init__(self):
        self.sensational_regex = [re.compile(p, re.IGNORECASE) for p in SENSATIONAL_PATTERNS]
        self.credible_regex = [re.compile(p, re.IGNORECASE) for p in CREDIBLE_INDICATORS]

    def extract_claim(self, text: str) -> str:
        """Extracts the primary falsifiable claim from the text."""
        if not text:
            return "No text provided."
        
        # Strip URLs
        clean = re.sub(r'https?://\S+', '', text).strip()
        sentences = [s.strip() for s in re.split(r'[.!?\n]+', clean) if len(s.strip()) > 10]
        
        if not sentences:
            return text.strip()[:140]
        
        # Prioritize sentence with high claim density or take first sentence
        return sentences[0][:180]

    def analyze_linguistics(self, text: str) -> Dict[str, Any]:
        """Performs deep linguistic and sensationalism analysis on input text."""
        if not text:
            return {
                "error": "Empty text provided",
                "sensational_score": 0,
                "urgency_score": 0,
                "punctuation_anomaly": False,
                "detected_patterns": [],
                "claim": ""
            }

        # 1. Punctuation checks
        exclamation_count = text.count('!')
        question_count = text.count('?')
        caps_words = [w for w in text.split() if len(w) > 3 and w.isupper() and w.isalpha()]
        total_words = len(text.split()) or 1
        caps_ratio = len(caps_words) / total_words

        has_excessive_punctuation = exclamation_count >= 2 or question_count >= 3
        has_screaming_caps = caps_ratio > 0.25 and len(caps_words) >= 2

        # 2. Sensational and clickbait detection
        detected_patterns: List[str] = []
        for rx in self.sensational_regex:
            matches = rx.findall(text)
            if matches:
                for m in matches:
                    val = m[0] if isinstance(m, tuple) else m
                    detected_patterns.append(str(val).lower())

        for phrase in SUSPICIOUS_PHRASES:
            if phrase in text.lower() and phrase not in detected_patterns:
                detected_patterns.append(phrase)

        # 3. Credibility indicators
        credibility_matches = []
        for rx in self.credible_regex:
            matches = rx.findall(text)
            if matches:
                for m in matches:
                    val = m[0] if isinstance(m, tuple) else m
                    credibility_matches.append(str(val).lower())

        # 4. Compute composite language risk (0 to 100)
        language_risk = 15.0
        reasons: List[str] = []

        if detected_patterns:
            language_risk += min(len(detected_patterns) * 18, 45)
            reasons.append(f"Sensational vocabulary detected: {', '.join(detected_patterns[:4])}")

        if has_excessive_punctuation:
            language_risk += 15
            reasons.append(f"Excessive punctuation markers ({exclamation_count} '!', {question_count} '?') indicate manufactured urgency")

        if has_screaming_caps:
            language_risk += 15
            reasons.append("High ratio of uppercase capitalized words indicating alarmist framing")

        if credibility_matches:
            language_risk = max(5.0, language_risk - 25)
            reasons.append("Formal attribution to institutional reporting or peer-reviewed studies identified")

        extracted_claim = self.extract_claim(text)

        return {
            "sensational_score": min(round(language_risk, 1), 100.0),
            "excessive_punctuation": has_excessive_punctuation,
            "screaming_caps": has_screaming_caps,
            "suspicious_wording": list(set(detected_patterns)),
            "credibility_indicators": list(set(credibility_matches)),
            "reasons": reasons,
            "extracted_claim": extracted_claim,
            "word_count": total_words
        }

if __name__ == "__main__":
    analyzer = TextAnalyzer()
    sample = "URGENT: Drinking hot lemon water cures 100% of cancer overnight! Doctors are furious! Share before deleted!"
    res = analyzer.analyze_linguistics(sample)
    print("Extracted Claim:", res["extracted_claim"])
    print("Risk:", res["sensational_score"])
    print("Reasons:", res["reasons"])
