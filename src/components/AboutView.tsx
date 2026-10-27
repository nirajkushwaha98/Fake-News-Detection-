import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Layers,
  CheckCircle2,
  Users,
  Flag,
  FileCheck,
  Terminal,
  Activity
} from 'lucide-react';

interface AboutViewProps {
  accessibilityMode: boolean;
}

export const AboutView: React.FC<AboutViewProps> = ({ accessibilityMode }) => {
  const technologies = [
    { name: 'Python', desc: 'Core standalone ML training & pipeline scripts' },
    { name: 'NLP', desc: 'Text tokenization, lexical signal extraction, and claim isolation' },
    { name: 'TF-IDF', desc: 'Bi-gram feature vectorization with 5,000 top ngram dimensions' },
    { name: 'Machine Learning', desc: 'PassiveAggressive Classifier & transparent risk engine' },
    { name: 'OCR', desc: 'High-contrast client-side optical character recognition' },
    { name: 'Speech Processing', desc: 'Speech-to-text transcription and browser text-to-speech' },
    { name: 'Evidence Retrieval', desc: 'Real encyclopedic & fact-checking archive verification' }
  ];

  return (
    <div className={`space-y-8 max-w-4xl mx-auto ${accessibilityMode ? 'text-white' : 'text-slate-100'}`}>
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 mb-2">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          TRUTHLENS <span className="text-cyan-400">AI</span>
        </h1>
        <p className="text-base sm:text-lg font-medium italic text-cyan-300">
          &ldquo;See it. Hear it. Verify it.&rdquo;
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-bold uppercase tracking-wider mt-2">
          <Flag className="w-3.5 h-3.5" />
          <span>Status: PHASE 1 — EXPO PROTOTYPE</span>
        </div>
      </div>

      {/* Problem & Solution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem */}
        <div
          className={`p-6 sm:p-7 rounded-2xl border ${
            accessibilityMode
              ? 'bg-black border-rose-400'
              : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Problem</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            The Misinformation Crisis
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Misinformation spreads rapidly through text, images, audio and social media. Fast-paced online communication channels amplify fabricated claims before traditional investigative journalism can debunk them.
          </p>
        </div>

        {/* Solution */}
        <div
          className={`p-6 sm:p-7 rounded-2xl border ${
            accessibilityMode
              ? 'bg-black border-cyan-400'
              : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Solution</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            Multimodal Misinformation Screening
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            TruthLens AI provides multimodal misinformation screening, explainable risk assessment and evidence-assisted verification across text, news screenshots, and spoken audio claims.
          </p>
        </div>
      </div>

      {/* Technology Stack */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border ${
          accessibilityMode ? 'bg-black border-cyan-400' : 'bg-slate-900/80 border-slate-800 shadow-xl'
        }`}
      >
        <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-wider text-cyan-400">
          <Cpu className="w-4 h-4" />
          <span>Technology</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-6">
          Architectural Core & Algorithms
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {technologies.map((tech, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold text-sm text-slate-100">{tech.name}</span>
              </div>
              <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                {tech.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team & Verification Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`p-6 rounded-2xl border ${
            accessibilityMode ? 'bg-black border-cyan-400' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Team</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Team VeriVox
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-2">
            Dedicated engineering team focused on transparent AI screening, ethical credibility metrics, and accessibility-first verification tools.
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border ${
            accessibilityMode ? 'bg-black border-cyan-400' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span>Responsible AI Commitment</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Honest Verification
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-2">
            TruthLens AI avoids categorical binary verdicts like &ldquo;100% fake&rdquo;. Instead, it provides explainable risk scores (0–100) and evidence context so users make informed conclusions.
          </p>
        </div>
      </div>
    </div>
  );
};
