import React from 'react';
import { Message } from '../../types';
import { VoiceMessagePlayer } from '../voice/VoiceMessagePlayer';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isSender = message.senderType === 'user';

  return (
    <div
      className={`flex flex-col mb-4 ${
        isSender ? 'items-end' : 'items-start'
      } group transition-all`}
    >
      <div
        className={`relative max-w-[85%] md:max-w-[75%] lg:max-w-[65%] rounded-2xl p-3.5 transition-all ${
          message.type === 'voice'
            ? 'bg-transparent p-0'
            : isSender
            ? 'bg-accent text-white rounded-br-sm shadow-subtle'
            : 'bg-surface text-primary-text border border-border rounded-bl-sm shadow-subtle'
        }`}
      >
        {message.type === 'text' ? (
          <div>
            <p className="text-[14.5px] leading-relaxed break-words font-sans selection:bg-white/30">
              {message.text}
            </p>
            <div
              className={`flex items-center justify-end gap-1 mt-1 text-[10.5px] ${
                isSender ? 'text-accent-light' : 'text-muted-text'
              }`}
            >
              <span>{message.timestamp}</span>
              {isSender && (
                <span>
                  {message.status === 'read' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-accent-light" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-accent-light" />
                  )}
                </span>
              )}
            </div>
          </div>
        ) : message.voice ? (
          <div>
            <VoiceMessagePlayer
              voice={message.voice}
              isSender={isSender}
              messageId={message.id}
            />
            <div
              className={`flex items-center gap-1 mt-1 text-[10.5px] text-muted-text ${
                isSender ? 'justify-end' : 'justify-start'
              }`}
            >
              <span>{message.timestamp}</span>
              {isSender && (
                <span>
                  {message.status === 'read' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-accent" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-muted-text" />
                  )}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

