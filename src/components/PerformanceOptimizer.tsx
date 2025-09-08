import { useEffect } from 'react';

// Performance optimization utilities
export const usePerformanceOptimizer = () => {
  useEffect(() => {
    // Critical resource hints - only for essential services
    const hints = [
      { rel: 'dns-prefetch', href: '//api.github.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }
    ];
    
    hints.forEach(hint => {
      const existingLink = document.querySelector(`link[href="${hint.href}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
        document.head.appendChild(link);
      }
    });

    // Optimize images loading
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy-image');
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Prefetch critical routes
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed, continue without it
      });
    }

    return () => {
      imageObserver.disconnect();
    };
  }, []);
};

const PerformanceOptimizer = () => {
  usePerformanceOptimizer();
  return null;
};

export default PerformanceOptimizer;