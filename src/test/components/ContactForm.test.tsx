import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Variants } from 'framer-motion';
import ContactForm from '@/components/ContactForm';

const { toastMock } = vi.hoisted(() => ({
  toastMock: vi.fn(),
}));

const fetchMock = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

vi.mock('framer-motion', () => {
  const motionOnlyProps = new Set([
    'animate',
    'exit',
    'initial',
    'transition',
    'variants',
    'viewport',
    'whileHover',
    'whileInView',
    'whileTap',
  ]);

  interface MockMotionProps {
    children?: ReactNode;
    [key: string]: unknown;
  }

  const motion = new Proxy(
    {},
    {
      get:
        (_target, tag) =>
        ({ children, ...props }: MockMotionProps) => {
          const domProps = Object.fromEntries(
            Object.entries(props).filter(([key]) => !motionOnlyProps.has(key))
          );

          return createElement(tag as string, domProps, children);
        },
    }
  );

  return { motion };
});

const jsonResponse = (ok: boolean, payload: unknown) => ({
  ok,
  json: async () => payload,
});

const fillAndSubmitForm = async () => {
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: 'Tonderai Matanga' },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'tonde@example.com' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^message$/i }), {
    target: { value: 'I would like help building a product website.' },
  });

  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
};

describe('ContactForm', () => {
  const variants: Variants = {};

  beforeEach(() => {
    fetchMock.mockReset();
    toastMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits successfully and resets the form', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(true, {
        success: true,
        message:
          'Thank you for your message! It was received successfully, and I will review it soon.',
        submissionId: 'submission-123',
        emailDelivery: {
          notification: 'sent',
          confirmation: 'skipped',
        },
      })
    );

    render(<ContactForm variants={variants} />);

    await fillAndSubmitForm();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as [string, { method: string; body: string }];
      expect(url).toBe('/api/contact');
      expect(init.method).toBe('POST');
      const body = JSON.parse(init.body) as Record<string, unknown>;
      expect(body).toMatchObject({
        name: 'Tonderai Matanga',
        email: 'tonde@example.com',
        message: 'I would like help building a product website.',
        website: '', // honeypot stays empty for real users
      });
      expect(typeof body.startedAt).toBe('number'); // timing evidence included
    });

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Message sent successfully!',
          description:
            'Thank you for your message! It was received successfully, and I will review it soon.',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByRole('textbox', { name: /^message$/i })).toHaveValue('');
    });
  });

  it('shows the API validation error without falling back to a duplicate generic toast', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(false, {
        error: 'VALIDATION_ERROR',
        message: 'Please check your input and try again.',
        details: ['Message must be between 10 and 1000 characters.'],
      })
    );

    render(<ContactForm variants={variants} />);

    await fillAndSubmitForm();

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledTimes(1);
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Invalid input',
          description: 'Message must be between 10 and 1000 characters.',
          variant: 'destructive',
        })
      );
    });
  });

  it('shows a generic error toast when the request throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      fetchMock.mockRejectedValue(new Error('Network request failed'));

      render(<ContactForm variants={variants} />);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(toastMock).toHaveBeenCalledTimes(1);
        expect(toastMock).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to send message',
            description: 'Please try again or contact me directly via email.',
            variant: 'destructive',
          })
        );
      });

      expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
