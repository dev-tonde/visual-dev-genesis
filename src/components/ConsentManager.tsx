import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Shield, Analytics, Cookie } from "lucide-react";

interface ConsentManagerProps {
  onConsentChange: (consent: ConsentPreferences) => void;
}

export interface ConsentPreferences {
  analytics: boolean;
  performance: boolean;
  functional: boolean;
}

const CONSENT_KEY = 'user-consent-preferences';
const CONSENT_SHOWN_KEY = 'consent-banner-shown';

export const ConsentManager = ({ onConsentChange }: ConsentManagerProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: false,
    performance: true, // Essential for functionality
    functional: true   // Essential for functionality
  });

  useEffect(() => {
    // Check if consent has been given before
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    const bannerShown = localStorage.getItem(CONSENT_SHOWN_KEY);
    
    if (savedConsent) {
      const consent = JSON.parse(savedConsent);
      setPreferences(consent);
      onConsentChange(consent);
    } else if (!bannerShown) {
      setShowBanner(true);
    }
  }, [onConsentChange]);

  const saveConsent = (newPreferences: ConsentPreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newPreferences));
    localStorage.setItem(CONSENT_SHOWN_KEY, 'true');
    setPreferences(newPreferences);
    onConsentChange(newPreferences);
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      analytics: true,
      performance: true,
      functional: true
    });
  };

  const handleAcceptEssential = () => {
    saveConsent({
      analytics: false,
      performance: true,
      functional: true
    });
  };

  const handleCustomize = () => {
    // You could open a detailed preferences modal here
    // For now, we'll just accept essential
    handleAcceptEssential();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border border-border/50 bg-background/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Privacy Preferences</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAcceptEssential}
              className="h-6 w-6 p-0"
              aria-label="Close banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            We respect your privacy. Choose which data we can collect to improve your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Cookie className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Essential</div>
                <div className="text-xs text-muted-foreground">Required for basic functionality</div>
              </div>
              <div className="ml-auto text-xs text-green-600 font-medium">Always Active</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Analytics className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-xs text-muted-foreground">Help us improve by sharing usage data</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleAcceptAll} className="w-full">
              Accept All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAcceptEssential} className="flex-1">
                Essential Only
              </Button>
              <Button variant="ghost" onClick={handleCustomize} className="flex-1">
                Customize
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentManager;