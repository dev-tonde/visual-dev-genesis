import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.3';

// Rate limiting configuration
const RATE_LIMITS = {
  PER_IP_HOUR: 5,
  PER_EMAIL_HOUR: 3,
} as const;

const CONTACT_NAME_MIN_LENGTH = 2;
const CONTACT_NAME_MAX_LENGTH = 50;
const CONTACT_MESSAGE_MIN_LENGTH = 10;
const CONTACT_MESSAGE_MAX_LENGTH = 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only allow specific origins in production
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get('CORS_ORIGIN') || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

type EmailDeliveryStatus = 'sent' | 'failed' | 'skipped';

const getSupabaseServiceRoleClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase service role configuration');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

const getResendClient = () => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  return resendApiKey ? new Resend(resendApiKey) : null;
};

const jsonResponse = (body: unknown, status: number, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...headers,
    },
  });

const normalizeText = (value: unknown): string => (
  typeof value === 'string'
    ? value.replace(/\r\n/g, '\n').split('\0').join('').trim()
    : ''
);

const escapeHtml = (value: string): string => (
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case '\'':
        return '&#39;';
      default:
        return character;
    }
  })
);

const formatMessageForEmail = (message: string): string => escapeHtml(message).replace(/\n/g, '<br>');

const validateInput = (payload: unknown): { data?: ContactEmailRequest; errors: string[] } => {
  if (typeof payload !== 'object' || payload === null) {
    return {
      errors: ['Request body must be a JSON object.'],
    };
  }

  const candidate = payload as Record<string, unknown>;
  const data = {
    name: normalizeText(candidate.name),
    email: normalizeText(candidate.email).toLowerCase(),
    message: normalizeText(candidate.message),
  };
  const errors: string[] = [];

  if (data.name.length < CONTACT_NAME_MIN_LENGTH || data.name.length > CONTACT_NAME_MAX_LENGTH) {
    errors.push(`Name must be between ${CONTACT_NAME_MIN_LENGTH} and ${CONTACT_NAME_MAX_LENGTH} characters.`);
  }

  if (!EMAIL_REGEX.test(data.email)) {
    errors.push('A valid email address is required.');
  }

  if (
    data.message.length < CONTACT_MESSAGE_MIN_LENGTH ||
    data.message.length > CONTACT_MESSAGE_MAX_LENGTH
  ) {
    errors.push(`Message must be between ${CONTACT_MESSAGE_MIN_LENGTH} and ${CONTACT_MESSAGE_MAX_LENGTH} characters.`);
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { data, errors };
};

const getClientIp = (req: Request): string | null => {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = req.headers.get('x-real-ip')?.trim();
  const clientIp = forwardedFor || realIp || null;

  return clientIp && clientIp !== 'unknown' ? clientIp : null;
};

const hashValue = async (value: string): Promise<string> => {
  const encodedValue = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encodedValue);

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const checkRateLimit = async (identifier: string | null, type: 'ip' | 'email'): Promise<boolean> => {
  if (!identifier) {
    return true;
  }

  const supabaseServiceRole = getSupabaseServiceRoleClient();
  const limit = type === 'ip' ? RATE_LIMITS.PER_IP_HOUR : RATE_LIMITS.PER_EMAIL_HOUR;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const column = type === 'ip' ? 'ip_hash' : 'email';

  const { count, error } = await supabaseServiceRole
    .from('contact_submissions')
    .select('id', { count: 'exact', head: true })
    .eq(column, identifier)
    .gte('created_at', oneHourAgo);

  if (error) {
    throw new Error(`Rate limit check failed: ${error.message}`);
  }

  return (count || 0) < limit;
};

const createSubmission = async (data: ContactEmailRequest & { ip_hash: string | null }) => {
  const supabaseServiceRole = getSupabaseServiceRoleClient();
  const { data: insertedSubmission, error } = await supabaseServiceRole
    .from('contact_submissions')
    .insert([{
      name: data.name,
      email: data.email,
      message: data.message,
      ip_hash: data.ip_hash,
      status: 'pending',
    }])
    .select('id')
    .single();

  if (error || !insertedSubmission) {
    throw new Error(`Contact submission insert failed: ${error?.message || 'Unknown insert error'}`);
  }

  return insertedSubmission.id as string;
};

const sendNotificationEmail = async (resend: Resend, data: ContactEmailRequest) => {
  await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: ["hello@iamtonde.co.za"],
    subject: `New Contact Form Message from ${escapeHtml(data.name)}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Message:</strong></p>
      <p>${formatMessageForEmail(data.message)}</p>
      <hr>
      <p><em>This message was sent from your portfolio contact form.</em></p>
    `,
  });
};

