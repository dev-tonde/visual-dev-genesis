import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler, { RATE_LIMITS } from '../../../api/contact';

/**
 * Direct tests for the contact serverless function. External delivery (Resend)
 * and the limiter datastore are mocked; no real email is ever sent.
 *
 * The in-memory rate limiter is module-scoped, so each test uses a unique
 * client IP unless it is deliberately exercising the limiter.
 */

interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockResponse;
  setHeader: (name: string, value: string) => void;
  json: (payload: unknown) => void;
}

const createRes = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 0,
    headers: {},
    body: undefined,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    setHeader(name: string, value: string) {
      // eslint-disable-next-line security/detect-object-injection -- test double; names are literals from the handler
      res.headers[name] = value;
    },
    json(payload: unknown) {
      res.body = payload;
    },
  };
  return res;
};

let ipCounter = 0;
const nextIp = () => `203.0.113.${(ipCounter += 1)}`;

const validBody = () => ({
  name: 'Test User',
  email: 'test@example.com',
  message: 'This is a valid test message for the endpoint.',
  website: '',
  startedAt: Date.now() - 10_000,
});

const createReq = (overrides: Record<string, unknown> = {}, ip = nextIp()) => ({
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    origin: 'https://www.iamtonde.co.za',
    'x-forwarded-for': ip,
    ...(overrides.headers as Record<string, string> | undefined),
  },
  body: 'body' in overrides ? overrides.body : validBody(),
});

const fetchMock = vi.fn();

const mockResendSuccess = () =>
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ id: 'email-123' }),
  });

