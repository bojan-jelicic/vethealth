import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendReminderRequest {
  reminder_id: string;
  recipient_email: string;
  recipient_name: string;
  pet_name?: string;
  reminder_title: string;
  reminder_type: string;
  due_date: string;
  description?: string;
  is_test?: boolean;
}

const typeLabels: Record<string, string> = {
  vaccine_due: "Vakcinacija",
  follow_up: "Kontrolni pregled",
  custom: "Podsjetnik",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SendReminderRequest = await req.json();
    const {
      reminder_id,
      recipient_email,
      recipient_name,
      pet_name,
      reminder_title,
      reminder_type,
      due_date,
      description,
      is_test,
    } = body;

    if (!recipient_email) {
      return new Response(
        JSON.stringify({ error: "Email adresa je obavezna." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const typeLabel = typeLabels[reminder_type] || "Podsjetnik";
    const subjectLine = is_test
      ? `[TEST] ${typeLabel}: ${reminder_title}`
      : `${typeLabel}: ${reminder_title}`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VetHealth.ba <onboarding@resend.dev>",
        to: [recipient_email],
        subject: subjectLine,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #008080; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">VetHealth.ba</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Veterinarska Ordinacija Banjaluka</p>
            </div>
            <div style="background-color: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <h2 style="color: #333; margin-top: 0;">Poštovani ${recipient_name},</h2>
              <p style="color: #666; line-height: 1.6;">
                ${is_test ? '<strong>[OVO JE TEST EMAIL]</strong><br><br>' : ''}
                Podsjećamo vas na zakazani termin:
              </p>
              <div style="background-color: #f0f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #008080;">
                <p style="margin: 0 0 8px 0;"><strong style="color: #008080;">${typeLabel}</strong></p>
                <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #333;">${reminder_title}</p>
                ${pet_name ? `<p style="margin: 0 0 8px 0; color: #666;">🐾 Ljubimac: <strong>${pet_name}</strong></p>` : ''}
                <p style="margin: 0 0 8px 0; color: #666;">📅 Datum: <strong>${due_date}</strong></p>
                ${description ? `<p style="margin: 0; color: #666;">${description}</p>` : ''}
              </div>
              <p style="color: #666; line-height: 1.6;">
                Molimo vas da nas kontaktirate radi zakazivanja termina ili potvrde dolaska.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="tel:+38751123456" style="display: inline-block; background-color: #008080; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  Nazovite nas: +387 51 123 456
                </a>
              </div>
              <p style="color: #666; line-height: 1.6;">
                Srdačan pozdrav,<br>Tim VetHealth.ba
              </p>
            </div>
            <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                Ulica Primjer 123, 78000 Banjaluka<br>
                info@vethealth.ba | +387 51 123 456
              </p>
            </div>
          </div>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Reminder email result:", emailResult);

    if (!emailResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Greška pri slanju emaila.", details: emailResult }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log to audit_logs if not a test
    if (!is_test && reminder_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get user from auth header
      const authHeader = req.headers.get("Authorization");
      let actorUserId = null;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        actorUserId = user?.id || null;
      }

      await supabase.from("audit_logs").insert({
        actor_user_id: actorUserId,
        action: "reminder_email_sent",
        entity_type: "reminder",
        entity_id: reminder_id,
        metadata: {
          recipient_email,
          recipient_name,
          pet_name: pet_name || null,
          reminder_title,
          reminder_type,
          due_date,
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email uspješno poslan!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-reminder-email:", error);
    return new Response(
      JSON.stringify({ error: "Greška pri slanju emaila." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
