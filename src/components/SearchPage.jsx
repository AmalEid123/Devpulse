import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, MapPin, Star, GitFork, ChevronRight, 
  CheckCircle2, LayoutGrid, List, ChevronLeft
} from 'lucide-react';
import { useGitHubData } from '../hooks/useGitHubData';
import { searchDevelopers, searchRepositories } from '../services/githubApi';

const EXPERIENCE_LEVELS = ['Junior', 'Intermediate', 'Senior'];
const ITEMS_PER_PAGE = 30; // عدد العناصر بكل صفحة

function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlType = searchParams.get('type') || 'repositories';
  const urlPage = parseInt(searchParams.get('page')) || 1;
  
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [searchType, setSearchType] = useState(urlType);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [filters, setFilters] = useState({ experience: [], minRepos: 0, location: '' });
  const [viewMode, setViewMode] = useState('grid');

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() && searchQuery !== urlQuery) {
        setSearchParams({ q: searchQuery.trim(), type: searchType, page: '1' });
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync URL changes
  useEffect(() => {
    setSearchType(urlType);
    setSearchQuery(urlQuery);
    setCurrentPage(urlPage);
  }, [urlQuery, urlType, urlPage]);

  const { data: developers, loading: devLoading, error: devError } = useGitHubData(
    () => urlType === 'developers' ? searchDevelopers(urlQuery, 100) : Promise.resolve([]),
    [urlQuery, urlType]
  );

  const { data: repositories, loading: repoLoading, error: repoError } = useGitHubData(
    () => urlType === 'repositories' ? searchRepositories(urlQuery, 100) : Promise.resolve([]),
    [urlQuery, urlType]
  );

  const toggleExperience = (level) => {
    setFilters(prev => ({
      ...prev,
      experience: prev.experience.includes(level)
        ? prev.experience.filter(l => l !== level)
        : [...prev.experience, level]
    }));
  };

  const applyDeveloperFilters = (dev) => {
    const normalizedLocation = filters.location.trim().toLowerCase();
    const reposCount = typeof dev.public_repos === 'number' ? dev.public_repos : 0;

    const experienceMatch = filters.experience.length === 0 || filters.experience.some(level => {
      if (typeof dev.public_repos !== 'number') return true;
      if (level === 'Junior') return reposCount < 20;
      if (level === 'Intermediate') return reposCount >= 20 && reposCount <= 100;
      if (level === 'Senior') return reposCount > 100;
      return false;
    });

    const locationMatch = !normalizedLocation || (dev.location || '').toLowerCase().includes(normalizedLocation);
    const reposMatch = filters.minRepos === 0 || reposCount >= filters.minRepos;
    return experienceMatch && locationMatch && reposMatch;
  };

  const applyRepositoryFilters = (repo) => {
    const starsMatch = repo.stargazers_count >= filters.minRepos;
    return starsMatch;
  };

  const allResults = searchType === 'developers'
    ? (developers || []).filter(applyDeveloperFilters)
    : (repositories || []).filter(applyRepositoryFilters);
  
  // Pagination logic
  const totalItems = allResults.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = allResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const loading = searchType === 'developers' ? devLoading : repoLoading;
  const error = searchType === 'developers' ? devError : repoError;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSearchParams({ q: urlQuery, type: searchType, page: String(page) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setSearchParams({ q: searchQuery.trim(), type: searchType, page: '1' });
                setCurrentPage(1);
              }
            }}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="relative flex items-center bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-lg p-2">
              <Search className="w-5 h-5 text-[var(--color-text-muted)] ml-3" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchType === 'developers'
                  ? 'Search developers by username or name...'
                  : 'Search repositories by name or description...'
                }
                className="flex-1 px-4 py-3 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none text-sm md:text-base" 
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Toggle */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setSearchType('developers');
                setCurrentPage(1);
                setSearchParams({ q: urlQuery, type: 'developers', page: '1' });
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                searchType === 'developers' 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              Developers ({developers?.length || 0})
            </button>
            <button
              onClick={() => {
                setSearchType('repositories');
                setCurrentPage(1);
                setSearchParams({ q: urlQuery, type: 'repositories', page: '1' });
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                searchType === 'repositories' 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              Repositories ({repositories?.length || 0})
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          {searchType === 'developers' && (
            <motion.aside 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-[var(--color-text)]" />
                  <h3 className="font-bold text-[var(--color-text)]">Filters</h3>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Experience</p>
                  <div className="space-y-2">
                    {EXPERIENCE_LEVELS.map(level => (
                      <label key={level} className="flex items-center gap-3 cursor-pointer group">
                        <div 
                          onClick={() => toggleExperience(level)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            filters.experience.includes(level) ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-border)]'
                          }`}
                        >
                          {filters.experience.includes(level) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-[var(--color-text-secondary)]">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Location</p>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input 
                      type="text" 
                      placeholder="e.g. Remote, Egypt" 
                      value={filters.location}
                      onChange={e => setFilters({...filters, location: e.target.value})}
                      className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Min Repositories</p>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    step="10" 
                    value={filters.minRepos}
                    onChange={e => setFilters({...filters, minRepos: parseInt(e.target.value)})}
                    className="w-full mb-2" 
                  />
                  <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                    <span>0</span>
                    <span className="text-[var(--color-primary)] font-bold">{filters.minRepos}+</span>
                    <span>200</span>
                  </div>
                </div>

                <button 
                  onClick={() => setFilters({ experience: [], minRepos: 0, location: '' })}
                  className="w-full py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl text-sm font-medium hover:bg-[var(--color-border-light)] hover:text-[var(--color-text)] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.aside>
          )}

          {/* Results */}
          <div className={searchType === 'developers' ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-[var(--color-text)]">
                  {loading ? 'Searching...' : `Found ${totalItems} ${searchType}`}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {urlQuery ? `Results for "${urlQuery}"` : 'Showing top results from GitHub'}
                  {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
              {searchType === 'developers' && (
                <div className="flex items-center gap-3">
                  <div className="flex bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1">
                    <button 
                      onClick={() => setViewMode('grid')} 
                      className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')} 
                      className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className={searchType === 'developers' && viewMode === 'grid' ? 'grid md:grid-cols-2 gap-6' : 'space-y-4'}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse h-48 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]" />
                ))}
              </div>
            )}

            {error && <div className="text-red-500 text-center py-10">{error}</div>}

            {/* Developers Results */}
            {searchType === 'developers' && (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-6' : 'space-y-4'}>
                <AnimatePresence mode="popLayout">
                  {paginatedResults.map((dev, idx) => (
                    <motion.div 
                      key={dev.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }} 
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ y: -4, boxShadow: 'var(--shadow-glow)' }}
                      className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          <img 
                            src={dev.avatar_url} 
                            alt={dev.login} 
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--color-border)]" 
                          />
                          <div>
                            <h3 className="font-bold text-[var(--color-text)] text-lg">{dev.name || dev.login}</h3>
                            <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                              <MapPin className="w-3 h-3" /> {dev.location || 'Remote'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--color-text-muted)]">Followers</p>
                          <p className="text-2xl font-bold text-[var(--color-primary)]">{formatNumber(dev.followers)}</p>
                        </div>
                      </div>

                      <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">{dev.bio || 'Open source contributor.'}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(dev.company || dev.type) && (
                          <span className="px-3 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs rounded-full font-medium">
                            {dev.company || dev.type}
                          </span>
                        )}
                        {dev.blog && (
                          <span className="px-3 py-1 bg-[var(--color-border-light)] text-[var(--color-text-muted)] text-xs rounded-full font-medium">
                            {dev.blog}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                        <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {dev.public_repos ?? '—'} repos
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-4 h-4" /> {dev.following ?? '—'} following
                          </span>
                        </div>
                        <Link 
                          to={`/developer/${dev.login}`} 
                          className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          View Profile <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Repositories Results */}
            {searchType === 'repositories' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {paginatedResults.map((repo, idx) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -8, boxShadow: 'var(--shadow-glow)' }}
                      className="group bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={repo.owner?.avatar_url} 
                            alt={repo.owner?.login} 
                            className="w-10 h-10 rounded-xl object-cover" 
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate text-sm">
                              {repo.full_name}
                            </h3>
                            <p className="text-xs text-[var(--color-text-muted)]">{repo.language || 'N/A'}</p>
                          </div>
                        </div>
                        <a 
                          href={repo.html_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 hover:bg-[var(--color-border-light)] rounded-lg transition-colors"
                        >
                          <GitFork className="w-4 h-4 text-[var(--color-text-muted)]" />
                        </a>
                      </div>

                      <p className="text-sm text-[var(--color-text-secondary)] mb-4 flex-1 line-clamp-3">
                        {repo.description || 'No description available.'}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 
                            {formatNumber(repo.stargazers_count)}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-4 h-4" /> 
                            {formatNumber(repo.forks_count)}
                          </span>
                        </div>
                        <span className="text-xs">{new Date(repo.updated_at).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border-light)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border-light)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {!loading && paginatedResults.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-20"
              >
                <Search className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
                <p className="text-[var(--color-text-secondary)] text-lg">
                  No {searchType} found {urlQuery ? `for "${urlQuery}"` : ''}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}