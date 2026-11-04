/**
 * EchoPulse Frontend Reusable API Client
 * Configured via VITE_API_BASE_URL (defaults to http://localhost:8000/api)
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  private getHeaders(isFormData = false): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('echopulse_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public async register(payload: {
    username: string;
    full_name: string;
    email: string;
    password: string;
    preferred_language?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  }

  public async login(username_or_email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username_or_email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(err.detail || 'Invalid credentials');
    }
    return res.json();
  }

  public async getMe() {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  }

  public async updateProfile(payload: {
    full_name?: string;
    username?: string;
    bio?: string;
    avatar?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }

  public async updatePreferences(payload: {
    preferred_language?: string;
    auto_translate_enabled?: boolean;
    show_transcript?: boolean;
    translated_audio_enabled?: boolean;
  }) {
    const res = await fetch(`${API_BASE_URL}/users/me/preferences`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return res.json();
  }

  public async getConversations() {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load conversations');
    return res.json();
  }

  public async getMessages(conversationId: string) {
    const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load messages');
    return res.json();
  }

  public async sendTextMessage(conversationId: string, text: string) {
    const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/text`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to send text message');
    return res.json();
  }

  public async uploadVoiceMessage(
    conversationId: string,
    audioBlob: Blob,
    durationSeconds: number
  ) {
    const formData = new FormData();
    const extension = audioBlob.type.includes('webm') ? 'webm' : 'wav';
    formData.append('audio_file', audioBlob, `voice_recording.${extension}`);
    formData.append('duration_seconds', durationSeconds.toString());

    const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/voice`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Voice upload failed' }));
      throw new Error(err.detail || 'Voice upload failed');
    }
    return res.json();
  }

  public getAudioStreamUrl(messageId: string, type: 'original' | 'translated'): string {
    return `${API_BASE_URL}/messages/${messageId}/audio/${type}`;
  }
}

export const api = new ApiClient();

