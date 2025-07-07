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

const GITHUB_USERNAME = 'your-username'; // TODO: Replace with your GitHub username
const GITHUB_TOKEN = ''; // Optional: Add your GitHub token for higher rate limits

export const fetchGitHubRepos = async (): Promise<GitHubRepo[]> => {
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

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
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