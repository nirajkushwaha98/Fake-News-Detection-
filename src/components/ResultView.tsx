import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  ExternalLink,
  Search,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { VerificationResult } from '../types';

interface ResultViewProps {
  result: VerificationResult;
  onReset: () => void;
  accessibilityMode: boolean;
  isSpeaking: boolean;
  onReadAloud: () => void;
  onStopSpeaking: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onReset,
  accessibilityMode,
  isSpeaking,
  onReadAloud,
  onStopSpeaking
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySummary = () => {
    const text = `[TruthLens AI Verification Report]\nAssessment: ${result.assessment}\nRisk Score: ${result.riskScore}/100 (${result.riskLevel} RISK)\nClaim: "${result.extractedClaim}"\nKey Reasons:\n${result.whyReasons.join('\n')}\nVerified via TruthLens AI`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Badge & color mappings
  const isUnableToVerify = result.assessment === 'Unable to Verify';
  const isHighRisk = result.riskLevel === 'HIGH' && !isUnableToVerify;
  const isMediumRisk = result.riskLevel === 'MEDIUM' && !isUnableToVerify;
  const isLowRisk = result.riskLevel === 'LOW' && !isUnableToVerify;

  const riskColor = isUnableToVerify
    ? 'text-slate-300'
    : isLowRisk
    ? 'text-emerald-400'
    : isMediumRisk
    ? 'text-amber-400'
    : 'text-rose-400';

  const riskBg = isUnableToVerify
    ? 'bg-slate-800/40 border-slate-700/50'
    : isLowRisk
    ? 'bg-emerald-500/10 border-emerald-500/30'
    : isMediumRisk
    ? 'bg-amber-500/10 border-amber-500/30'
    : 'bg-rose-500/10 border-rose-500/30';

  const IconComponent = isUnableToVerify
    ? HelpCircle
    : isLowRisk
    ? ShieldCheck
    : isMediumRisk
    ? AlertTriangle
    : ShieldAlert;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        accessibilityMode
          ? 'bg-black border-cyan-400 p-6 sm:p-8 text-white'
          : 'bg-slate-900/90 border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-md'
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <span>TruthLens AI Analysis Report</span>
            <span>·</span>
            <span>Input: {result.inputType.toUpperCase()}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Screening & Verification Results
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Read Aloud Button */}
          <button
            type="button"
            onClick={isSpeaking ? onStopSpeaking : onReadAloud}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : accessibilityMode
                ? 'bg-yellow-400 text-black border border-white hover:bg-yellow-300'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
            }`}
            aria-label="Listen to verification result aloud"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Stop Reading</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>🔊 Read Result Aloud</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copy analysis summary"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            title="Verify another claim"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Verification</span>
          </button>
        </div>
      </div>

      {/* Main Verdict Card with Risk Score Meter */}
      <div className={`my-6 p-6 rounded-2xl border ${riskBg} flex flex-col md:flex-row items-center justify-between gap-6`}>
        {/* Left: Score Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative flex items-center justify-center">
            {/* Circular Gauge Ring */}
            <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center ${
              isLowRisk
                ? 'border-emerald-500 bg-emerald-950/40'
                : isMediumRisk
                ? 'border-amber-500 bg-amber-950/40'
                : 'border-rose-500 bg-rose-950/40'
            }`}>
              <span className={`text-3xl font-black ${riskColor}`}>
                {result.riskScore}
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <IconComponent className={`w-5 h-5 ${riskColor}`} />
              <span className={`text-xs font-black tracking-wider uppercase ${riskColor}`}>
                {result.riskLevel} MISINFORMATION RISK
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
              {result.assessment}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Score derived from composite weighted lexical, institutional citation, and external knowledge cross-checks.
            </p>
          </div>
        </div>

        {/* Right: Visual Meter Bar */}
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span className="text-emerald-400">LOW (0-30)</span>
            <span className="text-amber-400">MED (31-60)</span>
            <span className="text-rose-400">HIGH (61-100)</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
            <div className="w-[30%] bg-emerald-500/40 border-r border-slate-900" />
            <div className="w-[30%] bg-amber-500/40 border-r border-slate-900" />
            <div className="w-[40%] bg-rose-500/40" />
          </div>
          <div className="text-right text-[11px] text-slate-400">
            Risk Position: <strong className={riskColor}>{result.riskScore}%</strong>
          </div>
        </div>
      </div>

      {/* Extracted Claim Card */}
      <div className={`p-4 sm:p-5 rounded-xl border mb-6 ${
        accessibilityMode
          ? 'bg-black border-cyan-400'
          : 'bg-slate-950/80 border-slate-800'
      }`}>
        <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          <span>Extracted Core Claim:</span>
        </div>
        <blockquote className="text-base sm:text-lg font-medium italic text-slate-200 pl-3 border-l-2 border-cyan-500">
          &ldquo;{result.extractedClaim}&rdquo;
        </blockquote>
      </div>

      {/* Why This Result? (Explainability Engine) */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <span>Why this result?</span>
          <span className="text-xs font-normal text-slate-400">(Explainable AI Breakdown)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.whyReasons.map((reason, idx) => {
            const isWarning = reason.startsWith('⚠️');
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-2.5 ${
                  isWarning
                    ? 'bg-amber-950/25 border-amber-800/40 text-amber-200'
                    : 'bg-emerald-950/25 border-emerald-800/40 text-emerald-200'
                }`}
              >
                <span className="text-base shrink-0">
                  {isWarning ? '⚠️' : '✓'}
                </span>
                <span>{reason.replace(/^[⚠️✓]\s*/, '')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Breakdown (Transparent Weights) */}
      <div className="mb-6 p-5 rounded-xl border border-slate-800 bg-slate-950/50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          Score Breakdown & Mathematical Weights (0–100 Scale)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Text Signals</div>
            <div className="text-lg font-black text-cyan-400 mt-0.5">
              {result.scoreComponents.textSignals}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Weight: 30%</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evidence Check</div>
            <div className="text-lg font-black text-blue-400 mt-0.5">
              {result.scoreComponents.evidence}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Weight: 30%</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Language Markers</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">
              {result.scoreComponents.languageIndicators}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Weight: 20%</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Source / Context</div>
            <div className="text-lg font-black text-indigo-400 mt-0.5">
              {result.scoreComponents.sourceContext}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Weight: 20%</div>
          </div>
        </div>
      </div>

      {/* FIND RELATED / REAL NEWS SECTION */}
      <div className="border-t border-slate-800 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
              🔎 FIND RELATED INFORMATION
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Real Live Encyclopedic & Fact-Checking Cross-Check
          </span>
        </div>

        {result.evidenceFound && result.evidenceItems.length > 0 ? (
          <div className="space-y-3">
            {result.evidenceItems.map((item) => {
              const isSupport = item.stance === 'Supporting';
              const isContradict = item.stance === 'Contradicting';

              const badgeColor = isSupport
                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                : isContradict
                ? 'text-rose-400 bg-rose-950/60 border-rose-800'
                : 'text-amber-400 bg-amber-950/60 border-amber-800';

              const StanceIcon = isSupport
                ? CheckCircle2
                : isContradict
                ? XCircle
                : HelpCircle;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    accessibilityMode
                      ? 'bg-black border-cyan-400'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-100">
                        {item.title}
                      </span>
                      <span className="text-xs text-slate-400">({item.source})</span>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeColor}`}>
                      <StanceIcon className="w-3.5 h-3.5" />
                      <span>{item.stanceLabel}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                    {item.summary}
                  </p>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold focus:outline-none focus:underline"
                  >
                    <span>Inspect external source record</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          /* MANDATORY NO RELATED NEWS FOUND CARD */
          <div className="p-5 rounded-xl border border-amber-800/40 bg-amber-950/20 text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-slate-100">
                  &ldquo;I searched for related information but could not find sufficiently relevant or reliable coverage.&rdquo;
                </p>
                <p className="text-amber-300 font-medium">
                  &ldquo;Not finding evidence does not by itself prove that the claim is false.&rdquo;
                </p>
                <p className="text-slate-400 text-xs">
                  The claim may concern an emerging local event, an unindexed rumor, or an offline incident without established journalistic documentation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Disclaimer */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <span>TruthLens AI Phase 1 Prototype · Responsible AI Guidelines Applied</span>
        <span>Never claims 100% truth or 100% fake · Multi-signal screening assistant</span>
      </div>
    </div>
  );
};
