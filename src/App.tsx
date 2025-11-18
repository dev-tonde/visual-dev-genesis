import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SafeThemeProvider } from "@/components/SafeThemeProvider";
import { HelmetProvider } from 'react-helmet-async';
import CommandPalette from "@/components/CommandPalette";
import ErrorBoundary from "@/components/ErrorBoundary";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import AccessibilityEnhancer from "@/components/AccessibilityEnhancer";
import Analytics from "@/components/Analytics";
import ConsentManager, { ConsentPreferences } from "@/components/ConsentManager";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AuthProvider } from "@/components/AuthProvider";
import LoadingSpinner from "@/components/LoadingSpinner";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load route components not needed on initial load
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Games = lazy(() => import("./pages/Games"));
const Auth = lazy(() => import("./pages/Auth"));
const SubmitTestimonial = lazy(() => import("./pages/SubmitTestimonial"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminHub = lazy(() => import("./pages/AdminHub"));
const AdminContacts = lazy(() => import("./pages/AdminContacts"));
const Profile = lazy(() => import("./pages/Profile"));

const AppContent = () => {
  useAnalytics();
  const [consentPreferences, setConsentPreferences] = useState<ConsentPreferences | null>(null);

  const handleConsentChange = (consent: ConsentPreferences) => {
    setConsentPreferences(consent);
    // Store consent in localStorage (already handled by ConsentManager)
    // You can also send this to your analytics service if needed
  };

  return (
    <>
      <PerformanceOptimizer />
      <PerformanceMonitor />
      <AccessibilityEnhancer />
      <Analytics />
      <ConsentManager onConsentChange={handleConsentChange} />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/games" element={<Games />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/submit-testimonial" element={<SubmitTestimonial />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminHub />
            </ProtectedRoute>
          } />
          <Route path="/admin/testimonials" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/contacts" element={
            <ProtectedRoute>
              <AdminContacts />
            </ProtectedRoute>
          } />
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
              <Toaster />
              <Sonner />
              <CommandPalette />
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </SafeThemeProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
