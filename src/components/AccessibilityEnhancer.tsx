import { useEffect } from 'react';

// Accessibility enhancements for better screen reader support and WCAG compliance
const AccessibilityEnhancer = () => {
  useEffect(() => {
    // Add skip links for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50';
    skipLink.setAttribute('aria-label', 'Skip navigation and go to main content');
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Enhance focus management
    const addFocusStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        *:focus-visible {
          outline: 2px solid hsl(var(--primary)) !important;
          outline-offset: 2px !important;
          border-radius: 4px !important;
        }
        
        /* Enhanced button focus */
        button:focus-visible, 
        [role="button"]:focus-visible {
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3) !important;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          * {
            border-color: ButtonText !important;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Screen reader only content */
        .sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }
        
        .sr-only:focus {
          position: static !important;
          width: auto !important;
          height: auto !important;
          padding: inherit !important;
          margin: inherit !important;
          overflow: visible !important;
          clip: auto !important;
          white-space: inherit !important;
        }
      `;
      document.head.appendChild(style);
    };

    addFocusStyles();

    // Add ARIA live region for dynamic content announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);

    // Add landmark roles to improve navigation
    const addLandmarks = () => {
      // Main content
      const main = document.querySelector('main');
      if (main && !main.getAttribute('role')) {
        main.setAttribute('role', 'main');
        main.setAttribute('aria-label', 'Main content');
        main.id = 'main-content';
      }

      // Navigation
      const nav = document.querySelector('nav');
      if (nav && !nav.getAttribute('role')) {
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Main navigation');
      }

      // Footer
      const footer = document.querySelector('footer');
      if (footer && !footer.getAttribute('role')) {
        footer.setAttribute('role', 'contentinfo');
        footer.setAttribute('aria-label', 'Site footer');
      }
    };

    // Wait for DOM to be ready
    setTimeout(addLandmarks, 100);

    // Enhance keyboard navigation
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      // Escape key to close modals/dropdowns
      if (e.key === 'Escape') {
        const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
        if (openModal) {
          const closeButton = openModal.querySelector('[aria-label*="close"], [aria-label*="Close"]');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardNavigation);

    // Announce route changes for screen readers
    const announceRouteChange = () => {
      const liveRegion = document.getElementById('live-region');
      if (liveRegion) {
        const pageTitle = document.title;
        liveRegion.textContent = `Navigated to ${pageTitle}`;
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', announceRouteChange);

    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
      window.removeEventListener('popstate', announceRouteChange);
    };
  }, []);

  return null;
};

export default AccessibilityEnhancer;