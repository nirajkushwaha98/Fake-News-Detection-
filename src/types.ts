export type InputMode = 'text' | 'image' | 'voice';

export type AssessmentTier =
  | 'Potentially Reliable'
  | 'Potentially Misleading'
  | 'High Misinformation Risk'
  | 'Unable to Verify';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface UserProfile {
  name: string;
  email: string;
  isDemo: boolean;
}

export type Stance = 'Supporting' | 'Unclear' | 'Contradicting';

export interface EvidenceItem {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  stance: Stance;
  stanceLabel: string;
  relevanceScore?: number;
}

export interface ScoreComponents {
  textSignals: number;      // 30% weight
  evidence: number;         // 30% weight
  languageIndicators: number; // 20% weight
  sourceContext: number;    // 20% weight
}

export interface LinguisticAnalysis {
  sensationalScore: number;
  excessivePunctuation: boolean;
  screamingCaps: boolean;
  suspiciousPhrases: string[];
  sensationalKeywords: string[];
  credibilityIndicators: string[];
  wordCount: number;
  readingEase?: number;
}

export interface VerificationResult {
  id: string;
  timestamp: string;
  inputType: InputMode;
  originalInput: string;
  extractedClaim: string;
  riskScore: number;         // 0 - 100
  riskLevel: RiskLevel;      // LOW (0-30), MEDIUM (31-60), HIGH (61-100)
  assessment: AssessmentTier;
  whyReasons: string[];
  scoreComponents: ScoreComponents;
  evidenceFound: boolean;
  evidenceItems: EvidenceItem[];
  evidenceMessage: string;
  readAloudScript: string;
  linguistic: LinguisticAnalysis;
  mediaDetails?: {
    imagePreviewUrl?: string;
    ocrConfidence?: number;
    audioDuration?: number;
    transcriptLength?: number;
  };
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  inputType: InputMode;
  claim: string;
  riskScore: number;
  riskLevel: RiskLevel;
  assessment: AssessmentTier;
}

export interface PresetSample {
  id: string;
  title: string;
  category: 'WhatsApp Forward' | 'Sensational Medical' | 'Genuine Scientific' | 'Viral Rumor';
  type: InputMode;
  content: string;
  expectedTier: AssessmentTier;
  description: string;
}
