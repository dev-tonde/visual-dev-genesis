import { describe, expect, it } from 'vitest';
import {
  sanitizeEmailInput,
  sanitizeMultilineForSubmission,
  sanitizePhoneInput,
  sanitizeSingleLineForSubmission,
} from '@/lib/sanitize';

describe('sanitize helpers', () => {
  it('normalizes single-line input before submission', () => {
    expect(sanitizeSingleLineForSubmission('  Jane \u0007  Doe \n ')).toBe('Jane Doe');
  });

  it('normalizes multiline input before submission', () => {
    expect(
      sanitizeMultilineForSubmission(' \r\nHello\u0007   there\r\n\r\n\r\nWorld  '),
    ).toBe('Hello there\n\nWorld');
  });

  it('canonicalizes email and phone values', () => {
    expect(sanitizeEmailInput('  Hello.User@Example.COM \n')).toBe('hello.user@example.com');
    expect(sanitizePhoneInput('+27 (0)81abc 432\t1220')).toBe('+27 (0)81 432 1220');
  });
});
