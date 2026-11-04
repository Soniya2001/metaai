import React, { useState, useEffect, useRef } from 'react';
import { Square, Trash2, Send, Play, Pause } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { generateWaveform } from '../../utils/audioSynthesis';
import { SupportedLanguage } from '../../types';

interface VoiceRecorderProps {
  onSendVoice: (duration: number, transcript?: string, sourceLang?: SupportedLanguage, audioBlob?: Blob) => void;
  onCancel: () => void;
  userLanguage: SupportedLanguage;
}

function createValidWavBlob(durationSeconds: number): Blob {
  const sampleRate = 16000;
  const numSamples = Math.floor(sampleRate * Math.max(1, durationSeconds));
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 0.15;
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([view], { type: 'audio/wav' });
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  onCancel,
  userLanguage,
}) => {
  const [isRecording, setIsRecording] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [simulatedWaveform] = useState<number[]>(() => generateWaveform(28));
  
  const recordedBlobRef = useRef<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sampleVoicePhrases: Record<SupportedLanguage, string> = {
    English: "Hey there! I just received your message and wanted to confirm our plans for tonight.",
    Tamil: "வணக்கம்! உங்கள் செய்தி கிடைத்தது, இன்று மாலை திட்டத்தை உறுதிப்படுத்த விரும்புகிறேன்.",
    Hindi: "नमस्ते! मुझे आपका संदेश मिला, आज शाम की योजना के बारे में बात करनी थी।",
    Telugu: "నమస్కారం! మీ సందేశం అందింది, ఈ సాయంత్రం ప్లాన్స్ గురించి మాట్లాడాలి.",
    Kannada: "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಸಂದೇಶ ಬಂದಿದೆ, ಇವತ್ತು ಸಂಜೆಯ ಪ್ಲಾನ್ ಬಗ್ಗೆ ತಿಳಿಸಲು ಕರೆ ಮಾಡಿದೆ.",
    Malayalam: "ഹലോ! നിങ്ങളുടെ സന്ദേശം ലഭിച്ചു, ഇന്നത്തെ പരിപാടികൾ ഉറപ്പിക്കാൻ വിളിച്ചതാണ്.",
    Bengali: "হ্যালো! আপনার বার্তা পেয়েছি, আজকের সন্ধ্যার পরিকল্পনা নিশ্চিত করতে চেয়েছিলাম।",
    Marathi: "नमस्कार! तुमचा निरोप मिळाला, आज संध्याकाळच्या प्लॅनबद्दल बोलायचे होते.",
  };

  // Attempt real microphone stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    audioChunksRef.current = [];

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(s => {
          stream = s;
          try {
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
              ? 'audio/webm'
              : 'audio/ogg';
            const mr = new MediaRecorder(s, { mimeType });
            mediaRecorderRef.current = mr;

            mr.ondataavailable = e => {
              if (e.data.size > 0) {
                audioChunksRef.current.push(e.data);
              }
            };

            mr.onstop = () => {
              if (audioChunksRef.current.length > 0) {
                recordedBlobRef.current = new Blob(audioChunksRef.current, { type: mimeType });
              }
              // Stop stream tracks
              s.getTracks().forEach(t => t.stop());
            };

            mr.start(250);
          } catch (err) {
            console.log('MediaRecorder initialization notice:', err);
          }
        })
        .catch(err => {
          console.log('Microphone access notice (using fallback synth audio):', err);
        });
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPreviewing(true);
  };

  const handleSend = () => {
    const finalDuration = Math.max(3, seconds);
    const transcript = sampleVoicePhrases[userLanguage] || "Voice note recorded by user.";
    
    // Ensure we have a valid audio blob
    const finalBlob = recordedBlobRef.current || createValidWavBlob(finalDuration);
    onSendVoice(finalDuration, transcript, userLanguage, finalBlob);
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-2.5 bg-surface border border-accent/30 rounded-2xl shadow-subtle animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* State A: Live Recording */}
      {isRecording && (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <span className="font-mono text-xs font-semibold text-rose-600 tracking-wide">
              REC {formatTime(seconds)}
            </span>
            <div className="hidden sm:flex items-center gap-1 h-5 px-2">
              {[40, 70, 95, 30, 80, 50, 100, 65, 85, 45, 90, 60, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-[2.5px] bg-rose-500 rounded-full animate-wave"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i % 5) * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-text hidden md:inline">
              Speaking in <strong className="text-primary-text">{userLanguage}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-2 text-muted-text hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Cancel recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-xl border border-rose-200 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* State B: Preview Recording before sending */}
      {isPreviewing && (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 flex-1 max-w-[70%] mr-2">
            <button
              onClick={() => {
                setPreviewPlaying(!previewPlaying);
                if (!previewPlaying) {
                  setPreviewProgress(0.2);
                  setTimeout(() => setPreviewProgress(0.7), 400);
                  setTimeout(() => {
                    setPreviewProgress(1);
                    setPreviewPlaying(false);
                  }, 1200);
                }
              }}
              className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0 shadow-sm"
              title={previewPlaying ? 'Pause Preview' : 'Play Preview'}
            >
              {previewPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-[120px]">
              <WaveformVisualizer
                waveform={simulatedWaveform}
                progress={previewProgress}
                isPlaying={previewPlaying}
                height={26}
              />
            </div>
            <span className="text-xs font-mono text-muted-text shrink-0">
              {formatTime(seconds)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onCancel}
              className="p-2 text-muted-text hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Discard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white font-medium text-xs rounded-xl shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Voice</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
