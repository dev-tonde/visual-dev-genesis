import { useEffect } from 'react';

// Performance optimization utilities
export const usePerformanceOptimizer = () => {
  useEffect(() => {
    // Preload critical fonts
    const linkPreload = document.createElement('link');
    linkPreload.rel = 'preload';
    linkPreload.as = 'font';
    linkPreload.type = 'font/woff2';
    linkPreload.crossOrigin = 'anonymous';
    document.head.appendChild(linkPreload);

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