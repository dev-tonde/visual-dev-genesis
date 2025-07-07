import { useState, useEffect } from 'react';
import { fetchGitHubRepos, GitHubRepo } from '@/lib/github';

export const useGitHubRepos = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepos = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedRepos = await fetchGitHubRepos();
        setRepos(fetchedRepos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      } finally {
        setLoading(false);
      }
    };

    loadRepos();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRepos = await fetchGitHubRepos();
      setRepos(fetchedRepos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  return { repos, loading, error, refetch };
};