import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '@/pages/NotFound';

vi.mock('framer-motion', () => {
  const motionOnlyProps = new Set(['animate', 'initial', 'transition']);

  interface MockMotionProps {
    children?: ReactNode;
    [key: string]: unknown;
  }

  const motion = new Proxy(
    {},
    {
      get: (_target, tag) =>
        ({ children, ...props }: MockMotionProps) => {
          const domProps = Object.fromEntries(
            Object.entries(props).filter(([key]) => !motionOnlyProps.has(key))
          );

          return createElement(tag as string, domProps, children);
        },
    }
  );

  return {
    motion,
    useReducedMotion: () => false,
  };
});

describe('NotFound page', () => {
  it('renders the primary recovery actions', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/missing-route']}>
          <NotFound />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(
      screen.getByRole('heading', { name: 'This route does not exist anymore.' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view case studies/i })).toBeInTheDocument();
    expect(screen.getByText('/missing-route')).toBeInTheDocument();
  });
});
