import React from 'react';
import {
  Globe,
  Mic,
  Clock,
  Volume2,
  ShieldCheck,
  ChevronRight,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';

export const ChatRightSidebar: React.FC = () => {
  const { activeConversation, settings, messages } = useApp();

  if (!activeConversation) return null;

  const { contact } = activeConversation;
  const voiceMessages = messages.filter(m => m.type === 'voice');

  return (
    <div className="hidden lg:flex flex-col h-full w-80 bg-surface border-l border-border overflow-y-auto select-none p-5 divide-y divide-border/60">
      {/* Contact Profile Summary */}
      <div className="flex flex-col items-center text-center pb-5">
        <div className="relative mb-3">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-accent/20 shadow-subtle"
          />
          {contact.isOnline && (
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          )}
        </div>

        <h3 className="font-semibold text-base text-primary-text">{contact.name}</h3>
        <p className="text-xs text-muted-text mt-0.5">{contact.email}</p>
        {contact.bio && (
          <p className="text-xs text-primary-text/80 mt-2 px-3 leading-relaxed bg-surface-subtle p-2 rounded-xl border border-border/80">
            &ldquo;{contact.bio}&rdquo;
          </p>
        )}
      </div>

      {/* Language & Translation Hub */}
      <div className="py-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-text">
          Language Profile
        </h4>

        <div className="p-3 bg-surface-subtle rounded-xl border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-text flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent" />
              Native Tongue
            </span>
            <span className="font-semibold text-primary-text">{contact.nativeLanguage}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-text flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-accent" />
              Translating To
            </span>
            <span className="font-semibold text-accent">{settings.preferredLanguage}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/70">
            <span className="text-muted-text">Translation Mode</span>
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
              {settings.autoVoiceTranslation ? 'Real-time Auto' : 'Manual Trigger'}
            </span>
          </div>
        </div>
      </div>

      {/* Shared Voice Notes in this thread */}
      <div className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Voice Memos ({voiceMessages.length})
          </h4>
          <span className="text-[11px] text-accent font-medium">Originals saved</span>
        </div>

        <div className="space-y-2">
          {voiceMessages.map((vm, index) => (
            <div
              key={vm.id}
              className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border hover:border-accent/30 transition-all text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-subtle flex items-center justify-center text-accent">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-medium text-primary-text">
                    Voice Note #{index + 1}
                  </div>
                  <div className="text-[10px] text-muted-text flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{vm.voice?.duration}s • {vm.voice?.sourceLanguage}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-accent font-medium">Ready</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Settings shortcut */}
      <div className="pt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-text">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero-retention voice translation privacy</span>
        </div>
        <Link
          to="/settings"
          className="flex items-center justify-between w-full p-2.5 rounded-xl bg-surface hover:bg-surface-subtle border border-border text-xs text-primary-text font-medium transition-colors"
        >
          <span className="flex items-center gap-2">
            <SettingsIcon className="w-3.5 h-3.5 text-accent" />
            <span>Tune Translation Settings</span>
          </span>
          <ChevronRight className="w-4 h-4 text-muted-text" />
        </Link>
      </div>
    </div>
  );
};
