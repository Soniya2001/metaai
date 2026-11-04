// Utility for realistic audio playback using Web Speech API and Web Audio API
import { SupportedLanguage } from '../types';

const languageCodes: Record<SupportedLanguage, string> = {
  English: 'en-US',
  Tamil: 'ta-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Bengali: 'bn-IN',
  Marathi: 'mr-IN',
};

class AudioPlayerService {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private progressInterval: number | null = null;

  public playSpeech(
    text: string,
    language: SupportedLanguage,
    onProgress: (progress: number) => void,
    onEnd: () => void,
    durationSec: number = 8
  ): void {
    this.stop();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCodes[language] || 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Find an appropriate voice if available
      const voices = window.speechSynthesis.getVoices();
      const targetLang = languageCodes[language];
      const matchedVoice = voices.find(v => v.lang.startsWith(targetLang?.slice(0, 2) || 'en'));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      const startTime = Date.now();
      const estimatedDurationMs = Math.max(durationSec * 1000, text.length * 75);

      this.progressInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(elapsed / estimatedDurationMs, 0.98);
        onProgress(ratio);
      }, 50);

      utterance.onend = () => {
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        }
        onProgress(1);
        setTimeout(onEnd, 150);
        this.activeUtterance = null;
      };

      utterance.onerror = () => {
        this.fallbackTonePlayback(durationSec, onProgress, onEnd);
      };

      this.activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      this.fallbackTonePlayback(durationSec, onProgress, onEnd);
    }
  }

  private fallbackTonePlayback(
    durationSec: number,
    onProgress: (progress: number) => void,
    onEnd: () => void
  ): void {
    const totalMs = durationSec * 1000;
    const start = Date.now();

    this.progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / totalMs, 1);
      onProgress(progress);
      if (progress >= 1) {
        if (this.progressInterval) clearInterval(this.progressInterval);
        this.progressInterval = null;
        onEnd();
      }
    }, 60);
  }

  public stop(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.activeUtterance = null;
  }
}

export const audioPlayer = new AudioPlayerService();

// Helper to generate realistic waveform heights
export function generateWaveform(count: number = 32): number[] {
  return Array.from({ length: count }, (_, i) => {
    // sinusoidal variation with organic noise
    const base = Math.sin((i / count) * Math.PI) * 60;
    const noise = Math.random() * 35;
    return Math.min(100, Math.max(15, Math.round(base + noise)));
  });
}
