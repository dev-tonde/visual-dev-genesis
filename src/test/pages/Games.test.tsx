import { createElement, forwardRef, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Games from '@/pages/Games';
import { PROFILE } from '@/config/profile';

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

  return { motion };
});

vi.mock('@/components/Navigation', () => ({
  default: () => <nav data-testid="navigation" />,
}));

vi.mock('@/components/SEOHead', () => ({
  default: () => null,
}));

describe('Games page', () => {
  it('positions the games as engineering demos with technical context and source links', () => {
    render(<Games />);

    expect(screen.getByRole('heading', { name: /interactive engineering demos/i })).toBeInTheDocument();
    expect(screen.getByText(/This page exists to show front-end engineering judgment/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /featured systems demos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /compact logic demos/i })).toBeInTheDocument();
    expect(screen.queryByText(/Game Zone/i)).not.toBeInTheDocument();

    expect(screen.getByText(/Rotation and collision checks have to stay predictable/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /view source for tetris/i })
    ).toHaveAttribute('href', `${PROFILE.portfolioRepoUrl}/blob/main/src/components/games/TetrisGame.tsx`);
  });
});
