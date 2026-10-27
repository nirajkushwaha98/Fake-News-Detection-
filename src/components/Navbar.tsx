import React from 'react';
import {
  ShieldAlert,
  Activity,
  History,
  Compass,
  Info,
  Code2,
  Volume2,
  VolumeX,
  Eye,
  LogOut,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accessibilityMode: boolean;
  setAccessibilityMode: (mode: boolean) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onReopenWelcome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  accessibilityMode,
  setAccessibilityMode,
  isSpeaking,
  onStopSpeaking,
  user,
  onLogout,
  onReopenWelcome
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home / Dashboard', icon: LayoutDashboard },
    { id: 'verifier', label: 'Screening Console', icon: ShieldAlert },
    { id: 'history', label: 'History', icon: History },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'about', label: 'About', icon: Info },
    { id: 'code', label: 'Python Source', icon: Code2 },
  ];

  return (
    <header
      role="banner"
      className={`border-b transition-colors duration-200 sticky top-0 z-50 ${
        accessibilityMode
          ? 'bg-black border-cyan-400 text-white'
          : 'bg-slate-950/90 backdrop-blur-md border-slate-800 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
            role="button"
            tabIndex={0}
            aria-label="TruthLens AI Dashboard"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveTab('dashboard');
            }}
          >
            <div
              className={`p-2 rounded-xl transition-all duration-300 ${
                accessibilityMode
                  ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/50'
                  : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 group-hover:scale-105'
              }`}
            >
              <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight ${
                    accessibilityMode ? 'text-cyan-300' : 'text-white'
                  }`}
                >
                  TRUTHLENS <span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                  Team VeriVox
                </span>
              </div>
              <p
                className={`text-xs italic ${
                  accessibilityMode
                    ? 'text-yellow-300 font-semibold'
                    : 'text-slate-400 font-medium'
                }`}
              >
                &ldquo;See it. Hear it. Verify it.&rdquo;
              </p>
            </div>
          </div>

          {/* Controls & User Session */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Speech Synthesizer Indicator */}
            {isSpeaking && (
              <button
                type="button"
                onClick={onStopSpeaking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold animate-pulse focus:ring-2 focus:ring-red-400"
                aria-label="Stop audio reading"
              >
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Stop Audio</span>
              </button>
            )}

            {/* Hear Welcome Quick Button */}
            <button
              type="button"
              onClick={onReopenWelcome}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-medium transition-colors"
              title="Re-open Welcome Screen & Audio"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>🔊 Welcome Audio</span>
            </button>

            {/* Accessibility Mode Toggle */}
            <button
              type="button"
              onClick={() => setAccessibilityMode(!accessibilityMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 focus:outline-none focus:ring-2 ${
                accessibilityMode
                  ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-cyan-500/50'
              }`}
              aria-pressed={accessibilityMode}
              aria-label="Toggle Accessibility High Contrast Mode"
              title="Toggle Accessibility High Contrast Mode (Alt + A)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">♿ Accessibility</span>
            </button>

            {/* User Profile & Logout */}
            {user && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-cyan-400">
                    {user.isDemo ? 'Demo Mode' : 'Evaluator'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                  title="Logout / Switch User"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/80 text-xs sm:text-sm"
          role="tablist"
          aria-label="Primary Navigation"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  isActive
                    ? accessibilityMode
                      ? 'bg-cyan-400 text-black font-bold ring-2 ring-cyan-300'
                      : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : accessibilityMode
                    ? 'text-white hover:bg-slate-900 border border-transparent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
