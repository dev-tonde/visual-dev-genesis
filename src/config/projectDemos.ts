/**
 * Manual Demo URL Configuration
 * 
 * To add demo URLs for your projects:
 * 1. Find the project name from your GitHub repos
 * 2. Add an entry below with the project name as the key
 * 3. Provide the live demo URL as the value
 * 
 * Example:
 * 'my-project-name': 'https://my-project.vercel.app'
 */

export const PROJECT_DEMO_URLS: Record<string, string> = {
  // Add your project demo URLs here
  // Format: 'project-name': 'https://demo-url.com'
  
  // Example entries (replace these with your actual projects):
  // 'portfolio-website': 'https://portfolio.example.com',
  // 'e-commerce-app': 'https://shop.example.com',
  // 'task-manager': 'https://tasks.example.com',
};

/**
 * Get demo URL for a project
 * Falls back to GitHub homepage or a default URL if not configured
 */
export const getDemoUrl = (projectName: string, githubHomepage?: string | null): string => {
  // Check if manually configured
  const configuredUrl = PROJECT_DEMO_URLS[projectName];
  if (configuredUrl) {
    return configuredUrl;
  }
  
  // Fallback to GitHub homepage if available
  if (githubHomepage) {
    return githubHomepage;
  }
  
  // Default fallback
  return `https://${projectName.toLowerCase()}.dev-tonde.dev`;
};
