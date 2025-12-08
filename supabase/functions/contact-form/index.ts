import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactFormRequest = await req.json();

    console.log("Received contact form submission:", { name, email, phone, subject });

    // Validate required fields
    if (!name || name.length < 2) {
      return new Response(
        JSON.stringify({ error: "Ime mora imati najmanje 2 karaktera." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return new Response(
        JSON.stringify({ error: "Email adresa nije validna." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subject || subject.length < 5) {
      return new Response(
        JSON.stringify({ error: "Predmet mora imati najmanje 5 karaktera." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!message || message.length < 10 || message.length > 500) {
      return new Response(
        JSON.stringify({ error: "Poruka mora imati između 10 i 500 karaktera." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: submissionData, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Greška pri čuvanju poruke. Pokušajte ponovo." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Saved submission to database:", submissionData.id);

    // Send notification email to the veterinary clinic using Resend API
    const clinicEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VetHealth.ba <onboarding@resend.dev>",
        to: ["info@vethealth.ba"],
        subject: `Nova poruka: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #008080;">Nova Kontakt Poruka</h2>
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ime i Prezime:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ""}
              <p><strong>Predmet:</strong> ${subject}</p>
            </div>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Poruka:</h3>
              <p style="color: #666; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
            </div>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">
              Primljeno: ${new Date().toISOString()}
            </p>
          </div>
        `,
      }),
    });

    console.log("Clinic notification email sent:", await clinicEmailResponse.json());

    // Send confirmation email to the customer
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VetHealth.ba <onboarding@resend.dev>",
        to: [email],
        subject: "Hvala vam na poruci - VetHealth.ba",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #008080; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">VetHealth.ba</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Veterinarska Ordinacija Banjaluka</p>
            </div>
            
            <div style="background-color: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <h2 style="color: #333; margin-top: 0;">Poštovani ${name},</h2>
              <p style="color: #666; line-height: 1.6;">
                Hvala vam što ste nas kontaktirali! Primili smo vašu poruku i javit ćemo vam se u najkraćem mogućem roku.
              </p>
              
              <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #008080; margin-top: 0;">Vaša poruka:</h3>
                <p style="color: #666;"><strong>Predmet:</strong> ${subject}</p>
                <p style="color: #666; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                U međuvremenu, ako imate hitno pitanje, slobodno nas nazovite na:
              </p>
              <p style="color: #008080; font-size: 18px; font-weight: bold;">
                +387 51 123 456
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-top: 20px;">
                Srdačan pozdrav,<br>
                Tim VetHealth.ba
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

    console.log("Customer confirmation email sent:", await customerEmailResponse.json());

    // Update submission status to 'sent'
    await supabase
      .from("contact_submissions")
      .update({ status: "sent" })
      .eq("id", submissionData.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Poruka uspješno poslana!",
        submissionId: submissionData.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in contact-form function:", error);
    return new Response(
      JSON.stringify({
        error: "Došlo je do greške pri slanju poruke. Molimo pokušajte ponovo.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
