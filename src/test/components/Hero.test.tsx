import { createElement, type ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Hero from '@/components/Hero';

// Mock framer-motion to avoid animation issues in tests
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
      get:
        (_target, tag) =>
        ({ children, ...props }: MockMotionProps) => {
          const domProps = Object.fromEntries(
            Object.entries(props).filter(([key]) => !motionOnlyProps.has(key))
          );

          return createElement(tag as string, domProps, children);
        },
    }
  );

  return { motion };
});

describe('Hero Component', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  it('has proper semantic structure', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
    const heroSection = document.querySelector('section');
    expect(heroSection).toBeTruthy();
  });

  it('contains navigation elements', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
    const links = document.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });
});
