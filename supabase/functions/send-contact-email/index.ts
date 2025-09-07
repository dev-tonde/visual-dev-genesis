import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

// Input validation and sanitization functions
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateInput = (data: ContactEmailRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!data.message || data.message.length < 10 || data.message.length > 2000) {
    errors.push('Message must be between 10 and 2000 characters');
  }
  
  return { isValid: errors.length === 0, errors };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData: ContactEmailRequest = await req.json();
    
    // Validate input
    const { isValid, errors } = validateInput(rawData);
    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid input data",
          details: errors 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Sanitize inputs
    const name = sanitizeInput(rawData.name);
    const email = sanitizeInput(rawData.email);
    const message = sanitizeInput(rawData.message);

    console.log("Processing contact form submission:", { name, email });

    // Send notification email to yourself
    const notificationEmail = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: ["hello@iamtonde.co.za"], // Your email
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This message was sent from your portfolio contact form.</em></p>
      `,
    });

    // Send confirmation email to the sender
    const confirmationEmail = await resend.emails.send({
      from: "Tonderai <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for reaching out!",
      html: `
        <h2>Thank you for your message, ${name}!</h2>
        <p>I've received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; margin: 16px 0; color: #64748b;">
          ${message.replace(/\n/g, '<br>')}
        </blockquote>
        <p>Best regards,<br>Tonderai</p>
        <hr>
        <p style="font-size: 12px; color: #94a3b8;">This is an automated response from hello@iamtonde.co.za</p>
      `,
    });

    console.log("Emails sent successfully:", { 
      notification: notificationEmail.data?.id, 
      confirmation: confirmationEmail.data?.id 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Thank you for your message! I'll get back to you soon.",
        emailIds: {
          notification: notificationEmail.data?.id,
          confirmation: confirmationEmail.data?.id
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
    // Standardized error response
    const errorResponse = {
      success: false,
      error: "CONTACT_SEND_FAILED",
      message: "Unable to send your message at this time. Please try again in a few moments.",
      code: "E001",
      retryAfter: 30000 // 30 seconds
    };
    
    // Handle specific error types
    if (error.message?.includes('rate limit')) {
      errorResponse.error = "RATE_LIMIT_EXCEEDED";
      errorResponse.message = "Too many requests. Please wait a moment before trying again.";
      errorResponse.code = "E002";
      errorResponse.retryAfter = 60000; // 1 minute
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorResponse.error = "NETWORK_ERROR";
      errorResponse.message = "Network connection issue. Please check your internet and try again.";
      errorResponse.code = "E003";
    } else if (error.message?.includes('validation')) {
      errorResponse.error = "VALIDATION_ERROR";
      errorResponse.message = "Please check your input and try again.";
      errorResponse.code = "E004";
      errorResponse.retryAfter = 0;
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: error.message?.includes('validation') ? 400 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);