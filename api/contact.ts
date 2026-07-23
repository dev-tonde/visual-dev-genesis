/**
 * Vercel serverless function: receives contact-form submissions and forwards
 * them via the Resend API.
 *
 * Required environment variables (server-side only, never VITE_-prefixed):
 * - RESEND_API_KEY            Resend API key
 * - CONTACT_EMAIL             Destination inbox
 * - CONTACT_FROM              Verified sender (optional; defaults to Resend onboarding sender)
 *
 * Optional environment variables:
 * - UPSTASH_REDIS_REST_URL    Upstash Redis REST endpoint — enables cross-instance rate limiting
 * - UPSTASH_REDIS_REST_TOKEN  Upstash Redis REST token
 * - CONTACT_ALLOWED_ORIGINS   Comma-separated extra allowed origins
 *
 * Anti-abuse controls (documented in ARCHITECTURE.md):
 * - Rate limits per hashed source IP: 10 attempts / 60 min, 3 accepted / 15 min.
 *   Cross-instance when Upstash is configured; otherwise best-effort per warm
 *   instance. Limiter failure fails OPEN so legitimate mail is never dropped
 *   by an infrastructure error.
 * - Honeypot field ("website") + minimum-completion-time check (3 s).
 *   Rejections are generic and do not reveal which control triggered.
 * - POST-only, JSON-only, 10 KB body cap, origin allow-list, 8 s Resend timeout.
 *
 * Response payloads intentionally match src/lib/contact.ts
 * (ContactFunctionSuccessPayload / ContactFunctionErrorPayload).
 */

import { createHash } from 'node:crypto';

const NAME_MIN = 2;
const NAME_MAX = 50;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;
const EMAIL_MAX = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_BODY_BYTES = 10_240; // 10 KB
const MIN_COMPLETION_MS = 3_000; // forms submitted faster than this are treated as bots
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 2 * 60 * 1000;
const RESEND_TIMEOUT_MS = 8_000;

export const RATE_LIMITS = {
  attempts: { max: 10, windowMs: 60 * 60 * 1000 },
  accepted: { max: 3, windowMs: 15 * 60 * 1000 },
} as const;

const DEFAULT_ALLOWED_ORIGINS = ['https://www.iamtonde.co.za', 'https://iamtonde.co.za'];

interface ContactBody {
  name: string;
  email: string;
  message: string;
}

interface VercelStyleRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelStyleResponse {
  status: (code: number) => VercelStyleResponse;
  setHeader: (name: string, value: string) => void;
  json: (payload: unknown) => void;
}

/* ---------------------------------- helpers ---------------------------------- */

const headerValue = (req: VercelStyleRequest, name: string): string => {
  // eslint-disable-next-line security/detect-object-injection -- `name` is always a compile-time literal at call sites
  const raw = req.headers?.[name];
  if (Array.isArray(raw)) return raw[0] ?? '';
  return raw ?? '';
};

const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Source identifier: first hop of x-forwarded-for (set authoritatively by
 * Vercel's edge), hashed so raw IPs are never stored or logged.
 * Limitation: shared IPs (offices, CGNAT, VPNs) share a bucket; IPv6 clients
 * can rotate addresses. Acceptable for a portfolio contact form.
 */
const sourceId = (req: VercelStyleRequest): string => {
  const forwarded = headerValue(req, 'x-forwarded-for');
  const ip = forwarded.split(',')[0]?.trim() || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 24);
};

const isAllowedOrigin = (origin: string): boolean => {
  if (!origin) return true; // non-browser clients send no Origin; the limiter and bot checks still apply
  let host: string;
  let protocol: string;
  try {
    const parsed = new URL(origin);
    host = parsed.hostname;
    protocol = parsed.protocol;
  } catch {
    return false;
  }
  if (protocol !== 'https:' && host !== 'localhost' && host !== '127.0.0.1') return false;
  const extra = (process.env.CONTACT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (DEFAULT_ALLOWED_ORIGINS.includes(origin) || extra.includes(origin)) return true;
  if (host.endsWith('.vercel.app')) return true; // Preview deployments
  if (host === 'localhost' || host === '127.0.0.1') return true; // local dev
  return false;
};

/* ------------------------------- rate limiting -------------------------------- */

interface LimitCheck {
  limited: boolean;
  retryAfterSec: number;
}

type Bucket = 'attempts' | 'accepted';

// Best-effort fallback: valid only within one warm serverless instance.
const memoryCounters = new Map<string, { count: number; resetAt: number }>();

const memoryIncrement = (key: string, windowMs: number): number => {
  const now = Date.now();
  const entry = memoryCounters.get(key);
  if (!entry || entry.resetAt <= now) {
    memoryCounters.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }
  entry.count += 1;
  return entry.count;
};

const upstashIncrement = async (key: string, windowMs: number): Promise<number | null> => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', key],
        ['PEXPIRE', key, String(windowMs), 'NX'],
      ]),
    });
    if (!response.ok) return null;
    const results = (await response.json()) as Array<{ result?: number }>;
    const count = results?.[0]?.result;
    return typeof count === 'number' ? count : null;
  } catch {
    return null; // fail open — never block legitimate mail on limiter outage
  }
};

const checkLimit = async (id: string, bucket: Bucket): Promise<LimitCheck> => {
  const { max, windowMs } = bucket === 'attempts' ? RATE_LIMITS.attempts : RATE_LIMITS.accepted;
  const windowIndex = Math.floor(Date.now() / windowMs);
  const key = `contact:${bucket}:${id}:${windowIndex}`;

  let count = await upstashIncrement(key, windowMs);
  if (count === null) {
    count = memoryIncrement(key, windowMs);
  }

  const retryAfterSec = Math.max(1, Math.ceil(((windowIndex + 1) * windowMs - Date.now()) / 1000));
  return { limited: count > max, retryAfterSec };
};

