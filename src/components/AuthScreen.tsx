import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, UserCheck, Lock, Mail, User, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  accessibilityMode,
  onToggleAccessibility
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 4) {
        setError('Password should be at least 4 characters for Phase 1 demo.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your entry.');
        return;
      }

      onLogin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        isDemo: false
      });
    } else {
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      // Lightweight Phase-1 session authentication
      const displayName = email.split('@')[0];
      const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      onLogin({
        name: capitalized || 'Verified Evaluator',
        email: email.trim().toLowerCase(),
        isDemo: false
      });
    }
  };

  const handleContinueAsDemo = () => {
    onLogin({
      name: 'Demo Evaluator',
      email: 'demo@verivox.truthlens.ai',
      isDemo: true
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 transition-colors duration-200 ${
        accessibilityMode ? 'bg-black text-white' : 'bg-[#060a12] text-slate-100'
      }`}
    >
      {/* Top Bar with Accessibility Control */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-300">
            TEAM VERIVOX
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleAccessibility}
          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
            accessibilityMode
              ? 'bg-yellow-400 text-black border-yellow-300'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/50'
          }`}
          aria-pressed={accessibilityMode}
        >
          ♿ Accessibility Mode
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div
          className={`rounded-2xl border transition-all ${
            accessibilityMode
              ? 'bg-black border-cyan-400 p-6 sm:p-8'
              : 'bg-slate-900/90 border-slate-800 shadow-2xl shadow-cyan-950/40 backdrop-blur-md p-6 sm:p-8'
          }`}
        >
          {/* Brand Presentation */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 mb-3">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              TRUTHLENS <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-sm font-medium italic text-cyan-300 mt-1">
              &ldquo;See it. Hear it. Verify it.&rdquo;
            </p>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
              AI-powered multimodal misinformation screening assistant.
            </p>
          </div>

          {/* Toggle Login vs Sign Up */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm tracking-wide uppercase transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <span>{mode === 'login' ? 'LOGIN' : 'SIGN UP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              OR FOR LIVE PROJECT EXPO
            </span>
          </div>

          {/* Continue as Demo User (Mandatory Requirement) */}
          <button
            type="button"
            onClick={handleContinueAsDemo}
            className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>CONTINUE AS DEMO USER</span>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-md w-full mx-auto text-center py-4 text-[11px] text-slate-500 space-y-1">
        <p>TruthLens AI · Developed by Team VeriVox</p>
        <p>Phase 1 Project Expo Prototype · Responsible AI Misinformation Screening</p>
      </div>
    </div>
  );
};
