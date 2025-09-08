import { lazy } from 'react';

// Lazy load the Certifications component for code splitting
export const CertificationsLazy = lazy(() => import('./Certifications'));