/**
 * Vercel serverless function: receives contact-form submissions and forwards
 * them via the Resend API. Replaces the former Supabase edge function.
 *
 * Required environment variables (Vercel project settings):
 * - RESEND_API_KEY   Resend API key
 * - CONTACT_EMAIL    Destination inbox (e.g. tonderai@iamtonde.co.za)
 * - CONTACT_FROM     Verified sender (e.g. "Portfolio <contact@iamtonde.co.za>")
 *
 * Response payloads intentionally match src/lib/contact.ts
 * (ContactFunctionSuccessPayload / ContactFunctionErrorPayload).
 */

const NAME_MIN = 2;
const NAME_MAX = 50;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;
const EMAIL_MAX = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactBody {
  name: string;
  email: string;
  message: string;
}

interface VercelStyleRequest {
  method?: string;
  body?: unknown;
}

interface VercelStyleResponse {
  status: (code: number) => VercelStyleResponse;
  setHeader: (name: string, value: string) => void;
  json: (payload: unknown) => void;
}

const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const validate = (body: unknown): { data?: ContactBody; details?: string[] } => {
  const details: string[] = [];

  if (typeof body !== 'object' || body === null) {
    return { details: ['Request body must be a JSON object.'] };
  }

  const candidate = body as Record<string, unknown>;
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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default async function handler(req: VercelStyleRequest, res: VercelStyleResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'VALIDATION_ERROR',
      message: 'Method not allowed.',
    });
    return;
  }

  const { data, details } = validate(req.body);

  if (!data) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Please correct the highlighted fields and try again.',
      details,
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL;
  const fromEmail = process.env.CONTACT_FROM ?? 'Portfolio Contact <onboarding@resend.dev>';

  if (!apiKey || !toEmail) {
    // Configuration problem: fail the form, never the site.
    res.status(500).json({
      error: 'CONTACT_SEND_FAILED',
      message: 'The contact service is not configured. Please email me directly.',
    });
    return;
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: data.email,
        subject: `Portfolio contact from ${data.name}`,
        html: [
          `<p><strong>Name:</strong> ${escapeHtml(data.name)}</p>`,
          `<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>`,
          `<p><strong>Message:</strong></p>`,
          `<p>${escapeHtml(data.message).replace(/\n/g, '<br />')}</p>`,
        ].join(''),
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
    res.status(502).json({
      error: 'NETWORK_ERROR',
      message: 'The message could not be sent right now. Please try again shortly.',
    });
  }
}
