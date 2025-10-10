import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables");
}

const supabaseAdmin = SUPABASE_URL && SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  : null;

async function callLovableAI(userMessage: string, context: any) {
  if (!LOVABLE_API_KEY) {
    throw new Error("Missing Lovable API key");
  }

  const systemPrompt = `
Tu es Alex, assistant expert du diagnostic smartphone pour notre marketplace de réparateurs.
Objectifs: proactivité, multi-intents (FAQ, devis, RDV, garanties), pré-diagnostic rapide, personnalisation, et escalade fluide.

Sortie STRICTEMENT en JSON une seule ligne sans backticks:
{
  "reply": string,                      // Réponse naturelle en français
  "intent": string,                     // one of: faq, diagnostic, quote, booking, status, pricing, warranty, smalltalk, escalate, unknown
  "confidence": number,                 // 0..1
  "suggestions": string[],              // 0..4 propositions cliquables
  "actions": string[],                  // ex: ["create_quote", "book_appointment", "connect_agent"]
  "entities": {                         // si possible
    "device_brand"?: string,
    "device_model"?: string,
    "issue"?: string,
    "postal_code"?: string,
    "email"?: string,
    "name"?: string
  }
}

Règles:
- Si l’utilisateur semble hésiter ou commence une nouvelle session, propose une accroche courte et 2-3 questions ciblées de diagnostic.
- Si l’intent est booking/quote, propose l’étape suivante et rappelle la garantie.
- Si manque d’infos, pose une question précise.
- En cas d’incertitude, confidence <= 0.6 et propose escalade.
`;

  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt },
      ...(context?.history ? context.history : []),
      { role: "user", content: userMessage },
    ],
    temperature: 0.5,
  };

  console.log("Calling Lovable AI Gateway with Gemini...");
  
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errTxt = await res.text();
    console.error(`Lovable AI error: ${res.status} ${errTxt}`);
    
    // Gérer les erreurs de rate limit et de paiement
    if (res.status === 429) {
      throw new Error("Rate limit dépassé. Veuillez réessayer dans quelques instants.");
    }
    if (res.status === 402) {
      throw new Error("Crédits insuffisants. Veuillez ajouter des crédits à votre workspace.");
    }
    
    throw new Error(`Lovable AI error: ${res.status} ${errTxt}`);
  }

  const data = await res.json();
  console.log("Lovable AI response received");
  const content = data?.choices?.[0]?.message?.content || "";

  // Essayer de parser le JSON de sortie
  let parsed: any = null;
  try {
    // prendre la première ligne qui ressemble à un JSON
    const line = content.trim().split("\n").find((l: string) => l.trim().startsWith("{") && l.trim().endsWith("}")) ?? content.trim();
    parsed = JSON.parse(line);
  } catch (_) {
    // Fallback minimal
    parsed = {
      reply: content || "Je suis là pour vous aider à diagnostiquer votre panne.",
      intent: "unknown",
      confidence: 0.5,
      suggestions: ["Obtenir un devis", "Prendre rendez-vous", "Parler à un agent"],
      actions: ["create_quote", "book_appointment", "connect_agent"],
      entities: {},
    };
  }

  return parsed;
}

async function logCrmActivity(owner_id: string | null, payload: {
  contact_id?: string | null;
  deal_id?: string | null;
  content: string;
  intent?: string;
  confidence?: number;
  meta?: Record<string, unknown>;
}) {
  if (!supabaseAdmin || !owner_id) return;
  try {
    await supabaseAdmin.from("crm_activities").insert({
      owner_id,
      type: "chat",
      contact_id: payload.contact_id ?? null,
      deal_id: payload.deal_id ?? null,
      content: payload.content,
      data: {
        intent: payload.intent,
        confidence: payload.confidence,
        ...payload.meta,
      },
    });
  } catch (e) {
    console.error("Failed to log CRM activity", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, session_id, user_id, owner_id, message } = await req.json();

    if (action === "start_conversation") {
      const conversation_id = crypto.randomUUID();
      const greeting = "Bonjour 👋 Je suis Alex, votre assistant réparation. Quel est le souci principal avec votre téléphone (écran, batterie, ne s’allume plus, autre) ?";

      return new Response(
        JSON.stringify({
          conversation_id,
          message: greeting,
          suggestions: [
            "Écran fissuré",
            "Batterie qui se décharge vite",
            "Le téléphone ne s’allume plus",
          ],
          actions: ["diagnostic_start", "create_quote"],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "send_message") {
      const userMsg: string = message?.content ?? "";
      const convId: string = message?.conversation_id ?? crypto.randomUUID();

      const parsed = await callLovableAI(userMsg, { history: [] });

      // Journaliser côté CRM (si owner fourni)
      await logCrmActivity(owner_id ?? null, {
        content: `Q: ${userMsg}\nA: ${parsed.reply}`,
        intent: parsed.intent,
        confidence: parsed.confidence,
        meta: { convId, session_id: session_id ?? null, user_id: user_id ?? null, entities: parsed.entities },
      });

      return new Response(
        JSON.stringify({
          response: parsed.reply,
          intent: parsed.intent,
          confidence: parsed.confidence,
          suggestions: parsed.suggestions ?? [],
          actions: parsed.actions ?? [],
          conversation_id: convId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("chatbot-gpt5 error", error);
    return new Response(JSON.stringify({ error: error?.message ?? "Unexpected error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
