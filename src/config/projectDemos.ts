/**
 * Curated project demo links layered on top of live GitHub repo data.
 *
 * Keys should match the repo name in lowercase. Only add real public URLs here.
 */
export const PROJECT_DEMO_URLS: Record<string, string> = {};

export type ProjectLinkSource = 'curated_demo' | 'repository_homepage';

export interface ProjectDemoLink {
  url: string;
  source: ProjectLinkSource;
  label: string;
}

const getConfiguredDemoUrl = (projectName: string, demoUrls: Record<string, string>) => {
  const normalizedProjectName = projectName.trim().toLowerCase();
  const configuredEntry = Object.entries(demoUrls).find(([name]) => name === normalizedProjectName);
  return configuredEntry?.[1] ?? null;
};

export const resolveProjectDemoLink = (
  projectName: string,
  githubHomepage?: string | null,
  demoUrls: Record<string, string> = PROJECT_DEMO_URLS
): ProjectDemoLink | null => {
  const configuredUrl = getConfiguredDemoUrl(projectName, demoUrls);
  if (configuredUrl) {
    return {
      url: configuredUrl,
      source: 'curated_demo',
      label: 'Curated demo',
    };
  }

  if (githubHomepage?.trim()) {
    return {
      url: githubHomepage,
      source: 'repository_homepage',
      label: 'Repo homepage',
    };
  }

  return null;
};
