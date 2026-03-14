import { z } from 'zod';
import {
  sanitizeEmailInput,
  sanitizeMultilineForSubmission,
  sanitizeSingleLineForSubmission,
} from '@/lib/sanitize';

export const CONTACT_NAME_MIN_LENGTH = 2;
export const CONTACT_NAME_MAX_LENGTH = 50;
export const CONTACT_MESSAGE_MIN_LENGTH = 10;
export const CONTACT_MESSAGE_MAX_LENGTH = 1000;

export const CONTACT_SUBMISSION_STATUSES = ['pending', 'read', 'responded'] as const;

export type ContactSubmissionStatus = (typeof CONTACT_SUBMISSION_STATUSES)[number];

const sanitizeString = <T extends z.ZodTypeAny>(
  sanitizer: (value: string) => string,
  schema: T,
) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? sanitizer(value) : value),
    schema,
  );

export const contactFormSchema = z.object({
  name: sanitizeString(
    sanitizeSingleLineForSubmission,
    z
      .string()
      .min(CONTACT_NAME_MIN_LENGTH, `Name must be at least ${CONTACT_NAME_MIN_LENGTH} characters`)
      .max(CONTACT_NAME_MAX_LENGTH, `Name must be less than ${CONTACT_NAME_MAX_LENGTH} characters`),
  ),
  email: sanitizeString(
    sanitizeEmailInput,
    z.string().email('Please enter a valid email address'),
  ),
  message: sanitizeString(
    sanitizeMultilineForSubmission,
    z
      .string()
      .min(CONTACT_MESSAGE_MIN_LENGTH, `Message must be at least ${CONTACT_MESSAGE_MIN_LENGTH} characters`)
      .max(CONTACT_MESSAGE_MAX_LENGTH, `Message must be less than ${CONTACT_MESSAGE_MAX_LENGTH} characters`),
  ),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export type ContactFunctionErrorCode =
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'CONTACT_SEND_FAILED';

export interface ContactFunctionErrorPayload {
  error: ContactFunctionErrorCode;
  message: string;
  retryAfter?: number;
  details?: string[];
}

export interface ContactFunctionSuccessPayload {
  success: true;
  message: string;
  submissionId: string;
  emailDelivery: {
    notification: 'sent' | 'failed' | 'skipped';
    confirmation: 'sent' | 'failed' | 'skipped';
  };
}

const DEFAULT_CONTACT_FUNCTION_ERROR: ContactFunctionErrorPayload = {
  error: 'CONTACT_SEND_FAILED',
  message: 'Please try again or contact me directly via email.',
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isContactFunctionErrorPayload = (
  value: unknown,
): value is ContactFunctionErrorPayload => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.error === 'string' &&
    typeof candidate.message === 'string' &&
    (candidate.retryAfter === undefined || typeof candidate.retryAfter === 'number') &&
    (candidate.details === undefined || isStringArray(candidate.details))
  );
};

export const isContactFunctionSuccessPayload = (
  value: unknown,
): value is ContactFunctionSuccessPayload => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (
    candidate.success !== true ||
    typeof candidate.message !== 'string' ||
    typeof candidate.submissionId !== 'string'
  ) {
    return false;
  }

  const emailDelivery = candidate.emailDelivery;
  if (typeof emailDelivery !== 'object' || emailDelivery === null) {
    return false;
  }

  const delivery = emailDelivery as Record<string, unknown>;
  const statuses = new Set(['sent', 'failed', 'skipped']);

  return (
    typeof delivery.notification === 'string' &&
    statuses.has(delivery.notification) &&
    typeof delivery.confirmation === 'string' &&
    statuses.has(delivery.confirmation)
  );
};

export const parseContactFunctionError = (error: unknown): ContactFunctionErrorPayload => {
  if (isContactFunctionErrorPayload(error)) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const candidate = error as Record<string, unknown>;
    const message = candidate.message;

    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message);
        if (isContactFunctionErrorPayload(parsed)) {
          return parsed;
        }
      } catch {
        return {
          ...DEFAULT_CONTACT_FUNCTION_ERROR,
          message,
        };
      }

      return {
        ...DEFAULT_CONTACT_FUNCTION_ERROR,
        message,
      };
    }
  }

  return DEFAULT_CONTACT_FUNCTION_ERROR;
};
