import { useEffect } from 'react';

const SEOEnhancements = () => {
  useEffect(() => {
    // Ensure proper document structure
    const ensureDocumentStructure = () => {
      // Add skip to content link if not exists
      if (!document.querySelector('#skip-to-content')) {
        const skipLink = document.createElement('a');
        skipLink.id = 'skip-to-content';
        skipLink.href = '#main-content';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    };

    ensureDocumentStructure();
  }, []);

  return null;
};

export default SEOEnhancements;