describe('api/contact handler', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RESEND_API_KEY', 'test-resend-key');
    vi.stubEnv('CONTACT_EMAIL', 'inbox@example.com');
    vi.stubEnv('CONTACT_FROM', 'Portfolio <contact@example.com>');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns 405 with an Allow header for GET', async () => {
    const res = createRes();
    await handler({ ...createReq(), method: 'GET' } as never, res as never);
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
  });

  it('returns 415 for unsupported content types', async () => {
    const req = createReq();
    req.headers['content-type'] = 'text/plain';
    const res = createRes();
    await handler(req as never, res as never);
    expect(res.statusCode).toBe(415);
  });

  it('returns 400 for a malformed (non-object) body', async () => {
    const req = createReq({ body: 'just a string' });
    const res = createRes();
    await handler(req as never, res as never);
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 with details for invalid fields', async () => {
    const req = createReq({
      body: { ...validBody(), name: 'A', email: 'not-an-email', message: 'short' },
    });
    const res = createRes();
    await handler(req as never, res as never);
    expect(res.statusCode).toBe(400);
    const body = res.body as { error: string; details: string[] };
    expect(body.error).toBe('VALIDATION_ERROR');
    expect(body.details).toHaveLength(3);
  });

  it('rejects a populated honeypot with a generic response', async () => {
    const req = createReq({ body: { ...validBody(), website: 'https://spam.example' } });
    const res = createRes();
    await handler(req as never, res as never);
    expect(res.statusCode).toBe(400);
    const body = res.body as { message: string };
    expect(body.message).not.toMatch(/honeypot|bot|website/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a too-fast submission with a generic response', async () => {
    const req = createReq({ body: { ...validBody(), startedAt: Date.now() - 500 } });
    const res = createRes();
    await handler(req as never, res as never);
    expect(res.statusCode).toBe(400);
    const body = res.body as { message: string };
    expect(body.message).not.toMatch(/timing|fast|seconds/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 413 when the declared content length exceeds the cap', async () => {
    const req = createReq();
    req.headers['content-length'] = '50000';
    const res = createRes();
    await handler(req as never, res as never);
    expect(res.statusCode).toBe(413);
  });

  it('returns 403 for a disallowed origin', async () => {
    const req = createReq();
    req.headers.origin = 'https://evil.example.com';
    const res = createRes();
    await handler(req as never, res as never);
    expect(res.statusCode).toBe(403);
  });

  it('allows Vercel preview origins', async () => {
    mockResendSuccess();
    const req = createReq();
    req.headers.origin = 'https://visual-dev-genesis-git-feat-abc-dev-tonde.vercel.app';
    const res = createRes();
    await handler(req as never, res as never);
    expect(res.statusCode).toBe(200);
  });

  it('sends a valid submission through Resend with escaped HTML and a text part', async () => {
    mockResendSuccess();
    const req = createReq({
      body: { ...validBody(), name: 'Eve <script>alert(1)</script>' },
    });
    const res = createRes();
    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string; signal: unknown }];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.signal).toBeDefined(); // AbortController timeout wired up

    const payload = JSON.parse(init.body) as {
      from: string;
      to: string[];
      subject: string;
      html: string;
      text: string;
    };
    expect(payload.to).toEqual(['inbox@example.com']); // server-controlled recipient
    expect(payload.from).toBe('Portfolio <contact@example.com>'); // server-controlled sender
    expect(payload.html).toContain('&lt;script&gt;'); // escaped
    expect(payload.html).not.toContain('<script>');
    expect(payload.text).toContain('This is a valid test message');

    const success = res.body as { success: boolean; submissionId: string };
    expect(success.success).toBe(true);
    expect(success.submissionId).toBe('email-123');
  });

  it('returns a safe 500 when configuration is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const res = createRes();
    await handler(createReq() as never, res as never);
    expect(res.statusCode).toBe(500);
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain('RESEND');
    expect(serialized).not.toContain('test-resend-key');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns a safe 502 when Resend rejects the request', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
    const res = createRes();
    await handler(createReq() as never, res as never);
    expect(res.statusCode).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('resend.com');
  });

  it('returns a safe 502 when the Resend call times out (abort)', async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    const res = createRes();
    await handler(createReq() as never, res as never);
    expect(res.statusCode).toBe(502);
    const body = res.body as { error: string };
    expect(body.error).toBe('NETWORK_ERROR');
  });

  it('rate limits repeated attempts from one source with 429 and Retry-After', async () => {
    mockResendSuccess();
    const ip = '198.51.100.77';
    let firstLimited: MockResponse | null = null;

    for (let i = 0; i < RATE_LIMITS.attempts.max + 2; i += 1) {
      const res = createRes();
      await handler(createReq({}, ip) as never, res as never);
      if (res.statusCode === 429 && !firstLimited) {
        firstLimited = res;
      }
    }

    expect(firstLimited).not.toBeNull();
    expect(Number(firstLimited?.headers['Retry-After'])).toBeGreaterThan(0);
    const body = firstLimited?.body as { error: string; retryAfter: number };
    expect(body.error).toBe('RATE_LIMIT_EXCEEDED');
    expect(body.retryAfter).toBeGreaterThan(0);
  });

  it('caps accepted submissions per source (3 per window)', async () => {
    mockResendSuccess();
    const ip = '198.51.100.88';
    const statuses: number[] = [];

    for (let i = 0; i < RATE_LIMITS.accepted.max + 1; i += 1) {
      const res = createRes();
      await handler(createReq({}, ip) as never, res as never);
      statuses.push(res.statusCode);
    }

    expect(statuses.slice(0, RATE_LIMITS.accepted.max)).toEqual([200, 200, 200]);
    expect(statuses[RATE_LIMITS.accepted.max]).toBe(429);
  });

  it('never exposes private environment values in any response', async () => {
    mockResendSuccess();
    const res = createRes();
    await handler(createReq() as never, res as never);
    const serialized = JSON.stringify(res.body) + JSON.stringify(res.headers);
    expect(serialized).not.toContain('test-resend-key');
    expect(serialized).not.toContain('RESEND_API_KEY');
    expect(serialized).not.toContain('UPSTASH');
  });
});
