import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { supportedLanguages } from '../components/settings/LanguageSelector';
import { SupportedLanguage } from '../types';
import {
  Mail,
  Globe,
  Sliders,
  LogOut,
  Edit3,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, settings, logout } = useApp();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio || '',
    nativeLanguage: user.nativeLanguage,
    preferredLanguage: user.preferredLanguage,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-4 sm:p-8 select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-text">
              User Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-text mt-1">
              Manage your personal identity, voice persona, and language profiles.
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-surface hover:bg-surface-subtle text-primary-text shadow-subtle transition-all"
          >
            {isEditing ? (
              <>
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-primary-text block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-xl text-xs text-primary-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary-text block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-xl text-xs text-primary-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary-text block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-xl text-xs text-primary-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary-text block mb-1">
                    Native / Spoken Language
                  </label>
                  <select
                    value={formData.nativeLanguage}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        nativeLanguage: e.target.value as SupportedLanguage,
                      })
                    }
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-xl text-xs text-primary-text focus:outline-none focus:border-accent"
                  >
                    {supportedLanguages.map(l => (
                      <option key={l.name} value={l.name}>
                        {l.name} ({l.script})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-primary-text block mb-1">
                  About / Bio
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share a short bio..."
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-xl text-xs text-primary-text focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs rounded-xl border border-border bg-surface text-muted-text hover:bg-surface-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-accent hover:bg-accent-hover text-white shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover border border-border shadow-card"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl font-bold text-primary-text">{user.name}</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent bg-accent-subtle px-2.5 py-0.5 rounded-full border border-accent/20 w-fit mx-auto sm:mx-0">
                    <Sparkles className="w-3 h-3" />
                    Verified Voice Profile
                  </span>
                </div>

                <p className="text-xs text-muted-text">@{user.username}</p>
                <p className="text-xs text-muted-text flex items-center justify-center sm:justify-start gap-1 pt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </p>

                {user.bio && (
                  <p className="text-xs text-primary-text/90 pt-2 leading-relaxed max-w-lg">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Translation Preferences Summary */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle space-y-4">
          <h3 className="text-sm font-semibold text-primary-text flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            <span>Active Linguistic Matrix</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
              <span className="text-muted-text">Native / Spoken Language</span>
              <div className="font-semibold text-primary-text text-sm flex items-center gap-2">
                <span>{user.nativeLanguage}</span>
                <span className="text-xs font-normal text-muted-text">(Outbound Voice)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-accent-subtle/40 border border-accent/20 space-y-1">
              <span className="text-muted-text">Preferred Translation Target</span>
              <div className="font-semibold text-accent text-sm flex items-center gap-2">
                <span>{settings.preferredLanguage}</span>
                <span className="text-xs font-normal text-muted-text">(Inbound Audio/Text)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent" />
              <span className="text-primary-text font-medium">Automatic Translation</span>
            </div>
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              {settings.autoVoiceTranslation ? 'Enabled' : 'Manual'}
            </span>
          </div>
        </div>

        {/* Account & Privacy Actions */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-primary-text block">
                Zero-Retention Privacy Active
              </span>
              <span className="text-muted-text">
                Your voice biometric embeddings are stored locally only.
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
