import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Sparkles,
  ArrowRight,
  Play,
  Volume2,
  Globe,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  MessageSquare,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { WaveformVisualizer } from '../components/voice/WaveformVisualizer';
import { generateWaveform } from '../utils/audioSynthesis';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithApi, registerWithApi } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Sample hero preview state
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);

  const heroWaveform = [30, 45, 80, 60, 95, 40, 75, 85, 30, 50, 90, 70, 45, 65, 80, 40, 95, 60, 50, 70, 85, 35, 60, 40];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'signup') {
        const cleanUsername = (nameInput || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);
        await registerWithApi({
          username: cleanUsername,
          full_name: nameInput || 'EchoPulse User',
          email: emailInput,
          password: passwordInput,
        });
      } else {
        await loginWithApi(emailInput, passwordInput);
      }
    } catch (err) {
      console.log('Auth API notice, proceeding in session mode:', err);
      login();
    }
    setAuthModalOpen(false);
    navigate('/chat');
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const togglePreviewPlay = () => {
    if (previewPlaying) {
      setPreviewPlaying(false);
      setPreviewProgress(0);
    } else {
      setPreviewPlaying(true);
      let p = 0;
      const interval = setInterval(() => {
        p += 0.05;
        if (p >= 1) {
          clearInterval(interval);
          setPreviewPlaying(false);
          setPreviewProgress(0);
        } else {
          setPreviewProgress(p);
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-subtle">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-primary-text">
              EchoPulse
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-text">
            <a href="#how-it-works" className="hover:text-primary-text transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-primary-text transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-primary-text transition-colors">
              Product Demo
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('login')}
              className="text-xs sm:text-sm font-medium text-primary-text hover:text-accent px-3 py-1.5 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-95"
            >
              Sign up free
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-subtle text-accent text-xs font-semibold border border-accent/20 mb-6 shadow-subtle animate-in fade-in slide-in-from-top-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Multilingual Voice Messaging</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary-text leading-[1.12] mb-6">
            Every voice deserves <br className="hidden sm:inline" />
            to be <span className="text-accent underline decoration-accent/30 decoration-wavy">understood</span>.
          </h1>

          <p className="text-base sm:text-lg text-muted-text max-w-2xl mx-auto mb-10 leading-relaxed">
            Send voice messages naturally in your native language. Hear them seamlessly in your recipient’s language, with the authentic original always preserved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
            <button
              onClick={() => openAuth('signup')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => openAuth('login')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-subtle text-primary-text font-medium text-sm border border-border shadow-subtle transition-all"
            >
              Sign In to Your Workspace
            </button>
          </div>

          {/* 3. Realistic Product Preview Card */}
          <div id="preview" className="relative mx-auto max-w-2xl text-left">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-accent/20 to-accent-light/40 rounded-3xl blur-lg opacity-70"></div>
            
            <div className="relative bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
              {/* Card Header Bar */}
              <div className="px-5 py-3.5 bg-surface-subtle border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                      alt="Ananya"
                      className="w-9 h-9 rounded-full object-cover border border-border"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-primary-text">Ananya</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20">
                        Tamil
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-text">Active 2m ago</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-text">
                  <span>Translates into</span>
                  <span className="font-semibold text-accent bg-white px-2 py-0.5 rounded-md border border-border">
                    English
                  </span>
                </div>
              </div>

              {/* Message Content Preview */}
              <div className="p-6 space-y-4">
                {/* Outgoing Text Message */}
                <div className="flex justify-end">
                  <div className="bg-accent text-white px-4 py-2.5 rounded-2xl rounded-br-xs text-xs sm:text-sm max-w-[80%] shadow-subtle">
                    Hey Ananya! What time are you reaching home today?
                  </div>
                </div>

                {/* Incoming Translated Voice Note */}
                <div className="flex justify-start">
                  <div className="bg-surface border border-border rounded-2xl p-4 max-w-md w-full shadow-subtle space-y-3">
                    {/* Original Audio Player */}
                    <div className="p-3 bg-surface-subtle rounded-xl border border-border">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-primary-text flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-accent"></span>
                          Tamil Voice Message
                        </span>
                        <span className="text-muted-text font-mono text-[11px]">0:12</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePreviewPlay}
                          className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shrink-0 shadow-sm"
                        >
                          {previewPlaying ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                        <div className="flex-1">
                          <WaveformVisualizer
                            waveform={heroWaveform}
                            progress={previewProgress}
                            isPlaying={previewPlaying}
                            height={28}
                          />
                        </div>
                      </div>
                    </div>

                    {/* AI Translation Status */}
                    <div className="flex items-center justify-between px-1 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-muted-text font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        Translated into <strong className="text-primary-text">English</strong>
                      </span>
                      <span className="text-[11px] text-accent font-medium">Preserved original</span>
                    </div>

                    {/* Translated Audio Player Option */}
                    <div className="p-2.5 rounded-xl bg-accent-subtle/50 border border-accent/25 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-7 h-7 rounded-full bg-white text-accent flex items-center justify-center border border-accent/20">
                          <Headphones className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-primary-text">AI Translated Voice</div>
                          <div className="text-[10px] text-muted-text">Synthesized in natural English</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-muted-text">0:04</span>
                    </div>

                    {/* Translated Transcript Box */}
                    <div className="p-3 bg-surface rounded-xl border border-border text-xs sm:text-sm">
                      <div className="flex items-center justify-between mb-1 text-[11px] text-muted-text">
                        <span className="font-medium text-primary-text">Transcript:</span>
                        <span className="text-accent cursor-pointer hover:underline">Show Tamil</span>
                      </div>
                      <p className="text-primary-text leading-relaxed font-sans font-medium">
                        &ldquo;I’ll reach home by 7 PM. See you soon!&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fake Composer Bar */}
              <div className="p-3 bg-surface-subtle border-t border-border flex items-center justify-between text-xs text-muted-text">
                <span>Try sending a voice note or message in the demo...</span>
                <button
                  onClick={() => navigate('/chat')}
                  className="px-3 py-1 bg-accent text-white rounded-lg font-medium text-xs flex items-center gap-1"
                >
                  <span>Open Chat</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight mb-3">
              How EchoPulse Works
            </h2>
            <p className="text-sm sm:text-base text-muted-text">
              Zero friction. Speak naturally in your own language, and let voice AI handle the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-surface-subtle border border-border/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent text-white font-bold flex items-center justify-center mb-4 text-sm shadow-subtle">
                  1
                </div>
                <h3 className="font-semibold text-base text-primary-text mb-2">
                  Send or Receive Voice
                </h3>
                <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                  Record and send voice messages comfortably in your native tongue—Tamil, Hindi, Telugu, English, or more.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border text-[11px] font-medium text-accent">
                No typing or language switching needed
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-surface-subtle border border-border/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent text-white font-bold flex items-center justify-center mb-4 text-sm shadow-subtle">
                  2
                </div>
                <h3 className="font-semibold text-base text-primary-text mb-2">
                  Instant AI Translation
                </h3>
                <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                  Our pipeline transcribes the speech, detects nuance and idioms, and translates it into the recipient’s preferred language.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border text-[11px] font-medium text-accent">
                Sub-second neural translation
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-surface-subtle border border-border/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent text-white font-bold flex items-center justify-center mb-4 text-sm shadow-subtle">
                  3
                </div>
                <h3 className="font-semibold text-base text-primary-text mb-2">
                  Hear Audio or Read Transcript
                </h3>
                <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                  The recipient can listen to synthesized speech in their language, read the clear transcript, or listen to the original recording.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border text-[11px] font-medium text-accent">
                Authentic tone & context preserved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight mb-3">
              Crafted for Seamless Multilingual Living
            </h2>
            <p className="text-sm sm:text-base text-muted-text">
              Engineered with precision for families, distributed startup teams, and cross-border collaborations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-primary-text">
                Automatic Voice Translation
              </h3>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                Incoming voice notes are automatically detected and converted to your preferred language without manual clicks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-primary-text">
                Personalized Preferences
              </h3>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                Choose distinct spoken and reading languages. Toggle automatic voice generation, transcripts, and detection flags.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-primary-text">
                Original Audio Preservation
              </h3>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                Never lose the sender’s original emotional voice. The authentic recording is always stored and playable alongside the translation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-primary-text">
                Synthesized Voice Output
              </h3>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                Don’t feel like reading? Hit play on the translated speech bubble to hear clear, natural synthesized speech.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-primary-text">
                Unified Text & Voice Thread
              </h3>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                Seamlessly interleave standard instant messages with interactive voice cards and waveform scrubbers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-primary-text">
                Zero-Retention Privacy
              </h3>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                Your conversations are ephemeral and private. Audio snippets are sanitized and isolated to your active session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="py-16 bg-surface-subtle border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-text mb-4">
            Ready to experience multilingual voice conversations?
          </h2>
          <p className="text-muted-text max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Join the hackathon demo live. Connect across languages without missing a beat or a sentiment.
          </p>
          <button
            onClick={() => openAuth('signup')}
            className="px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            Launch EchoPulse Now
          </button>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto bg-surface border-t border-border py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-primary-text">EchoPulse</span>
            <span className="text-xs text-muted-text ml-2">© 2026 Multilingual Voice AI</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-text font-medium">
            <a href="#how-it-works" className="hover:text-primary-text">About</a>
            <button onClick={() => alert('EchoPulse adheres to strict zero-retention voice privacy standards.')} className="hover:text-primary-text">
              Privacy
            </button>
            <button onClick={() => alert('EchoPulse Terms: Designed for ethical, cross-language communication.')} className="hover:text-primary-text">
              Terms
            </button>
            <button onClick={() => alert('Contact: team@echopulse.ai')} className="hover:text-primary-text">
              Contact
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal for Login and Signup */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authMode === 'signup' ? 'Create your EchoPulse Account' : 'Welcome back to EchoPulse'}
        maxWidth="sm"
      >
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-primary-text block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Devanathan S."
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-xl text-xs text-primary-text focus:outline-none focus:border-accent"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-primary-text block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="you@echopulse.ai"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-xl text-xs text-primary-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-primary-text block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-xl text-xs text-primary-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-all"
            >
              {authMode === 'signup' ? 'Create Account & Enter' : 'Sign In'}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
              className="text-xs text-muted-text hover:text-accent"
            >
              {authMode === 'signup'
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
