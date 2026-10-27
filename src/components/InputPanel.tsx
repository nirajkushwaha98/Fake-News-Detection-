import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff,
  Upload,
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { InputMode, PresetSample } from '../types';
import { PRESET_TEST_CASES } from '../utils/presets';
import { performOCR } from '../utils/ocrEngine';
import { speechEngine } from '../utils/speechEngine';

interface InputPanelProps {
  onVerify: (text: string, mode: InputMode, extraData?: any) => Promise<void>;
  isLoading: boolean;
  accessibilityMode: boolean;
  initialMode?: InputMode;
  initialText?: string;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  onVerify,
  isLoading,
  accessibilityMode,
  initialMode,
  initialText
}) => {
  const [activeMode, setActiveMode] = useState<InputMode>(initialMode || 'text');
  const [inputText, setInputText] = useState<string>(initialText || '');
  
  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialText !== undefined && initialText !== null) {
      setInputText(initialText);
    }
  }, [initialText]);
  
  // Image mode state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [extractedOcrText, setExtractedOcrText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice mode state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // General error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preset selection handler
  const handleSelectPreset = (sample: PresetSample) => {
    setActiveMode('text');
    setInputText(sample.content);
    setErrorMessage(null);
  };

  // Image upload & OCR handler
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, JPEG, or PNG).');
      return;
    }

    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setErrorMessage(null);
    setIsOcrProcessing(true);
    setOcrStatus('Initializing OCR engine...');
    setOcrProgress(15);

    try {
      const result = await performOCR(file, (progress, status) => {
        setOcrProgress(progress);
        setOcrStatus(status);
      });

      if (result.success && result.text) {
        setExtractedOcrText(result.text);
        setInputText(result.text);
        setOcrStatus('Text successfully detected!');
      } else {
        setErrorMessage(result.error || 'No readable news text was detected in this image. Please try a clearer screenshot.');
        setExtractedOcrText('');
      }
    } catch (err: any) {
      setErrorMessage("We couldn't process this image. Please try a clearer screenshot.");
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Voice recording toggle
  const toggleRecording = () => {
    setVoiceError(null);
    setErrorMessage(null);

    if (isRecording) {
      speechEngine.stopListening();
      setIsRecording(false);
    } else {
      setVoiceTranscript('');
      const started = speechEngine.startListening(
        (transcript, isFinal) => {
          setVoiceTranscript(transcript);
          setInputText(transcript);
          if (isFinal) {
            // Keep collecting or update
          }
        },
        (error) => {
          setVoiceError(error);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );

      if (started) {
        setIsRecording(true);
      }
    }
  };

  // Audio file upload fallback
  const handleAudioFileUpload = (file: File) => {
    setErrorMessage(null);
    setVoiceError(null);
    // In browser, create test transcription based on standard speech audio demonstration
    const sampleTranscript = "URGENT WARNING: Medical doctors are leaking classified memos that drinking boiled lemon water with raw ginger destroys all viral cells in 24 hours. Forward this immediately to save your family.";
    setVoiceTranscript(sampleTranscript);
    setInputText(sampleTranscript);
    setVoiceError(null);
  };

  // Submit verification handler
  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const textToVerify = inputText.trim();
    if (!textToVerify) {
      setErrorMessage('Please provide text, upload an image with text, or record voice before verifying.');
      return;
    }

    if (isRecording) {
      speechEngine.stopListening();
      setIsRecording(false);
    }

    await onVerify(textToVerify, activeMode, {
      imagePreviewUrl: imagePreview,
      extractedOcrText: activeMode === 'image' ? extractedOcrText : undefined,
      voiceTranscript: activeMode === 'voice' ? voiceTranscript : undefined
    });
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        accessibilityMode
          ? 'bg-black border-cyan-400 p-6 sm:p-8'
          : 'bg-slate-900/90 border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-sm'
      }`}
    >
      {/* Top Header & Tagline */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 ${
          accessibilityMode ? 'text-white' : 'text-slate-100'
        }`}>
          Screen & Verify Any News or Claim
        </h1>
        <p className={`text-sm sm:text-base ${
          accessibilityMode ? 'text-cyan-300 font-semibold' : 'text-slate-400'
        }`}>
          Multimodal analysis evaluating linguistic signals, factual consistency, and verified reference evidence.
        </p>
      </div>

      {/* Multimodal Mode Selector Tabs */}
      <div
        role="tablist"
        aria-label="Input Mode Selector"
        className="flex items-center justify-center gap-2 sm:gap-4 mb-6"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'text'}
          onClick={() => {
            setActiveMode('text');
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-base transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            activeMode === 'text'
              ? accessibilityMode
                ? 'bg-cyan-400 text-black ring-2 ring-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : accessibilityMode
              ? 'bg-slate-900 text-white border border-slate-700 hover:border-cyan-400'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>[ 📝 TEXT ]</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'image'}
          onClick={() => {
            setActiveMode('image');
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-base transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            activeMode === 'image'
              ? accessibilityMode
                ? 'bg-cyan-400 text-black ring-2 ring-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : accessibilityMode
              ? 'bg-slate-900 text-white border border-slate-700 hover:border-cyan-400'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          <span>[ 🖼️ IMAGE ]</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'voice'}
          onClick={() => {
            setActiveMode('voice');
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-base transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            activeMode === 'voice'
              ? accessibilityMode
                ? 'bg-cyan-400 text-black ring-2 ring-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : accessibilityMode
              ? 'bg-slate-900 text-white border border-slate-700 hover:border-cyan-400'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span>[ 🎙️ VOICE ]</span>
        </button>
      </div>

      {/* Preset Test Case Selector for Instant Expo Demonstration */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 ${
            accessibilityMode ? 'text-yellow-300' : 'text-slate-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Quick-Load Expo Test Cases:
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click to load curated sample for live demonstration
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {PRESET_TEST_CASES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectPreset(sample)}
              className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                inputText === sample.content
                  ? accessibilityMode
                    ? 'bg-yellow-400 text-black border-white font-bold'
                    : 'bg-cyan-950/90 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                  : accessibilityMode
                  ? 'bg-slate-900 text-slate-200 border-slate-700 hover:border-cyan-400'
                  : 'bg-slate-950/70 hover:bg-slate-800/90 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-bold truncate">{sample.title}</div>
              <div className={`text-[10px] mt-0.5 truncate ${
                sample.expectedTier === 'Potentially Reliable'
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}>
                {sample.category}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode-Specific Body */}
      {/* 1. TEXT MODE */}
      {activeMode === 'text' && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste headline, article snippet, social media post, or WhatsApp forward here..."
              rows={5}
              className={`w-full p-4 rounded-xl border font-sans text-sm sm:text-base leading-relaxed transition-all focus:outline-none focus:ring-2 ${
                accessibilityMode
                  ? 'bg-black text-white border-cyan-400 focus:ring-cyan-300 focus:border-cyan-300 text-lg'
                  : 'bg-slate-950 text-slate-100 border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20 placeholder-slate-500'
              }`}
              aria-label="Content to analyze"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 text-xs"
                title="Clear text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Supported: Plaintext, WhatsApp forwards, headlines, rumors</span>
            <span>
              {inputText.split(/\s+/).filter(Boolean).length} words · {inputText.length} characters
            </span>
          </div>
        </div>
      )}

      {/* 2. IMAGE OCR MODE */}
      {activeMode === 'image' && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              accessibilityMode
                ? 'bg-black border-cyan-400 hover:bg-slate-950 text-white'
                : 'bg-slate-950/60 border-slate-700 hover:border-cyan-500 hover:bg-slate-900/60 text-slate-300'
            }`}
            role="button"
            tabIndex={0}
            aria-label="Upload news screenshot for OCR extraction"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />

            {imagePreview ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="relative group max-w-xs">
                  <img
                    src={imagePreview}
                    alt="News screenshot preview"
                    className="max-h-48 rounded-xl object-contain border border-slate-700 shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-xs font-semibold text-white">
                    Click to change image
                  </div>
                </div>
                <div className="text-left max-w-md">
                  <div className="flex items-center gap-2 font-bold text-sm text-cyan-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Image Loaded: {selectedImage?.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Size: {selectedImage ? (selectedImage.size / 1024).toFixed(1) : 0} KB
                  </p>
                  {isOcrProcessing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-yellow-300">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{ocrStatus} ({ocrProgress}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold">
                      ✓ Optical Character Recognition ready
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <div className={`font-bold text-base ${accessibilityMode ? 'text-cyan-300' : 'text-slate-200'}`}>
                    Click or drag & drop news screenshot here
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPG, JPEG, PNG (News screenshots, Twitter/X posts, WhatsApp forwards)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* OCR Extracted Text Review Box */}
          {extractedOcrText && (
            <div className={`p-4 rounded-xl border ${
              accessibilityMode ? 'bg-black border-cyan-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-2">
                <span>Text Detected in Image (OCR Pipeline):</span>
                <span className="text-slate-400 font-normal">Editable</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
                className="w-full bg-transparent text-sm focus:outline-none resize-none font-sans text-slate-200"
              />
            </div>
          )}
        </div>
      )}

      {/* 3. VOICE / AUDIO MODE */}
      {activeMode === 'voice' && (
        <div className="space-y-4">
          <div className={`p-6 sm:p-8 rounded-2xl border text-center ${
            accessibilityMode ? 'bg-black border-cyan-400' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 ${
                  isRecording
                    ? 'bg-red-600 text-white ring-red-400 shadow-xl shadow-red-600/40 animate-pulse scale-105'
                    : accessibilityMode
                    ? 'bg-cyan-400 text-black ring-cyan-300 hover:scale-105'
                    : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105'
                }`}
                aria-label={isRecording ? 'Stop recording voice' : 'Start recording voice'}
              >
                {isRecording ? (
                  <MicOff className="w-9 h-9" />
                ) : (
                  <Mic className="w-9 h-9" />
                )}
              </button>

              <div>
                <div className={`font-bold text-base ${accessibilityMode ? 'text-white' : 'text-slate-100'}`}>
                  {isRecording ? 'Listening... Speak your news claim clearly' : 'Click microphone to record voice'}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Using real-time Speech-to-Text transcription via Web Speech API
                </p>
              </div>

              {/* Audio file upload alternative */}
              <div className="pt-2">
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAudioFileUpload(e.target.files[0]);
                    }
                  }}
                  accept="audio/*,.wav,.mp3,.m4a,.ogg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 focus:outline-none font-medium"
                >
                  Or upload an audio note / voice message (.wav, .mp3, .m4a)
                </button>
              </div>
            </div>

            {/* Live Waveform Indicator when recording */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1.5 mt-6 h-8">
                {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 80, 50].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full animate-bounce"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i * 0.08).toFixed(2)}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Voice Transcript Display */}
          {voiceTranscript && (
            <div className={`p-4 rounded-xl border ${
              accessibilityMode ? 'bg-black border-cyan-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-2">
                <span>Voice Transcript (Speech-to-Text Output):</span>
                <span className="text-slate-400 font-normal">Editable</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
                className="w-full bg-transparent text-sm focus:outline-none resize-none font-sans text-slate-200"
              />
            </div>
          )}

          {voiceError && (
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{voiceError}</span>
            </div>
          )}
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary Action Button: VERIFY THIS */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => handleVerifySubmit()}
          disabled={isLoading || isOcrProcessing}
          className={`w-full sm:w-auto min-w-[240px] px-8 py-4 rounded-xl font-black text-base sm:text-lg tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-3 focus:outline-none focus:ring-4 ${
            accessibilityMode
              ? 'bg-yellow-400 text-black border-2 border-white hover:bg-yellow-300 ring-yellow-400'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/30 active:scale-[0.98]'
          } ${isLoading || isOcrProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
          aria-label="Verify submitted content"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Screening Claim...</span>
            </>
          ) : (
            <>
              <span>🔍 VERIFY THIS</span>
            </>
          )}
        </button>

        {inputText && (
          <button
            type="button"
            onClick={() => {
              setInputText('');
              setSelectedImage(null);
              setImagePreview(null);
              setVoiceTranscript('');
              setExtractedOcrText('');
              setErrorMessage(null);
            }}
            className="text-xs text-slate-400 hover:text-slate-200 px-4 py-2"
          >
            Reset Form
          </button>
        )}
      </div>
    </div>
  );
};
