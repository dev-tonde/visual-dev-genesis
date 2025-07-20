import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Simple analytics hook for tracking page views
export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Generate a simple session ID
        const sessionId = sessionStorage.getItem('session_id') || 
          crypto.randomUUID?.() || 
          Math.random().toString(36).substring(2, 15);
        
        if (!sessionStorage.getItem('session_id')) {
          sessionStorage.setItem('session_id', sessionId);
        }

        // Track page view
        await supabase.from('page_views').insert({
          page_path: location.pathname + location.search,
          session_id: sessionId,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent
        });

        // Track custom user event
        await supabase.from('user_events').insert({
          event_name: 'page_view',
          page_path: location.pathname,
          session_id: sessionId,
          event_data: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug('Analytics tracking failed:', error);
      }
    };

    // Track after a small delay to avoid blocking initial render
    const timer = setTimeout(trackPageView, 100);
    return () => clearTimeout(timer);
  }, [location]);

  // Function to track custom events
  const trackEvent = async (eventName: string, eventData?: Record<string, any>) => {
    try {
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID?.() || 'anonymous';
      
      await supabase.from('user_events').insert({
        event_name: eventName,
        page_path: location.pathname,
        session_id: sessionId,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.debug('Event tracking failed:', error);
    }
  };

  return { trackEvent };
};