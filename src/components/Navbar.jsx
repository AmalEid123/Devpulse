import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import logoImage from '../assets/logo.png';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/search', label: 'Search' },
  { path: '/projects', label: 'Trending' },
  { path: '/developer', label: 'Developers' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const { user, logout } = useAuth();

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearch.trim())}&type=repositories`);
      setSearchOpen(false);
      setNavSearch('');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-[var(--color-bg)] border-b border-[var(--color-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoImage}
              alt="DevPulse logo"
              className="w-10 h-10 object-cover rounded-lg"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text text-transparent">
              DevPulse
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary-light)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-border-light)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <AnimatePresence>
                {searchOpen && (
                  <form onSubmit={handleNavSearch}>
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 240, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      value={navSearch}
                      onChange={(e) => setNavSearch(e.target.value)}
                      placeholder="Search..."
                      className="absolute right-10 top-1/2 -translate-y-1/2 w-60 px-4 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </form>
                )}
              </AnimatePresence>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full hover:bg-[var(--color-border-light)] transition-colors"
              >
                <Search className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            <ThemeToggle />

            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-full">
                  <img
                    src={user.avatar}
                    alt={user.name || 'User avatar'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-[var(--color-text)]">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 bg-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium rounded-full hover:bg-[var(--color-border-light)] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:block px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-full hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--color-border-light)]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-elevated)]"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === link.path
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary-light)]'
                      : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate('/');
                  }}
                  className="block w-full px-3 py-2 mt-2 text-center bg-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg text-sm font-medium"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 mt-2 text-center bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}