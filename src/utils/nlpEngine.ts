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
  'free energy', 'mind control', 'depopulation', 'microchip implant', '5g radiation',
  'free recharge', 'free laptop', 'free money', 'lottery winner', 'stock up on candles',
  'emergency food', '15 days of total darkness', '15 days of darkness'
];

const SUSPICIOUS_PHRASES = [
  'share before it gets deleted',
  'share before it s deleted',
  'secret government memo',
  'miracle cure doctors hate',
  'what they are hiding from you',
  'what they don t want you to know',
  'forward to 10 groups',
  'forward to all your contacts',
  'forward this urgent message',
  'nasa confirmed 15 days of darkness',
  'drinking hot water kills virus',
  'boiled garlic water cures cancer',
  'unesco declared best anthem',
  'share immediately to save lives',
  'banks shutting down tomorrow',
  'mainstream media is ordered to stay silent',
  'mainstream media is silent',
  'sim cards will be deactivated',
  // Hinglish / Hindi phrases
  'turant forward karein',
  'sabko share karo',
  '10 logo ko bhejo',
  'group me forward karo',
  'modi ji de rahe hai free',
  'free recharge mil raha hai',
  'sarkari yojana free',
  'delete hone se pehle dekho',
  'sach samne aa gaya',
  'ramban ilaj'
];

const CREDIBLE_INDICATORS = [
  'according to a study published in',
  'according to a multi-center study published in',
  'reuters confirmed',
  'associated press reported',
  'world health organization issued',
  'centers for disease control stated',
  'peer-reviewed clinical trial',
  'data published by the national',
  'in a press briefing on monday',
  'spokesperson confirmed in official statement',
  'statistical analysis conducted by researchers',
  'the new england journal of medicine',
  'national weather service has issued',
  'national oceanic and atmospheric administration',
  'the lancet',
  'nature journal',
  'pib fact check',
  'indian space research organisation',
  'reserve bank of india announced'
];

const CATEGORY_MAP: Record<string, string[]> = {
  'Health & Medical': [
    'cure', 'cancer', 'diabetes', 'doctor', 'medicine', 'virus', 'infection', 'hospital',
    'vaccine', 'therapy', 'clinical', 'disease', 'garlic', 'lemon', 'home remedy', 'ilaj',
    'cardiovascular', 'hypertension', 'blood pressure'
  ],
  'Science & Technology': [
    'nasa', 'isro', 'space', 'satellite', 'physics', 'solar', 'telescope', 'exoplanet',
    'climate', 'atmosphere', 'earth', 'moon', 'venus', 'jupiter', 'researchers', 'revolves', 'astronomy'
  ],
  'Governance & Policy': [
    'government', 'ministry', 'federal', 'bill', 'court', 'parliament', 'police', 'military',
    'sarkar', 'yojana', 'modi', 'advisory', 'official', 'regulations', 'unesco'
  ],
  'Financial & Economy': [
    'bank', 'reserve bank', 'interest rate', 'rupees', 'dollar', 'crypto', 'free money',
    'lottery', 'recharge', 'tax', 'inflation', 'stock market', 'account deactivated'
  ],
  'Viral Hoax & Rumor': [
    '15 days darkness', 'forward to 10', 'alien', 'sim card deactivated',
    'secret memo', 'they are hiding', 'apocalypse', 'share before deleted'
  ]
};

export function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  let bestCategory = 'General News & Information';
  let maxMatches = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    const matches = keywords.filter(kw => lower.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = cat;
    }
  }

  return bestCategory;
}

export function extractClaim(text: string): string {
  if (!text || text.trim().length === 0) return 'No distinct claim provided';

  const clean = text.replace(/https?:\/\/\S+/gi, '').trim();
  const sentences = clean.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 8);

  if (sentences.length === 0) {
    return clean.slice(0, 160);
  }

  const claimSentence = sentences.find(s =>
    /\b(cures?|causes?|announced|proved|proves|discovered|leaked|confirmed|warning|alert|cancels?|destroys?|issued|published|revolves?|eliminates?)\b/i.test(s)
  );

  return (claimSentence || sentences[0]).slice(0, 180);
}

