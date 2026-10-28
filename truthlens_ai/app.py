"""
TruthLens AI - Master Application Entry Point (Phase 1 Expo)
"See it. Hear it. Verify it."
Multimodal Misinformation Screening & Verification Assistant
"""

import os
import sys
import json

# Ensure truthlens_ai directory is in Python path for submodule imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

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
        """
        Unified multimodal verification pipeline:
        Input -> Extraction -> Linguistic Signals -> Evidence Cross-Check -> Risk Score -> Deep Analysis Data
        """
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
            "raw_text": processed_text,
            "extracted_claim": claim,
            "search_query": search_query,
            "risk_score": risk_result["risk_score"],
            "assessment": risk_result["assessment"],
            "tier": risk_result["tier"],
            "color": risk_result["color"],
            "confidence_score": risk_result.get("confidence_score", 90),
            "credibility_rating": risk_result.get("credibility_rating", ""),
            "category": risk_result.get("category", ling_result.get("category", "General")),
            "emotional_tone": risk_result.get("emotional_tone", ling_result.get("emotional_tone", "Neutral")),
            "urgency_level": risk_result.get("urgency_level", ling_result.get("urgency_level", "NORMAL")),
            "score_components": risk_result["components"],
            "why_reasons": risk_result["why_reasons"],
            "actionable_guidance": risk_result.get("actionable_guidance", []),
            "evidence_found": evidence_result["found"],
            "evidence_items": evidence_result.get("items", []),
            "evidence_message": evidence_result.get("message", MANDATORY_FALLBACK_NOT_FOUND),
            "speech_script": speech_script,
            "linguistic_data": {
                "suspicious_wording": ling_result.get("suspicious_wording", []),
                "credibility_indicators": ling_result.get("credibility_indicators", []),
                "sensational_score": ling_result.get("sensational_score", 0),
                "urgency_score": ling_result.get("urgency_score", 0),
                "excessive_punctuation": ling_result.get("excessive_punctuation", False),
                "screaming_caps": ling_result.get("screaming_caps", False),
                "word_count": ling_result.get("word_count", 0)
            }
        }

    def verify_image(self, image_path: str) -> dict:
        """Pipeline: IMAGE -> OCR -> TEXT -> VERIFICATION"""
        ocr_res = self.ocr_engine.extract_text(image_path)
        if not ocr_res.get("success", False) or not ocr_res.get("text", "").strip():
            return {
                "success": False,
                "input_type": "image",
                "error": ocr_res.get("error") or ocr_res.get("message", "No text detected in image."),
                "image_path": image_path
            }
        extracted_text = ocr_res["text"]
        result = self.verify_content(extracted_text, input_type="image")
        result["ocr_detected_text"] = extracted_text
        return result

    def verify_audio(self, audio_path: str) -> dict:
        """Pipeline: AUDIO -> SPEECH-TO-TEXT -> TRANSCRIPT -> VERIFICATION"""
        stt_res = self.voice_analyzer.transcribe_audio_file(audio_path)
        if not stt_res.get("success", False) or not stt_res.get("transcript", "").strip():
            return {
                "success": False,
                "input_type": "voice",
                "error": stt_res.get("error", "Transcription failed."),
                "audio_path": audio_path
            }
        transcript = stt_res["transcript"]
        result = self.verify_content(transcript, input_type="voice")
        result["voice_transcript"] = transcript
        return result

def print_result_banner(result: dict):
    print("\n" + "=" * 70)
    print("🛡️  TRUTHLENS AI - VERIFICATION RESULT")
    print("=" * 70)
    print(f"Risk Score:        {result['risk_score']} / 100 ({result['tier']})")
    print(f"Assessment:        {result['assessment']}")
    print(f"Category:          {result.get('category', 'General')}")
    print(f"Emotional Tone:    {result.get('emotional_tone', 'Neutral')}")
    print(f"Urgency Level:     {result.get('urgency_level', 'NORMAL')}")
    print(f"Confidence Score:  {result.get('confidence_score', 90)}%")
    print(f"Credibility:       {result.get('credibility_rating', 'Evaluated')}")
    print(f"Input Type:        {result['input_type'].upper()}")
    print("-" * 70)
    print(f"Extracted Claim:\n\"{result['extracted_claim']}\"")
    print("-" * 70)
    print("Why this result? (Explainable AI Breakdown):")
    for r in result["why_reasons"]:
        print(f"  {r}")
    print("-" * 70)
    print("Actionable Guidance for User:")
    for g in result.get("actionable_guidance", []):
        print(f"  {g}")
    print("-" * 70)
    print("Score Breakdown:")
    comps = result["score_components"]
    print(f"  • Text Signals:       {comps['text_signals']}% (Weight: 30%)")
    print(f"  • Evidence:           {comps['evidence']}% (Weight: 30%)")
    print(f"  • Language Markers:   {comps['language_indicators']}% (Weight: 20%)")
    print(f"  • Source / Context:   {comps['source_context']}% (Weight: 20%)")
    print("-" * 70)
    print("Related Information / Live Evidence Records:")
    if result["evidence_found"] and result["evidence_items"]:
        for idx, item in enumerate(result["evidence_items"], 1):
            print(f"  [{idx}] {item['title']} ({item.get('stance_tag', 'Reference')})")
            print(f"      Source: {item['source']}")
            print(f"      Summary: {item['summary'][:140]}...")
            print(f"      Link: {item['link']}")
    else:
        print(f"  {result['evidence_message']}")
    print("=" * 70)

def main():
    app = TruthLensApp()
    print("*" * 70)
    print("🛡️  TRUTHLENS AI (Phase 1 Prototype)")
    print("Tagline: 'See it. Hear it. Verify it.'")
    print("Multimodal Misinformation Screening & Verification Assistant")
    print("*" * 70)

    if len(sys.argv) > 1:
        test_text = " ".join(sys.argv[1:])
        res = app.verify_content(test_text)
        print_result_banner(res)
    else:
        # Interactive demo prompt
        sample = "URGENT: Drinking boiled lemon garlic water cures 100% of cancer overnight! Doctors are furious, share immediately!"
        print(f"\nRunning default sample analysis:\n\"{sample}\"\n")
        res = app.verify_content(sample)
        print_result_banner(res)
        print("\nAccessibility Read-Aloud Script:\n", res["speech_script"])

if __name__ == "__main__":
    main()
