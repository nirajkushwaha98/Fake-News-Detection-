import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Mic,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { InputMode, UserProfile } from '../types';
import { speechEngine } from '../utils/speechEngine';

interface WelcomeScreenProps {
  user: UserProfile;
  onStartVerification: (mode?: InputMode) => void;
  accessibilityMode: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  user,
  onStartVerification,
  accessibilityMode
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedMode, setSelectedMode] = useState<InputMode>('text');

  const welcomeMessage =
    "Welcome to TruthLens AI. You are using Team VeriVox's misinformation verification assistant. See it, hear it, verify it.";

  const speakWelcome = () => {
    setIsSpeaking(true);
    speechEngine.speak(
      welcomeMessage,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const stopSpeaking = () => {
    speechEngine.stopSpeaking();
    setIsSpeaking(false);
  };

  // Attempt real browser text-to-speech on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Browser autoplay may block unprompted audio; the visible button provides 100% reliable fallback
      speakWelcome();
    }, 400);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 transition-colors duration-200 ${
        accessibilityMode ? 'bg-black text-white' : 'bg-[#060a12] text-slate-100'
      }`}
    >
      {/* Top Banner */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>TRUTHLENS AI</span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
                Phase-1 Expo
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Team VeriVox
            </div>
          </div>
        </div>

        {/* Audio control button */}
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              type="button"
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold animate-pulse"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Audio</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={speakWelcome}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-bold transition-all shadow-md shadow-cyan-950/30"
              title="Hear Welcome Message"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>🔊 HEAR WELCOME</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Welcome Content */}
      <div className="max-w-3xl w-full mx-auto my-auto py-8 text-center space-y-8">
        {/* Welcome Titles */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Team VeriVox</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Welcome to TruthLens AI
          </h1>

          <p className="text-lg sm:text-xl font-semibold italic text-cyan-400">
            &ldquo;See it. Hear it. Verify it.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            An AI-powered multimodal misinformation screening and verification assistant.
          </p>
        </div>

        {/* Real Audio Prompt Button (Prominent) */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={speakWelcome}
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              isSpeaking
                ? 'bg-rose-600 text-white animate-pulse'
                : accessibilityMode
                ? 'bg-yellow-400 text-black border border-white'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
            }`}
            aria-label="Click to hear spoken welcome message"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>{isSpeaking ? 'Speaking Welcome...' : '🔊 HEAR WELCOME'}</span>
          </button>
        </div>

        {/* 3 Modality Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
          {/* Text Card */}
          <div
            onClick={() => setSelectedMode('text')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all select-none ${
              selectedMode === 'text'
                ? accessibilityMode
                  ? 'bg-black border-cyan-400 ring-2 ring-cyan-400'
                  : 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500'
                : accessibilityMode
                ? 'bg-black border-slate-700'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📝</span>
              {selectedMode === 'text' && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              )}
            </div>
            <h3 className="font-bold text-white text-base mb-1">
              TEXT
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify a news article, headline or claim.
            </p>
          </div>

          {/* Image Card */}
          <div
            onClick={() => setSelectedMode('image')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all select-none ${
              selectedMode === 'image'
                ? accessibilityMode
                  ? 'bg-black border-cyan-400 ring-2 ring-cyan-400'
                  : 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500'
                : accessibilityMode
                ? 'bg-black border-slate-700'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🖼️</span>
              {selectedMode === 'image' && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              )}
            </div>
            <h3 className="font-bold text-white text-base mb-1">
              IMAGE
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan a screenshot or news image.
            </p>
          </div>

          {/* Voice Card */}
          <div
            onClick={() => setSelectedMode('voice')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all select-none ${
              selectedMode === 'voice'
                ? accessibilityMode
                  ? 'bg-black border-cyan-400 ring-2 ring-cyan-400'
                  : 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500'
                : accessibilityMode
                ? 'bg-black border-slate-700'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🎙️</span>
              {selectedMode === 'voice' && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              )}
            </div>
            <h3 className="font-bold text-white text-base mb-1">
              VOICE
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Speak or upload a claim.
            </p>
          </div>
        </div>

        {/* Main Action Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onStartVerification(selectedMode);
            }}
            className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm tracking-wider uppercase transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 mx-auto focus:outline-none focus:ring-2 focus:ring-cyan-400 hover:scale-[1.02]"
          >
            <span>START VERIFICATION</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-5xl w-full mx-auto text-center py-4 border-t border-slate-900 text-xs text-slate-500">
        TruthLens AI · Team VeriVox · Phase 1 Project Expo Prototype
      </div>
    </div>
  );
};
