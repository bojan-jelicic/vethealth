import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AppointmentRequest {
  serviceId: string;
  veterinarianId?: string;
  appointmentDate: string;
  appointmentTime: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  petName: string;
  petSpeciesBreed?: string;
  petNotes?: string;
}

interface AvailableSlotsRequest {
  date: string;
  veterinarianId?: string;
  serviceId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    // GET available slots
    if (req.method === "GET" && path === "available-slots") {
      const date = url.searchParams.get("date");
      const veterinarianId = url.searchParams.get("veterinarianId");

      if (!date) {
        return new Response(
          JSON.stringify({ error: "Datum je obavezan" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Fetching available slots for date:", date, "vet:", veterinarianId);

      // Get all appointments for the date
      let query = supabase
        .from("appointments")
        .select("appointment_time")
        .eq("appointment_date", date)
        .neq("status", "cancelled");

      if (veterinarianId) {
        query = query.eq("veterinarian_id", veterinarianId);
      }

      const { data: bookedSlots, error: bookedError } = await query;

      if (bookedError) {
        console.error("Error fetching booked slots:", bookedError);
        throw bookedError;
      }

      // Generate all possible time slots (9:00 - 17:00, every 30 min)
      const allSlots = [];
      for (let hour = 9; hour < 17; hour++) {
        allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
        allSlots.push(`${hour.toString().padStart(2, "0")}:30`);
      }

      // Check if date is weekend (Saturday = 6, Sunday = 0)
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // If weekend, return no slots
      if (isWeekend) {
        return new Response(
          JSON.stringify({ slots: [], message: "Ordinacija ne radi vikendom" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateObj < today) {
        return new Response(
          JSON.stringify({ slots: [], message: "Ne možete zakazati termin u prošlosti" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const bookedTimes = bookedSlots?.map((slot) => 
        slot.appointment_time.substring(0, 5)
      ) || [];

      const slots = allSlots.map((time) => ({
        time,
        isAvailable: !bookedTimes.includes(time),
      }));

      console.log("Returning slots:", slots.length, "booked:", bookedTimes.length);

      return new Response(
        JSON.stringify({ slots }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST create appointment
    if (req.method === "POST") {
      const body: AppointmentRequest = await req.json();
      
      console.log("Creating appointment:", body);

      // Validate required fields
      if (!body.serviceId || !body.appointmentDate || !body.appointmentTime ||
          !body.ownerFirstName || !body.ownerLastName || !body.ownerEmail ||
          !body.ownerPhone || !body.petName) {
        return new Response(
          JSON.stringify({ error: "Sva obavezna polja moraju biti popunjena" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if slot is still available
      let checkQuery = supabase
        .from("appointments")
        .select("id")
        .eq("appointment_date", body.appointmentDate)
        .eq("appointment_time", body.appointmentTime)
        .neq("status", "cancelled");

      if (body.veterinarianId) {
        checkQuery = checkQuery.eq("veterinarian_id", body.veterinarianId);
      }

      const { data: existingSlot } = await checkQuery;

      if (existingSlot && existingSlot.length > 0) {
        return new Response(
          JSON.stringify({ error: "Ovaj termin je već zauzet. Molimo odaberite drugi." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create appointment
      const { data: appointment, error: insertError } = await supabase
        .from("appointments")
        .insert({
          service_id: body.serviceId,
          veterinarian_id: body.veterinarianId || null,
          appointment_date: body.appointmentDate,
          appointment_time: body.appointmentTime,
          owner_first_name: body.ownerFirstName,
          owner_last_name: body.ownerLastName,
          owner_email: body.ownerEmail,
          owner_phone: body.ownerPhone,
          pet_name: body.petName,
          pet_species_breed: body.petSpeciesBreed || null,
          pet_notes: body.petNotes || null,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating appointment:", insertError);
        throw insertError;
      }

      console.log("Appointment created:", appointment.id);

      // Get service and vet details for email
      const { data: service } = await supabase
        .from("services")
        .select("name")
        .eq("id", body.serviceId)
        .single();

      let vetName = "Bilo koji veterinar";
      if (body.veterinarianId) {
        const { data: vet } = await supabase
          .from("veterinarians")
          .select("name")
          .eq("id", body.veterinarianId)
          .single();
        if (vet) vetName = vet.name;
      }

      // Format date for email
      const dateFormatted = new Date(body.appointmentDate).toLocaleDateString("bs-BA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Send confirmation email to customer
      try {
        await resend.emails.send({
          from: "Veterinarska Ordinacija <onboarding@resend.dev>",
          to: [body.ownerEmail],
          subject: "Potvrda Zakazanog Termina - Veterinarska Ordinacija",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #008080; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Veterinarska Ordinacija</h1>
              </div>
              <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #333;">Poštovani ${body.ownerFirstName},</h2>
                <p style="color: #666; font-size: 16px;">
                  Vaš termin je uspješno zakazan! Evo detalja vašeg termina:
                </p>
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #888; width: 40%;">Usluga:</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold;">${service?.name || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #888;">Veterinar:</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold;">${vetName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #888;">Datum:</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold;">${dateFormatted}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #888;">Vrijeme:</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold;">${body.appointmentTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #888;">Ljubimac:</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold;">${body.petName}</td>
                    </tr>
                  </table>
                </div>
                <p style="color: #666; font-size: 14px;">
                  Molimo dođite 10 minuta prije zakazanog termina. 
                  U slučaju otkazivanja, molimo kontaktirajte nas najmanje 24 sata unaprijed.
                </p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="color: #888; font-size: 12px; margin: 0;">
                    Veterinarska Ordinacija Banja Luka<br>
                    Tel: +387 51 123 456<br>
                    Email: info@vetbl.com
                  </p>
                </div>
              </div>
            </div>
          `,
        });
        console.log("Confirmation email sent to:", body.ownerEmail);
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the appointment if email fails
      }

      // Send notification to clinic
      try {
        await resend.emails.send({
          from: "Sistem Zakazivanja <onboarding@resend.dev>",
          to: ["info@vetbl.com"], // Replace with actual clinic email
          subject: `Novi Zakazani Termin - ${body.petName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2>Novi Termin Zakazan</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Vlasnik:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.ownerFirstName} ${body.ownerLastName}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.ownerEmail}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Telefon:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.ownerPhone}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Ljubimac:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.petName} (${body.petSpeciesBreed || "N/A"})</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Usluga:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${service?.name}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Veterinar:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${vetName}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Datum:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${dateFormatted}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Vrijeme:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.appointmentTime}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Napomena:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.petNotes || "Nema"}</td></tr>
              </table>
            </div>
          `,
        });
        console.log("Notification email sent to clinic");
      } catch (emailError) {
        console.error("Error sending clinic notification:", emailError);
      }

      return new Response(
        JSON.stringify({ 
          message: "Termin uspješno zakazan",
          appointmentId: appointment.id 
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in appointments function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Došlo je do greške" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
