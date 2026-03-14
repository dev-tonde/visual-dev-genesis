import { createElement, forwardRef, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Projects from '@/components/Projects';
import type { GitHubRepo, GitHubRepoFetchError } from '@/lib/github';

const { useGitHubReposMock, refetchMock } = vi.hoisted(() => ({
  useGitHubReposMock: vi.fn(),
  refetchMock: vi.fn(),
}));

vi.mock('@/hooks/useGitHubRepos', () => ({
  useGitHubRepos: useGitHubReposMock,
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => [vi.fn(), true],
}));

vi.mock('framer-motion', () => {
  const motionOnlyProps = new Set([
    'animate',
    'exit',
    'initial',
    'transition',
    'variants',
    'viewport',
    'whileHover',
    'whileInView',
    'whileTap',
  ]);

  interface MockMotionProps {
    children?: ReactNode;
    [key: string]: unknown;
  }

  const motion = new Proxy(
    {},
    {
      get: (_target, tag) =>
        forwardRef<HTMLElement, MockMotionProps>(({ children, ...props }, ref) => {
          const domProps = Object.fromEntries(
            Object.entries(props).filter(([key]) => !motionOnlyProps.has(key))
          );

          return createElement(tag as string, { ...domProps, ref }, children);
        }),
    }
  );

  return {
    AnimatePresence: ({ children }: { children?: ReactNode }) => children,
    motion,
  };
});

const buildRepo = (overrides: Partial<GitHubRepo> = {}): GitHubRepo => ({
  id: 1,
  name: 'real-portfolio',
  description: 'A verified repo from GitHub.',
  html_url: 'https://github.com/dev-tonde/real-portfolio',
  homepage: 'https://portfolio.example.com',
  language: 'TypeScript',
  stargazers_count: 5,
  forks_count: 2,
  topics: ['react', 'tailwind'],
  updated_at: '2026-03-10T10:00:00.000Z',
  created_at: '2026-01-10T10:00:00.000Z',
  fork: false,
  ...overrides,
});

const buildError = (
  message: string,
  kind: GitHubRepoFetchError['kind'] = 'api'
): GitHubRepoFetchError =>
  Object.assign(new Error(message), {
    kind,
    name: 'GitHubRepoFetchError',
  }) as GitHubRepoFetchError;

const mockHookState = (overrides: Record<string, unknown> = {}) => {
  useGitHubReposMock.mockReturnValue({
    repos: [],
    status: 'ready',
    loading: false,
    error: null,
    refetch: refetchMock,
    profileUrl: 'https://github.com/dev-tonde',
    username: 'dev-tonde',
    ...overrides,
  });
};

describe('Projects', () => {
  beforeEach(() => {
    useGitHubReposMock.mockReset();
    refetchMock.mockReset();
  });

  it('shows curated case studies with honest metric placeholders alongside the live feed', () => {
    mockHookState({
      status: 'error',
      error: buildError('GitHub API error: 503 Service Unavailable'),
    });

    render(<Projects />);

    expect(screen.getByRole('heading', { name: /selected case studies/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /visual dev genesis/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Add verified metric/i).length).toBeGreaterThan(1);
    expect(
      screen.getByText(
        /Add recruiter reply rate, interview conversion, or qualified inbound lead count/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /live repository feed/i })).toBeInTheDocument();
  });

  it('shows a loading state while live GitHub repositories are being fetched', () => {
    mockHookState({
      status: 'loading',
      loading: true,
    });

    render(<Projects />);

    expect(
      screen.getByText(
        /Curated case studies are available below while the live GitHub repository feed loads/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/GitHub projects are temporarily unavailable/i)
    ).not.toBeInTheDocument();
  });

  it('shows an honest unavailable state without invented fallback projects', () => {
    mockHookState({
      status: 'error',
      error: buildError('GitHub API error: 503 Service Unavailable'),
    });

    render(<Projects />);

    expect(screen.getByText(/GitHub projects are temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view github profile/i })).toHaveAttribute(
      'href',
      'https://github.com/dev-tonde'
    );
    expect(screen.queryByText('E-Commerce Platform')).not.toBeInTheDocument();
  });

  it('shows code-only cards when no verified public demo link exists', () => {
    mockHookState({
      repos: [
        buildRepo({
          description: null,
          homepage: null,
        }),
      ],
    });

    render(<Projects />);

    expect(
      screen.getByText(/No public description provided in the repository/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Some repositories only include verified code links/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No verified public demo link is listed for this project/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /live demo/i })).not.toBeInTheDocument();
  });

  it('distinguishes no matching projects from an empty GitHub profile', () => {
    mockHookState({
      repos: [buildRepo()],
    });

    render(<Projects />);

    fireEvent.change(screen.getByPlaceholderText(/search projects/i), {
      target: { value: 'rust' },
    });

    expect(screen.getByText(/No projects match the current filters/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });
});
