import React, { useState } from 'react';
import { Phone, Video, MoreVertical, ArrowLeft, Globe, Shield, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatHeaderProps {
  onBackClick?: () => void;
  showBackButton?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onBackClick,
  showBackButton = false,
}) => {
  const { activeConversation, settings, startCall } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!activeConversation) return null;

  const { contact, isOnline } = activeConversation;

  return (
    <div className="h-16 px-4 border-b border-border bg-surface flex items-center justify-between z-10 shrink-0 shadow-subtle">
      <div className="flex items-center gap-3 min-w-0">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="md:hidden p-1.5 -ml-1 text-muted-text hover:text-primary-text hover:bg-surface-subtle rounded-xl"
            title="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative shrink-0">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-10 h-10 rounded-full object-cover border border-border"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-primary-text text-sm truncate">
              {contact.name}
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent-subtle text-accent border border-accent/20">
              <Globe className="w-3 h-3" />
              {contact.nativeLanguage}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-text truncate">
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            <span>•</span>
            <span className="truncate">
              translates to <strong className="text-primary-text font-medium">{settings.preferredLanguage}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => startCall('voice')}
          className="p-2 text-muted-text hover:text-accent hover:bg-surface-subtle rounded-xl transition-colors"
          title="Start voice call (Demo preview)"
        >
          <Phone className="w-4 h-4" />
        </button>

        <button
          onClick={() => startCall('video')}
          className="p-2 text-muted-text hover:text-accent hover:bg-surface-subtle rounded-xl transition-colors"
          title="Start video call (Demo preview)"
        >
          <Video className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(prev => !prev)}
            className="p-2 text-muted-text hover:text-primary-text hover:bg-surface-subtle rounded-xl transition-colors"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-12 w-48 bg-surface border border-border rounded-xl shadow-dropdown py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  alert(`Contact: ${contact.name}\nNative Language: ${contact.nativeLanguage}\nStatus: ${contact.status || 'Active'}`);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-primary-text hover:bg-surface-subtle text-left"
              >
                <UserIcon className="w-4 h-4 text-muted-text" />
                <span>Contact details</span>
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  alert('End-to-End Encryption active with automated translation sanitization.');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-primary-text hover:bg-surface-subtle text-left"
              >
                <Shield className="w-4 h-4 text-muted-text" />
                <span>Encryption & Privacy</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

