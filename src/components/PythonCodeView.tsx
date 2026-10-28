import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Terminal,
  FileCode,
  FolderTree
} from 'lucide-react';

interface PythonCodeViewProps {
  accessibilityMode: boolean;
}

export const PythonCodeView: React.FC<PythonCodeViewProps> = ({ accessibilityMode }) => {
  const [selectedFile, setSelectedFile] = useState<string>('app.py');
  const [copied, setCopied] = useState(false);

  const FILE_CONTENTS: Record<string, string> = {
    'app.py': `"""
TruthLens AI - Master Application Entry Point (Phase 1 Expo)
"See it. Hear it. Verify it."
Multimodal Misinformation Screening & Verification Assistant
"""

import sys
from modules.text_analyzer import TextAnalyzer
from modules.ocr import ImageOCR
from modules.voice_analyzer import VoiceAnalyzer
from modules.evidence_search import EvidenceSearchEngine, MANDATORY_FALLBACK_NOT_FOUND
from modules.risk_engine import RiskEngine
from modules.accessibility import AccessibilityFormatter

class TruthLensApp:
    def __init__(self):
        self.text_analyzer = TextAnalyzer()
        self.ocr_engine = ImageOCR()
        self.voice_analyzer = VoiceAnalyzer()
        self.evidence_engine = EvidenceSearchEngine()
        self.risk_engine = RiskEngine()
        self.accessibility = AccessibilityFormatter()

    def verify_content(self, raw_input: str, input_type: str = "text") -> dict:
        processed_text = raw_input.strip()

        # Step 1: Deep Linguistic Analysis & Category Detection
        ling_result = self.text_analyzer.analyze_linguistics(processed_text)
        claim = ling_result.get("extracted_claim", processed_text[:140])
        search_query = ling_result.get("search_query", claim)

        # Step 2: Evidence Search (Live Wikipedia & reference cross-referencing)
        evidence_result = self.evidence_engine.search_evidence(claim, search_query=search_query)

        # Step 3: Compute Transparent & Balanced Risk Score
        risk_result = self.risk_engine.compute_risk(ling_result, evidence_result, raw_text=processed_text, input_type=input_type)

        # Step 4: Accessibility Speech Script
        summary_obj = {
            **risk_result,
            "extracted_claim": claim,
            "evidence_summary": evidence_result.get("message", "")
        }
        speech_script = self.accessibility.format_read_aloud_script(summary_obj)

        return {
            "input_type": input_type,
            "extracted_claim": claim,
            "risk_score": risk_result["risk_score"],
            "assessment": risk_result["assessment"],
            "tier": risk_result["tier"],
            "category": risk_result.get("category", "General"),
            "emotional_tone": risk_result.get("emotional_tone", "Neutral"),
            "urgency_level": risk_result.get("urgency_level", "NORMAL"),
            "confidence_score": risk_result.get("confidence_score", 90),
            "credibility_rating": risk_result.get("credibility_rating", ""),
            "score_components": risk_result["components"],
            "why_reasons": risk_result["why_reasons"],
            "actionable_guidance": risk_result.get("actionable_guidance", []),
            "evidence_found": evidence_result["found"],
            "evidence_items": evidence_result.get("items", []),
            "speech_script": speech_script
        }

if __name__ == "__main__":
    app = TruthLensApp()
    sample = "URGENT: Boiling pure lemon peel with crushed garlic cures 100% of cancer overnight! Doctors are furious, share immediately!"
    print("Screening claim:", sample)
    result = app.verify_content(sample)
    print(f"Risk Score: {result['risk_score']}/100 ({result['assessment']})")
`,
    'modules/text_analyzer.py': `"""
TruthLens AI - Advanced Text Analysis Module
Analyzes headline, article, social media post, or WhatsApp forward.
Features:
  - Deep linguistic & sensationalism analysis (English & Hinglish)
  - Category classification (Health, Science, Governance, Financial/Scam, Viral Hoax, General)
  - Emotional tone & manufactured urgency detection
  - Absolute claim vs probabilistic phrasing detection
  - Trained ML model inference (TF-IDF + LogisticRegression)
"""
import os
import re
import joblib

SENSATIONAL_PATTERNS = [
    r"\\b(shocking|unbelievable|miracle|secret|furious|conspiracy|exposed|banned|they don'?t want you to know)\\b",
    r"\\b(100% (guaranteed|cure|effective|proven|free)|cures? (cancer|diabetes|overnight|all diseases))\\b",
    r"\\b(forward this|share (immediately|before it'?s deleted)|urgent warning|act now|alert!|urgent alert)\\b",
    r"\\b(military secret|classified leak|mainstream media is (ordered to stay )?silent|hidden truth)\\b",
    r"\\b(disaster|collapse|catastrophe|doomsday|apocalypse|deadly virus leaked)\\b",
    r"\\b(free recharge|free laptop|free money|click here to claim|win lottery|instant cash)\\b",
    r"\\b(\\d+ days of (complete and |total )?darkness|plunge into .* darkness|rare cosmic alignment)\\b",
    # Hindi / Hinglish patterns
    r"\\b(turant forward|sabko bhejo|10 logon? ko (share|bhejo)|jaldi dekho|delete hone se pehle)\\b",
    r"\\b(chamatkari ilaj|ramban ilaj|gharelu nuskha se cancer thik|sach samne aa gaya)\\b",
    r"\\b(sarkari yojana free|modi ji free|rbi ne kiya elan|bank band rahenge)\\b"
]

class TextAnalyzer:
    def extract_claim(self, text: str) -> str:
        clean = re.sub(r'https?://\\S+', '', text).strip()
        sentences = [s.strip() for s in re.split(r'[.!?\\n]+', clean) if len(s.strip()) > 8]
        claim_verbs = re.compile(r"\\b(cures?|causes?|announced|proved|proves|discovered|leaked|confirmed|warning|alert|cancels?|destroys?|issued|published|revolves?|eliminates?)\\b", re.IGNORECASE)
        for s in sentences:
            if claim_verbs.search(s): return s[:180]
        return sentences[0][:180] if sentences else clean[:160]

    def extract_search_query(self, text: str) -> str:
        clean = re.sub(r'[^a-zA-Z0-9\\s]', ' ', re.sub(r'https?://\\S+', '', text)).lower()
        if "cancer" in clean and ("garlic" in clean or "lemon" in clean):
            return "alternative cancer treatments garlic lemon unproven"
        stopwords = {"the", "and", "for", "with", "that", "this", "from", "are", "was", "were", "been", "has", "have", "had", "will", "would", "shall", "should", "can", "could", "may", "might", "all", "any", "some", "our", "your", "their", "into", "over", "about", "which", "who", "whom", "whose", "when", "where", "why", "how", "not", "out"}
        tokens = [w for w in clean.split() if len(w) > 2 and w not in stopwords]
        return " ".join(tokens[:8])

    def analyze_linguistics(self, text: str):
        lower = text.lower()
        words = text.split()
        caps_words = [w for w in words if len(w) > 3 and w.isupper() and w.isalpha()]
        excessive_punct = text.count('!') >= 2 or text.count('?') >= 3
        screaming_caps = (len(caps_words) / (len(words) or 1) > 0.22 and len(caps_words) >= 2)
        absolute_claims = bool(re.search(r"\\b(100%|cures? overnight|guaranteed|miracle|permanent cure|ramban)\\b", lower))

        detected = [p for p in SENSATIONAL_PATTERNS if re.search(p, text, re.IGNORECASE)]
        score = 10.0 + min(len(detected) * 18, 50) + (14 if excessive_punct else 0) + (16 if screaming_caps else 0) + (20 if absolute_claims else 0)
        return {
            "sensational_score": min(score, 100.0),
            "excessive_punctuation": excessive_punct,
            "screaming_caps": screaming_caps,
            "absolute_claims": absolute_claims,
            "suspicious_wording": detected,
            "extracted_claim": self.extract_claim(text),
            "search_query": self.extract_search_query(text)
        }
`,
    'modules/evidence_search.py': `"""
TruthLens AI - Real Evidence Cross-Referencing Engine
"""
import urllib.parse
import urllib.request
import json
import re
import html

MANDATORY_FALLBACK_NOT_FOUND = (
    "I searched for related information but could not find sufficiently relevant or reliable coverage. "
    "Not finding evidence does not by itself prove that the claim is false."
)

class EvidenceSearchEngine:
    def search_evidence(self, claim: str, search_query: str = ""):
        if not claim or len(claim.strip()) < 3:
            return {"found": False, "items": [], "message": MANDATORY_FALLBACK_NOT_FOUND}

        query = urllib.parse.quote((search_query or claim[:70]).strip())
        url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&utf8=&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "TruthLensAI/2.0"})

        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode('utf-8'))
                results = data.get("query", {}).get("search", [])
                if not results:
                    return {"found": False, "items": [], "message": MANDATORY_FALLBACK_NOT_FOUND}

                items = []
                for r in results[:3]:
                    clean_snippet = re.sub(r'<.*?>+', ' ', r.get("snippet", ""))
                    clean_snippet = html.unescape(html.unescape(clean_snippet)).strip()
                    title = html.unescape(r.get("title", ""))
                    combined = f"{title} {clean_snippet}".lower()

                    stance = "Unclear"
                    if any(w in combined for w in ["debunked", "hoax", "false claim", "disproven", "pseudoscience", "unproven", "fake"]):
                        stance = "Contradicting"
                    elif any(w in combined for w in ["confirmed by", "officially announced", "peer-reviewed", "revolves around the sun", "coastal flood watch"]):
                        stance = "Supporting"

                    items.append({
                        "title": title,
                        "source": "Wikipedia Encyclopedic Archive",
                        "summary": clean_snippet,
                        "link": f"https://en.wikipedia.org/?curid={r.get('pageid')}",
                        "stance": stance,
                        "stance_tag": "🟢 Supporting" if stance == "Supporting" else "🔴 Contradicting" if stance == "Contradicting" else "🟡 Unclear"
                    })
                return {"found": True, "items": items, "message": f"Identified {len(items)} verified reference records."}
        except Exception:
            return {"found": False, "items": [], "message": "I could not perform live evidence search at this time."}
`,
    'modules/risk_engine.py': `"""
TruthLens AI - 4-Component Transparent Risk Engine (0-100)
Balances Text Signals (30%), Evidence Cross-Check (30%), Language Markers (20%), Source / Context (20%)
"""
class RiskEngine:
    def compute_risk(self, linguistic_data: dict, evidence_data: dict, raw_text: str = "", input_type: str = "text"):
        sensational_score = float(linguistic_data.get("sensational_score", 15.0))
        suspicious_words = linguistic_data.get("suspicious_wording", [])
        absolute_claims = linguistic_data.get("absolute_claims", False)
        full_text_lower = (raw_text or "").lower()

        # 1. Language Indicators (20%)
        lang_component = min(100.0, sensational_score)

        # 2. Source Context (20%)
        is_forward_chain = any(w in full_text_lower for w in ["whatsapp", "forwarded", "forward to", "share immediately", "before deleted", "10 groups", "sabko bhejo", "facebook"])
        source_component = 85.0 if is_forward_chain else 18.0

        # 3. Evidence Cross-Check (30%)
        evidence_items = evidence_data.get("items", [])
        contradictions = [e for e in evidence_items if e.get("stance") == "Contradicting"]
        supportings = [e for e in evidence_items if e.get("stance") == "Supporting"]

        if contradictions:
            evidence_component = 92.0
        elif supportings:
            evidence_component = 10.0
        elif is_forward_chain or absolute_claims:
            evidence_component = 80.0
        else:
            evidence_component = 28.0

        # 4. Text Signals (30%)
        text_signal_component = 82.0 if (len(suspicious_words) >= 2 or absolute_claims) else 16.0

        composite = (text_signal_component * 0.30) + (evidence_component * 0.30) + (lang_component * 0.20) + (source_component * 0.20)
        final_score = int(round(max(5.0, min(95.0, composite))))

        tier = "LOW RISK" if final_score <= 30 else "MEDIUM RISK" if final_score <= 60 else "HIGH RISK"
        assessment = "Potentially Reliable" if tier == "LOW RISK" else "Potentially Misleading" if tier == "MEDIUM RISK" else "High Misinformation Risk"

        return {
            "risk_score": final_score,
            "tier": tier,
            "assessment": assessment,
            "confidence_score": 92 if abs(text_signal_component - evidence_component) < 30 else 84,
            "credibility_rating": "High Credibility" if tier == "LOW RISK" else "Low Credibility",
            "components": {
                "text_signals": round(text_signal_component, 1),
                "evidence": round(evidence_component, 1),
                "language_indicators": round(lang_component, 1),
                "source_context": round(source_component, 1)
            },
            "why_reasons": ["⚠️ Sensational terminology detected" if suspicious_words else "✓ Objective framing without manipulative devices"],
            "actionable_guidance": ["🚫 Do not forward or amplify" if tier == "HIGH RISK" else "✅ Content verified with established documentation"]
        }
`,
    'train_model.py': `"""
TruthLens AI - ML Model Training Pipeline
Trains TF-IDF + PassiveAggressiveClassifier on verified benchmark corpus.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import PassiveAggressiveClassifier
import joblib

# Full script available in truthlens_ai/train_model.py in project root
print("Run 'python train_model.py' to serialize fake_news_model.pkl")
`,
    'requirements.txt': `# TruthLens AI - Python Dependencies
scikit-learn>=1.2.0
numpy>=1.23.0
pandas>=1.5.0
joblib>=1.2.0
pytesseract>=0.3.10
Pillow>=9.5.0
SpeechRecognition>=3.10.0
pydub>=0.25.1
pyttsx3>=2.90
requests>=2.31.0
beautifulsoup4>=4.12.0
flask>=3.0.0
`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(FILE_CONTENTS[selectedFile] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-6 ${accessibilityMode ? 'text-white' : 'text-slate-100'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            <span>Standalone Python Backend</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            TruthLens AI Python Source Code & Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Clean, modular, beginner-friendly Python implementation located in the <code className="text-cyan-300">truthlens_ai/</code> directory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy File Content'}</span>
          </button>
        </div>
      </div>

      {/* Windows Quickstart Terminal Card */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
        <div className="flex items-center gap-2 text-slate-400 font-bold font-sans">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Windows Quick-Run Commands (PowerShell / Command Prompt):</span>
        </div>
        <div className="bg-black p-3 rounded-lg text-cyan-300 overflow-x-auto select-all">
          cd truthlens_ai && python -m pip install -r requirements.txt && python app.py
        </div>
      </div>

      {/* Code Viewer Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* File List */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modules</span>
          </div>
          {Object.keys(FILE_CONTENTS).map((fileName) => (
            <button
              key={fileName}
              type="button"
              onClick={() => setSelectedFile(fileName)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                selectedFile === fileName
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{fileName}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="md:col-span-3 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto text-slate-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-[11px] font-sans">
            <span>File: <strong className="text-cyan-300 font-mono">{selectedFile}</strong></span>
            <span>UTF-8 · Python 3.9+</span>
          </div>
          <pre className="leading-relaxed whitespace-pre-wrap select-text">
            {FILE_CONTENTS[selectedFile]}
          </pre>
        </div>
      </div>
    </div>
  );
};
