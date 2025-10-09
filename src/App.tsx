import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SafeThemeProvider } from "@/components/SafeThemeProvider";
import { HelmetProvider } from 'react-helmet-async';
import CommandPalette from "@/components/CommandPalette";
import ErrorBoundary from "@/components/ErrorBoundary";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import AccessibilityEnhancer from "@/components/AccessibilityEnhancer";
import Analytics from "@/components/Analytics";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Games from "./pages/Games";
import Auth from "./pages/Auth";
import TestimonialForm from "@/components/TestimonialForm";
import AdminTestimonials from "./pages/AdminTestimonials";

const queryClient = new QueryClient();

const AppContent = () => {
  useAnalytics();
  return (
    <>
      <PerformanceOptimizer />
      <PerformanceMonitor />
      <AccessibilityEnhancer />
      <Analytics />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/games" element={<Games />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/submit-testimonial" element={<TestimonialForm />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
