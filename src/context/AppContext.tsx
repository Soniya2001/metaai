import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Conversation,
  Message,
  UserSettings,
  SupportedLanguage,
} from '../types';
import {
  currentUser as initialCurrentUser,
  initialConversations,
  initialMessages,
} from '../data/mockConversations';
import { simulateTranslation, translationBank } from '../utils/translationService';
import { generateWaveform } from '../utils/audioSynthesis';
import { api } from '../services/api';

interface AppContextType {
  user: User;
  settings: UserSettings;
  conversations: Conversation[];
  activeConversationId: string;
  activeConversation: Conversation | undefined;
  messages: Message[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredConversations: Conversation[];
  isAuthenticated: boolean;
  setActiveConversationId: (id: string) => void;
  sendTextMessage: (text: string) => void;
  sendVoiceMessage: (duration: number, transcript?: string, sourceLang?: SupportedLanguage, audioBlob?: Blob) => void;
  triggerTranslateMessage: (messageId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateProfile: (updatedUser: Partial<User>) => void;
  login: () => void;
  loginWithApi: (username_or_email: string, password: string) => Promise<void>;
  registerWithApi: (payload: { username: string; full_name: string; email: string; password: string; preferred_language?: string }) => Promise<void>;
  logout: () => void;
  activeCall: { active: boolean; type: 'voice' | 'video'; contactName?: string } | null;
  startCall: (type: 'voice' | 'video') => void;
  endCall: () => void;
}

const defaultSettings: UserSettings = {
  preferredLanguage: 'English',
  sourceLanguageDetection: true,
  autoVoiceTranslation: true,
  showTranslatedTranscript: true,
  enableTranslatedAudio: true,
  preserveOriginalAudio: true,
  notificationsEnabled: true,
  audioQuality: 'high',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('echopulse_user');
    return saved ? JSON.parse(saved) : initialCurrentUser;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('echopulse_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return initialConversations;
  });

  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(() => {
    return initialMessages;
  });

  const [activeConversationId, setActiveConversationId] = useState<string>('conv-ananya');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const authStatus = localStorage.getItem('echopulse_authenticated');
    const token = localStorage.getItem('echopulse_token');
    // If user has explicitly clicked Sign Out, keep them signed out
    if (authStatus === 'false') {
      return false;
    }
    // If authenticated flag is true or valid token exists, stay signed in
    if (authStatus === 'true' || token) {
      return true;
    }
    // Default session: signed in so user directly accesses the chat app
    return true;
  });
  const [activeCall, setActiveCall] = useState<{ active: boolean; type: 'voice' | 'video'; contactName?: string } | null>(null);

  // Sync user preferred language with settings
  useEffect(() => {
    if (user.preferredLanguage !== settings.preferredLanguage) {
      setUser(prev => ({ ...prev, preferredLanguage: settings.preferredLanguage }));
    }
  }, [settings.preferredLanguage]);

  // Persist user and settings
  useEffect(() => {
    localStorage.setItem('echopulse_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('echopulse_settings', JSON.stringify(settings));
  }, [settings]);

  // Attempt initial sync with backend
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const token = localStorage.getItem('echopulse_token');
        if (!token) return;
        
        const me = await api.getMe();
        if (me) {
          setUser(prev => ({
            ...prev,
            id: me.id,
            name: me.full_name,
            username: me.username,
            email: me.email,
            preferredLanguage: me.preferred_language as SupportedLanguage,
          }));
          setSettings(prev => ({
            ...prev,
            preferredLanguage: me.preferred_language as SupportedLanguage,
            autoVoiceTranslation: me.auto_translate_enabled,
            showTranslatedTranscript: me.show_transcript,
            enableTranslatedAudio: me.translated_audio_enabled,
          }));
        }
      } catch (err) {
        // Fallback to local state gracefully
        console.log('Backend sync notice (running with local cache):', err);
      }
    };
    syncWithBackend();
  }, []);

  // Dynamically re-translate when preferred language changes and auto-translate is on
  useEffect(() => {
    const currentLang = settings.preferredLanguage;
    setAllMessages(prevMessages => {
      const updated = { ...prevMessages };
      for (const convId in updated) {
        updated[convId] = updated[convId].map(msg => {
          if (msg.type === 'voice' && msg.voice) {
            // Update translation for recipient language
            if (msg.voice.translatedLanguage !== currentLang) {
              return {
                ...msg,
                voice: {
                  ...msg.voice,
                  translatedLanguage: currentLang,
                  translationStatus: settings.autoVoiceTranslation ? 'translating' : 'translated',
                },
              };
            }
          }
          return msg;
        });
      }
      return updated;
    });

    // Simulate async completion of translation for the new language
    if (settings.autoVoiceTranslation) {
      const timer = setTimeout(() => {
        setAllMessages(prev => {
          const updated = { ...prev };
          for (const convId in updated) {
            updated[convId] = updated[convId].map(msg => {
              if (msg.type === 'voice' && msg.voice) {
                // Look up in translation bank or fallback
                const bankTranslation = translationBank[msg.voice.id]?.[currentLang];
                const newTrans = bankTranslation || msg.voice.translatedTranscript;

                return {
                  ...msg,
                  voice: {
                    ...msg.voice,
                    translatedLanguage: currentLang,
                    translatedTranscript: newTrans,
                    translationStatus: 'translated',
                  },
                };
              }
              return msg;
            });
          }
          return updated;
        });

        // Also sync snippet in conversation list
        setConversations(prev =>
          prev.map(c => {
            if (c.lastMessage?.type === 'voice' && c.lastMessage.voice) {
              const bankTranslation = translationBank[c.lastMessage.voice.id]?.[currentLang];
              if (bankTranslation) {
                return {
                  ...c,
                  lastMessage: {
                    ...c.lastMessage,
                    voice: {
                      ...c.lastMessage.voice,
                      translatedLanguage: currentLang,
                      translatedTranscript: bankTranslation,
                      translationStatus: 'translated',
                    },
                  },
                };
              }
            }
            return c;
          })
        );
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [settings.preferredLanguage, settings.autoVoiceTranslation]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = allMessages[activeConversationId] || [];

  const filteredConversations = conversations.filter(conv => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      conv.contact.name.toLowerCase().includes(q) ||
      conv.contact.nativeLanguage.toLowerCase().includes(q) ||
      (conv.lastMessage.text && conv.lastMessage.text.toLowerCase().includes(q)) ||
      (conv.lastMessage.voice &&
        (conv.lastMessage.voice.originalTranscript.toLowerCase().includes(q) ||
          conv.lastMessage.voice.translatedTranscript.toLowerCase().includes(q)))
    );
  });

  const sendTextMessage = (text: string) => {
    if (!text.trim() || !activeConversationId) return;

    const newMsg: Message = {
      id: `msg-text-${Date.now()}`,
      conversationId: activeConversationId,
      senderId: user.id,
      senderType: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text: text.trim(),
      status: 'sent',
    };

    setAllMessages(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
    }));

    // Update conversation snippet
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, lastMessage: newMsg }
          : c
      )
    );

    // Call backend API asynchronously
    api.sendTextMessage(activeConversationId, text.trim()).catch(err => {
      console.log('API text message sync notice (saved locally):', err);
    });
  };

  const sendVoiceMessage = (
    duration: number,
    transcript: string = 'Voice message recorded from client.',
    sourceLang: SupportedLanguage = user.nativeLanguage,
    audioBlob?: Blob
  ) => {
    if (!activeConversationId) return;

    const targetLang = activeConversation?.contact.preferredLanguage || settings.preferredLanguage;
    const voiceId = `voice-${Date.now()}`;

    const newVoiceMsg: Message = {
      id: `msg-voice-${Date.now()}`,
      conversationId: activeConversationId,
      senderId: user.id,
      senderType: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'voice',
      voice: {
        id: voiceId,
        duration: Math.max(2, Math.round(duration)),
        waveform: generateWaveform(32),
        sourceLanguage: sourceLang,
        originalTranscript: transcript,
        translationStatus: 'translating',
        translatedLanguage: targetLang,
        translatedTranscript: 'Translating audio...',
      },
      status: 'sent',
    };

    setAllMessages(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newVoiceMsg],
    }));

    // Call backend audio upload if audioBlob is present
    if (audioBlob) {
      api.uploadVoiceMessage(activeConversationId, audioBlob, duration)
        .then(uploadRes => {
          console.log('Voice audio persisted to backend:', uploadRes.audio_filename);
        })
        .catch(err => {
          console.log('Voice audio upload notice (persisted in local state):', err);
        });
    }

    // Simulate async translation
    setTimeout(async () => {
      const res = await simulateTranslation(voiceId, targetLang, transcript);
      setAllMessages(prev => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map(m => {
          if (m.id === newVoiceMsg.id && m.voice) {
            return {
              ...m,
              voice: {
                ...m.voice,
                translationStatus: res.success ? 'translated' : 'failed',
                translatedTranscript: res.translatedText,
              },
            };
          }
          return m;
        }),
      }));
    }, 1200);

    // Update conversation snippet
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, lastMessage: newVoiceMsg }
          : c
      )
    );
  };

  const triggerTranslateMessage = async (messageId: string) => {
    // Set status to translating
    setAllMessages(prev => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map(m => {
        if (m.id === messageId && m.voice) {
          return {
            ...m,
            voice: { ...m.voice, translationStatus: 'translating' },
          };
        }
        return m;
      }),
    }));

    const targetMsg = (allMessages[activeConversationId] || []).find(m => m.id === messageId);
    if (!targetMsg || !targetMsg.voice) return;

    const res = await simulateTranslation(
      targetMsg.voice.id,
      settings.preferredLanguage,
      targetMsg.voice.originalTranscript
    );

    setAllMessages(prev => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map(m => {
        if (m.id === messageId && m.voice) {
          return {
            ...m,
            voice: {
              ...m.voice,
              translationStatus: res.success ? 'translated' : 'failed',
              translatedLanguage: settings.preferredLanguage,
              translatedTranscript: res.translatedText,
            },
          };
        }
        return m;
      }),
    }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Sync with backend API
    api.updatePreferences({
      preferred_language: newSettings.preferredLanguage,
      auto_translate_enabled: newSettings.autoVoiceTranslation,
      show_transcript: newSettings.showTranslatedTranscript,
      translated_audio_enabled: newSettings.enableTranslatedAudio,
    }).catch(err => console.log('Settings preference sync notice:', err));
  };

  const updateProfile = (updatedUser: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedUser }));

    // Sync with backend API
    api.updateProfile({
      full_name: updatedUser.name,
      username: updatedUser.username,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
    }).catch(err => console.log('Profile sync notice:', err));
  };

  const loginWithApi = async (username_or_email: string, password: string) => {
    const res = await api.login(username_or_email, password);
    if (res.access_token) {
      localStorage.setItem('echopulse_token', res.access_token);
      localStorage.setItem('echopulse_authenticated', 'true');
      setIsAuthenticated(true);
      const me = await api.getMe();
      if (me) {
        setUser(prev => ({
          ...prev,
          id: me.id,
          name: me.full_name,
          username: me.username,
          email: me.email,
          preferredLanguage: me.preferred_language as SupportedLanguage,
        }));
      }
    }
  };

  const registerWithApi = async (payload: { username: string; full_name: string; email: string; password: string; preferred_language?: string }) => {
    const res = await api.register(payload);
    if (res.access_token) {
      localStorage.setItem('echopulse_token', res.access_token);
      localStorage.setItem('echopulse_authenticated', 'true');
      setIsAuthenticated(true);
      const me = await api.getMe();
      if (me) {
        setUser(prev => ({
          ...prev,
          id: me.id,
          name: me.full_name,
          username: me.username,
          email: me.email,
          preferredLanguage: me.preferred_language as SupportedLanguage,
        }));
      }
    }
  };

  const login = () => {
    localStorage.setItem('echopulse_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.setItem('echopulse_authenticated', 'false');
    localStorage.removeItem('echopulse_token');
    setIsAuthenticated(false);
  };

  const startCall = (type: 'voice' | 'video') => {
    setActiveCall({
      active: true,
      type,
      contactName: activeConversation?.contact.name,
    });
  };

  const endCall = () => {
    setActiveCall(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        settings,
        conversations,
        activeConversationId,
        activeConversation,
        messages: activeMessages,
        searchQuery,
        setSearchQuery,
        filteredConversations,
        isAuthenticated,
        setActiveConversationId,
        sendTextMessage,
        sendVoiceMessage,
        triggerTranslateMessage,
        updateSettings,
        updateProfile,
        login,
        loginWithApi,
        registerWithApi,
        logout,
        activeCall,
        startCall,
        endCall,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
