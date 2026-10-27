import {
  AssessmentTier,
  EvidenceItem,
  LinguisticAnalysis,
  RiskLevel,
  ScoreComponents,
  VerificationResult,
  InputMode
} from '../types';

export const MANDATORY_FALLBACK_NOT_FOUND =
  "I searched for related information but could not find sufficiently relevant or reliable coverage. Not finding evidence does not by itself prove that the claim is false.";

const SENSATIONAL_WORDS = [
  'shocking', 'unbelievable', 'miracle', 'secret', 'furious', 'conspiracy', 'exposed',
  'banned', 'classified', 'leaked', 'hoax', 'disaster', 'catastrophe', 'apocalypse',
  'guaranteed', 'instant cure', '100% cure', 'cure cancer', 'cure diabetes',
  'doctors hate this', 'they are hiding', 'spread this', 'forward this', 'share immediately',
  'urgent alert', 'urgent warning', 'shutting down', 'military taking over', 'alien technology',
  'free energy', 'mind control', 'depopulation', 'microchip implant', '5g radiation'
];

const SUSPICIOUS_PHRASES = [
  'share before it gets deleted',
  'secret government memo',
  'miracle cure doctors hate',
  'what they are hiding from you',
  'forward to 10 groups',
  'forward to all your contacts',
  'nasa confirmed 15 days of darkness',
  'drinking hot water kills virus',
  'unesco declared best anthem',
  'share immediately to save lives',
  'banks shutting down tomorrow'
];

const CREDIBILITY_INDICATORS = [
  'according to a study published in',
  'reuters confirmed',
  'associated press reported',
  'world health organization issued',
  'centers for disease control stated',
  'peer-reviewed clinical trial',
  'data published by the national',
  'in a press briefing on monday',
  'spokesperson confirmed in official statement',
  'statistical analysis conducted by researchers'
];

export function extractClaim(text: string): string {
  if (!text || text.trim().length === 0) return 'No distinct claim provided';
  
  // Clean text from URLs and excess whitespace
  const clean = text.replace(/https?:\/\/\S+/gi, '').trim();
  const sentences = clean.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 8);
  
  if (sentences.length === 0) {
    return clean.slice(0, 150);
  }

  // Look for a sentence with an assertive claim verb
  const claimSentence = sentences.find(s => 
    /\b(cures?|causes?|announced|proved|proves|discovered|leaked|confirmed|warning|alert|cancels?|destroys?)\b/i.test(s)
  );

  return (claimSentence || sentences[0]).slice(0, 180);
}

export function analyzeLinguistics(text: string): LinguisticAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      sensationalScore: 0,
      excessivePunctuation: false,
      screamingCaps: false,
      suspiciousPhrases: [],
      sensationalKeywords: [],
      credibilityIndicators: [],
      wordCount: 0
    };
  }

  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const totalWords = words.length || 1;

  // 1. Punctuation checks
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const excessivePunctuation = exclamationCount >= 2 || questionCount >= 3;

  // 2. Screaming caps
  const capsWords = words.filter(w => w.length > 3 && w === w.toUpperCase() && /^[A-Z]+$/.test(w));
  const screamingCaps = (capsWords.length / totalWords > 0.22 && capsWords.length >= 2) || (text.length > 20 && text === text.toUpperCase());

  // 3. Sensational keyword checks
  const detectedKeywords: string[] = [];
  for (const sw of SENSATIONAL_WORDS) {
    if (new RegExp(`\\b${sw}\\b`, 'i').test(text)) {
      detectedKeywords.push(sw);
    }
  }

  // 4. Suspicious phrases
  const detectedPhrases: string[] = [];
  for (const phrase of SUSPICIOUS_PHRASES) {
    if (lower.includes(phrase)) {
      detectedPhrases.push(phrase);
    }
  }

  // 5. Credibility indicators
  const foundCredibility: string[] = [];
  for (const ci of CREDIBILITY_INDICATORS) {
    if (lower.includes(ci)) {
      foundCredibility.push(ci);
    }
  }

  // Compute sensational score (0 to 100)
  let score = 15.0;
  if (detectedKeywords.length > 0) {
    score += Math.min(detectedKeywords.length * 16, 48);
  }
  if (detectedPhrases.length > 0) {
    score += Math.min(detectedPhrases.length * 20, 40);
  }
  if (excessivePunctuation) {
    score += 16;
  }
  if (screamingCaps) {
    score += 18;
  }
  if (foundCredibility.length > 0) {
    score = Math.max(5, score - 30);
  }

  return {
    sensationalScore: Math.min(100, Math.round(score)),
    excessivePunctuation,
    screamingCaps,
    suspiciousPhrases: Array.from(new Set(detectedPhrases)),
    sensationalKeywords: Array.from(new Set(detectedKeywords)),
    credibilityIndicators: Array.from(new Set(foundCredibility)),
    wordCount: totalWords
  };
}

