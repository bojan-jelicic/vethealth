import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

// Fetch services and vets for context
async function getServicesAndVets() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const [servicesRes, vetsRes] = await Promise.all([
    supabase.from('services').select('id, name, duration_minutes, price').eq('is_active', true),
    supabase.from('veterinarians').select('id, name, specialization').eq('is_active', true)
  ]);

  return {
    services: servicesRes.data || [],
    veterinarians: vetsRes.data || []
  };
}

// Check available slots for a date
async function getAvailableSlots(date: string, veterinarianId?: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Check if weekend
  const dateObj = new Date(date);
  const day = dateObj.getDay();
  if (day === 0 || day === 6) {
    return { available: false, message: "Ordinacija ne radi vikendom." };
  }

  // Check if past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj < today) {
    return { available: false, message: "Ne možete zakazati termin u prošlosti." };
  }

  // Get booked slots
  let query = supabase
    .from("appointments")
    .select("appointment_time")
    .eq("appointment_date", date)
    .neq("status", "cancelled");

  if (veterinarianId) {
    query = query.eq("veterinarian_id", veterinarianId);
  }

  const { data: bookedSlots } = await query;

  // Generate all slots
  const allSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    allSlots.push(`${hour.toString().padStart(2, "0")}:30`);
  }

  const bookedTimes = bookedSlots?.map(s => s.appointment_time.substring(0, 5)) || [];
  const availableSlots = allSlots.filter(t => !bookedTimes.includes(t));

  return { 
    available: true, 
    slots: availableSlots,
    message: availableSlots.length > 0 
      ? `Dostupni termini za ${date}: ${availableSlots.join(', ')}`
      : "Nema dostupnih termina za ovaj datum."
  };
}

// Book appointment
async function bookAppointment(data: any) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Validate required fields
  if (!data.serviceId || !data.appointmentDate || !data.appointmentTime ||
      !data.ownerFirstName || !data.ownerLastName || !data.ownerEmail ||
      !data.ownerPhone || !data.petName) {
    return { success: false, message: "Nedostaju obavezni podaci za zakazivanje." };
  }

  // Check if slot still available
  let checkQuery = supabase
    .from("appointments")
    .select("id")
    .eq("appointment_date", data.appointmentDate)
    .eq("appointment_time", data.appointmentTime)
    .neq("status", "cancelled");

  if (data.veterinarianId) {
    checkQuery = checkQuery.eq("veterinarian_id", data.veterinarianId);
  }

  const { data: existing } = await checkQuery;
  if (existing && existing.length > 0) {
    return { success: false, message: "Ovaj termin je već zauzet. Molimo odaberite drugi." };
  }

  // Create appointment
  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      service_id: data.serviceId,
      veterinarian_id: data.veterinarianId || null,
      appointment_date: data.appointmentDate,
      appointment_time: data.appointmentTime,
      owner_first_name: data.ownerFirstName,
      owner_last_name: data.ownerLastName,
      owner_email: data.ownerEmail,
      owner_phone: data.ownerPhone,
      pet_name: data.petName,
      pet_species_breed: data.petSpeciesBreed || null,
      pet_notes: data.petNotes || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Booking error:", error);
    return { success: false, message: "Greška pri zakazivanju. Pokušajte ponovo." };
  }

  // Get service name for confirmation
  const { data: service } = await supabase
    .from('services')
    .select('name')
    .eq('id', data.serviceId)
    .single();

  return { 
    success: true, 
    appointmentId: appointment.id,
    message: `Termin uspješno zakazan! 📅\n\n**Detalji:**\n- Usluga: ${service?.name}\n- Datum: ${data.appointmentDate}\n- Vrijeme: ${data.appointmentTime}\n- Ljubimac: ${data.petName}\n\nPotvrda je poslana na email: ${data.ownerEmail}`
  };
}

