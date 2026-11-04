import React, { useState, useEffect, useRef } from 'react';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageBubble } from '../components/chat/MessageBubble';
import { MessageComposer } from '../components/chat/MessageComposer';
import { ChatRightSidebar } from '../components/chat/ChatRightSidebar';
import { CallModalPlaceholder } from '../components/chat/CallModalPlaceholder';
import { useApp } from '../context/AppContext';
import { Sparkles, MessageSquare } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { messages, activeConversation } = useApp();
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // When switching conversations on mobile, switch to chat view
  const handleSelectConversationOnMobile = () => {
    setMobileView('chat');
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* 1. Left Sidebar: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-84 h-full shrink-0 flex flex-col ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ConversationList onSelectConversation={handleSelectConversationOnMobile} />
      </div>

      {/* 2. Middle Main Conversation Area */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 bg-background/50 relative ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <>
            <ChatHeader
              showBackButton={true}
              onBackClick={() => setMobileView('list')}
            />

            {/* Translation notice banner */}
            <div className="bg-accent-subtle/40 border-b border-accent/15 px-4 py-1.5 flex items-center justify-between text-xs text-muted-text">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>
                  Translating voice between{' '}
                  <strong className="text-primary-text font-medium">
                    {activeConversation.contact.nativeLanguage}
                  </strong>{' '}
                  and your preferred language.
                </span>
              </span>
              <span className="text-[11px] text-accent font-medium hidden sm:inline">
                End-to-end encrypted
              </span>
            </div>

            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-text">
                  <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6 text-accent" />
                  </div>
                  <h4 className="text-sm font-semibold text-primary-text mb-1">
                    No messages in this conversation yet
                  </h4>
                  <p className="text-xs max-w-xs">
                    Send a text or hold the microphone button below to record a voice note in your language.
                  </p>
                </div>
              ) : (
                messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Composer */}
            <MessageComposer />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-text">
            <h3 className="text-base font-semibold text-primary-text mb-2">
              Select a conversation to start chatting
            </h3>
            <p className="text-xs max-w-sm">
              Choose a contact from the list on the left to listen to multilingual voice messages or send new ones.
            </p>
          </div>
        )}
      </div>

      {/* 3. Right Sidebar (Desktop 3-Column Layout) */}
      <ChatRightSidebar />

      {/* Call placeholder modal */}
      <CallModalPlaceholder />
    </div>
  );
};

