import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LanguageSelector } from '../components/settings/LanguageSelector';
import { ToggleSwitch } from '../components/settings/ToggleSwitch';
import {
  Globe,
  Sliders,
  Bell,
  Shield,
  Cpu,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [activeSection, setActiveSection] = useState<'language' | 'translation' | 'notifications' | 'privacy'>('language');
  const [saveToast, setSaveToast] = useState(false);

  const showSaveNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleSettingChange = (field: keyof typeof settings, value: any) => {
    updateSettings({ [field]: value });
    showSaveNotification();
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-4 sm:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-text">
              Settings & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-muted-text mt-1">
              Configure voice translation models, audio playback, and regional preferences.
            </p>
          </div>

          {saveToast && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium animate-in fade-in duration-150">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved in real-time</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveSection('language')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === 'language'
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface hover:bg-surface-subtle text-muted-text border border-border'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Language Preferences</span>
          </button>

          <button
            onClick={() => setActiveSection('translation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === 'translation'
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface hover:bg-surface-subtle text-muted-text border border-border'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Voice & Translation Rules</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === 'notifications'
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface hover:bg-surface-subtle text-muted-text border border-border'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveSection('privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === 'privacy'
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface hover:bg-surface-subtle text-muted-text border border-border'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy & Processing</span>
          </button>
        </div>

        {/* SECTION 1: Language Settings */}
        {activeSection === 'language' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle space-y-6">
              <LanguageSelector
                value={settings.preferredLanguage}
                onChange={lang => handleSettingChange('preferredLanguage', lang)}
              />

              <div className="pt-4 border-t border-border">
                <ToggleSwitch
                  label="Automatic Source Language Detection"
                  description="Infer incoming dialect automatically without requiring contacts to specify their language beforehand."
                  checked={settings.sourceLanguageDetection}
                  onChange={v => handleSettingChange('sourceLanguageDetection', v)}
                />
              </div>

              {/* Language Selection Preview Card */}
              <div className="p-4 rounded-xl bg-accent-subtle/50 border border-accent/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-primary-text">
                    Current Active Language Matrix
                  </div>
                  <div className="text-muted-text leading-relaxed">
                    Voice messages sent to you in <span className="font-medium text-primary-text">Tamil, Hindi, Telugu, Kannada, Bengali</span> or other tongues will immediately translate into <strong className="text-accent underline font-semibold">{settings.preferredLanguage}</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Translation Toggles */}
        {activeSection === 'translation' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle divide-y divide-border/60">
              <ToggleSwitch
                label="Automatic Voice Translation"
                description="Immediately translate incoming voice notes upon arrival. When turned off, incoming voice notes will show a manual 'Translate' button."
                checked={settings.autoVoiceTranslation}
                onChange={v => handleSettingChange('autoVoiceTranslation', v)}
              />

              <ToggleSwitch
                label="Show Translated Transcript"
                description="Display the written translation text beneath the audio waveform in the message thread."
                checked={settings.showTranslatedTranscript}
                onChange={v => handleSettingChange('showTranslatedTranscript', v)}
              />

              <ToggleSwitch
                label="Enable Translated Audio Voice Playback"
                description="Generate natural speech in your preferred language for instant listening."
                checked={settings.enableTranslatedAudio}
                onChange={v => handleSettingChange('enableTranslatedAudio', v)}
              />

              <ToggleSwitch
                label="Preserve Original Audio"
                description="Keep the sender's original authentic audio recording and waveform player accessible."
                checked={settings.preserveOriginalAudio}
                onChange={v => handleSettingChange('preserveOriginalAudio', v)}
              />
            </div>
          </div>
        )}

        {/* SECTION 3: Notification Settings */}
        {activeSection === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle divide-y divide-border/60">
              <ToggleSwitch
                label="Push Notifications for Incoming Messages"
                description="Receive system alerts when contacts send voice or text messages."
                checked={settings.notificationsEnabled}
                onChange={v => handleSettingChange('notificationsEnabled', v)}
              />

              <ToggleSwitch
                label="Sound on Audio Translation Finished"
                description="Play a subtle chime once an incoming voice note has been transcribed and translated."
                checked={true}
                onChange={() => showSaveNotification()}
              />
            </div>
          </div>
        )}

        {/* SECTION 4: Privacy & Processing Details */}
        {activeSection === 'privacy' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle space-y-4">
              <h3 className="text-sm font-semibold text-primary-text flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                <span>Audio Engine Architecture</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-surface-subtle rounded-xl border border-border space-y-1">
                  <span className="text-muted-text block">Speech-to-Text Pipeline</span>
                  <span className="font-semibold text-primary-text">Neural Whisper + ASR</span>
                </div>
                <div className="p-3 bg-surface-subtle rounded-xl border border-border space-y-1">
                  <span className="text-muted-text block">Translation Model</span>
                  <span className="font-semibold text-primary-text">Multilingual NMT (Indic + Global)</span>
                </div>
                <div className="p-3 bg-surface-subtle rounded-xl border border-border space-y-1">
                  <span className="text-muted-text block">Speech Synthesis (TTS)</span>
                  <span className="font-semibold text-primary-text">High Fidelity Voice Synthesizer</span>
                </div>
                <div className="p-3 bg-surface-subtle rounded-xl border border-border space-y-1">
                  <span className="text-muted-text block">Target Inference Latency</span>
                  <span className="font-semibold text-accent">&lt; 650 ms</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-subtle border border-border text-xs text-muted-text space-y-2 mt-4">
                <div className="flex items-center gap-2 text-primary-text font-semibold">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Zero-Retention Privacy Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  Voice audio data is processed ephemeral in memory during speech-to-speech translation and is never used to train generalized models without explicit user consent.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
