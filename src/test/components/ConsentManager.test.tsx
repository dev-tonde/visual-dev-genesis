import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ConsentManager from '@/components/ConsentManager';

const CONSENT_KEY = 'user-consent-preferences';
const CONSENT_SHOWN_KEY = 'consent-banner-shown';

describe('ConsentManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('restores saved consent without crashing', async () => {
    const onConsentChange = vi.fn();

    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        analytics: true,
        performance: true,
        functional: true,
      }),
    );

    render(<ConsentManager onConsentChange={onConsentChange} />);

    await waitFor(() =>
      expect(onConsentChange).toHaveBeenCalledWith({
        analytics: true,
        performance: true,
        functional: true,
      }),
    );

    expect(screen.queryByText('Privacy Preferences')).not.toBeInTheDocument();
  });

  it('recovers from malformed saved consent by showing the banner', async () => {
    const onConsentChange = vi.fn();

    localStorage.setItem(CONSENT_KEY, '{invalid json');
    localStorage.removeItem(CONSENT_SHOWN_KEY);

    render(<ConsentManager onConsentChange={onConsentChange} />);

    expect(await screen.findByText('Privacy Preferences')).toBeInTheDocument();
    expect(onConsentChange).not.toHaveBeenCalled();
    expect(localStorage.getItem(CONSENT_KEY)).toBeNull();
  });
});
