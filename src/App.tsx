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
import LoadingSpinner from '@/components/LoadingSpinner';
import Index from './pages/Index';

// Lazy load route components not needed on initial load
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Games = lazy(() => import('./pages/Games'));

const AppContent = () => (
  <>
    <AccessibilityEnhancer />
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/games" element={<Games />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
);

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <SafeThemeProvider>
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <BrowserRouter>
            <CommandPaletteProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </CommandPaletteProvider>
          </BrowserRouter>
        </TooltipProvider>
      </SafeThemeProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
