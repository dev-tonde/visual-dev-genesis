import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { ConsentPreferences } from '@/components/ConsentManager';

const CONSENT_KEY = 'user-consent-preferences';
type EventData = Record<string, unknown>;
type WindowWithDoNotTrack = Window & typeof globalThis & { doNotTrack?: string };

// Simple analytics hook for tracking page views with consent and DNT respect
export const useAnalytics = () => {
  const location = useLocation();
  const [hasConsent, setHasConsent] = useState(false);
  const [isDNTEnabled, setIsDNTEnabled] = useState(false);

  useEffect(() => {
    // Check Do Not Track setting
    const windowDoNotTrack = (window as WindowWithDoNotTrack).doNotTrack;
    const dntEnabled =
      navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes' || windowDoNotTrack === '1';
    setIsDNTEnabled(dntEnabled);

    if (dntEnabled) {
      if (import.meta.env.DEV) {
        console.debug('Analytics disabled: Do Not Track is enabled');
      }
      return;
    }

    const checkConsent = () => {
      const savedConsent = localStorage.getItem(CONSENT_KEY);
      if (savedConsent) {
        const consent: ConsentPreferences = JSON.parse(savedConsent);
        setHasConsent(consent.analytics);
      }
    };

    checkConsent();
    // Listen for consent changes
    window.addEventListener('storage', checkConsent);
    return () => window.removeEventListener('storage', checkConsent);
  }, []);

  useEffect(() => {
    const trackPageView = async () => {
      // Respect DNT and user consent
      if (isDNTEnabled || !hasConsent) return;

      try {
        // Generate a simple session ID
        const sessionId =
          sessionStorage.getItem('session_id') ||
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
          user_agent: navigator.userAgent,
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
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        if (import.meta.env.DEV) {
          console.debug('Analytics tracking failed:', error);
        }
      }
    };

    // Track after a small delay to avoid blocking initial render
    const timer = setTimeout(trackPageView, 100);
    return () => clearTimeout(timer);
  }, [location, hasConsent, isDNTEnabled]);

  // Function to track custom events with retry logic
  const trackEvent = async (eventName: string, eventData?: EventData, retryCount = 0) => {
    // Respect DNT and user consent
    if (isDNTEnabled || !hasConsent) return;

    const maxRetries = 2;

    try {
      const sessionId =
        sessionStorage.getItem('session_id') || crypto.randomUUID?.() || 'anonymous';

      const { error } = await supabase.from('user_events').insert({
        event_name: eventName,
        page_path: location.pathname,
        session_id: sessionId,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug('Event tracking failed:', error);
      }

      // Retry with exponential backoff for network errors
      if (
        retryCount < maxRetries &&
        error instanceof Error &&
        (error.message.includes('network') || error.message.includes('fetch'))
      ) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => trackEvent(eventName, eventData, retryCount + 1), delay);
      }
    }
  };

  return { trackEvent };
};