export function extractSearchQuery(text: string): string {
  if (!text) return '';
  const clean = text.replace(/https?:\/\/\S+/gi, '').replace(/[^a-zA-Z0-9\s]/g, ' ');
  let lower = clean.toLowerCase();

  const noiseWords = [
    'breaking', 'urgent', 'shocking', 'discovery', 'unbelievable', 'secret', 'leaked', 'confidential',
    'share immediately', 'forward this', 'before it gets deleted', 'before it s deleted',
    'doctors are furious', 'furious', 'they are hiding', 'what they don t want you to know',
    '100 guaranteed', 'overnight', 'share to 10 groups', 'viral alert', 'warning', 'must read',
    'life saving', 'according to a multi center study published in', 'according to', 'reported that',
    'pure', 'crushed', 'boiling', 'warm', 'banning this recipe everywhere', 'recipe', 'banned'
  ];

  for (const nw of noiseWords) {
    lower = lower.replace(new RegExp(`\\b${nw}\\b`, 'g'), ' ');
  }

  // Targeted queries for famous hoaxes / claims
  if (lower.includes('cancer') && (lower.includes('lemon') || lower.includes('garlic') || lower.includes('water'))) {
    return 'alternative cancer treatments garlic lemon unproven';
  }

  if (lower.includes('darkness') && (lower.includes('nasa') || lower.includes('earth') || lower.includes('venus') || lower.includes('jupiter'))) {
    return '15 days of darkness NASA hoax';
  }

  const stopwords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were', 'been',
    'has', 'have', 'had', 'will', 'would', 'shall', 'should', 'can', 'could', 'may',
    'might', 'all', 'any', 'some', 'our', 'your', 'their', 'into', 'over', 'about',
    'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how', 'not', 'out'
  ]);

  const tokens = lower.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
  return tokens.slice(0, 8).join(' ');
}

