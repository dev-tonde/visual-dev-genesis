import { describe, expect, it } from 'vitest';
import {
  contactFormSchema,
  isContactFunctionSuccessPayload,
  parseContactFunctionError,
} from '@/lib/contact';

describe('contact helpers', () => {
  it('parses a JSON-encoded edge-function error payload', () => {
    const payload = parseContactFunctionError({
      message: JSON.stringify({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests.',
        retryAfter: 60000,
      }),
    });

    expect(payload).toEqual({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests.',
      retryAfter: 60000,
    });
  });

  it('falls back to a generic error payload for plain-text errors', () => {
    const payload = parseContactFunctionError({
      message: 'Function returned a 500 response',
    });

    expect(payload).toEqual({
      error: 'CONTACT_SEND_FAILED',
      message: 'Function returned a 500 response',
    });
  });

  it('recognizes a successful contact submission payload', () => {
    expect(
      isContactFunctionSuccessPayload({
        success: true,
        message: 'Saved',
        submissionId: 'submission-123',
        emailDelivery: {
          notification: 'sent',
          confirmation: 'failed',
        },
      })
    ).toBe(true);
  });

  it('sanitizes contact form values before validation output', () => {
    expect(
      contactFormSchema.parse({
        name: '  Jane \n Doe  ',
        email: ' HELLO@Example.com ',
        message: '  Need help with a rebuild.\u0007  ',
      })
    ).toEqual({
      name: 'Jane Doe',
      email: 'hello@example.com',
      message: 'Need help with a rebuild.',
    });
  });
});
