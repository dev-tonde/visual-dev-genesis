// GitHub API integration for fetching repositories
export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  created_at: string;
  fork: boolean;
}

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME || 'dev-tonde';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

export const fetchGitHubRepos = async (retryCount = 0): Promise<GitHubRepo[]> => {
  const maxRetries = 3;
  const baseDelay = 1000;
  
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`, {
      headers,
    });

    if (response.status === 403) {
      // Rate limit exceeded
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : new Date(Date.now() + 3600000);
      const waitTime = Math.max(0, resetDate.getTime() - Date.now());
      
      console.warn(`GitHub API rate limit exceeded. Reset at ${resetDate.toLocaleTimeString()}`);
      
      if (retryCount < maxRetries && waitTime < 300000) { // Don't wait more than 5 minutes
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000)));
        return fetchGitHubRepos(retryCount + 1);
      }
      
      throw new Error(`GitHub API rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}`);
    }

    if (response.status >= 500 && retryCount < maxRetries) {
      // Server error, retry with exponential backoff
      const delay = baseDelay * Math.pow(2, retryCount);
      console.warn(`GitHub API server error (${response.status}). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchGitHubRepos(retryCount + 1);
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repos: GitHubRepo[] = await response.json();
    
    // Filter out forks and sort by stars/recency
    return repos
      .filter(repo => !repo.fork)
      .sort((a, b) => {
        // Prioritize pinned repos (those with topics including 'featured' or 'portfolio')
        const aIsFeatured = a.topics?.includes('featured') || a.topics?.includes('portfolio');
        const bIsFeatured = b.topics?.includes('featured') || b.topics?.includes('portfolio');
        
        if (aIsFeatured && !bIsFeatured) return -1;
        if (!aIsFeatured && bIsFeatured) return 1;
        
        // Then sort by stars and recency
        return (b.stargazers_count * 2 + new Date(b.updated_at).getTime()) - 
               (a.stargazers_count * 2 + new Date(a.updated_at).getTime());
      });
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error);
    
    if (retryCount < maxRetries && error instanceof Error && error.message.includes('fetch')) {
      // Network error, retry with exponential backoff
      const delay = baseDelay * Math.pow(2, retryCount);
      console.warn(`Network error. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchGitHubRepos(retryCount + 1);
    }
    
    return [];
  }
};

export const getLanguageColor = (language: string | null): string => {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#239120',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Vue: '#4FC08D',
    React: '#61DAFB',
    Angular: '#DD0031',
    Svelte: '#ff3e00',
  };
  
  return colors[language || ''] || '#6b7280';
};