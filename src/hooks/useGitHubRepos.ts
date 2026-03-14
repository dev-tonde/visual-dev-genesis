import { useCallback, useEffect, useState } from 'react';
import {
  fetchGitHubRepos,
  getGitHubProfileUrl,
  GITHUB_USERNAME,
  GitHubRepo,
  GitHubRepoFetchError,
} from '@/lib/github';

export type GitHubReposStatus = 'loading' | 'ready' | 'empty' | 'error';

export const useGitHubRepos = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [status, setStatus] = useState<GitHubReposStatus>('loading');
  const [error, setError] = useState<GitHubRepoFetchError | null>(null);

  const loadRepos = useCallback(async () => {
    try {
      // Keep fetch failure distinct from an empty repo list so the UI can stay honest.
      setStatus('loading');
      setError(null);
      const fetchedRepos = await fetchGitHubRepos();
      setRepos(fetchedRepos);
      setStatus(fetchedRepos.length > 0 ? 'ready' : 'empty');
    } catch (err) {
      setRepos([]);
      setStatus('error');
      setError(
        err instanceof GitHubRepoFetchError
          ? err
          : new GitHubRepoFetchError({
              kind: 'api',
              message: err instanceof Error ? err.message : 'Failed to fetch repositories',
            })
      );
    }
  }, []);

  useEffect(() => {
    void loadRepos();
  }, [loadRepos]);

  return {
    repos,
    status,
    loading: status === 'loading',
    error,
    refetch: loadRepos,
    profileUrl: getGitHubProfileUrl(),
    username: GITHUB_USERNAME,
  };
};
