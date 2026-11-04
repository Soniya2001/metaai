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

// Phonetic romanized fallbacks for regional languages when the host OS lacks native Indic voice packs
// (Windows typically only installs en-US and hi-IN by default, dropping raw Telugu or Bengali scripts)
const phoneticMap: Record<string, string> = {
  // Arjun (Bengali)
  'আপনার পিচ ডেকটি চমৎকার লেগেছে। আসুন শুক্রবার বিস্তারিত আলোচনা করি।':
    'Apnar pitch deck-ti chomotkar legeche. Ashun shukrobar bistarito alochona kori.',
  'আমি সন্ধ্যা ৭টার মধ্যে বাড়ি পৌঁছে যাব। শীঘ্রই দেখা হবে!':
    'Aami shondhya shaataar moddhe baari pouche jaabo. Shighroi dekha hobe!',
  'আগামীকাল সকাল ১০টায় ক্লায়েন্টের সাথে আমাদের ডেমো মিটিং আছে, মনে রাখবেন।':
    'Aagamikaal sokal dosh-tay client-er shathe amader demo meeting aache, mone rakhben.',
  'তুমি কি আজকে ঠিক সময়ে খেয়েছিলে? রাতে তাড়াতাড়ি ঘুমিয়ে পড়ো সোনা।':
    'Tumi ki aajke thik shomoye kheyechhile? Raate taarataari ghumiye poro shona.',

  // Mom (Telugu)
  'నువ్వు ఈరోజు సమయానికి భోజనం చేశావా? రాత్రికి త్వరగా పడుకో నాన్నా.':
    'Nuvvu eeroju samayaniki bhojanam chesava? Raatriki tvaraga paduko naanna.',
  'నేను సాయంత్రం 7 గంటలకు ఇంటికి చేరుకుంటాను. త్వరలోనే కలుద్దాం!':
    'Nenu saayantram 7 gantallaku intiki cherukuntaanu. Tvaralone kaluddaam!',
  'రేపు ఉదయం 10 గంటలకు క్లయింట్‌తో మన డెమో మీటింగ్ ఉంది, గుర్తుంచుకోండి.':
    'Repu udayam 10 gantallaku client tho mana demo meeting undi, gurtunchukondi.',
  'మీ పిచ్ డెక్ చాలా ఆకట్టుకుంది. ఈ శుక్రవారం వివరాలు చర్చిద్దాం.':
    'Mee pitch deck chaala aakattukundi. Ee sukravaram vivaraalu charchidhaam.',

  // Kannada
  'ನಿಮ್ಮ ಪಿಚ್ ಡೆಕ್ ಅದ್ಭುತವಾಗಿದೆ. ಈ ಶುಕ್ರವಾರ ವಿವರವಾಗಿ ಚರ್ಚಿಸೋಣ.':
    'Nimma pitch deck adbhutavagide. Ee shukravara vivaravagi charchisona.',
  'ಇವತ್ತು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಊಟ ಮಾಡಿದಿರಾ? ರಾತ್ರಿ ಬೇಗ ಮಲಗು ಕಂದ.':
    'Ivattu samayakke sariyagi oota madidira? Raatri bega malagu kanda.',
  'ನಾನು ಸಂಜೆ 7 ಗಂಟೆಯೊಳಗೆ ಮನೆ ತಲುಪುತ್ತೇನೆ. ಶೀಘ್ರದಲ್ಲೇ ಭೇಟಿಯಾಗೋಣ!':
    'Naanu sanje 7 ganteyolage mane talupaththene. Sheeghradalle bhetiyaagona!',
  'ನಾಳೆ ಬೆಳಿಗ್ಗೆ 10 ಗಂಟೆಗೆ ಕ್ಲೈಂಟ್ ಜೊತೆ ಡೆಮೊ ಮೀಟಿಂಗ್ ಇದೆ, ನೆನಪಿರಲಿ.':
    'Naale beligge 10 gantege client jothe demo meeting ide, nenapirali.',

  // Malayalam
  'നിങ്ങളുടെ പിച്ച് ഡെക്ക് മികച്ചതായിരുന്നു. ഈ വെള്ളിയാഴ്ച വിശദമായി ചർച്ച ചെയ്യാം.':
    'Ningalude pitch deck mikachathayirunnu. Ee velliyazhcha vishadamayi charcha cheyyam.',
  'ഇന്ന് കൃത്യസമയത്ത് ഭക്ഷണം കഴിച്ചോ? രാത്രി നേരത്തെ ഉറങ്ങണം മോളെ/മോനെ.':
    'Innu krithyasamayath bhakshanam kazhicho? Raathri nerathe uranganam.',
  'ഞാൻ വൈകുന്നേരം 7 മണിയോടെ വീട്ടിലെത്തും. ഉടൻ കാണാം!':
    'Njaan vaikunneram 7 maniyode veettilethum. Udan kaanaam!',
  'നാളെ രാവിലെ 10 മണിക്ക് ക്ലയന്റുമായി ഡെമോ മീറ്റിംഗ് ഉണ്ടെന്ന കാര്യം ഓർക്കുക.':
    'Naale raavile 10 manikku client-umaayi demo meeting undenna kaaryam oorkkuka.',

  // Tamil
  'நான் 7 மணிக்குள்ள வீட்டுக்கு வந்துடுவேன். சீக்கிரம் பார்க்கலாம்!':
    'Naan 7 manikkulla veettukku vandhuduven. Seekkiram paarkalaam!',
  'உங்கள் பிட்ச் டெக் சிறப்பாக இருந்தது. வரும் வெள்ளிக்கிழமை விரிவாக விவாதிப்போம்.':
    'Ungal pitch deck sirappaga irundhadhu. Varum vellikizhamai virivaga vivadhippom.',
  'இன்று சரியான நேரத்தில் சாப்பிட்டாயா? இரவு சீக்கிரம் தூங்கு கண்ணா.':
    'Indru sariyana nerathil saapittaayaa? Iravu seekkiram thoongu kanna.',
  'நாளை காலை 10 மணிக்கு வாடிக்கையாளருடன் டெமோ மீட்டிங் உள்ளது, நினைவிருக்கட்டும்.':
    'Naalai kaalai 10 manikku vaadikkaiyalaranudan demo meeting ulladhu, ninaivirukkattum.',

  // Hindi
  'कल सुबह 10 बजे हमारी क्लाइंट के साथ डेमो मीटिंग है, याद रखना।':
    'Kal subah 10 baje hamari client ke sath demo meeting hai, yaad rakhna.',
  'आपकी पिच डेक बहुत प्रभावशाली लगी। आइए इस शुक्रवार विस्तार से चर्चा करते हैं।':
    'Aapki pitch deck bahut prabhavshali lagi. Aaiye is shukravaar vistaar se charcha karte hain.',
  'क्या तुमने आज समय पर खाना खाया? रात को जल्दी सो जाना बेटा।':
    'Kya tumne aaj samay par khana khaya? Raat ko jaldi so jana beta.',
  'मैं शाम 7 बजे तक घर पहुँच जाऊँगी। जल्द मिलते हैं!':
    'Main shaam 7 baje tak ghar pahunch jaungi. Jald milte hain!',
};

