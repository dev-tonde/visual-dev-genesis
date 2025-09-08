import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Hero from '@/components/Hero';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('Hero Component', () => {
  it('renders without crashing', () => {
    render(<Hero />);
    expect(document.body).toBeTruthy();
  });

  it('has proper semantic structure', () => {
    render(<Hero />);
    const heroSection = document.querySelector('section');
    expect(heroSection).toBeTruthy();
  });

  it('contains navigation elements', () => {
    render(<Hero />);
    const links = document.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });
});