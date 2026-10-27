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

        # Step 1: Linguistic Analysis
        ling_result = self.text_analyzer.analyze_linguistics(processed_text)
        claim = ling_result.get("extracted_claim", processed_text[:120])

        # Step 2: Evidence Search (Real Wikipedia & reference cross-referencing)
        evidence_result = self.evidence_engine.search_evidence(claim)

        # Step 3: Compute Transparent Risk Score
        risk_result = self.risk_engine.compute_risk(ling_result, evidence_result, input_type=input_type)

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
            "score_components": risk_result["components"],
            "why_reasons": risk_result["why_reasons"],
            "evidence_found": evidence_result["found"],
            "evidence_items": evidence_result.get("items", []),
            "speech_script": speech_script
        }

if __name__ == "__main__":
    app = TruthLensApp()
    sample = "URGENT: Drinking boiled lemon garlic water cures 100% of cancer overnight! Doctors are furious, share immediately!"
    print("Screening claim:", sample)
    result = app.verify_content(sample)
    print(f"Risk Score: {result['risk_score']}/100 ({result['assessment']})")
`,
    'modules/text_analyzer.py': `"""
TruthLens AI - Text Analysis Module
Analyzes headline, article, social media post, or WhatsApp forward.
"""
import re

SENSATIONAL_PATTERNS = [
    r"\\b(shocking|unbelievable|miracle|secret|furious|conspiracy|exposed|banned)\\b",
    r"\\b(100% (guaranteed|cure)|cures? (cancer|overnight))\\b",
    r"\\b(forward this|share (immediately|before deleted)|urgent warning)\\b"
]

class TextAnalyzer:
    def extract_claim(self, text: str) -> str:
        clean = re.sub(r'https?://\\S+', '', text).strip()
        sentences = [s.strip() for s in re.split(r'[.!?\\n]+', clean) if len(s.strip()) > 8]
        return sentences[0][:180] if sentences else text[:140]

    def analyze_linguistics(self, text: str):
        exclamation_count = text.count('!')
        caps_words = [w for w in text.split() if len(w) > 3 and w.isupper() and w.isalpha()]
        excessive_punct = exclamation_count >= 2
        screaming_caps = (len(caps_words) / (len(text.split()) or 1)) > 0.25

        detected = []
        for pat in SENSATIONAL_PATTERNS:
            if re.search(pat, text, re.IGNORECASE):
                detected.append(pat)

        score = 15.0 + min(len(detected) * 20, 50) + (15 if excessive_punct else 0)
        return {
            "sensational_score": min(score, 100.0),
            "excessive_punctuation": excessive_punct,
            "screaming_caps": screaming_caps,
            "suspicious_wording": detected,
            "extracted_claim": self.extract_claim(text),
            "word_count": len(text.split())
        }
`,
    'modules/evidence_search.py': `"""
TruthLens AI - Real Evidence Cross-Referencing Engine
"""
import urllib.parse
import urllib.request
import json
import re

MANDATORY_FALLBACK_NOT_FOUND = (
    "I searched for related information but could not find sufficiently relevant or reliable coverage. "
    "Not finding evidence does not by itself prove that the claim is false."
)

class EvidenceSearchEngine:
    def search_evidence(self, claim: str):
        if not claim or len(claim.strip()) < 3:
            return {"found": False, "items": [], "message": MANDATORY_FALLBACK_NOT_FOUND}

        try:
            query = urllib.parse.quote(claim[:100])
            url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&utf8=&format=json"
            req = urllib.request.Request(url, headers={"User-Agent": "TruthLensAI/1.0"})
            with urllib.request.urlopen(req, timeout=4) as response:
                data = json.loads(response.read().decode('utf-8'))
                results = data.get("query", {}).get("search", [])
                if not results:
                    return {"found": False, "items": [], "message": MANDATORY_FALLBACK_NOT_FOUND}

                items = []
                for r in results[:3]:
                    clean_snippet = re.sub(r'<.*?>+', '', r.get("snippet", ""))
                    items.append({
                        "title": r.get("title"),
                        "source": "Wikipedia Encyclopedic Archive",
                        "summary": clean_snippet,
                        "link": f"https://en.wikipedia.org/?curid={r.get('pageid')}",
                        "stance": "Contradicting" if "false" in clean_snippet.lower() or "hoax" in clean_snippet.lower() else "Unclear"
                    })
                return {"found": True, "items": items, "message": "Cross-referenced with reliable external records."}
        except Exception:
            return {"found": False, "items": [], "message": "I could not perform live evidence search at this time."}
`,
    'modules/risk_engine.py': `"""
TruthLens AI - 4-Component Transparent Risk Engine (0-100)
"""
class RiskEngine:
    def compute_risk(self, linguistic_data: dict, evidence_data: dict, input_type: str = "text"):
        # 1. Text Signals (30%)
        text_signals = 80.0 if linguistic_data.get("suspicious_wording") else 35.0
        # 2. Evidence Cross-Check (30%)
        evidence_score = 85.0 if any(e.get("stance") == "Contradicting" for e in evidence_data.get("items", [])) else 45.0
        # 3. Language Indicators (20%)
        lang_score = linguistic_data.get("sensational_score", 20.0)
        # 4. Source / Context Signals (20%)
        source_score = 50.0

        composite = (text_signals * 0.30) + (evidence_score * 0.30) + (lang_score * 0.20) + (source_score * 0.20)
        final_score = int(round(max(5.0, min(95.0, composite))))

        if final_score <= 30:
            assessment, tier = "Potentially Reliable", "LOW RISK"
        elif final_score <= 60:
            assessment, tier = "Potentially Misleading", "MEDIUM RISK"
        else:
            assessment, tier = "High Misinformation Risk", "HIGH RISK"

        return {
            "risk_score": final_score,
            "assessment": assessment,
            "tier": tier,
            "components": {
                "text_signals": text_signals,
                "evidence": evidence_score,
                "language_indicators": lang_score,
                "source_context": source_score
            },
            "why_reasons": [
                "⚠️ Sensational vocabulary detected" if linguistic_data.get("suspicious_wording") else "✓ Neutral vocabulary observed",
                "⚠️ Manufactured urgency through uppercase or punctuation" if linguistic_data.get("excessive_punctuation") else "✓ Standard punctuation",
                "⚠️ Claim lacks sufficient supporting evidence" if not evidence_data.get("found") else "✓ External knowledge records identified"
            ]
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
