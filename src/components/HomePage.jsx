import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { 
  Star, ChevronRight, Users, 
  TrendingUp, Activity, BarChart3, Zap, GitBranch, Terminal
} from 'lucide-react';
import { useGitHubData } from '../hooks/useGitHubData';
import { fetchTrendingRepos } from '../services/githubApi';

const INSIGHTS = [
  { label: 'Trending Language', value: 'TypeScript', change: '+12%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Active PRs Today', value: '4,821', change: 'Active', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'New Contributors', value: '1,240', change: '+8%', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' }
];

function formatStars(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
}

export default function HomePage() {
  const heroRef = useRef(null);
  
  const { data: repos, loading, error } = useGitHubData(() => fetchTrendingRepos(7), []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-word', { y: 60, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
      gsap.from('.hero-sub', { y: 30, opacity: 0, duration: 0.8, delay: 0.6 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const featured = repos?.[0];
  const trending = repos?.slice(1, 4) || [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section ref={heroRef} className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--color-primary)] rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            {'Discover the True Pulse of the Developer Community'.split(' ').map((word, i) => (
              <span key={i} className="hero-word inline-block mr-3">
                {word === 'True' || word === 'Pulse' ? (
                  <span className="text-[var(--color-primary)] italic">{word}</span>
                ) : (
                  <span className="text-[var(--color-text)]">{word}</span>
                )}
              </span>
            ))}
          </h1>
          <p className="hero-sub text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto">
            The ultimate dashboard for open-source insights, real-time repository analytics, and networking with top-tier contributors.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              to="/search"
              className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-primary)] text-white rounded-full text-base font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Go to Search
            </Link>
          </div>
        </div>
      </section>

      {/* باقي الصفحة زي ما هي */}
      {/* Featured Project */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        {loading && (
          <div className="animate-pulse bg-[var(--color-bg-card)] rounded-3xl h-96 border border-[var(--color-border)]" />
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {featured && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="bg-[var(--color-bg-card)] rounded-3xl p-8 md:p-10 border border-[var(--color-border)] shadow-[var(--shadow-lg)] grid md:grid-cols-2 gap-10 items-center"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[var(--color-success-bg)] text-[var(--color-success)] text-xs font-bold rounded-full uppercase tracking-wide">
                  Featured
                </span>
                <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {formatStars(featured.stargazers_count)}
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-4">{featured.full_name}</h2>
              <p className="text-[var(--color-text-secondary)] mb-6 text-lg leading-relaxed">{featured.description || 'No description available.'}</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {featured.language && (
                  <span className="px-4 py-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm rounded-full font-medium">{featured.language}</span>
                )}
                <span className="px-4 py-1.5 bg-[var(--color-border-light)] text-[var(--color-text-secondary)] text-sm rounded-full font-medium">Open Source</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <a 
                  href={featured.html_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium flex items-center gap-2 hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Explore Repository <ChevronRight className="w-4 h-4" />
                </a>
                <button className="px-6 py-3 border border-[var(--color-border)] rounded-xl font-medium hover:bg-[var(--color-border-light)] transition-colors text-[var(--color-text)]">
                  Quick Demo
                </button>
              </div>
            </div>
            <motion.div 
              className="relative rounded-2xl overflow-hidden bg-[var(--color-bg-elevated)] h-80 flex items-center justify-center"
              whileHover={{ scale: 1.03 }} 
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img 
                src={featured.owner?.avatar_url} 
                alt={featured.name}
                className="w-32 h-32 rounded-2xl shadow-2xl" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Trending Projects */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">Trending This Week</h2>
            <p className="text-[var(--color-text-secondary)]">Fastest growing repositories across the ecosystem.</p>
          </div>
          <Link to="/projects" className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="animate-pulse h-64 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]" />)}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {trending.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ y: -8, boxShadow: 'var(--shadow-glow)' }}
              className="group bg-[var(--color-bg-card)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
            >
              <div className="h-48 bg-[var(--color-bg-elevated)] flex items-center justify-center relative overflow-hidden">
                <img 
                  src={project.owner?.avatar_url} 
                  alt={project.name} 
                  className="w-20 h-20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-[var(--color-text)] truncate">{project.full_name}</h3>
                  <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] shrink-0">
                    <Star className="w-4 h-4" /> {formatStars(project.stargazers_count)}
                  </div>
                </div>
                <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">{project.description || 'No description'}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.language && (
                    <span className="px-2 py-1 bg-[var(--color-border-light)] text-[var(--color-text-secondary)] text-xs rounded-md font-medium">{project.language}</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-[var(--color-bg-card)]" />
                    ))}
                  </div>
                  <a 
                    href={project.html_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    View Project <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Insights & CTA */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {INSIGHTS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
            >
              <div className="flex items-center justify-between mb-4">
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <span className={`px-2 py-1 ${item.bg} ${item.color} text-xs rounded-full font-medium`}>{item.change}</span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">{item.label}</p>
              <p className="text-3xl font-bold text-[var(--color-text)]">{item.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-[var(--color-bg-card)] rounded-3xl p-12 text-center border border-[var(--color-border)]"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">Ready to join the elite?</h2>
          <p className="text-[var(--color-text-secondary)] mb-8 max-w-xl mx-auto">
            Join 500,000+ developers who are building the next generation of software with better data.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-[var(--shadow-glow)]">
              Get Started for Free
            </Link>
            <button className="px-8 py-3 border border-[var(--color-border)] bg-[var(--color-bg-elevated)] rounded-xl font-medium hover:bg-[var(--color-border-light)] transition-colors text-[var(--color-text)]">
              Book a Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: BarChart3, title: 'Deep Insights', desc: 'ML-powered code quality analysis and contributor velocity tracking.' },
            { icon: Zap, title: 'Real-time Pulse', desc: 'Live stream of community activity across 50+ languages and frameworks.' },
            { icon: GitBranch, title: 'GraphQL API', desc: 'Query everything. Every developer, project, and commit exposed.' },
            { icon: Terminal, title: 'DevFlow CLI', desc: 'Command-line interface for managing multi-cloud deployments.' }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
            >
              <div className="w-12 h-12 bg-[var(--color-primary-light)] rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="font-bold text-[var(--color-text)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}