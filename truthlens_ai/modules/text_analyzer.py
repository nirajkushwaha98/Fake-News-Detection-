"""
TruthLens AI - Advanced Text Analysis Module
Analyzes headline, article, social media post, or WhatsApp forward.
Features:
  - Deep linguistic & sensationalism analysis (English & Hinglish)
  - Category classification (Health, Science, Governance, Financial/Scam, Viral Hoax, General)
  - Emotional tone & manufactured urgency detection
  - Absolute claim vs probabilistic phrasing detection
  - Trained ML model inference (TF-IDF + Classifier) with fallback
  - Smart search entity / keyword extraction for evidence search
"""

import os
import re
from typing import Dict, List, Any, Optional

# Sensational and clickbait patterns (English & Hinglish)
SENSATIONAL_PATTERNS = [
    r"\b(shocking|unbelievable|miracle|secret|furious|conspiracy|exposed|banned|they don'?t want you to know)\b",
    r"\b(100% (guarantee|guaranteed|cure|effective|proven|free)|cures? (cancer|diabetes|overnight|all diseases))\b",
    r"\b(forward this|share (immediately|before it'?s deleted)|urgent warning|act now|alert!|urgent alert)\b",
    r"\b(military secret|classified leak|mainstream media is (ordered to stay )?silent|hidden truth|dark secret)\b",
    r"\b(disaster|collapse|catastrophe|doomsday|apocalypse|deadly virus leaked)\b",
    r"\b(free recharge|free laptop|free money|click here to claim|win lottery|instant cash)\b",
    r"\b(\d+ days of (complete and |total )?darkness|plunge into .* darkness|rare cosmic alignment)\b",
    r"\b(stock up on (candles|food|cash)|emergency food now)\b",
    # Hindi / Hinglish patterns
    r"\b(turant (forward|share|dekho)|sabko (bhejo|share|forward)|10 logon? ko (share|bhejo)|jaldi dekho|delete hone se pehle)\b",
    r"\b(chamatkari ilaj|ramban ilaj|gharelu nuskha|cancer (cells )?khatam|doctors shock|sach samne aa gaya)\b",
    r"\b(sarkari yojana free|modi ji free|rbi ne kiya elan|bank band rahenge)\b",
    r"\b(nasa ne confirm kiya|unesco ne ghoshit kiya|duniya khatam|15 din andhera)\b"
]

SUSPICIOUS_PHRASES = [
    "share before it gets deleted",
    "secret government memo",
    "miracle cure doctors hate",
    "what they are hiding from you",
    "forward to 10 groups",
    "forward to all your contacts",
    "nasa confirmed 15 days of darkness",
    "drinking hot water kills virus",
    "unesco declared best anthem",
    "banks shutting down tomorrow",
    "free recharge for all users",
    "who declared emergency warning",
    "boiled garlic water cures cancer",
    "sabko forward karein",
    "modi ji de rahe hai free",
    "turant share karein",
    "delete hone se pehle dekho"
]

CREDIBLE_INDICATORS = [
    r"\b(according to (the|a)? (official|report|study|reuters|ap news|statement|peer-reviewed))\b",
    r"\b(published in|clinical trial|data indicates|confirmed by authorities|spokesperson)\b",
    r"\b(statistical analysis|investigation found|press conference|federal|ministry of|department of)\b",
    r"\b(world health organization|centers for disease control|national weather service|isro|nasa release)\b",
    r"\b(the lancet|new england journal of medicine|nature|science journal|pib fact check)\b",
    r"\b(randomized controlled trial|longitudinal observation|standard error|confidence interval)\b"
]

