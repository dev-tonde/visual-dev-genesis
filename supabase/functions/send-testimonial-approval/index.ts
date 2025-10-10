import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  testimonialId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { testimonialId }: ApprovalEmailRequest = await req.json();

    if (!testimonialId) {
      return new Response(
        JSON.stringify({ error: "testimonialId is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Fetching testimonial:", testimonialId);

    // Fetch testimonial details with user email
    const { data: testimonial, error: fetchError } = await supabase
      .from("testimonials")
      .select(`
        id,
        name,
        title,
        company,
        content,
        user_id,
        profiles!inner(email)
      `)
      .eq("id", testimonialId)
      .single();

    if (fetchError || !testimonial) {
      console.error("Error fetching testimonial:", fetchError);
      return new Response(
        JSON.stringify({ error: "Testimonial not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userEmail = testimonial.profiles?.email;

    if (!userEmail) {
      console.error("No email found for user");
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending approval email to:", userEmail);

    // Send approval email
    const emailResponse = await resend.emails.send({
      from: "Tonderai Matanga <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Your Testimonial Has Been Approved! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Testimonial Approved</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Testimonial Approved!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${testimonial.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Great news! Your testimonial has been approved and is now live on our website.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; font-weight: 600; color: #667eea;">Your Testimonial:</p>
              <p style="margin: 0; font-style: italic; color: #555;">"${testimonial.content}"</p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                <strong>${testimonial.name}</strong><br>
                ${testimonial.title} at ${testimonial.company}
              </p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for taking the time to share your experience. Your feedback means a lot!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://iamtonde.co.za" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                View Your Testimonial
              </a>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">Best regards,<br><strong>Tonderai Matanga</strong></p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Tonderai Matanga. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.id,
        message: `Approval email sent to ${userEmail}` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-testimonial-approval function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