export function analyzeLinguistics(text: string): LinguisticAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      sensationalScore: 0,
      urgencyScore: 0,
      urgencyLevel: 'LOW',
      emotionalTone: 'Neutral',
      excessivePunctuation: false,
      screamingCaps: false,
      absoluteClaims: false,
      suspiciousPhrases: [],
      sensationalKeywords: [],
      credibilityIndicators: [],
      category: 'General',
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

  // 3. Absolute assertion detection
  const absoluteClaims = /\b(100%|cures? overnight|guaranteed|miracle|permanent cure|ramban ilaj)\b/i.test(lower);

  // 4. Sensational keyword checks
  const detectedKeywords: string[] = [];
  for (const sw of SENSATIONAL_WORDS) {
    if (new RegExp(`\\b${sw}\\b`, 'i').test(text)) {
      detectedKeywords.push(sw);
    }
  }

  // 5. Suspicious phrases
  const detectedPhrases: string[] = [];
  for (const phrase of SUSPICIOUS_PHRASES) {
    if (lower.includes(phrase)) {
      detectedPhrases.push(phrase);
    }
  }

  // 6. Credibility indicators
  const foundCredibility: string[] = [];
  for (const ci of CREDIBLE_INDICATORS) {
    if (lower.includes(ci)) {
      foundCredibility.push(ci);
    }
  }

  // 7. Urgency & Emotional Tone Calculation
  let urgencyScore = 0;
  if (excessivePunctuation) urgencyScore += 30;
  if (screamingCaps) urgencyScore += 25;
  if (/\b(urgent|immediately|act now|warning|turant|sabko|jaldi)\b/i.test(lower)) {
    urgencyScore += 35;
  }

  let urgencyLevel: 'LOW' | 'NORMAL' | 'MODERATE' | 'CRITICAL';
  if (urgencyScore >= 50) urgencyLevel = 'CRITICAL';
  else if (urgencyScore >= 25) urgencyLevel = 'MODERATE';
  else urgencyLevel = 'NORMAL';

  let emotionalTone = 'Neutral / Informative';
  if (detectedKeywords.length > 0 && urgencyScore > 25) {
    emotionalTone = 'Alarmist / Clickbait';
  } else if (/\b(conspiracy|hiding|secret bunker|mafia|cover-up|suppressed)\b/i.test(lower)) {
    emotionalTone = 'Conspiratorial';
  } else if (foundCredibility.length > 0) {
    emotionalTone = 'Objective & Sourced';
  }

  // Compute Sensational Score (0 to 100)
  // Baseline for clean, objective text is 10.0
  let score = 10.0;
  if (detectedKeywords.length > 0) {
    score += Math.min(detectedKeywords.length * 16, 48);
  }
  if (detectedPhrases.length > 0) {
    score += Math.min(detectedPhrases.length * 20, 40);
  }
  if (excessivePunctuation) {
    score += 14;
  }
  if (screamingCaps) {
    score += 16;
  }
  if (absoluteClaims) {
    score += 20;
  }
  if (foundCredibility.length > 0) {
    score = Math.max(5, score - 30);
  }

  const category = detectCategory(text);

  return {
    sensationalScore: Math.min(100, Math.round(score)),
    urgencyScore,
    urgencyLevel,
    emotionalTone,
    excessivePunctuation,
    screamingCaps,
    absoluteClaims,
    suspiciousPhrases: Array.from(new Set(detectedPhrases)),
    sensationalKeywords: Array.from(new Set(detectedKeywords)),
    credibilityIndicators: Array.from(new Set(foundCredibility)),
    category,
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
  confidenceScore: number;
  credibilityRating: string;
  category: string;
  emotionalTone: string;
  urgencyLevel: string;
  scoreComponents: ScoreComponents;
  whyReasons: string[];
  actionableGuidance: string[];
} {
  const fullTextLower = originalText.toLowerCase();

  // -------------------------------------------------------------
  // 1. Language Indicators (20% weight)
  // -------------------------------------------------------------
  let languageIndicators = linguistic.sensationalScore;
  if (linguistic.excessivePunctuation) languageIndicators = Math.min(100, languageIndicators + 10);
  if (linguistic.screamingCaps) languageIndicators = Math.min(100, languageIndicators + 10);
  if (linguistic.absoluteClaims) languageIndicators = Math.min(100, languageIndicators + 15);

  // -------------------------------------------------------------
  // 2. Source & Context Indicators (20% weight)
  // -------------------------------------------------------------
  const isForwardChain = [
    'whatsapp', 'forwarded', 'forward to', 'forward this', 'share immediately', 'share this',
    'before deleted', 'before it gets deleted', "before it's deleted", 'sabko bhejo',
    'groups', '10 groups', 'group me', 'turant share', 'turant forward', 'turant', 'sabko',
    'facebook', 'share this secret', 'share this life-saving', 'mainstream media is silent',
    'mainstream media is ordered', 'they are banning', 'deactivated by military',
    'shutting down tomorrow', 'stock up now', 'stock up on candles', 'protect your bank',
    'stock up', 'emergency food', 'gharelu nuskha', '100% guarantee'
  ].some(term => fullTextLower.includes(term));

  let sourceContext = 18.0;
  if (isForwardChain) {
    sourceContext = 85.0;
  } else if (linguistic.credibilityIndicators.length > 0) {
    sourceContext = 10.0;
  }

  // -------------------------------------------------------------
  // 3. Evidence Cross-Check (30% weight)
  // -------------------------------------------------------------
  let evidenceScore = 28.0; // Baseline for unverified neutral claim
  const contradictions = evidenceItems.filter(e => e.stance === 'Contradicting');
  const supportings = evidenceItems.filter(e => e.stance === 'Supporting');

  if (evidenceFound && evidenceItems.length > 0) {
    if (contradictions.length > 0) {
      evidenceScore = Math.min(100, 88.0 + contradictions.length * 4);
    } else if (supportings.length > 0) {
      evidenceScore = Math.max(6, 14.0 - supportings.length * 3);
    } else {
      // Unclear / contextual
      if (linguistic.absoluteClaims || (fullTextLower.includes('cancer') && fullTextLower.includes('cure')) || isForwardChain) {
        evidenceScore = 78.0;
      } else {
        evidenceScore = 28.0;
      }
    }
  } else {
    // Uncorroborated claim
    if (linguistic.absoluteClaims || (fullTextLower.includes('cancer') && fullTextLower.includes('cure')) || isForwardChain || linguistic.sensationalKeywords.length >= 2) {
      evidenceScore = 82.0;
    } else {
      evidenceScore = 38.0;
    }
  }

  // -------------------------------------------------------------
  // 4. Text Signals (30% weight)
  // -------------------------------------------------------------
  let textSignals = 16.0;
  if (linguistic.sensationalKeywords.length >= 2 || linguistic.suspiciousPhrases.length > 0 || linguistic.absoluteClaims) {
    textSignals = 82.0;
  } else if (linguistic.sensationalKeywords.length === 1) {
    textSignals = 55.0;
  }

  if (linguistic.credibilityIndicators.length > 0) {
    textSignals = Math.max(6, textSignals - 25);
  }

  // -------------------------------------------------------------
  // Composite Weighted Sum:
  // Text 30%, Evidence 30%, Language 20%, Source 20%
  // -------------------------------------------------------------
  const weighted =
    (textSignals * 0.30) +
    (evidenceScore * 0.30) +
    (languageIndicators * 0.20) +
    (sourceContext * 0.20);

  const finalRisk = Math.max(5, Math.min(95, Math.round(weighted)));

  // Determine Assessment Tier and Level
  let assessment: AssessmentTier;
  let riskLevel: RiskLevel;
  let credibilityRating: string;

  if (finalRisk <= 30) {
    assessment = 'Potentially Reliable';
    riskLevel = 'LOW';
    credibilityRating = 'High Credibility — Verifiable markers present';
  } else if (finalRisk <= 60) {
    assessment = 'Potentially Misleading';
    riskLevel = 'MEDIUM';
    credibilityRating = 'Moderate / Mixed — Requires independent verification';
  } else {
    assessment = 'High Misinformation Risk';
    riskLevel = 'HIGH';
    credibilityRating = 'Low Credibility — High probability of manipulation';
  }

  // Confidence Calculation
  const signalVariance = Math.abs(textSignals - evidenceScore) + Math.abs(languageIndicators - sourceContext);
  let confidenceScore = 84;
  if (signalVariance < 30) confidenceScore = 92;
  else if (signalVariance > 60) confidenceScore = 75;

  // Construct Detailed Explainability Reasons
  const whyReasons: string[] = [];

  const allSensational = [...linguistic.sensationalKeywords, ...linguistic.suspiciousPhrases];
  if (allSensational.length > 0) {
    whyReasons.push(`⚠️ Sensational or clickbait phrasing detected: ${allSensational.slice(0, 3).join(', ')}`);
  }
  if (linguistic.excessivePunctuation || linguistic.screamingCaps) {
    whyReasons.push('⚠️ Manufactured urgency via excessive punctuation or uppercase emphasis');
  }
  if (linguistic.absoluteClaims) {
    whyReasons.push("⚠️ Extreme absolute claims ('100% cure', 'overnight') typical of pseudoscience");
  }
  if (isForwardChain) {
    whyReasons.push('⚠️ Virality encouragement markers typical of unverified social media chains');
  }

  if (evidenceFound && evidenceItems.length > 0) {
    if (contradictions.length > 0) {
      whyReasons.push(`⚠️ Conflicting documentation found in reference archives (${contradictions[0].title})`);
    } else if (supportings.length > 0) {
      whyReasons.push(`✓ Verifiable encyclopedic or scientific coverage corroborates core claim (${supportings[0].title})`);
    } else {
      whyReasons.push('ℹ️ General contextual information located; specific assertion remains unindexed');
    }
  } else {
    whyReasons.push('ℹ️ No exact encyclopedic record located (absence of evidence does not alone indicate falsehood)');
  }

  if (linguistic.credibilityIndicators.length > 0) {
    whyReasons.push(`✓ Formal attribution to recognized institutions or clinical trials observed: ${linguistic.credibilityIndicators.slice(0, 2).join(', ')}`);
  } else if (allSensational.length === 0 && finalRisk <= 30) {
    whyReasons.push('✓ Factual, objective framing without manipulative or alarmist rhetorical devices');
  }

  // Construct Actionable Guidance
  const actionableGuidance: string[] = [];
  if (riskLevel === 'HIGH') {
    actionableGuidance.push('🚫 Do not forward or amplify this claim on social media or messaging apps.');
    if (linguistic.category === 'Health & Medical') {
      actionableGuidance.push('🩺 Consult a certified medical doctor or check WHO / ICMR before trying home remedies.');
    } else if (linguistic.category === 'Financial & Economy' || linguistic.category === 'Viral Hoax & Rumor') {
      actionableGuidance.push('🛡️ Beware of phishing links or fraudulent messages impersonating authorities.');
    }
    actionableGuidance.push('🔍 Check trusted fact-checking platforms such as PIB Fact Check, Alt News, or Reuters Fact Check.');
  } else if (riskLevel === 'MEDIUM') {
    actionableGuidance.push('⚠️ Exercise caution: Key claims are either partially accurate, lacking context, or unverified.');
    actionableGuidance.push('🔎 Search for official press releases from the mentioned organizations before sharing.');
  } else {
    actionableGuidance.push('✅ Content aligns with verified sources and objective institutional standards.');
    actionableGuidance.push('📖 Safe to reference with proper contextual attribution.');
  }

  return {
    riskScore: finalRisk,
    riskLevel,
    assessment,
    confidenceScore,
    credibilityRating,
    category: linguistic.category,
    emotionalTone: linguistic.emotionalTone,
    urgencyLevel: linguistic.urgencyLevel,
    scoreComponents: {
      textSignals: Math.round(textSignals),
      evidence: Math.round(evidenceScore),
      languageIndicators: Math.round(languageIndicators),
      sourceContext: Math.round(sourceContext)
    },
    whyReasons,
    actionableGuidance
  };
}