export function computeRiskScore(
  linguistic: LinguisticAnalysis,
  evidenceItems: EvidenceItem[],
  evidenceFound: boolean,
  inputType: InputMode,
  originalText: string
): {
  riskScore: number;
  riskLevel: RiskLevel;
  assessment: AssessmentTier;
  scoreComponents: ScoreComponents;
  whyReasons: string[];
} {
  // 1. Text Signals (30% weight)
  let textSignals = 30.0;
  if (linguistic.sensationalKeywords.length >= 2 || linguistic.suspiciousPhrases.length > 0) {
    textSignals = 82.0;
  } else if (linguistic.credibilityIndicators.length > 0) {
    textSignals = 18.0;
  } else if (linguistic.wordCount < 8) {
    textSignals = 45.0; // Short text penalty
  } else {
    textSignals = 35.0;
  }

  // 2. Evidence Cross-Check (30% weight)
  let evidenceScore = 50.0; // Neutral baseline when unverified
  if (evidenceFound && evidenceItems.length > 0) {
    const contradictions = evidenceItems.filter(e => e.stance === 'Contradicting');
    const supporting = evidenceItems.filter(e => e.stance === 'Supporting');

    if (contradictions.length > 0) {
      evidenceScore = 88.0;
    } else if (supporting.length > 0) {
      evidenceScore = 14.0;
    } else {
      evidenceScore = 44.0;
    }
  } else {
    // Unverified claims default to moderate uncertainty
    evidenceScore = 58.0;
  }

  // 3. Language Indicators (20% weight)
  let languageIndicators = linguistic.sensationalScore;
  if (linguistic.excessivePunctuation) languageIndicators = Math.min(100, languageIndicators + 12);
  if (linguistic.screamingCaps) languageIndicators = Math.min(100, languageIndicators + 14);

  // 4. Source / Context Indicators (20% weight)
  let sourceContext = 45.0;
  const lowerText = originalText.toLowerCase();
  if (lowerText.includes('forwarded as received') || lowerText.includes('whatsapp') || lowerText.includes('forward to')) {
    sourceContext = 82.0;
  } else if (linguistic.credibilityIndicators.length > 0) {
    sourceContext = 18.0;
  } else if (inputType === 'image' && linguistic.wordCount > 30) {
    sourceContext = 40.0;
  }

  // Composite Weighted Sum: Text 30%, Evidence 30%, Language 20%, Source 20%
  const weighted =
    (textSignals * 0.30) +
    (evidenceScore * 0.30) +
    (languageIndicators * 0.20) +
    (sourceContext * 0.20);

  const finalRisk = Math.max(5, Math.min(95, Math.round(weighted)));

  // Determine Assessment Tier and Level
  let assessment: AssessmentTier;
  let riskLevel: RiskLevel;

  if (finalRisk <= 30) {
    assessment = 'Potentially Reliable';
    riskLevel = 'LOW';
  } else if (finalRisk <= 60) {
    assessment = 'Potentially Misleading';
    riskLevel = 'MEDIUM';
  } else {
    assessment = 'High Misinformation Risk';
    riskLevel = 'HIGH';
  }

  // Construct "Why this result?"
  const whyReasons: string[] = [];
  if (linguistic.sensationalKeywords.length > 0) {
    whyReasons.push(`⚠️ Sensational wording detected: ${linguistic.sensationalKeywords.slice(0, 3).join(', ')}`);
  }
  if (linguistic.excessivePunctuation || linguistic.screamingCaps) {
    whyReasons.push('⚠️ Manufactured urgency via excessive punctuation or uppercase emphasis');
  }
  if (evidenceFound && evidenceItems.length > 0) {
    const hasContradiction = evidenceItems.some(e => e.stance === 'Contradicting');
    const hasSupporting = evidenceItems.some(e => e.stance === 'Supporting');
    if (hasContradiction) {
      whyReasons.push('⚠️ Documented encyclopedic and factual records conflict with submitted claim');
    } else if (hasSupporting) {
      whyReasons.push('✓ Corroborating coverage located across established knowledge archives');
    }
  } else {
    whyReasons.push('⚠️ Submitted claim could not be sufficiently corroborated by established reference sources');
  }
  if (linguistic.credibilityIndicators.length > 0) {
    whyReasons.push('✓ Content utilizes formal reporting citations and institutional references');
  }
  if (lowerText.includes('forwarded') || lowerText.includes('share')) {
    whyReasons.push('⚠️ Virality encouragement markers typical of unverified social media chains');
  }

  if (whyReasons.length === 0) {
    whyReasons.push('Neutral linguistic structure evaluated against baseline misinformation signals');
  }

  return {
    riskScore: finalRisk,
    riskLevel,
    assessment,
    scoreComponents: {
      textSignals: Math.round(textSignals),
      evidence: Math.round(evidenceScore),
      languageIndicators: Math.round(languageIndicators),
      sourceContext: Math.round(sourceContext)
    },
    whyReasons
  };
}

export function buildReadAloudScript(result: Partial<VerificationResult>): string {
  const parts: string[] = [
    `TruthLens AI verification summary.`,
    `Assessment: ${result.assessment || 'Analysis complete'}.`,
    `The misinformation risk score is ${result.riskScore || 0} out of 100, which is classified as ${result.riskLevel || ''} risk.`
  ];

  if (result.extractedClaim) {
    parts.push(`Extracted core claim: "${result.extractedClaim}".`);
  }

  if (result.whyReasons && result.whyReasons.length > 0) {
    const cleanReasons = result.whyReasons.map(r => r.replace(/^[⚠️✓]\s*/, ''));
    parts.push(`Key reasons: ${cleanReasons.join('. ')}.`);
  }

  if (result.evidenceItems && result.evidenceItems.length > 0) {
    parts.push(`Related information: Identified ${result.evidenceItems.length} reference records for cross checking.`);
  } else if (result.evidenceMessage) {
    parts.push(`Evidence status: ${result.evidenceMessage}`);
  }

  parts.push(`Reminder: Not finding evidence does not by itself prove that a claim is false.`);

  return parts.join(' ');
}