const tools = [
  {
    type: "function",
    function: {
      name: "get_available_slots",
      description: "Dohvata dostupne termine za određeni datum. Koristi ovu funkciju kada korisnik pita za slobodne termine ili želi vidjeti raspoloživost.",
      parameters: {
        type: "object",
        properties: {
          date: { 
            type: "string", 
            description: "Datum u formatu YYYY-MM-DD" 
          },
          veterinarianId: { 
            type: "string", 
            description: "ID veterinara (opcionalno)" 
          }
        },
        required: ["date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Zakazuje termin sa svim potrebnim podacima. Koristi ovu funkciju SAMO kada imaš SVE potrebne podatke: uslugu, datum, vrijeme, podatke o vlasniku i ljubimcu.",
      parameters: {
        type: "object",
        properties: {
          serviceId: { type: "string", description: "ID usluge" },
          veterinarianId: { type: "string", description: "ID veterinara (opcionalno)" },
          appointmentDate: { type: "string", description: "Datum u formatu YYYY-MM-DD" },
          appointmentTime: { type: "string", description: "Vrijeme u formatu HH:MM" },
          ownerFirstName: { type: "string", description: "Ime vlasnika" },
          ownerLastName: { type: "string", description: "Prezime vlasnika" },
          ownerEmail: { type: "string", description: "Email vlasnika" },
          ownerPhone: { type: "string", description: "Telefon vlasnika" },
          petName: { type: "string", description: "Ime ljubimca" },
          petSpeciesBreed: { type: "string", description: "Vrsta/rasa ljubimca (opcionalno)" },
          petNotes: { type: "string", description: "Napomene o ljubimcu (opcionalno)" }
        },
        required: ["serviceId", "appointmentDate", "appointmentTime", "ownerFirstName", "ownerLastName", "ownerEmail", "ownerPhone", "petName"]
      }
    }
  }
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!LOVABLE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AI servis nije konfigurisan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages }: ChatRequest = await req.json();
    
    // Get services and vets for context
    const { services, veterinarians } = await getServicesAndVets();
    
    const servicesInfo = services.map(s => 
      `- ${s.name} (ID: ${s.id}, trajanje: ${s.duration_minutes}min, cijena: ${s.price}KM)`
    ).join('\n');
    
    const vetsInfo = veterinarians.map(v => 
      `- ${v.name} (ID: ${v.id}, specijalizacija: ${v.specialization || 'Opšta praksa'})`
    ).join('\n');

    const today = new Date().toISOString().split('T')[0];

    const SYSTEM_PROMPT = `Ti si ljubazni AI asistent veterinarske ordinacije "VetHealth" u Banjaluci. Imaš mogućnost da direktno zakažeš termine za korisnike.

**Danas je: ${today}**

**Radno vrijeme**: Ponedjeljak - Petak, 09:00 - 17:00. Vikendom ne radimo.

**Dostupne usluge:**
${servicesInfo}

**Dostupni veterinari:**
${vetsInfo}

**PRAVILA ZA ZAKAZIVANJE:**
1. Kada korisnik želi zakazati termin, pitaj ga redom za:
   - Koju uslugu želi (ponudi listu)
   - Koji datum mu odgovara
   - Provjeri dostupne termine za taj datum
   - Koji termin želi
   - Ime i prezime vlasnika
   - Email adresu
   - Broj telefona
   - Ime ljubimca
   - Vrstu/rasu ljubimca (opcionalno)
   - Napomenu/razlog posjete (opcionalno)

2. NIKADA ne zakazuj termin bez svih obaveznih podataka.
3. Kada imaš sve podatke, koristi funkciju book_appointment.
4. Za provjeru slobodnih termina koristi funkciju get_available_slots.
5. Potvrdi svaki podatak prije konačnog zakazivanja.

**Kontakt informacije:**
- Telefon: +387 51 123 456
- Hitni slučajevi: +387 65 123 456
- Email: info@vetbl.com
- Adresa: Ulica Veterinara 123, 78000 Banja Luka

Budi ljubazan, profesionalan i vodi korisnika korak po korak kroz proces zakazivanja. Odgovaraj na srpskom jeziku (latinica).`;

    const fullMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-15)
    ];

    // First API call with tools
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: fullMessages,
        tools: tools,
        tool_choice: "auto",
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Previše zahtjeva. Molimo sačekajte trenutak." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    // Check if there's a tool call
    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      console.log("Tool call:", functionName, args);

      let toolResult: any;

      if (functionName === "get_available_slots") {
        toolResult = await getAvailableSlots(args.date, args.veterinarianId);
      } else if (functionName === "book_appointment") {
        toolResult = await bookAppointment(args);
      }

      console.log("Tool result:", toolResult);

      // Second API call with tool result
      const followUpMessages = [
        ...fullMessages,
        choice.message,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        }
      ];

      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: followUpMessages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!followUpResponse.ok) {
        throw new Error("Follow-up API error");
      }

      const followUpData = await followUpResponse.json();
      const assistantMessage = followUpData.choices?.[0]?.message?.content || toolResult.message;

      return new Response(
        JSON.stringify({ 
          message: assistantMessage,
          bookingSuccess: toolResult.success === true,
          appointmentId: toolResult.appointmentId
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No tool call, return direct response
    const assistantMessage = choice?.message?.content || "Žao mi je, trenutno ne mogu odgovoriti.";

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in live-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Greška pri obradi zahtjeva",
        message: "Žao mi je, trenutno imam tehničkih poteškoća. Molimo kontaktirajte nas na telefon +387 51 123 456."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
