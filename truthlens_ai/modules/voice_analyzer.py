"""
TruthLens AI - Voice & Speech-to-Text Module
Converts audio files or microphone recordings into text transcripts for misinformation screening.
Includes text-to-speech accessibility output.
"""

import os
from typing import Dict, Any

class VoiceAnalyzer:
    def __init__(self):
        self._sr_available = None

    def check_availability(self) -> bool:
        if self._sr_available is not None:
            return self._sr_available
        try:
            import speech_recognition as sr
            self._sr_available = True
        except ImportError:
            self._sr_available = False
        return self._sr_available

    def transcribe_audio_file(self, audio_path: str) -> Dict[str, Any]:
        """Transcribes audio file to text using speech recognition."""
        if not os.path.exists(audio_path):
            return {
                "success": False,
                "error": f"Audio file not found: {audio_path}",
                "transcript": ""
            }

        if not self.check_availability():
            return {
                "success": False,
                "error": "SpeechRecognition package not installed. (Use 'pip install SpeechRecognition pydub'). In the TruthLens AI web application, native Web Speech API provides zero-install real-time speech-to-text.",
                "transcript": ""
            }

        try:
            import speech_recognition as sr
            r = sr.Recognizer()

            # Handle format conversion if needed via pydub
            sound_path = audio_path
            if audio_path.lower().endswith(('.mp3', '.m4a', '.ogg')):
                try:
                    from pydub import AudioSegment
                    wav_temp = audio_path + ".temp.wav"
                    sound = AudioSegment.from_file(audio_path)
                    sound.export(wav_temp, format="wav")
                    sound_path = wav_temp
                except Exception:
                    pass

            with sr.AudioFile(sound_path) as source:
                audio_data = r.record(source)
                transcript = r.recognize_google(audio_data)

            if sound_path.endswith(".temp.wav") and os.path.exists(sound_path):
                os.remove(sound_path)

            return {
                "success": True,
                "transcript": transcript,
                "message": "Speech successfully transcribed into text pipeline."
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Transcription error: {str(e)}",
                "transcript": ""
            }

    def speak_text(self, text: str) -> bool:
        """Text-to-speech for accessibility in Python."""
        try:
            import pyttsx3
            engine = pyttsx3.init()
            engine.say(text)
            engine.runAndWait()
            return True
        except Exception:
            return False

if __name__ == "__main__":
    va = VoiceAnalyzer()
    print("Voice Analyzer local SR available:", va.check_availability())