/* -------------------------------- validation ---------------------------------- */

interface ParsedSubmission {
  data?: ContactBody;
  details?: string[];
  bot?: boolean;
}

const parseSubmission = (body: unknown): ParsedSubmission => {
  if (typeof body !== 'object' || body === null) {
    return { details: ['Request body must be a JSON object.'] };
  }

  const candidate = body as Record<string, unknown>;

  // Bot controls. Rejections are reported generically by the caller.
  const honeypot = candidate.website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return { bot: true };
  }
  const startedAt = candidate.startedAt;
  if (typeof startedAt !== 'number' || !Number.isFinite(startedAt)) {
    return { bot: true };
  }
  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_COMPLETION_MS || elapsed > MAX_FORM_AGE_MS || elapsed < -CLOCK_SKEW_MS) {
    return { bot: true };
  }

  const details: string[] = [];
  const name = typeof candidate.name === 'string' ? collapseWhitespace(candidate.name) : '';
  const email = typeof candidate.email === 'string' ? candidate.email.trim().toLowerCase() : '';
  const message = typeof candidate.message === 'string' ? candidate.message.trim() : '';

  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    details.push(`Name must be between ${NAME_MIN} and ${NAME_MAX} characters.`);
  }
  if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    details.push('Please provide a valid email address.');
  }
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    details.push(`Message must be between ${MESSAGE_MIN} and ${MESSAGE_MAX} characters.`);
  }

  return details.length > 0 ? { details } : { data: { name, email, message } };
};

/* ---------------------------------- handler ----------------------------------- */

export default async function handler(req: VercelStyleRequest, res: VercelStyleResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'VALIDATION_ERROR', message: 'Method not allowed.' });
    return;
  }

  const contentType = headerValue(req, 'content-type');
  if (!contentType.toLowerCase().includes('application/json')) {
    res.status(415).json({
      error: 'VALIDATION_ERROR',
      message: 'Requests must use application/json.',
    });
    return;
  }

  const declaredLength = Number(headerValue(req, 'content-length'));
  const bodySize = (() => {
    try {
      return JSON.stringify(req.body ?? '').length;
    } catch {
      return MAX_BODY_BYTES + 1;
    }
  })();
  if (
    (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) ||
    bodySize > MAX_BODY_BYTES
  ) {
    res.status(413).json({ error: 'VALIDATION_ERROR', message: 'Request body is too large.' });
    return;
  }

  const origin = headerValue(req, 'origin');
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({
      error: 'CONTACT_SEND_FAILED',
      message: 'This request could not be processed.',
    });
    return;
  }

  const id = sourceId(req);

  const attemptCheck = await checkLimit(id, 'attempts');
  if (attemptCheck.limited) {
    res.setHeader('Retry-After', String(attemptCheck.retryAfterSec));
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later or email me directly.',
      retryAfter: attemptCheck.retryAfterSec * 1000,
    });
    return;
  }

  const { data, details, bot } = parseSubmission(req.body);

  if (bot) {
    // Generic response: does not reveal which control triggered.
    res.status(400).json({
      error: 'CONTACT_SEND_FAILED',
      message: 'Your message could not be processed. Please email me directly.',
    });
    return;
  }

  if (!data) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Please correct the highlighted fields and try again.',
      details,
    });
    return;
  }

  const acceptedCheck = await checkLimit(id, 'accepted');
  if (acceptedCheck.limited) {
    res.setHeader('Retry-After', String(acceptedCheck.retryAfterSec));
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message:
        'You have sent several messages recently. Please try again later or email me directly.',
      retryAfter: acceptedCheck.retryAfterSec * 1000,
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL;
  const fromEmail = process.env.CONTACT_FROM ?? 'Portfolio Contact <onboarding@resend.dev>';

  if (!apiKey || !toEmail) {
    // Configuration problem: fail the form, never the site. No config details leak.
    res.status(500).json({
      error: 'CONTACT_SEND_FAILED',
      message: 'The contact service is not configured. Please email me directly.',
    });
    return;
  }

  const textBody = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    '',
    'Message:',
    data.message,
  ].join('\n');

  const htmlBody = [
    `<p><strong>Name:</strong> ${escapeHtml(data.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>`,
    `<p><strong>Message:</strong></p>`,
    `<p>${escapeHtml(data.message).replace(/\n/g, '<br />')}</p>`,
  ].join('');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        from: fromEmail, // server-controlled: never user input
        to: [toEmail], // server-controlled: never user input
        reply_to: data.email, // validated: no whitespace/CRLF possible
        subject: `Portfolio contact from ${data.name}`,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!resendResponse.ok) {
      res.status(502).json({
        error: 'CONTACT_SEND_FAILED',
        message: 'The message could not be delivered. Please email me directly.',
      });
      return;
    }

    const resendResult = (await resendResponse.json().catch(() => ({}))) as { id?: string };

    res.status(200).json({
      success: true,
      message: "Thank you for your message. I'll get back to you soon.",
      submissionId: resendResult.id ?? 'unknown',
      emailDelivery: {
        notification: 'sent',
        confirmation: 'skipped',
      },
    });
  } catch {
    // Covers network failures and the AbortController timeout alike.
    res.status(502).json({
      error: 'NETWORK_ERROR',
      message: 'The message could not be sent right now. Please try again shortly.',
    });
  } finally {
    clearTimeout(timeout);
  }
}
