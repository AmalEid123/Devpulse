import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('devpulse_users') || '[]');
    const matching = users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());

    if (!matching) {
      setError('No account found with that email.');
      return;
    }

    setMessage(`Password reset link sent to ${email.trim()}. Check your inbox.`);
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
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-[var(--color-bg-card)] rounded-3xl p-8 border border-[var(--color-border)] shadow-[var(--shadow-lg)]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">DP</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Forgot Password</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Enter your email to receive a password reset link.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {message && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Send Reset Link
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Remembered your password?{' '}
            <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
