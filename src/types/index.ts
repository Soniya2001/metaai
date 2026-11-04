export type SupportedLanguage = 
  | 'English'
  | 'Tamil'
  | 'Hindi'
  | 'Telugu'
  | 'Kannada'
  | 'Malayalam'
  | 'Bengali'
  | 'Marathi';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  nativeLanguage: SupportedLanguage;
  preferredLanguage: SupportedLanguage;
  bio?: string;
  status?: string;
  isOnline?: boolean;
}

export interface VoiceMessage {
  id: string;
  duration: number; // in seconds
  waveform: number[]; // bar heights 10-100
  sourceLanguage: SupportedLanguage;
  originalTranscript: string;
  translationStatus: 'translating' | 'translated' | 'failed';
  translatedLanguage: SupportedLanguage;
  translatedTranscript: string;
  translatedDuration?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'contact';
  timestamp: string; // ISO or formatted
  type: 'text' | 'voice';
  text?: string;
  voice?: VoiceMessage;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  contact: User;
  lastMessage: Message;
  unreadCount: number;
  isOnline: boolean;
  isTyping?: boolean;
}

export interface UserSettings {
  preferredLanguage: SupportedLanguage;
  sourceLanguageDetection: boolean;
  autoVoiceTranslation: boolean;
  showTranslatedTranscript: boolean;
  enableTranslatedAudio: boolean;
  preserveOriginalAudio: boolean;
  notificationsEnabled: boolean;
  audioQuality: 'standard' | 'high';
}

