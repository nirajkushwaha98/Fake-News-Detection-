"""
TruthLens AI - Evidence Search Module
Searches reliable encyclopedic and fact-checking sources for claims.
Extracts title, source, summary, and link.
Classifies findings into:
  - Supporting (Green)
  - Unclear (Yellow)
  - Contradicting (Red)
Includes mandatory fallback wording when no reliable evidence is located.
"""

import urllib.parse
from typing import Dict, List, Any

MANDATORY_FALLBACK_NOT_FOUND = (
    "I searched for related information but could not find sufficiently relevant or reliable coverage. "
    "Not finding evidence does not by itself prove that the claim is false."
)

class EvidenceSearchEngine:
    def __init__(self):
        self.wiki_api = "https://en.wikipedia.org/w/api.php"

    def search_evidence(self, claim: str) -> Dict[str, Any]:
        """
        Searches reliable open sources for corroborating or debunking evidence.
        Never invents fake articles or hallucinated links.
        """
        if not claim or len(claim.strip()) < 3:
            return {
                "found": False,
                "items": [],
                "message": MANDATORY_FALLBACK_NOT_FOUND
            }

        try:
            import json
            import urllib.request
            import urllib.parse
            import re

            cleaned_query = urllib.parse.quote(claim.strip()[:100])
            url = f"{self.wiki_api}?action=query&list=search&srsearch={cleaned_query}&utf8=&format=json"
            
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "TruthLensAI-MisinformationScreening/1.0"}
            )

            with urllib.request.urlopen(req, timeout=4) as response:
                if response.status != 200:
                    return {
                        "found": False,
                        "items": [],
                        "message": "I could not perform live evidence search at this time."
                    }
                data = json.loads(response.read().decode('utf-8'))
            search_results = data.get("query", {}).get("search", [])

            if not search_results:
                return {
                    "found": False,
                    "items": [],
                    "message": MANDATORY_FALLBACK_NOT_FOUND
                }

            evidence_items: List[Dict[str, Any]] = []
            claim_lower = claim.lower()

            for item in search_results[:3]:
                raw_snippet = item.get("snippet", "")
                # Simple tag stripping
                import re
                clean_snippet = re.sub(r'<.*?>+', '', raw_snippet)
                title = item.get("title", "Related Record")
                pageid = item.get("pageid", "")
                link = f"https://en.wikipedia.org/?curid={pageid}"

                # Determine stance based on cross-examination
                snippet_lower = clean_snippet.lower()
                
                # Check contradiction signals
                contradict_words = ["debunked", "hoax", "false", "disproven", "myth", "conspiracy theory", "misconception", "no evidence"]
                support_words = ["confirmed", "proven", "official", "established", "demonstrated", "scientific consensus"]

                if any(cw in snippet_lower for cw in contradict_words):
                    stance = "Contradicting"
                    stance_tag = "🔴 Contradicting"
                elif any(sw in snippet_lower for sw in support_words):
                    stance = "Supporting"
                    stance_tag = "🟢 Supporting"
                else:
                    stance = "Unclear"
                    stance_tag = "🟡 Unclear"

                evidence_items.append({
                    "title": title,
                    "source": "Wikipedia Encyclopedic Knowledge Base",
                    "summary": clean_snippet,
                    "link": link,
                    "stance": stance,
                    "stance_tag": stance_tag
                })

            return {
                "found": True,
                "items": evidence_items,
                "message": f"Identified {len(evidence_items)} verifiable external records for cross-referencing."
            }

        except Exception as e:
            return {
                "found": False,
                "items": [],
                "message": "I could not perform live evidence search at this time.",
                "error_details": str(e)
            }

if __name__ == "__main__":
    engine = EvidenceSearchEngine()
    print(engine.search_evidence("Moon landing 1969"))
