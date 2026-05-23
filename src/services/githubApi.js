const BASE_URL = 'https://api.github.com';
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const defaultHeaders = {
  'Accept': 'application/vnd.github.v3+json'
};
const headers = {
  ...defaultHeaders,
  ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {})
};
let tokenAuthorized = true;

async function get(url) {
  const requestHeaders = tokenAuthorized && TOKEN ? headers : defaultHeaders;
  const res = await fetch(url, { headers: requestHeaders });
  if (res.ok) {
    return res.json();
  }

  if (res.status === 401 && tokenAuthorized && TOKEN) {
    tokenAuthorized = false;
    console.warn('GitHub token unauthorized, disabling token and retrying without it:', url);
    const fallbackRes = await fetch(url, { headers: defaultHeaders });
    if (fallbackRes.ok) {
      return fallbackRes.json();
    }
  }

  const errorText = await res.text();
  const message = `GitHub API failed: ${res.status} ${res.statusText}${errorText ? ' - ' + errorText : ''}`;
  throw new Error(message);
}

// ─── Trending Repositories ───
export async function fetchTrendingRepos(perPage = 9) {
  const data = await get(
    `${BASE_URL}/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=${perPage}`
  );
  return data?.items || [];
}

// ─── Search Repositories ───
export async function searchRepositories(query = '', perPage = 100) {
  const term = query.trim();
  if (!term) return [];

  const normalized = term.toLowerCase();
  const data = await get(
    `${BASE_URL}/search/repositories?q=${encodeURIComponent(`${term} in:name,description`)}&sort=stars&order=desc&per_page=${perPage}`
  );

  const items = data?.items || [];
  if (items.length > 0) return items;

  const fallback = await get(
    `${BASE_URL}/search/repositories?q=${encodeURIComponent(term)}&sort=stars&order=desc&per_page=${perPage}`
  );
  return (fallback?.items || []).filter(repo => {
    const name = repo.name?.toLowerCase() || '';
    const fullName = repo.full_name?.toLowerCase() || '';
    const description = (repo.description || '').toLowerCase();
    return (
      name.includes(normalized) ||
      fullName.includes(normalized) ||
      description.includes(normalized)
    );
  });
}

export async function searchDevelopers(query = '', perPage = 100) {
  const term = query.trim();
  if (!term) return [];

  const normalized = term.toLowerCase();
  const perPageLimit = Math.min(perPage, 30);

  const loginData = await get(
    `${BASE_URL}/search/users?q=${encodeURIComponent(`${term} in:login`)}&per_page=${perPageLimit}`
  );
  const plainData = await get(
    `${BASE_URL}/search/users?q=${encodeURIComponent(term)}+type:user&per_page=${perPageLimit}`
  );

  const candidates = [
    ...(loginData?.items || []),
    ...(plainData?.items || [])
  ];

  const uniqueUsers = Array.from(
    new Map(candidates.map((user) => [user.login, user])).values()
  );

  return uniqueUsers.filter((user) => {
    const login = (user.login || '').toLowerCase();
    const name = (user.name || '').toLowerCase();
    return login.includes(normalized) || name.includes(normalized);
  }).slice(0, perPageLimit);
}

// ─── User Details ───
export async function fetchUserDetails(username) {
  return get(`${BASE_URL}/users/${username}`);
}

// ─── User Repos ───
export async function fetchUserRepos(username, perPage = 100) {
  return get(`${BASE_URL}/users/${username}/repos?sort=updated&per_page=${perPage}`);
}

// ─── User Languages ───
export async function fetchUserLanguages(username) {
  const repos = await fetchUserRepos(username, 100);
  if (!repos?.length) return [];
  
  const stats = {};
  let total = 0;
  
  repos.forEach(repo => {
    if (repo.language) {
      stats[repo.language] = (stats[repo.language] || 0) + 1;
      total++;
    }
  });
  
  return Object.entries(stats)
    .map(([name, count]) => ({ 
      name, 
      value: Math.round((count / total) * 100),
      color: getLanguageColor(name)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function getLanguageColor(lang) {
  const colors = {
    JavaScript: '#f7df1e',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Vue: '#41b883',
    React: '#61dafb',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Dockerfile: '#384d54'
  };
  return colors[lang] || '#4f46e5';
}