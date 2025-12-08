import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

const SYSTEM_PROMPT = `Ti si ljubazni AI asistent veterinarske ordinacije "VetHealth" u Banjaluci. Tvoja uloga je da pomogneš vlasnicima kućnih ljubimaca sa informacijama o:

1. **Radno vrijeme**: Ponedjeljak - Petak od 09:00 do 17:00. Vikendom ne radimo.

2. **Usluge koje nudimo**:
   - Opšti pregledi i dijagnostika
   - Vakcinacije za pse, mačke i druge ljubimce
   - Hirurške intervencije (sterilizacija, kastracija)
   - Stomatologija (čišćenje zuba, ekstrakcije)
   - Laboratorijske analize
   - Kontrolni pregledi

3. **Zakazivanje termina**: Možeš ih uputiti na stranicu /zakazivanje-termina za online zakazivanje.

4. **Kontakt informacije**:
   - Telefon: +387 51 123 456
   - Hitni slučajevi: +387 65 123 456
   - Email: info@vetbl.com
   - Adresa: Ulica Veterinara 123, 78000 Banja Luka

5. **Hitni slučajevi**: Za hitne slučajeve van radnog vremena, uputiti na hitni broj telefona.

6. **Cjenovnik**: Možeš ih uputiti na stranicu /cjenovnik-usluga za pregled cijena.

Budi ljubazan, profesionalan i empatičan. Ako ne znaš odgovor, ljubazno uputi korisnika da kontaktira ordinaciju direktno. 
Odgovaraj na srpskom jeziku (latinica). Drži odgovore kratkim i jasnim.
NIKADA ne izmišljaj informacije o cijenama ili dostupnosti termina - za to uputi korisnika na odgovarajuće stranice ili kontakt.`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY is not set");
    return new Response(
      JSON.stringify({ error: "AI servis nije konfigurisan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages }: ChatRequest = await req.json();

    console.log("Chat request received with", messages.length, "messages");

    // Prepare messages with system prompt
    const fullMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-10) // Keep last 10 messages for context
    ];

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: fullMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "Žao mi je, trenutno ne mogu odgovoriti. Molimo kontaktirajte nas direktno.";

    console.log("AI response generated successfully");

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
