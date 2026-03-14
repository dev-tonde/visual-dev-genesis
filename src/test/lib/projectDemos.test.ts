import { describe, expect, it } from 'vitest';
import { resolveProjectDemoLink } from '@/config/projectDemos';

describe('resolveProjectDemoLink', () => {
  it('prefers intentional curated demo links over the repository homepage', () => {
    expect(
      resolveProjectDemoLink('portfolio-site', 'https://github-homepage.example.com', {
        'portfolio-site': 'https://curated-demo.example.com',
      })
    ).toEqual({
      label: 'Curated demo',
      source: 'curated_demo',
      url: 'https://curated-demo.example.com',
    });
  });

  it('falls back to the repository homepage when no curated demo link exists', () => {
    expect(resolveProjectDemoLink('portfolio-site', 'https://github-homepage.example.com')).toEqual({
      label: 'Repo homepage',
      source: 'repository_homepage',
      url: 'https://github-homepage.example.com',
    });
  });

  it('returns null when no verified public link exists', () => {
    expect(resolveProjectDemoLink('portfolio-site', null)).toBeNull();
  });
});
