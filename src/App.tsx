import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { InputPanel } from './components/InputPanel';
import { ResultView } from './components/ResultView';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { RoadmapView } from './components/RoadmapView';
import { AboutView } from './components/AboutView';
import { PythonCodeView } from './components/PythonCodeView';
import {
  HistoryEntry,
  InputMode,
  PresetSample,
  UserProfile,
  VerificationResult
} from './types';
import {
  analyzeLinguistics,
  extractClaim,
  computeRiskScore,
  buildReadAloudScript
} from './utils/nlpEngine';
import { searchRelatedEvidence } from './utils/evidenceEngine';
import { speechEngine } from './utils/speechEngine';

const STORAGE_KEY_USER = 'truthlens_user_session';
const STORAGE_KEY_HISTORY = 'truthlens_history_v1';
const STORAGE_KEY_A11Y = 'truthlens_a11y_v1';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse user session:', e);
    }
    return null;
  });

  // Welcome screen state
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Input overrides when navigating from Dashboard or Welcome
  const [inputModeOverride, setInputModeOverride] = useState<InputMode>('text');
  const [inputTextOverride, setInputTextOverride] = useState<string>('');

  // Accessibility mode
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_A11Y) === 'true';
    } catch {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<VerificationResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Local History state
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse history:', e);
    }
    return [
      {
        id: 'seed-1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        inputType: 'text',
        claim: 'Drinking boiled garlic lemon water eliminates all viral infections overnight',
        riskScore: 78,
        riskLevel: 'HIGH',
        assessment: 'High Misinformation Risk'
      },
      {
        id: 'seed-2',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        inputType: 'text',
        claim: 'New low-dose combination therapy demonstrated 24% reduction in cardiovascular events',
        riskScore: 18,
        riskLevel: 'LOW',
        assessment: 'Potentially Reliable'
      }
    ];
  });

  // Sync user session
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {}
  }, [user]);

  // Sync accessibility mode
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_A11Y, String(accessibilityMode));
    } catch {}
  }, [accessibilityMode]);

  // Sync history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Global Keyboard Shortcuts (Alt+A: a11y, Alt+S: speech, Esc: stop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setAccessibilityMode(prev => !prev);
      }
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (isSpeaking) {
          handleStopSpeaking();
        } else if (currentResult) {
          handleReadAloud();
        }
      }
      if (e.key === 'Escape' && isSpeaking) {
        handleStopSpeaking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [accessibilityMode, isSpeaking, currentResult]);

  // Login handler
  const handleLogin = (userProfile: UserProfile) => {
    setUser(userProfile);
    setShowWelcome(true);
  };

  // Logout handler
  const handleLogout = () => {
    speechEngine.stopSpeaking();
    setIsSpeaking(false);
    setUser(null);
    setShowWelcome(false);
    setCurrentResult(null);
  };

  // Welcome screen Start Verification
  const handleStartFromWelcome = (mode: InputMode = 'text') => {
    setShowWelcome(false);
    setInputModeOverride(mode);
    setActiveTab('verifier');
  };

  // Read Aloud Handler
  const handleReadAloud = () => {
    if (!currentResult) return;
    setIsSpeaking(true);
    speechEngine.speak(
      currentResult.readAloudScript,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleStopSpeaking = () => {
    speechEngine.stopSpeaking();
    setIsSpeaking(false);
  };

  // Main Verification Pipeline
  const handleVerify = async (
    text: string,
    inputType: InputMode,
    extraData?: any
  ): Promise<void> => {
    setIsLoading(true);
    handleStopSpeaking();

    try {
      // Step 1: Linguistic Analysis
      const linguistic = analyzeLinguistics(text);

      // Step 2: Claim Extraction
      const claim = extractClaim(text);

      // Step 3: Live Evidence Cross-Check
      const evidenceResult = await searchRelatedEvidence(claim);

      // Step 4: Compute Transparent Risk Score
      const riskCalculation = computeRiskScore(
        linguistic,
        evidenceResult.items,
        evidenceResult.found,
        inputType,
        text
      );

      // Step 5: Construct Unified Result Object
      const resultObj: VerificationResult = {
        id: `analysis-${Date.now()}`,
        timestamp: new Date().toISOString(),
        inputType,
        originalInput: text,
        extractedClaim: claim,
        riskScore: riskCalculation.riskScore,
        riskLevel: riskCalculation.riskLevel,
        assessment: riskCalculation.assessment,
        whyReasons: riskCalculation.whyReasons,
        scoreComponents: riskCalculation.scoreComponents,
        evidenceFound: evidenceResult.found,
        evidenceItems: evidenceResult.items,
        evidenceMessage: evidenceResult.message,
        readAloudScript: '',
        linguistic,
        mediaDetails: extraData
      };

      // Step 6: Generate Accessibility Speech Script
      resultObj.readAloudScript = buildReadAloudScript(resultObj);

      setCurrentResult(resultObj);

      // Step 7: Record to Local History
      const newHistoryEntry: HistoryEntry = {
        id: resultObj.id,
        timestamp: resultObj.timestamp,
        inputType: resultObj.inputType,
        claim: resultObj.extractedClaim,
        riskScore: resultObj.riskScore,
        riskLevel: resultObj.riskLevel,
        assessment: resultObj.assessment
      };

      setHistory(prev => [newHistoryEntry, ...prev]);

      // If Accessibility Mode is ON, announce result summary via speech synthesis
      if (accessibilityMode) {
        setTimeout(() => {
          setIsSpeaking(true);
          speechEngine.speak(
            resultObj.readAloudScript,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false)
          );
        }, 500);
      }
    } catch (error) {
      console.error('Verification failure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {}
  };

  const handleSelectHistoryEntry = (entry: HistoryEntry) => {
    setInputModeOverride(entry.inputType);
    setInputTextOverride(entry.claim);
    setActiveTab('verifier');
    handleVerify(entry.claim, entry.inputType);
  };

  const handleSelectDemoSample = (sample: PresetSample) => {
    setInputModeOverride(sample.type);
    setInputTextOverride(sample.content);
    setCurrentResult(null);
    setActiveTab('verifier');
  };

  // If not authenticated, render Login / Sign up Screen (Screen 1)
  if (!user) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        accessibilityMode={accessibilityMode}
        onToggleAccessibility={() => setAccessibilityMode(!accessibilityMode)}
      />
    );
  }

  // If authenticated and welcome overlay is active (Screen 2)
  if (showWelcome) {
    return (
      <WelcomeScreen
        user={user}
        onStartVerification={handleStartFromWelcome}
        accessibilityMode={accessibilityMode}
      />
    );
  }

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-200 ${
        accessibilityMode ? 'bg-black text-white' : 'bg-[#060a12] text-slate-100'
      }`}
    >
      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentResult
          ? `Analysis complete. Result: ${currentResult.assessment}. Risk score: ${currentResult.riskScore} out of 100.`
          : ''}
      </div>

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accessibilityMode={accessibilityMode}
        setAccessibilityMode={setAccessibilityMode}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
        user={user}
        onLogout={handleLogout}
        onReopenWelcome={() => setShowWelcome(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <DashboardView
            userName={user.name}
            history={history}
            accessibilityMode={accessibilityMode}
            onSelectMode={(mode) => {
              setInputModeOverride(mode);
              setActiveTab('verifier');
            }}
            onSelectDemoSample={handleSelectDemoSample}
          />
        )}

        {/* VERIFIER / SCREENING CONSOLE TAB */}
        {activeTab === 'verifier' && (
          <div className="space-y-8">
            {currentResult ? (
              <ResultView
                result={currentResult}
                onReset={() => setCurrentResult(null)}
                accessibilityMode={accessibilityMode}
                isSpeaking={isSpeaking}
                onReadAloud={handleReadAloud}
                onStopSpeaking={handleStopSpeaking}
              />
            ) : (
              <InputPanel
                onVerify={handleVerify}
                isLoading={isLoading}
                accessibilityMode={accessibilityMode}
                initialMode={inputModeOverride}
                initialText={inputTextOverride}
              />
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onSelectEntry={handleSelectHistoryEntry}
            accessibilityMode={accessibilityMode}
          />
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <RoadmapView accessibilityMode={accessibilityMode} />
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <AboutView accessibilityMode={accessibilityMode} />
        )}

        {/* PYTHON SOURCE CODE VIEWER TAB */}
        {activeTab === 'code' && (
          <PythonCodeView accessibilityMode={accessibilityMode} />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-900 mt-16 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300">
            TRUTHLENS AI — Team VeriVox
          </p>
          <p className="text-slate-400 italic">
            &ldquo;See it. Hear it. Verify it.&rdquo;
          </p>
          <p className="text-slate-500 text-[11px]">
            Phase 1 Project Expo Prototype · Responsible AI Misinformation Screening Assistant
          </p>
        </div>
      </footer>
    </div>
  );
}
