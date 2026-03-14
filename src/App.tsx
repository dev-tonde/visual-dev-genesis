import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SafeThemeProvider } from '@/components/SafeThemeProvider';
import { HelmetProvider } from 'react-helmet-async';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import ErrorBoundary from '@/components/ErrorBoundary';
import AccessibilityEnhancer from '@/components/AccessibilityEnhancer';
import Analytics from '@/components/Analytics';
import ConsentManager, { ConsentPreferences } from '@/components/ConsentManager';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AuthProvider } from '@/components/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import Index from './pages/Index';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load route components not needed on initial load
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Games = lazy(() => import('./pages/Games'));
const AccountAccessPage = lazy(() => import('./pages/Auth'));
const OperationsWorkspacePage = lazy(() => import('./pages/AdminHub'));
const ContactInboxPage = lazy(() => import('./pages/AdminContacts'));
const AccountWorkspacePage = lazy(() => import('./pages/Profile'));

const AppContent = () => {
  useAnalytics();

  const handleConsentChange = (_consent: ConsentPreferences) => {
    // Store consent in localStorage (already handled by ConsentManager)
    // You can also send this to your analytics service if needed
  };

  return (
    <>
      <AccessibilityEnhancer />
      <Analytics />
      <ConsentManager onConsentChange={handleConsentChange} />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/games" element={<Games />} />
          <Route path="/auth" element={<AccountAccessPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AccountWorkspacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <OperationsWorkspacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contacts"
            element={
              <ProtectedRoute>
                <ContactInboxPage />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <SafeThemeProvider>
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <BrowserRouter>
            <AuthProvider>
              <CommandPaletteProvider>
                <Toaster />
                <Sonner />
                <AppContent />
              </CommandPaletteProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </SafeThemeProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
