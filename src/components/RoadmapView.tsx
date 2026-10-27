import React from 'react';
import { CheckCircle2, Clock, Rocket, GitBranch } from 'lucide-react';

interface RoadmapViewProps {
  accessibilityMode: boolean;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ accessibilityMode }) => {
  return (
    <div className={`space-y-8 max-w-4xl mx-auto ${accessibilityMode ? 'text-white' : 'text-slate-100'}`}>
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Product Evolution Roadmap</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          TruthLens AI Development Roadmap
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Honest distinction between our operational Phase-1 prototype and upcoming capabilities.
        </p>
      </div>

      {/* 3 Pillars Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CURRENT — PHASE 1 */}
        <div
          className={`p-6 rounded-2xl border flex flex-col justify-between ${
            accessibilityMode
              ? 'bg-black border-cyan-400'
              : 'bg-slate-900/90 border-cyan-500/50 shadow-xl shadow-cyan-500/10'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                CURRENT — PHASE 1
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>

            <h3 className="text-lg font-bold text-white mb-4">
              Operational Prototype
            </h3>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Text verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Explainable risk scoring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Image OCR</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Voice transcription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Evidence-assisted search</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Accessibility</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Implemented & Verified</span>
          </div>
        </div>

        {/* NEXT — PHASE 2 */}
        <div
          className={`p-6 rounded-2xl border flex flex-col justify-between ${
            accessibilityMode ? 'bg-black border-slate-700' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase bg-blue-950/80 border border-blue-800 text-blue-300">
                NEXT — PHASE 2
              </span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>

            <h3 className="text-lg font-bold text-white mb-4">
              Context & Consistency
            </h3>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">○</span>
                <span>Multimodal consistency checking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">○</span>
                <span>Context mismatch detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">○</span>
                <span>Old-image/new-claim detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">○</span>
                <span>Better source credibility assessment</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-blue-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>In Active Planning</span>
          </div>
        </div>

        {/* FUTURE */}
        <div
          className={`p-6 rounded-2xl border flex flex-col justify-between ${
            accessibilityMode ? 'bg-black border-slate-700' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase bg-purple-950/80 border border-purple-800 text-purple-300">
                FUTURE
              </span>
              <Rocket className="w-5 h-5 text-purple-400" />
            </div>

            <h3 className="text-lg font-bold text-white mb-4">
              Deep Forensics & Scale
            </h3>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold shrink-0">○</span>
                <span>Advanced image forensics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold shrink-0">○</span>
                <span>Audio deepfake detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold shrink-0">○</span>
                <span>More languages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold shrink-0">○</span>
                <span>Large-scale deployment</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-purple-400 font-semibold flex items-center gap-1.5">
            <Rocket className="w-4 h-4" />
            <span>Long-term Vision</span>
          </div>
        </div>
      </div>
    </div>
  );
};
