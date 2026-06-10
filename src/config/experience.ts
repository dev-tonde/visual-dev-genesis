// Professional experience, kept in sync with the CV (single source of truth).
export interface ExperienceEntry {
  company: string;
  title: string;
  period: string;
  summary: string;
  highlights: readonly string[];
}

export const EXPERIENCE: readonly ExperienceEntry[] = [
  {
    company: 'Retail Capital (TymeBank)',
    title: 'Senior Front-End Developer',
    period: 'Jul 2021 – Present',
    summary:
      'Customer-facing web apps with React, Next.js, and TypeScript (SSR/SSG), integrated with REST and GraphQL services.',
    highlights: [
      '40%+ faster load times via code-splitting, lazy loading, and Lighthouse-driven optimisation',
      'Accessible, responsive UI (WCAG 2.1) with cross-browser testing',
      'Reusable component libraries (Tailwind CSS/Storybook) and automated tests (Jest/RTL/Cypress) on GitHub Actions CI',
    ],
  },
  {
    company: 'Bet.co.za',
    title: 'Front-End Developer',
    period: 'Sep 2019 – Jun 2021',
    summary:
      'Revamped key betting platform surfaces with React and TypeScript, integrating with internal services via REST APIs.',
    highlights: [
      'Built and maintained the custom WordPress theme for central.bet.co.za (PHP templates, hooks/filters, custom post types)',
      'Optimised blog templates for SEO and page speed with responsive, mobile-first layouts',
      'Analytics instrumentation and A/B testing support under high traffic',
    ],
  },
  {
    company: 'Webaholics Digital Agency',
    title: 'Front-End Developer Intern',
    period: 'Sep 2017 – Aug 2019',
    summary:
      'Delivered pixel-perfect, responsive marketing sites and landing pages for clients across industries.',
    highlights: [
      'Built and customised WordPress themes/plugins with PHP, JavaScript, CSS/SASS, and Bootstrap',
      'Contributed to Drupal 8/9 theming with Twig templates and theme preprocessing',
      'Git-based workflows, translating wireframes into functional, performant interfaces',
    ],
  },
] as const;
