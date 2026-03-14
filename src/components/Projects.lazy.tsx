import { lazy } from 'react';

// Lazy load the Projects component for code splitting
export const ProjectsLazy = lazy(() => import('./Projects'));
