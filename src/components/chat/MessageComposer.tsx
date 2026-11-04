import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send, Globe, Image as ImageIcon } from 'lucide-react';
import { VoiceRecorder } from '../voice/VoiceRecorder';
import { useApp } from '../../context/AppContext';
import { SupportedLanguage } from '../../types';

export const MessageComposer: React.FC = () => {
  const { user, sendTextMessage, sendVoiceMessage, activeConversation } = useApp();
  const [inputText, setInputText] = useState('');
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendTextMessage(inputText);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceSend = (duration: number, transcript?: string, sourceLang?: SupportedLanguage, audioBlob?: Blob) => {
    sendVoiceMessage(duration, transcript, sourceLang, audioBlob);
    setIsRecordingMode(false);
  };

  if (isRecordingMode) {
    return (
      <div className="p-3 bg-background/80 backdrop-blur border-t border-border">
        <VoiceRecorder
          onSendVoice={handleVoiceSend}
          onCancel={() => setIsRecordingMode(false)}
          userLanguage={user.nativeLanguage}
        />
      </div>
    );
  }

  return (
    <div className="p-3 bg-background/90 backdrop-blur-md border-t border-border relative">
      {/* Attachment popover */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-4 bg-surface border border-border rounded-xl shadow-dropdown p-2 flex flex-col gap-1 z-20 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={() => {
              setShowAttachMenu(false);
              sendTextMessage('📎 Shared document: presentation-deck-v2.pdf');
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-primary-text hover:bg-surface-subtle rounded-lg text-left"
          >
            <Paperclip className="w-4 h-4 text-accent" />
            <span>Document or PDF</span>
          </button>
          <button
            onClick={() => {
              setShowAttachMenu(false);
              sendTextMessage('🖼️ Shared image: screenshot-wireframe.png');
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-primary-text hover:bg-surface-subtle rounded-lg text-left"
          >
            <ImageIcon className="w-4 h-4 text-accent" />
            <span>Photo or Audio File</span>
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-surface rounded-2xl border border-border p-2 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/15 transition-all shadow-subtle">
        {/* Attachment toggle */}
        <button
          type="button"
          onClick={() => setShowAttachMenu(prev => !prev)}
          className="p-2 text-muted-text hover:text-primary-text hover:bg-surface-subtle rounded-xl transition-colors shrink-0 mb-0.5"
          title="Attach media or file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${activeConversation?.contact.name || 'someone'}... (speaks ${activeConversation?.contact.nativeLanguage || 'multilingual'})`}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-primary-text placeholder:text-muted-text/70 py-1.5 px-1 max-h-28 leading-relaxed font-sans"
        />

        {/* Microphone action */}
        <button
          type="button"
          onClick={() => setIsRecordingMode(true)}
          className="p-2 text-muted-text hover:text-accent hover:bg-accent-subtle rounded-xl transition-colors shrink-0 mb-0.5"
          title="Record Voice Note"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send action */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="p-2 bg-accent hover:bg-accent-hover text-white rounded-xl disabled:opacity-40 disabled:hover:bg-accent disabled:cursor-not-allowed transition-all shadow-xs shrink-0 mb-0.5"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-muted-text">
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-accent" />
          <span>
            Voice notes auto-translate to{' '}
            <strong className="text-primary-text font-medium">
              {activeConversation?.contact.preferredLanguage || 'recipient language'}
            </strong>
          </span>
        </span>
        <span className="hidden sm:inline">Press Enter to send</span>
      </div>
    </div>
  );
};

