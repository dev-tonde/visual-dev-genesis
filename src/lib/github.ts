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

export type GitHubRepoFetchErrorKind = 'api' | 'network' | 'rate_limit' | 'invalid_response';

interface GitHubRepoFetchErrorOptions {
  kind: GitHubRepoFetchErrorKind;
  message: string;
  status?: number;
  resetAt?: string;
}

export class GitHubRepoFetchError extends Error {
  kind: GitHubRepoFetchErrorKind;
  status?: number;
  resetAt?: string;

  constructor({ kind, message, status, resetAt }: GitHubRepoFetchErrorOptions) {
    super(message);
    this.name = 'GitHubRepoFetchError';
    this.kind = kind;
    this.status = status;
    this.resetAt = resetAt;
  }
}

export const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME || 'dev-tonde';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const MAX_RATE_LIMIT_WAIT_MS = 300000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRateLimitResetDate = (response: Response) => {
  const resetTime = response.headers.get('X-RateLimit-Reset');
  if (!resetTime) {
    return new Date(Date.now() + 3600000);
  }

  const parsedResetTime = Number.parseInt(resetTime, 10);
  return Number.isNaN(parsedResetTime)
    ? new Date(Date.now() + 3600000)
    : new Date(parsedResetTime * 1000);
};

const normalizeGitHubRepoError = (error: unknown) => {
  if (error instanceof GitHubRepoFetchError) {
    return error;
  }

  if (error instanceof TypeError) {
    return new GitHubRepoFetchError({
      kind: 'network',
      message: 'GitHub could not be reached. Please check the connection and try again.',
    });
  }

  if (error instanceof Error) {
    return new GitHubRepoFetchError({
      kind: 'api',
      message: error.message,
    });
  }

  return new GitHubRepoFetchError({
    kind: 'api',
    message: 'GitHub projects could not be loaded right now.',
  });
};

const sortGitHubRepos = (repos: GitHubRepo[]) =>
  repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => {
      const aIsFeatured = a.topics?.includes('featured') || a.topics?.includes('portfolio');
      const bIsFeatured = b.topics?.includes('featured') || b.topics?.includes('portfolio');

      if (aIsFeatured && !bIsFeatured) {
        return -1;
      }

      if (!aIsFeatured && bIsFeatured) {
        return 1;
      }

      return (
        b.stargazers_count * 2 +
        new Date(b.updated_at).getTime() -
        (a.stargazers_count * 2 + new Date(a.updated_at).getTime())
      );
    });

export const getGitHubProfileUrl = () => `https://github.com/${GITHUB_USERNAME}`;

export const fetchGitHubRepos = async (retryCount = 0): Promise<GitHubRepo[]> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new GitHubRepoFetchError({
        kind: 'network',
        message: 'GitHub is unavailable while the device is offline.',
      });
    }

    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(GITHUB_API_URL, { headers });

    if (response.status === 403) {
      const resetDate = getRateLimitResetDate(response);
      const waitTime = Math.max(0, resetDate.getTime() - Date.now());

      if (retryCount < MAX_RETRIES && waitTime < MAX_RATE_LIMIT_WAIT_MS) {
        console.warn(`GitHub API rate limit exceeded. Retrying after ${waitTime}ms.`);
        await sleep(Math.min(waitTime, 60000));
        return fetchGitHubRepos(retryCount + 1);
      }

      throw new GitHubRepoFetchError({
        kind: 'rate_limit',
        message: `GitHub API rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}.`,
        status: response.status,
        resetAt: resetDate.toISOString(),
      });
    }

    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
      console.warn(`GitHub API server error (${response.status}). Retrying in ${delay}ms.`);
      await sleep(delay);
      return fetchGitHubRepos(retryCount + 1);
    }

    if (!response.ok) {
      throw new GitHubRepoFetchError({
        kind: 'api',
        message: `GitHub API error: ${response.status} ${response.statusText}`,
        status: response.status,
      });
    }

    const payload: unknown = await response.json();

    if (!Array.isArray(payload)) {
      throw new GitHubRepoFetchError({
        kind: 'invalid_response',
        message: 'GitHub returned an unexpected response format.',
      });
    }

    return sortGitHubRepos(payload as GitHubRepo[]);
  } catch (error) {
    const normalizedError = normalizeGitHubRepoError(error);

    if (retryCount < MAX_RETRIES && normalizedError.kind === 'network') {
      const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
      console.warn(`GitHub network error. Retrying in ${delay}ms.`);
      await sleep(delay);
      return fetchGitHubRepos(retryCount + 1);
    }

    console.error('Failed to fetch GitHub repos', {
      kind: normalizedError.kind,
      message: normalizedError.message,
      resetAt: normalizedError.resetAt,
      status: normalizedError.status,
    });

    throw normalizedError;
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
