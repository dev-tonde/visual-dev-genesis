import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LIVE_REGION_ID = 'route-change-announcer';

const AccessibilityEnhancer = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const existingRegion = document.getElementById(LIVE_REGION_ID);
    if (existingRegion) {
      return;
    }

    const liveRegion = document.createElement('div');
    liveRegion.id = LIVE_REGION_ID;
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);

    return () => {
      liveRegion.remove();
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const liveRegion = document.getElementById(LIVE_REGION_ID);
    if (!liveRegion) {
      return;
    }

    const announcement = document.title || `Navigated to ${location.pathname}`;
    liveRegion.textContent = announcement;

    const timeoutId = window.setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.hash, location.pathname, location.search]);

  return null;
};

export default AccessibilityEnhancer;
