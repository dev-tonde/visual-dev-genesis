import { useCallback, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const HOME_PATHNAME = '/';

const getScrollBehavior = (): ScrollBehavior => (
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
);

export const getSectionHref = (sectionId: string) => `/#${encodeURIComponent(sectionId)}`;

export const scrollSectionIntoView = (sectionId: string) => {
  const section = document.getElementById(sectionId);

  if (!section) {
    return false;
  }

  section.scrollIntoView({
    behavior: getScrollBehavior(),
    block: 'start',
  });

  return true;
};

export const useSectionNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback((sectionId: string) => {
    const nextHash = `#${encodeURIComponent(sectionId)}`;
    const isHomeRoute = location.pathname === HOME_PATHNAME;

    if (isHomeRoute && location.hash === nextHash) {
      scrollSectionIntoView(sectionId);
      return;
    }

    navigate({
      pathname: HOME_PATHNAME,
      hash: nextHash,
    });
  }, [location.hash, location.pathname, navigate]);
};

export const useSectionHashScroll = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.pathname !== HOME_PATHNAME || location.hash === '') {
      return;
    }

    // Run after the home route commits so the section element exists before scrolling.
    scrollSectionIntoView(decodeURIComponent(location.hash.slice(1)));
  }, [location.hash, location.pathname]);
};
