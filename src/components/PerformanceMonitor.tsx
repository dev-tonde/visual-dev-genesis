import { useEffect } from 'react';

// Performance monitoring and optimization for Lighthouse scores
const PerformanceMonitor = () => {
  useEffect(() => {
    // Critical Resource Hints
    const addResourceHints = () => {
      const head = document.head;
      
      // Preload critical fonts
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
      fontPreload.as = 'style';
      fontPreload.crossOrigin = 'anonymous';
      head.appendChild(fontPreload);
      
      // Preconnect to external domains
      const preconnects = [
        'https://api.github.com',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com'
      ];
      
      preconnects.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        head.appendChild(link);
      });
    };

    // Optimize images with intersection observer
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // Add critical CSS inline
    const addCriticalCSS = () => {
      const criticalCSS = `
        .fade-in-fast { opacity: 0; animation: fadeIn 0.3s ease-in forwards; }
        @keyframes fadeIn { to { opacity: 1; } }
        .loading { opacity: 0.7; filter: blur(2px); }
        .loaded { opacity: 1; filter: none; transition: all 0.3s ease; }
      `;
      
      const style = document.createElement('style');
      style.textContent = criticalCSS;
      document.head.appendChild(style);
    };

    // Performance metrics tracking
    const trackPerformanceMetrics = () => {
      if ('PerformanceObserver' in window) {
        // Track Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Track First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            const fidEntry = entry as any;
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Track Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            const clsEntry = entry as any;
            if (!clsEntry.hadRecentInput) {
              clsValue += clsEntry.value;
              console.log('CLS:', clsValue);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Optimize third-party scripts
    const optimizeThirdPartyScripts = () => {
      // Defer non-critical scripts
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
          script.setAttribute('defer', '');
        }
      });
    };

    // Service Worker registration
    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        }).then(registration => {
          console.log('SW registered:', registration);
        }).catch(error => {
          console.log('SW registration failed:', error);
        });
      }
    };

    // Initialize optimizations
    addResourceHints();
    addCriticalCSS();
    optimizeImages();
    trackPerformanceMetrics();
    optimizeThirdPartyScripts();
    registerServiceWorker();

    // Optimize based on network conditions
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType === '4g') {
        // Preload additional resources for fast connections
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = '/assets/programmer-hero-bg.jpg';
        document.head.appendChild(link);
      }
    }

    // Cleanup observers on unmount
    return () => {
      // Cleanup would be handled by the observers themselves
    };
  }, []);

  return null;
};

export default PerformanceMonitor;