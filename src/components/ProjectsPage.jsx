import { motion } from 'framer-motion';
import { Star, GitFork, ExternalLink, Clock } from 'lucide-react';
import { useGitHubData } from '../hooks/useGitHubData';
import { fetchTrendingRepos } from '../services/githubApi';

function formatStars(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
}

export default function ProjectsPage() {
  const { data: repos, loading, error } = useGitHubData(() => fetchTrendingRepos(12), []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">Trending Projects</h1>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Discover the fastest growing repositories across the developer ecosystem. Updated in real-time from GitHub.
          </p>
        </motion.div>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse h-64 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]" />)}
          </div>
        )}

        {error && <div className="text-red-500 text-center py-10">{error}</div>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(repos || []).map((project, idx) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, boxShadow: 'var(--shadow-glow)' }}
              className="group bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={project.owner?.avatar_url} alt={project.owner?.login} className="w-10 h-10 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                      {project.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                        {project.language || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <a href={project.html_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-[var(--color-border-light)] rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)]" />
                </a>
              </div>

              <p className="text-sm text-[var(--color-text-secondary)] mb-4 flex-1 line-clamp-3">
                {project.description || 'No description available.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {formatStars(project.stargazers_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" /> {formatStars(project.forks_count)}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" /> {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}