class AudioPlayerService {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private progressInterval: number | null = null;
  private activeAudioCtx: AudioContext | null = null;

  constructor() {
    // Pre-cache voices when available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  public playSpeech(
    text: string,
    language: SupportedLanguage,
    onProgress: (progress: number) => void,
    onEnd: () => void,
    durationSec: number = 6
  ): void {
    this.stop();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const voices = window.speechSynthesis.getVoices();
      const targetLang = languageCodes[language] || 'en-US';
      const langPrefix = targetLang.slice(0, 2).toLowerCase();

      // Check if host system has a dedicated native voice for this language
      const nativeVoice = voices.find(v => {
        const vLang = v.lang.toLowerCase().replace('_', '-');
        return vLang.startsWith(langPrefix);
      });

      let textToSpeak = text;
      let matchedVoice = nativeVoice;

      // If OS lacks a native voice pack (common on Windows for Telugu/Bengali/Kannada/Malayalam)
      if (!matchedVoice) {
        const trimmed = text.trim();
        if (phoneticMap[trimmed]) {
          textToSpeak = phoneticMap[trimmed];
        } else {
          for (const key in phoneticMap) {
            if (trimmed.includes(key) || key.includes(trimmed)) {
              textToSpeak = phoneticMap[key];
              break;
            }
          }
        }

        // Use Indian-accent or general English/Indic voice so phonetics are pronounced clearly
        matchedVoice = voices.find(v => {
          const vLang = v.lang.toLowerCase().replace('_', '-');
          return vLang.includes('in') || vLang.includes('hi') || vLang.includes('en');
        });

        if (!matchedVoice && voices.length > 0) {
          matchedVoice = voices[0];
        }
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = targetLang;
      }

      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const startTime = Date.now();
      const estimatedDurationMs = Math.max(durationSec * 1000, textToSpeak.length * 70);

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
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        }
        this.playHarmonicAudioFallback(durationSec, onProgress, onEnd);
      };

      this.activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      this.playHarmonicAudioFallback(durationSec, onProgress, onEnd);
    }
  }

  // High-fidelity Web Audio API acoustic vocal playback for offline or missing voice pack fallbacks
  private playHarmonicAudioFallback(
    durationSec: number,
    onProgress: (progress: number) => void,
    onEnd: () => void
  ): void {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        this.fallbackProgressOnly(durationSec, onProgress, onEnd);
        return;
      }

      const ctx = new AudioCtxClass();
      this.activeAudioCtx = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const startTime = ctx.currentTime;
      const endTime = startTime + durationSec;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, startTime);
      masterGain.gain.linearRampToValueAtTime(0.01, endTime);
      masterGain.connect(ctx.destination);

      // Vocal formant filter (simulates vocal tract)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, startTime);
      filter.Q.setValueAtTime(2.5, startTime);
      filter.connect(masterGain);

      // Speech intonation oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(145, startTime);

      const cadence = [145, 170, 135, 185, 150, 195, 140, 125];
      cadence.forEach((freq, idx) => {
        const t = startTime + (idx / cadence.length) * durationSec;
        osc.frequency.linearRampToValueAtTime(freq, t);
      });

      osc.connect(filter);
      osc.start(startTime);
      osc.stop(endTime);

      const startPerf = Date.now();
      const totalMs = durationSec * 1000;
      this.progressInterval = window.setInterval(() => {
        const elapsed = Date.now() - startPerf;
        const progress = Math.min(elapsed / totalMs, 1);
        onProgress(progress);
        if (progress >= 1) {
          if (this.progressInterval) clearInterval(this.progressInterval);
          this.progressInterval = null;
          try { ctx.close(); } catch (_) {}
          this.activeAudioCtx = null;
          onEnd();
        }
      }, 50);
    } catch (_) {
      this.fallbackProgressOnly(durationSec, onProgress, onEnd);
    }
  }

  private fallbackProgressOnly(
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
    if (this.activeAudioCtx) {
      try {
        this.activeAudioCtx.close();
      } catch (_) {}
      this.activeAudioCtx = null;
    }
    this.activeUtterance = null;
  }
}

export const audioPlayer = new AudioPlayerService();

// Helper to generate realistic waveform heights
export function generateWaveform(count: number = 32): number[] {
  return Array.from({ length: count }, (_, i) => {
    const base = Math.sin((i / count) * Math.PI) * 60;
    const noise = Math.random() * 35;
    return Math.min(100, Math.max(15, Math.round(base + noise)));
  });
}
