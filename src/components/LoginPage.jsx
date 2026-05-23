import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signUp, googleSignIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const GOOGLE_REDIRECT_URI = `${window.location.origin}/login`;

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const getIdTokenFromUrl = () => {
    const query = new URLSearchParams(window.location.search);
    const searchToken = query.get('id_token');
    if (searchToken) return searchToken;

    const hash = window.location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);
    return hashParams.get('id_token');
  };

  useEffect(() => {
    const idToken = getIdTokenFromUrl();

    if (idToken) {
      const profile = parseJwt(idToken);
      if (profile && profile.email) {
        const googleProfile = {
          name: profile.name || profile.email,
          email: profile.email,
          avatar: profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.email)}&background=4285f4&color=fff&size=128`,
          provider: 'google'
        };

        googleSignIn(googleProfile);
        setMessage('Signed in with Google successfully. Redirecting...');
        window.history.replaceState({}, document.title, '/login');
        setTimeout(() => navigate('/'), 800);
      } else {
        setError('Google login failed. Please try again.');
      }
    }
  }, [googleSignIn, navigate]);

  const buildGoogleAuthUrl = () => {
    const nonce = window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'id_token',
      scope: 'openid email profile',
      prompt: 'select_account',
      nonce
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleGoogleSignIn = () => {
    setError('');
    setMessage('Redirecting to Google...');
    if (!GOOGLE_CLIENT_ID) {
      setError('Google OAuth client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID.');
      return;
    }
    window.location.href = buildGoogleAuthUrl();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim() || !password.trim() || (isSignUp && !name.trim())) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (isSignUp) {
        await signUp({ name: name.trim(), email: email.trim(), password });
        setMessage('Account created successfully. Redirecting...');
      } else {
        await login({ email: email.trim(), password });
        setMessage('Signed in successfully. Redirecting...');
      }
      setTimeout(() => navigate('/'), 700);
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary)] rounded-full blur-[150px] opacity-10" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500 rounded-full blur-[120px] opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="bg-[var(--color-bg-card)] rounded-3xl p-8 border border-[var(--color-border)] shadow-[var(--shadow-lg)]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">DP</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              {isSignUp ? 'Join the developer community' : 'Sign in to your DevPulse account'}
            </p>
          </div>

          {message && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 mb-4">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Full Name</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="dev@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="text-[var(--color-text-secondary)]">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-[var(--color-primary)] hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-[var(--shadow-glow)]"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[var(--color-bg-card)] text-[var(--color-text-muted)]">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-border-light)] transition-colors text-sm text-[var(--color-text-secondary)]"
            >
              <FcGoogle className="w-4 h-4" /> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-border-light)] transition-colors text-sm text-[var(--color-text-secondary)]"
            >
              <Code2 className="w-4 h-4" /> GitHub
            </button>
          </div>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setError('');
                setMessage('');
                setIsSignUp(!isSignUp);
              }}
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
