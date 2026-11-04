import React from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Globe, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CallModalPlaceholder: React.FC = () => {
  const { activeCall, endCall, activeConversation, settings } = useApp();
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);

  if (!activeCall || !activeCall.active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-text/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface rounded-3xl border border-border shadow-floating p-8 flex flex-col items-center text-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-accent/15 to-transparent pointer-events-none" />

        {/* Feature badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent text-xs font-medium border border-accent/20 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Speech-to-Speech AI Calling (Preview)</span>
        </div>

        {/* Avatar */}
        <div className="relative mb-4">
          <img
            src={activeConversation?.contact.avatar}
            alt={activeCall.contactName}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-card"
          />
          <span className="absolute -bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white">
            ✓
          </span>
        </div>

        <h3 className="text-xl font-bold text-primary-text">{activeCall.contactName}</h3>
        <p className="text-xs text-muted-text mt-1">
          {activeCall.type === 'voice' ? 'Encrypted Voice Call' : 'HD Video Call'} • Connecting...
        </p>

        {/* Translation Indicator */}
        <div className="mt-5 p-3 rounded-2xl bg-surface-subtle border border-border w-full flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-primary-text font-medium">
            <Globe className="w-4 h-4 text-accent" />
            <span>AI Live Interpreter</span>
          </div>
          <span className="text-accent font-semibold">
            {activeConversation?.contact.nativeLanguage} ⇄ {settings.preferredLanguage}
          </span>
        </div>

        {/* Audio pulsing wave */}
        <div className="flex items-center justify-center gap-1.5 h-8 my-6">
          {[30, 60, 90, 45, 100, 70, 85, 40, 95, 55].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-accent rounded-full animate-wave"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Call Controls */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition-colors ${
              isMuted ? 'bg-rose-100 text-rose-600' : 'bg-surface-subtle hover:bg-border text-primary-text'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {activeCall.type === 'video' && (
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3.5 rounded-full transition-colors ${
                isVideoOff ? 'bg-rose-100 text-rose-600' : 'bg-surface-subtle hover:bg-border text-primary-text'
              }`}
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={endCall}
            className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95 transition-all"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-muted-text mt-6">
          Real-time WebRTC audio & video streams will integrate with the backend speech synthesis model.
        </p>
      </div>
    </div>
  );
};

