import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Variants } from 'framer-motion';
import ContactForm from '@/components/ContactForm';

const { invokeMock, toastMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
  toastMock: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

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
      get: (_target, tag) =>
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
    invokeMock.mockReset();
    toastMock.mockReset();
  });

  it('submits successfully and resets the form', async () => {
    invokeMock.mockResolvedValue({
      data: {
        success: true,
        message: 'Thank you for your message! It was received successfully, and I will review it soon.',
        submissionId: 'submission-123',
        emailDelivery: {
          notification: 'sent',
          confirmation: 'sent',
        },
      },
      error: null,
    });

    render(<ContactForm variants={variants} />);

    await fillAndSubmitForm();

    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalledWith('send-contact-email', {
        body: {
          name: 'Tonderai Matanga',
          email: 'tonde@example.com',
          message: 'I would like help building a product website.',
        },
      });
    });

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Message sent successfully!',
        description: 'Thank you for your message! It was received successfully, and I will review it soon.',
      }));
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByRole('textbox', { name: /^message$/i })).toHaveValue('');
    });
  });

  it('shows the function validation error without falling back to a duplicate generic toast', async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: {
        message: JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'Please check your input and try again.',
          details: ['Message must be between 10 and 1000 characters.'],
        }),
      },
    });

    render(<ContactForm variants={variants} />);

    await fillAndSubmitForm();

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledTimes(1);
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Invalid input',
        description: 'Message must be between 10 and 1000 characters.',
        variant: 'destructive',
      }));
    });
  });

  it('shows a generic error toast when the edge function call throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      invokeMock.mockRejectedValue(new Error('Network request failed'));

      render(<ContactForm variants={variants} />);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(toastMock).toHaveBeenCalledTimes(1);
        expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Failed to send message',
          description: 'Please try again or contact me directly via email.',
          variant: 'destructive',
        }));
      });

      expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