const sendConfirmationEmail = async (resend: Resend, data: ContactEmailRequest) => {
  await resend.emails.send({
    from: "Tonderai <onboarding@resend.dev>",
    to: [data.email],
    subject: "Thank you for reaching out!",
    html: `
      <h2>Thank you for your message, ${escapeHtml(data.name)}!</h2>
      <p>I've received your message and will get back to you as soon as possible.</p>
      <p><strong>Your message:</strong></p>
      <blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; margin: 16px 0; color: #64748b;">
        ${formatMessageForEmail(data.message)}
      </blockquote>
      <p>Best regards,<br>Tonderai</p>
      <hr>
      <p style="font-size: 12px; color: #94a3b8;">This is an automated response from hello@iamtonde.co.za</p>
    `,
  });
};

const getEmailDeliveryStatus = (result: PromiseSettledResult<unknown>): EmailDeliveryStatus => {
  return result.status === 'fulfilled' ? 'sent' : 'failed';
};

const getFailureReason = (result: PromiseSettledResult<unknown>): string => {
  if (result.status === 'fulfilled') {
    return '';
  }

  return result.reason instanceof Error ? result.reason.message : String(result.reason);
};

const buildSuccessMessage = (
  notificationStatus: EmailDeliveryStatus,
  confirmationStatus: EmailDeliveryStatus,
) => {
  if (notificationStatus === 'sent' && confirmationStatus === 'sent') {
    return "Thank you for your message! I'll get back to you soon.";
  }

  return "Thank you for your message! It was received successfully, and I'll review it soon.";
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let rawData: unknown;
    try {
      rawData = await req.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Request body must be valid JSON.",
          details: ["Request body must be valid JSON."],
        },
        400,
      );
    }

    const { data, errors } = validateInput(rawData);
    if (!data) {
      return jsonResponse(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid input data.",
          details: errors,
        },
        400,
      );
    }

    const clientIp = getClientIp(req);
    const ipHash = clientIp ? await hashValue(clientIp) : null;

    // Check rate limits
    const [ipRateOk, emailRateOk] = await Promise.all([
      checkRateLimit(ipHash, 'ip'),
      checkRateLimit(data.email, 'email')
    ]);

    if (!ipRateOk || !emailRateOk) {
      console.warn("Rate limit exceeded for contact form submission");
      return jsonResponse(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please wait before trying again.",
          retryAfter: 3600000 // 1 hour
        },
        429,
        {
          "Retry-After": "3600",
        },
      );
    }

    const submissionId = await createSubmission({
      ...data,
      ip_hash: ipHash,
    });

    console.log("Stored contact form submission", { submissionId });

    const resend = getResendClient();
    let notificationStatus: EmailDeliveryStatus = 'skipped';
    let confirmationStatus: EmailDeliveryStatus = 'skipped';

    if (!resend) {
      console.warn("RESEND_API_KEY is not configured; contact emails were skipped", { submissionId });
    } else {
      const [notificationResult, confirmationResult] = await Promise.allSettled([
        sendNotificationEmail(resend, data),
        sendConfirmationEmail(resend, data),
      ]);

      notificationStatus = getEmailDeliveryStatus(notificationResult);
      confirmationStatus = getEmailDeliveryStatus(confirmationResult);

      if (notificationResult.status === 'rejected') {
        console.error("Failed to send contact notification email", {
          submissionId,
          reason: getFailureReason(notificationResult),
        });
      }

      if (confirmationResult.status === 'rejected') {
        console.error("Failed to send contact confirmation email", {
          submissionId,
          reason: getFailureReason(confirmationResult),
        });
      }
    }

    return jsonResponse(
      {
        success: true,
        message: buildSuccessMessage(notificationStatus, confirmationStatus),
        submissionId,
        emailDelivery: {
          notification: notificationStatus,
          confirmation: confirmationStatus,
        },
      },
      200,
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const normalizedErrorMessage = errorMessage.toLowerCase();

    console.error("Error in send-contact-email function:", errorMessage);
    
    // Standardized error response
    const errorResponse = {
      success: false,
      error: "CONTACT_SEND_FAILED",
      message: "Unable to send your message at this time. Please try again in a few moments.",
      code: "E001",
      retryAfter: 30000 // 30 seconds
    };
    
    // Handle specific error types
    if (normalizedErrorMessage.includes('rate limit')) {
      errorResponse.error = "RATE_LIMIT_EXCEEDED";
      errorResponse.message = "Too many requests. Please wait a moment before trying again.";
      errorResponse.code = "E002";
      errorResponse.retryAfter = 60000; // 1 minute
    } else if (normalizedErrorMessage.includes('network') || normalizedErrorMessage.includes('fetch')) {
      errorResponse.error = "NETWORK_ERROR";
      errorResponse.message = "Network connection issue. Please check your internet and try again.";
      errorResponse.code = "E003";
    } else if (normalizedErrorMessage.includes('validation')) {
      errorResponse.error = "VALIDATION_ERROR";
      errorResponse.message = "Please check your input and try again.";
      errorResponse.code = "E004";
      errorResponse.retryAfter = 0;
    }
    
    return jsonResponse(
      errorResponse,
      normalizedErrorMessage.includes('validation') ? 400 : 500,
    );
  }
};

serve(handler);
