import { EvidenceItem, Stance } from '../types';
import { MANDATORY_FALLBACK_NOT_FOUND } from './nlpEngine';

export interface EvidenceSearchResult {
  found: boolean;
  items: EvidenceItem[];
  message: string;
}

const CONTRADICTING_TERMS = [
  'debunked', 'hoax', 'false claim', 'misconception', 'urban legend', 'conspiracy theory',
  'discredited', 'refuted', 'no scientific evidence', 'unsubstantiated', 'fact check: false',
  'fabricated', 'myth'
];

const SUPPORTING_TERMS = [
  'confirmed by', 'officially announced', 'peer-reviewed', 'clinical trial proved',
  'documented by', 'verified report', 'unanimously approved', 'established consensus'
];

function determineStance(snippet: string, title: string): { stance: Stance; label: string } {
  const text = `${title} ${snippet}`.toLowerCase();

  for (const term of CONTRADICTING_TERMS) {
    if (text.includes(term)) {
      return { stance: 'Contradicting', label: '🔴 Contradicting' };
    }
  }

  for (const term of SUPPORTING_TERMS) {
    if (text.includes(term)) {
      return { stance: 'Supporting', label: '🟢 Supporting' };
    }
  }

  return { stance: 'Unclear', label: '🟡 Unclear' };
}

export async function searchRelatedEvidence(claim: string): Promise<EvidenceSearchResult> {
  if (!claim || claim.trim().length < 4) {
    return {
      found: false,
      items: [],
      message: MANDATORY_FALLBACK_NOT_FOUND
    };
  }

  try {
    // 1. Try server proxy endpoint first
    try {
      const serverRes = await fetch(`/api/evidence?q=${encodeURIComponent(claim)}`);
      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.found && Array.isArray(data.evidence) && data.evidence.length > 0) {
          const items: EvidenceItem[] = data.evidence.map((item: any) => {
            const { stance, label } = determineStance(item.summary || '', item.title || '');
            return {
              id: item.id || `evidence-${Math.random()}`,
              title: item.title,
              source: item.source || 'Wikipedia Database',
              summary: item.summary,
              url: item.url,
              stance,
              stanceLabel: label
            };
          });

          return {
            found: true,
            items,
            message: `Identified ${items.length} relevant reference records from reliable open knowledge sources.`
          };
        }
      }
    } catch {
      // Fall through to direct client-side Wikipedia API call
    }

    // 2. Direct client-side Wikipedia CORS fetch
    // Wikipedia API supports origin=* for open cross-origin requests
    const cleanQuery = encodeURIComponent(claim.trim().slice(0, 100));
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${cleanQuery}&utf8=&format=json&origin=*`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        found: false,
        items: [],
        message: "I could not perform live evidence search at this time."
      };
    }

    const json = await res.json();
    const searchResults = json?.query?.search || [];

    if (searchResults.length === 0) {
      return {
        found: false,
        items: [],
        message: MANDATORY_FALLBACK_NOT_FOUND
      };
    }

    const items: EvidenceItem[] = searchResults.slice(0, 3).map((result: any) => {
      const cleanSnippet = (result.snippet || '')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&');

      const { stance, label } = determineStance(cleanSnippet, result.title);

      return {
        id: `wiki-${result.pageid}`,
        title: result.title,
        source: 'Wikipedia Encyclopedic Archive',
        summary: cleanSnippet,
        url: `https://en.wikipedia.org/?curid=${result.pageid}`,
        stance,
        stanceLabel: label
      };
    });

    return {
      found: items.length > 0,
      items,
      message: `Identified ${items.length} relevant external records for claim verification.`
    };
  } catch {
    // If offline or network error, return responsible fallback
    return {
      found: false,
      items: [],
      message: "I could not perform live evidence search at this time."
    };
  }
}
