import { useEffect } from 'react';
import { useAnalytics as useSupabaseAnalytics } from '@/hooks/useAnalytics';

// Enhanced analytics with performance tracking
export const useEnhancedAnalytics = () => {
  const { trackEvent } = useSupabaseAnalytics();

  const trackPerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      trackEvent('performance', {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
      });
    }
  };

  const trackError = (error: Error) => {
    trackEvent('error', {
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };

  const trackInteraction = (element: string, action: string) => {
    trackEvent('interaction', {
      element,
      action,
      timestamp: Date.now(),
    });
  };

  return { trackPerformance, trackError, trackInteraction };
};

const Analytics = () => {
  const { trackPerformance, trackError } = useEnhancedAnalytics();

  useEffect(() => {
    // Track performance metrics after page load
    window.addEventListener('load', () => {
      setTimeout(trackPerformance, 100);
    });

    // Track unhandled errors
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message));
    };

    // Track unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('load', trackPerformance);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [trackPerformance, trackError]);

  return null;
};

export default Analytics;