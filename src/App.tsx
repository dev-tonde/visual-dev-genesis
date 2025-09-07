import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HelmetProvider } from 'react-helmet-async';
import CommandPalette from "@/components/CommandPalette";
import MouseFollower from "@/components/MouseFollower";
import ErrorBoundary from "@/components/ErrorBoundary";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import AccessibilityEnhancer from "@/components/AccessibilityEnhancer";
import Analytics from "@/components/Analytics";
import { useAnalytics } from "@/hooks/useAnalytics";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <CommandPalette />
            <MouseFollower />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