export function buildReadAloudScript(result: Partial<VerificationResult>): string {
  const parts: string[] = [
    `TruthLens AI verification report.`,
    `Category: ${result.category || 'General'}.`,
    `Assessment: ${result.assessment || 'Analysis complete'}.`,
    `The misinformation risk score is ${result.riskScore || 0} out of 100, classified as ${result.riskLevel || ''} risk.`,
    `Confidence rating is ${result.confidenceScore || 90} percent.`
  ];

  if (result.extractedClaim) {
    parts.push(`Extracted claim: "${result.extractedClaim}".`);
  }

  if (result.whyReasons && result.whyReasons.length > 0) {
    const cleanReasons = result.whyReasons.map(r => r.replace(/^[⚠️✓ℹ️]\s*/, ''));
    parts.push(`Key findings: ${cleanReasons.join('. ')}.`);
  }

  if (result.actionableGuidance && result.actionableGuidance.length > 0) {
    const cleanGuidance = result.actionableGuidance.map(g => g.replace(/^[🚫🩺🛡️🔍⚠️✅📖]\s*/, ''));
    parts.push(`Recommended action: ${cleanGuidance.join('. ')}.`);
  }

  parts.push(`Reminder: Not finding evidence does not by itself prove that a claim is false.`);

  return parts.join(' ');
}
