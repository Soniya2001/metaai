import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Languages,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { VoiceMessage } from '../../types';
import { WaveformVisualizer } from './WaveformVisualizer';
import { audioPlayer } from '../../utils/audioSynthesis';
import { useApp } from '../../context/AppContext';

interface VoiceMessagePlayerProps {
  voice: VoiceMessage;
  isSender: boolean;
  messageId: string;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  voice,
  isSender,
  messageId,
}) => {
  const { settings, triggerTranslateMessage } = useApp();

  const [activePlayer, setActivePlayer] = useState<'none' | 'original' | 'translated'>('none');
  const [originalProgress, setOriginalProgress] = useState(0);
  const [translatedProgress, setTranslatedProgress] = useState(0);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(true);
  const [showOriginalTranscript, setShowOriginalTranscript] = useState(false);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      audioPlayer.stop();
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayOriginal = () => {
    if (activePlayer === 'original') {
      audioPlayer.stop();
      setActivePlayer('none');
      return;
    }

    audioPlayer.stop();
    setActivePlayer('original');
    setTranslatedProgress(0);

    audioPlayer.playSpeech(
      voice.originalTranscript,
      voice.sourceLanguage,
      progress => setOriginalProgress(progress),
      () => {
        setActivePlayer('none');
        setOriginalProgress(0);
      },
      voice.duration
    );
  };

  const handlePlayTranslated = () => {
    if (activePlayer === 'translated') {
      audioPlayer.stop();
      setActivePlayer('none');
      return;
    }

    audioPlayer.stop();
    setActivePlayer('translated');
    setOriginalProgress(0);

    const textToSpeak = voice.translatedTranscript;
    const targetLang = voice.translatedLanguage || settings.preferredLanguage;

    audioPlayer.playSpeech(
      textToSpeak,
      targetLang,
      progress => setTranslatedProgress(progress),
      () => {
        setActivePlayer('none');
        setTranslatedProgress(0);
      },
      voice.translatedDuration || voice.duration
    );
  };

  // Translation is ONLY needed for incoming messages from contacts speaking a DIFFERENT language
  const isDifferentLanguage =
    Boolean(voice.sourceLanguage && settings.preferredLanguage) &&
    voice.sourceLanguage.trim().toLowerCase() !== settings.preferredLanguage.trim().toLowerCase();

  const needsTranslation = !isSender && isDifferentLanguage;

  const isTranslating = needsTranslation && voice.translationStatus === 'translating';
  const isFailed = needsTranslation && voice.translationStatus === 'failed';
  const isTranslated = needsTranslation && voice.translationStatus === 'translated';

  return (
    <div className="flex flex-col gap-2.5 w-full min-w-[280px] max-w-[420px] select-none">
      {/* 1. Primary / Original Audio Player Container */}
      {settings.preserveOriginalAudio && (
        <div
          className={`p-3 rounded-2xl transition-all duration-200 ${
            isSender
              ? 'bg-accent/10 border border-accent/20'
              : 'bg-white border border-border shadow-subtle'
          }`}
        >
          {/* Header Row: Source Language & Duration */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium text-primary-text">
              <span className={`w-2 h-2 rounded-full ${isSender ? 'bg-accent' : 'bg-emerald-500'}`}></span>
              {isSender ? 'Your Voice Note' : `${voice.sourceLanguage} Audio`}
            </span>
            <span className="text-muted-text font-mono text-[11px]">
              {activePlayer === 'original'
                ? formatDuration(voice.duration * (1 - originalProgress))
                : formatDuration(voice.duration)}
            </span>
          </div>

          {/* Player Controls & Waveform */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayOriginal}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                activePlayer === 'original'
                  ? 'bg-accent text-white scale-95'
                  : isSender
                  ? 'bg-accent text-white hover:bg-accent-hover'
                  : 'bg-surface-subtle hover:bg-border text-primary-text'
              }`}
              title={activePlayer === 'original' ? 'Pause' : 'Play Audio'}
            >
              {activePlayer === 'original' ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <WaveformVisualizer
                waveform={voice.waveform}
                progress={originalProgress}
                isPlaying={activePlayer === 'original'}
                onSeek={ratio => {
                  setOriginalProgress(ratio);
                }}
                accentColor={isSender ? '#16877A' : '#202421'}
                height={32}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Translation Status & Control Bar (Only for incoming messages in a different language) */}
      {needsTranslation && (
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-1.5">
            {isTranslating ? (
              <span className="inline-flex items-center gap-1.5 text-accent font-medium">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Translating voice message...
              </span>
            ) : isFailed ? (
              <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Translation failed
              </span>
            ) : isTranslated ? (
              <span className="inline-flex items-center gap-1 text-muted-text font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                Translated to{' '}
                <strong className="text-primary-text font-semibold">
                  {voice.translatedLanguage || settings.preferredLanguage}
                </strong>
              </span>
            ) : (
              <span className="text-muted-text">Original audio available</span>
            )}
          </div>

          {/* Action: Manual translate or retry */}
          {(!settings.autoVoiceTranslation && !isTranslated && !isTranslating) || isFailed ? (
            <button
              onClick={() => triggerTranslateMessage(messageId)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-accent bg-accent-subtle hover:bg-accent-light/60 rounded-lg transition-colors border border-accent/20"
            >
              {isFailed ? (
                <>
                  <RotateCcw className="w-3 h-3" /> Retry
                </>
              ) : (
                <>
                  <Languages className="w-3 h-3" /> Translate
                </>
              )}
            </button>
          ) : null}
        </div>
      )}

      {/* 3. Translated Voice Playback (Only for incoming messages in a different language) */}
      {needsTranslation && settings.enableTranslatedAudio && isTranslated && (
        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border border-accent/25 bg-accent-subtle/50 transition-colors ${
            activePlayer === 'translated' ? 'ring-1 ring-accent' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={handlePlayTranslated}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activePlayer === 'translated'
                  ? 'bg-accent text-white scale-95'
                  : 'bg-white text-accent hover:bg-accent hover:text-white border border-accent/20 shadow-xs'
              }`}
              title="Play Translated Audio"
            >
              {activePlayer === 'translated' ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-primary-text flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-accent" />
                Listen in {voice.translatedLanguage || settings.preferredLanguage}
              </span>
              <span className="text-[11px] text-muted-text">AI Voice Playback</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-muted-text">
            {activePlayer === 'translated'
              ? formatDuration(voice.duration * (1 - translatedProgress))
              : formatDuration(voice.duration)}
          </div>
        </div>
      )}

      {/* 4. Transcript Card (Expandable & Toggleable) */}
      {settings.showTranslatedTranscript && (voice.originalTranscript || (needsTranslation && voice.translatedTranscript)) && (
        <div className="bg-surface rounded-xl border border-border p-3 shadow-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary-text">
              <FileText className="w-3.5 h-3.5 text-accent" />
              <span>
                {!needsTranslation
                  ? 'Transcript'
                  : showOriginalTranscript
                  ? `Original (${voice.sourceLanguage})`
                  : `Transcript (${voice.translatedLanguage || settings.preferredLanguage})`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {needsTranslation && isTranslated && (
                <button
                  onClick={() => setShowOriginalTranscript(prev => !prev)}
                  className="text-[11px] text-accent hover:underline font-medium"
                >
                  {showOriginalTranscript ? 'Show translation' : 'Show original'}
                </button>
              )}
              <button
                onClick={() => setIsTranscriptExpanded(prev => !prev)}
                className="text-muted-text hover:text-primary-text p-0.5"
                title={isTranscriptExpanded ? 'Collapse' : 'Expand'}
              >
                {isTranscriptExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {isTranscriptExpanded && (
            <p className="mt-2.5 text-sm text-primary-text leading-relaxed tracking-normal font-sans">
              {!needsTranslation || showOriginalTranscript
                ? voice.originalTranscript
                : voice.translatedTranscript}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
