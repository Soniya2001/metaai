import React from 'react';
import { Search, Plus, Mic, CheckCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ConversationListProps {
  onSelectConversation?: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
}) => {
  const {
    filteredConversations,
    activeConversationId,
    setActiveConversationId,
    markConversationAsRead,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const handleSelect = (id: string) => {
    setActiveConversationId(id);
    markConversationAsRead(id);
    if (onSelectConversation) {
      onSelectConversation(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border select-none">
      {/* Search Header */}
      <div className="p-3 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Messages
          </span>
          <button
            onClick={() => alert('New conversation modal: You can invite contacts via phone number or Echo ID.')}
            className="p-1.5 text-accent hover:bg-accent-subtle rounded-lg transition-colors"
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search conversations, language..."
            className="w-full pl-9 pr-3 py-1.5 bg-surface-subtle border border-border rounded-xl text-xs text-primary-text placeholder:text-muted-text/70 focus:outline-none focus:border-accent/40 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-text">
            No conversations matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          filteredConversations.map(conv => {
            const isActive = conv.id === activeConversationId;
            const { contact, lastMessage, unreadCount, isOnline } = conv;

            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-accent-subtle/70 border-l-[3.5px] border-l-accent'
                    : 'hover:bg-surface-subtle/80'
                }`}
              >
                {/* Contact Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-11 h-11 rounded-full object-cover border border-border"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  )}
                </div>

                {/* Contact Info & Last Message Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm truncate ${unreadCount > 0 && !isActive ? 'font-bold text-primary-text' : 'font-semibold text-primary-text'}`}>
                      {contact.name}
                    </span>
                    <span className={`text-[11px] whitespace-nowrap ml-2 ${unreadCount > 0 && !isActive ? 'text-accent font-semibold' : 'text-muted-text'}`}>
                      {lastMessage.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-text truncate">
                      {lastMessage.type === 'voice' ? (
                        <span className="inline-flex items-center gap-1 text-accent font-medium truncate">
                          <Mic className="w-3 h-3 shrink-0" />
                          <span>Voice note ({lastMessage.voice?.duration}s)</span>
                        </span>
                      ) : (
                        <span className="truncate">
                          {lastMessage.senderType === 'user' && (
                            <CheckCheck className="w-3 h-3 text-accent inline mr-1" />
                          )}
                          {lastMessage.text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-muted-text font-medium">
                        {contact.nativeLanguage.slice(0, 3)}
                      </span>
                      {unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] font-semibold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
