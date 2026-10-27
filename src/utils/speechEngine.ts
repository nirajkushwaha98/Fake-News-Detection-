// Browser Speech Recognition & Speech Synthesis Utility

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export class SpeechEngine {
  private recognition: any = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }

      if ('speechSynthesis' in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
      } catch (e) {
        console.warn('Could not fetch voices:', e);
      }
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. You can still upload audio files or paste text.');
      return false;
    }

    try {
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        onResult(combined, Boolean(finalTranscript));
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        onError(`Microphone error: ${event.error || 'Access restricted'}. Please ensure microphone permission is granted.`);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      onError('Could not initialize microphone. Please check permissions.');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
      this.isListening = false;
    }
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    rate: number = 0.95
  ): boolean {
    if (!this.isSpeechSynthesisSupported()) {
      return false;
    }

    try {
      this.stopSpeaking();

      // Ensure synthesizer is not in paused state
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      // Pick clear standard English voice if available
      const voices = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
        ) || voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Failed to synthesize speech:', err);
      return false;
    }
  }

  public stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Cancel speech error:', e);
      }
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return this.isSpeechSynthesisSupported() && window.speechSynthesis.speaking;
  }
}

export const speechEngine = new SpeechEngine();
