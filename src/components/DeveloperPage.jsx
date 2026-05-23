import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  Star, GitFork, GitPullRequest, Flame, MessageSquare,
  UserPlus, Zap, Layout, BarChart3, Code2, ChevronRight,
  HelpCircle, LogOut, Calendar, MapPin, TrendingUp,
  PieChart, Activity, GitCommit
} from 'lucide-react';
import { useGitHubData } from '../hooks/useGitHubData';
import { fetchUserDetails, fetchUserRepos, fetchUserLanguages } from '../services/githubApi';

const HEATMAP = Array.from({ length: 52 }, () =>
  Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
);

const heatColor = (level) => ['bg-[var(--color-border-light)]', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700'][level] || 'bg-[var(--color-border-light)]';

const DonutChart = ({ data }) => {
  if (!data?.length) return null;
  const total = data.reduce((a, b) => a + b.value, 0);
  let angle = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
      {data.map((item, i) => {
        const slice = (item.value / total) * 360;
        const rad1 = (angle * Math.PI) / 180;
        const rad2 = ((angle + slice) * Math.PI) / 180;
        const x1 = 50 + 40 * Math.cos(rad1), y1 = 50 + 40 * Math.sin(rad1);
        const x2 = 50 + 40 * Math.cos(rad2), y2 = 50 + 40 * Math.sin(rad2);
        const d = `M50 50 L${x1} ${y1} A40 40 0 ${slice > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
        angle += slice;
        return <path key={i} d={d} fill={item.color || '#4f46e5'} />;
      })}
      <circle cx="50" cy="50" r="24" fill="var(--color-bg-card)" />
    </svg>
  );
};

// ─── Analytics View ───
function AnalyticsView({ user, repos, languages }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" /> Growth
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--color-text-secondary)]">Repos Growth</span>
                <span className="text-emerald-600 font-medium">+{user.public_repos * 2}%</span>
              </div>
              <div className="h-2 bg-[var(--color-border-light)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--color-text-secondary)]">Followers Growth</span>
                <span className="text-emerald-600 font-medium">+{user.followers * 5}%</span>
              </div>
              <div className="h-2 bg-[var(--color-border-light)] rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--color-primary)]" /> Activity
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-[var(--color-bg-elevated)] rounded-xl">
              <p className="text-2xl font-bold text-[var(--color-text)]">{user.public_repos}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Public Repos</p>
            </div>
            <div className="text-center p-3 bg-[var(--color-bg-elevated)] rounded-xl">
              <p className="text-2xl font-bold text-[var(--color-text)]">{user.public_gists || 0}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Gists</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[var(--color-primary)]" /> Top Language
          </h3>
          {languages?.[0] ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: languages[0].color }}>
                {languages[0].name[0]}
              </div>
              <p className="font-bold text-[var(--color-text)]">{languages[0].name}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{languages[0].value}% of repos</p>
            </div>
          ) : (
            <p className="text-[var(--color-text-muted)] text-center">No data</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Repositories View ───
function RepositoriesView({ repos }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h3 className="text-lg font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-[var(--color-primary)]" /> All Repositories
        </h3>
        <div className="space-y-3">
          {(repos || []).map((repo) => (
            <motion.div
              key={repo.id}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer"
              onClick={() => window.open(repo.html_url, '_blank')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text)]">{repo.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{repo.language || 'No language'} • {repo.visibility || 'public'}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" /> {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" /> {repo.forks_count}
                </span>
                <span className="text-xs">{new Date(repo.updated_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Insights View ───
function InsightsView({ user, repos }) {
  const totalStars = (repos || []).reduce((sum, r) => sum + r.stargazers_count, 0);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Repository Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[var(--color-bg-elevated)] rounded-xl">
              <span className="text-[var(--color-text-secondary)]">Total Stars Earned</span>
              <span className="text-2xl font-bold text-yellow-500">{totalStars.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--color-bg-elevated)] rounded-xl">
              <span className="text-[var(--color-text-secondary)]">Total Forks</span>
              <span className="text-2xl font-bold text-blue-500">
                {(repos || []).reduce((sum, r) => sum + r.forks_count, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Account Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Member Since</span>
              <span className="text-[var(--color-text)]">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Last Updated</span>
              <span className="text-[var(--color-text)]">{new Date(user.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Profile</span>
              <a href={user.html_url} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
                github.com/{user.login}
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DeveloperPage() {
  const { username } = useParams();
  const targetUser = username || 'torvalds';
  const statsRef = useRef(null);
  
  // 🎯 الحالة الجديدة: أي tab نشيط
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user, loading: userLoading, error: userError } = useGitHubData(() => fetchUserDetails(targetUser), [targetUser]);
  const { data: repos, loading: reposLoading } = useGitHubData(() => fetchUserRepos(targetUser, 100), [targetUser]);
  const { data: languages, loading: langLoading } = useGitHubData(() => fetchUserLanguages(targetUser), [targetUser]);

  useEffect(() => {
    if (!userLoading) {
      const ctx = gsap.context(() => {
        gsap.from('.stat-card', { y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' });
        gsap.from('.heatmap-cell', { scale: 0, opacity: 0, duration: 0.3, stagger: 0.003, ease: 'back.out(2)', delay: 0.4 });
      }, statsRef);
      return () => ctx.revert();
    }
  }, [userLoading]);

  if (userLoading) return <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">Loading profile...</div>;
  if (userError) return <div className="min-h-screen flex items-center justify-center text-red-500">{userError}</div>;

  // 🎯 محتوى الـ tab النشيط
  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsView user={user} repos={repos} languages={languages} />;
      case 'repositories':
        return <RepositoriesView repos={repos} />;
      case 'insights':
        return <InsightsView user={user} repos={repos} />;
      case 'overview':
      default:
        return null; // Overview بيظهر تحت
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <motion.aside initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] sticky top-24">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-xl flex items-center justify-center">
                  <Layout className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="font-bold text-[var(--color-text)] text-sm">Dev Dashboard</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Analytics Engine</p>
                </div>
              </div>

              <nav className="space-y-1 mb-8">
                {[
                  { id: 'overview', icon: Layout, label: 'Overview' },
                  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                  { id: 'repositories', icon: Code2, label: 'Repositories' },
                  { id: 'insights', icon: Zap, label: 'Insights' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl p-5 text-white mb-6">
                <p className="text-sm font-medium mb-1">DevPulse Pro</p>
                <p className="text-xs text-indigo-200 mb-4">Unlock premium metrics and CI/CD logs.</p>
                <button className="w-full py-2 bg-white/20 backdrop-blur rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                  Upgrade Now
                </button>
              </div>

              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] transition-colors">
                  <HelpCircle className="w-4 h-4" /> Help Center
                </button>
                <Link to="/login" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Link>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6" ref={statsRef}>
            
            {/* Header - يظهر دائماً */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white"
              style={{ background: 'var(--gradient-hero)' }}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-400 rounded-full blur-[80px]" />
              </div>
              <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6">
                <motion.img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.login || 'User')}&background=3b82f6&color=fff&size=256`}
                  alt={user.login}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/20"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-1">{user.name || user.login}</h1>
                  <p className="text-indigo-200 flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4" /> {user.bio || 'Open Source Contributor'}
                  </p>
                  {user.location && (
                    <p className="text-indigo-300 text-xs mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {user.location}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <a
                    href={user.email ? `mailto:${user.email}` : user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-white/10 backdrop-blur rounded-xl text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </a>
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-[var(--color-primary)] rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" /> Follow
                  </a>
                </div>
              </div>
            </motion.div>

            {/* 🎯 المحتوى المتغير حسب الـ tab */}
            <AnimatePresence mode="wait">
              {activeTab !== 'overview' && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overview Content - يظهر بس لما يكون overview نشيط */}
            {activeTab === 'overview' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Stars', value: (repos || []).reduce((s, r) => s + r.stargazers_count, 0).toLocaleString(), change: '+12%', icon: Star, color: 'text-yellow-400' },
                    { label: 'Public Repos', value: user.public_repos, change: '+5.2%', icon: GitFork, color: 'text-blue-400' },
                    { label: 'Followers', value: user.followers, change: '+24', icon: GitPullRequest, color: 'text-emerald-400' },
                    { label: 'Following', value: user.following, change: 'Total', icon: Flame, color: 'text-orange-400' }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      className="stat-card bg-[var(--color-bg-card)] rounded-2xl p-5 border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
                      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.change}</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Heatmap & Languages */}
                <div className="grid md:grid-cols-5 gap-6">
                  <motion.div
                    className="md:col-span-3 bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-[var(--color-text)]">Contribution Heatmap</h3>
                      <select className="text-sm border border-[var(--color-border)] rounded-lg px-3 py-1.5 bg-[var(--color-bg-elevated)] text-[var(--color-text)]">
                        <option>Last 12 Months</option>
                      </select>
                    </div>
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-[3px] min-w-max">
                        {HEATMAP.map((week, wIdx) => (
                          <div key={wIdx} className="flex flex-col gap-[3px]">
                            {week.map((day, dIdx) => (
                              <motion.div
                                key={dIdx}
                                className={`heatmap-cell w-[10px] h-[10px] rounded-sm ${heatColor(day)}`}
                                whileHover={{ scale: 1.8 }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 text-xs text-[var(--color-text-muted)]">
                      <span>Contributions are estimated</span>
                      <div className="flex items-center gap-2">
                        <span>Less</span>
                        <div className="flex gap-[3px]">{[0,1,2,3,4].map(i => <div key={i} className={`w-[10px] h-[10px] rounded-sm ${heatColor(i)}`} />)}</div>
                        <span>More</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="md:col-span-2 bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-6">Language Distribution</h3>
                    {langLoading ? (
                      <div className="animate-pulse h-32 bg-[var(--color-bg-elevated)] rounded-xl" />
                    ) : (
                      <>
                        <div className="flex justify-center mb-6">
                          <DonutChart data={languages} />
                        </div>
                        <div className="space-y-3">
                          {(languages || []).map((lang, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color || '#4f46e5' }} />
                                <span className="text-sm text-[var(--color-text-secondary)]">{lang.name}</span>
                              </div>
                              <span className="text-sm font-bold text-[var(--color-text)]">{lang.value}%</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>

                {/* Recent Repos */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[var(--color-text)]">Recent Repositories</h3>
                    <button 
                      onClick={() => setActiveTab('repositories')}
                      className="text-sm text-[var(--color-primary)] font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {reposLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="animate-pulse h-16 bg-[var(--color-bg-elevated)] rounded-xl" />)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(repos || []).slice(0, 5).map((repo) => (
                        <motion.div
                          key={repo.id}
                          whileHover={{ x: 4 }}
                          className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer"
                          onClick={() => window.open(repo.html_url, '_blank')}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center">
                              <Code2 className="w-5 h-5 text-[var(--color-primary)]" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">{repo.name}</p>
                              <p className="text-xs text-[var(--color-text-muted)]">{repo.language || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4" /> {repo.stargazers_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" /> {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}