CATEGORY_KEYWORDS = {
    "Health & Medical": [
        "cure", "cancer", "diabetes", "doctor", "medicine", "virus", "infection", "hospital",
        "vaccine", "therapy", "clinical", "disease", "garlic", "lemon", "home remedy", "ilaj", "davai"
    ],
    "Science & Technology": [
        "nasa", "isro", "space", "satellite", "physics", "solar", "telescope", "exoplanet",
        "climate", "atmosphere", "earth", "moon", "venus", "jupiter", "researchers", "university"
    ],
    "Governance & Policy": [
        "government", "ministry", "federal", "bill", "court", "parliament", "police", "military",
        "sarkar", "yojana", "modi", "advisory", "official", "regulations", "law"
    ],
    "Financial & Economy": [
        "bank", "reserve bank", "interest rate", "rupees", "dollar", "crypto", "free money",
        "lottery", "recharge", "tax", "inflation", "stock market", "account deactivated"
    ],
    "Viral Hoax & Rumor": [
        "unesco", "15 days darkness", "forward to 10", "alien", "sim card deactivated",
        "secret memo", "they are hiding", "apocalypse"
    ]
}

class TextAnalyzer:
    def __init__(self):
        self.sensational_regex = [re.compile(p, re.IGNORECASE) for p in SENSATIONAL_PATTERNS]
        self.credible_regex = [re.compile(p, re.IGNORECASE) for p in CREDIBLE_INDICATORS]
        self.ml_model = None
        self.vectorizer = None
        self._load_ml_model()

    def _load_ml_model(self):
        """Attempt to load trained TF-IDF model if available."""
        try:
            import joblib
            model_paths = [
                os.path.join(os.path.dirname(__file__), "..", "models", "fake_news_model.pkl"),
                os.path.join("truthlens_ai", "models", "fake_news_model.pkl"),
                "models/fake_news_model.pkl"
            ]
            vec_paths = [
                os.path.join(os.path.dirname(__file__), "..", "models", "tfidf_vectorizer.pkl"),
                os.path.join("truthlens_ai", "models", "tfidf_vectorizer.pkl"),
                "models/tfidf_vectorizer.pkl"
            ]

            for mp, vp in zip(model_paths, vec_paths):
                if os.path.exists(mp) and os.path.exists(vp):
                    self.ml_model = joblib.load(mp)
                    self.vectorizer = joblib.load(vp)
                    break
        except Exception:
            self.ml_model = None
            self.vectorizer = None

    def extract_claim(self, text: str) -> str:
        """Extracts the primary falsifiable claim from the text."""
        if not text:
            return "No distinct claim provided."

        clean = re.sub(r'https?://\S+', '', text).strip()
        sentences = [s.strip() for s in re.split(r'[.!?\n]+', clean) if len(s.strip()) > 8]

        if not sentences:
            return clean[:160]

        # Look for sentence containing assertive claim keywords
        claim_verbs = re.compile(
            r"\b(cures?|causes?|announced|proved|proves|discovered|leaked|confirmed|warning|alert|cancels?|destroys?|issued|published|revolves?|eliminates?)\b",
            re.IGNORECASE
        )
        for s in sentences:
            if claim_verbs.search(s):
                return s[:180]

        return sentences[0][:180]

    def extract_search_query(self, text: str) -> str:
        """
        Extracts high-signal search keywords for Wikipedia / fact-checking lookups.
        Strips conversational filler, clickbait wrappers, and urgency calls.
        """
        if not text:
            return ""

        clean = re.sub(r'https?://\S+', '', text)
        clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', clean)

        # Remove sensational & viral wrapper phrases
        noise_words = [
            "breaking", "urgent", "shocking", "discovery", "unbelievable", "secret", "leaked", "confidential",
            "share immediately", "forward this", "before it gets deleted", "before it s deleted",
            "doctors are furious", "furious", "they are hiding", "what they don t want you to know",
            "100 guaranteed", "overnight", "share to 10 groups", "viral alert", "warning", "must read",
            "life saving", "according to a multi center study published in", "according to", "reported that",
            "pure", "crushed", "boiling", "warm", "banning this recipe everywhere", "recipe", "banned"
        ]
        lower = clean.lower()
        for nw in noise_words:
            lower = lower.replace(nw, " ")

        # Specific query enhancement for cancer / medical cure hoaxes
        if any(w in lower for w in ["cancer", "diabetes", "infection"]) and any(w in lower for w in ["lemon", "garlic", "honey", "water"]):
            return "alternative cancer treatments garlic lemon unproven"

        # Specific query enhancement for planetary darkness hoax
        if "darkness" in lower and any(w in lower for w in ["nasa", "earth", "venus", "jupiter", "days"]):
            return "15 days of darkness NASA hoax"

        # Extract words longer than 2 characters, remove common stopwords
        stopwords = {
            "the", "and", "for", "with", "that", "this", "from", "are", "was", "were", "been",
            "has", "have", "had", "will", "would", "shall", "should", "can", "could", "may",
            "might", "all", "any", "some", "our", "your", "their", "into", "over", "about",
            "which", "who", "whom", "whose", "when", "where", "why", "how", "not", "out", "from"
        }
        tokens = [w for w in lower.split() if len(w) > 2 and w not in stopwords]

        if not tokens:
            return text[:60].strip()

        # Keep top 6-8 key topical tokens
        return " ".join(tokens[:8])

    def detect_category(self, text: str) -> str:
        """Determines the primary thematic domain of the claim."""
        lower = text.lower()
        scores = {}
        for cat, kw_list in CATEGORY_KEYWORDS.items():
            count = sum(1 for kw in kw_list if kw in lower)
            if count > 0:
                scores[cat] = count

        if scores:
            return max(scores, key=scores.get)
        return "General News & Current Affairs"

    def analyze_linguistics(self, text: str) -> Dict[str, Any]:
        """Performs deep linguistic, urgency, and sensationalism analysis."""
        if not text or not text.strip():
            return {
                "error": "Empty text provided",
                "sensational_score": 0.0,
                "urgency_score": 0.0,
                "urgency_level": "LOW",
                "emotional_tone": "Neutral",
                "excessive_punctuation": False,
                "screaming_caps": False,
                "suspicious_wording": [],
                "credibility_indicators": [],
                "category": "General",
                "extracted_claim": "",
                "search_query": "",
                "ml_risk_score": None,
                "reasons": []
            }

        lower = text.lower()
        words = text.split()
        total_words = len(words) or 1

        # 1. Punctuation & Typography checks
        exclamation_count = text.count('!')
        question_count = text.count('?')
        caps_words = [w for w in words if len(w) > 3 and w.isupper() and w.isalpha()]
        caps_ratio = len(caps_words) / total_words

        has_excessive_punctuation = exclamation_count >= 2 or question_count >= 3
        has_screaming_caps = (caps_ratio > 0.22 and len(caps_words) >= 2) or (len(text) > 25 and text == text.upper())

        # 2. Sensational and clickbait detection
        detected_patterns: List[str] = []
        for rx in self.sensational_regex:
            matches = rx.findall(text)
            if matches:
                for m in matches:
                    val = m[0] if isinstance(m, tuple) else m
                    if val and str(val).lower() not in detected_patterns:
                        detected_patterns.append(str(val).lower())

        for phrase in SUSPICIOUS_PHRASES:
            if phrase in lower and phrase not in detected_patterns:
                detected_patterns.append(phrase)

        # 3. Credibility indicators
        credibility_matches = []
        for rx in self.credible_regex:
            matches = rx.findall(text)
            if matches:
                for m in matches:
                    val = m[0] if isinstance(m, tuple) else m
                    if val and str(val).lower() not in credibility_matches:
                        credibility_matches.append(str(val).lower())

        # 4. Absolute assertion detection ("100% cure", "guaranteed", "never fails")
        absolute_claims = bool(re.search(r"\b(100%|cures? overnight|guaranteed|miracle|permanent cure|ramban)\b", lower))

        # 5. Emotional Tone & Urgency Classification
        urgency_score = 0.0
        if has_excessive_punctuation:
            urgency_score += 30.0
        if has_screaming_caps:
            urgency_score += 25.0
        if any(w in lower for w in ["urgent", "immediately", "act now", "warning", "turant", "sabko", "jaldi"]):
            urgency_score += 35.0

        if urgency_score >= 50:
            urgency_level = "CRITICAL / MANUFACTURED"
        elif urgency_score >= 25:
            urgency_level = "MODERATE"
        else:
            urgency_level = "NORMAL"

        if detected_patterns and urgency_score > 30:
            emotional_tone = "Alarmist / Clickbait"
        elif any(w in lower for w in ["conspiracy", "hiding", "secret bunker", "mafia", "cover-up"]):
            emotional_tone = "Conspiratorial"
        elif credibility_matches:
            emotional_tone = "Objective & Sourced"
        else:
            emotional_tone = "Neutral / Informative"

        # 6. ML Model Inference (if available)
        ml_risk_score = None
        if self.ml_model and self.vectorizer:
            try:
                clean_for_ml = re.sub(r'[^a-zA-Z0-9\s]', '', lower)
                vec = self.vectorizer.transform([clean_for_ml])
                if hasattr(self.ml_model, "decision_function"):
                    df = self.ml_model.decision_function(vec)[0]
                    # Sigmoid squashing to 0-100
                    import math
                    ml_prob = 1.0 / (1.0 + math.exp(-df))
                    ml_risk_score = round(ml_prob * 100.0, 1)
                elif hasattr(self.ml_model, "predict_proba"):
                    probs = self.ml_model.predict_proba(vec)[0]
                    ml_risk_score = round(float(probs[1]) * 100.0, 1)
            except Exception:
                ml_risk_score = None

        # 7. Compute Sensational Risk Score (0 - 100)
        # Neutral baseline for clean text is LOW (10.0)
        language_risk = 10.0

        if detected_patterns:
            language_risk += min(len(detected_patterns) * 18.0, 50.0)
        if has_excessive_punctuation:
            language_risk += 14.0
        if has_screaming_caps:
            language_risk += 16.0
        if absolute_claims:
            language_risk += 20.0
        if credibility_matches:
            language_risk = max(5.0, language_risk - 25.0)

        # Incorporate ML if present
        if ml_risk_score is not None:
            language_risk = (language_risk * 0.65) + (ml_risk_score * 0.35)

        sensational_score = min(100.0, max(5.0, round(language_risk, 1)))

        # Reasons list
        reasons: List[str] = []
        if detected_patterns:
            reasons.append(f"⚠️ Sensational or alarmist phrasing detected: {', '.join(detected_patterns[:3])}")
        if has_excessive_punctuation or has_screaming_caps:
            reasons.append("⚠️ Manufactured urgency through uppercase or excessive exclamation marks")
        if absolute_claims:
            reasons.append("⚠️ Extreme absolute claims ('100% cure', 'overnight') typical of pseudoscience")
        if credibility_matches:
            reasons.append(f"✓ Formal attribution to established institutions: {', '.join(credibility_matches[:2])}")
        if not detected_patterns and not has_excessive_punctuation and not has_screaming_caps:
            reasons.append("✓ Measured, objective linguistic structure without overt emotional manipulation")

        extracted_claim = self.extract_claim(text)
        search_query = self.extract_search_query(text)
        category = self.detect_category(text)

        return {
            "sensational_score": sensational_score,
            "urgency_score": round(urgency_score, 1),
            "urgency_level": urgency_level,
            "emotional_tone": emotional_tone,
            "excessive_punctuation": has_excessive_punctuation,
            "screaming_caps": has_screaming_caps,
            "absolute_claims": absolute_claims,
            "suspicious_wording": list(set(detected_patterns)),
            "credibility_indicators": list(set(credibility_matches)),
            "category": category,
            "extracted_claim": extracted_claim,
            "search_query": search_query,
            "ml_risk_score": ml_risk_score,
            "reasons": reasons,
            "word_count": total_words
        }

if __name__ == "__main__":
    ta = TextAnalyzer()
    samples = [
        "The earth revolves around the sun.",
        "URGENT: Boiling garlic water cures 100% cancer overnight! Doctors furious! Share immediately!",
        "The National Weather Service has issued a coastal flood watch for low-lying sectors."
    ]
    for s in samples:
        res = ta.analyze_linguistics(s)
        print("Claim:", res["extracted_claim"])
        print("Search Query:", res["search_query"])
        print("Sensational Score:", res["sensational_score"])
        print("Tone:", res["emotional_tone"], "| Category:", res["category"])
        print("---")
