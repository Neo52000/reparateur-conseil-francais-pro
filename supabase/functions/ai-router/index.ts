import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple language detection (fr/en)
function detectLanguage(text?: string, hint?: string): 'fr' | 'en' {
  if (hint === 'fr' || hint === 'en') return hint;
  const t = (text || '').toLowerCase();
  const frenchHints = ['bonjour', 'salut', 'problème', 'écran', 'batterie', 'réparation', 'devis'];
  const isFr = frenchHints.some(w => t.includes(w)) || /[àâçéèêëîïôûùüÿœ]/.test(t);
  return isFr ? 'fr' : 'en';
}

// Quality heuristic: minimal length and not a refusal
function isLowQuality(answer: string): boolean {
  const a = answer.trim();
  if (a.length < 12) return true;
  if (/i cannot|can't assist|sorry, i can't|désolé.*je ne peux/i.test(a)) return true;
  return false;
}

async function callOpenAICompatible(baseUrl: string, apiKey: string, model: string, systemPrompt: string, userContent: string) {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.5,
      max_tokens: 500
    })
  });
  if (!res.ok) throw new Error(`OpenAI-compatible error: ${res.status}`);
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? '';
  return { text };
}

async function callOpenAI(userContent: string, systemPrompt: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.5,
      max_tokens: 500
    })
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? '';
  return { text };
}

async function callMistral(userContent: string, systemPrompt: string) {
  const apiKey = Deno.env.get('MISTRAL_API_KEY');
  if (!apiKey) throw new Error('MISTRAL_API_KEY missing');
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.5,
      max_tokens: 500
    })
  });
  if (!res.ok) throw new Error(`Mistral error: ${res.status}`);
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? '';
  return { text };
}

async function callDeepSeek(userContent: string, systemPrompt: string) {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY missing');
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.5,
      max_tokens: 500
    })
  });
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`);
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? '';
  return { text };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, text, language_hint, session_id, user_id } = body || {};

    if (action === 'start_conversation') {
      const lang = (language_hint as 'fr' | 'en') || 'fr';
      const message = lang === 'fr'
        ? "Bonjour ! Je suis votre assistant de pré-diagnostic. Décrivez le problème de votre smartphone."
        : "Hello! I'm your pre-diagnosis assistant. Please describe your phone issue.";
      const suggestions = lang === 'fr'
        ? ["Écran cassé", "Batterie qui se décharge", "Téléphone ne s'allume plus"]
        : ["Cracked screen", "Battery draining fast", "Phone won't turn on"];
      return new Response(JSON.stringify({
        conversation_id: session_id || `conv_${Date.now()}`,
        message,
        suggestions,
        actions: [
          { action: 'request_location', type: 'location', label: lang === 'fr' ? 'Partager ma localisation' : 'Share my location' }
        ]
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action !== 'send_message') {
      return new Response(JSON.stringify({ error: 'Unsupported action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const lang = detectLanguage(text, language_hint);
    const systemPrompt = lang === 'fr'
      ? "Tu es un assistant de pré-diagnostic pour la réparation de smartphones. Réponds en français de façon concise, utile, et propose des prochaines étapes (FAQ ou prise de RDV) si nécessaire."
      : "You are a pre-diagnosis assistant for smartphone repairs. Reply in English concisely, helpfully, and suggest next steps (FAQ or booking) if useful.";

    const providers: Array<{
      name: string;
      fn: () => Promise<{ text: string }>;
    }> = [];

    const gptOssUrl = Deno.env.get('GPT_OSS_BASE_URL');
    const gptOssKey = Deno.env.get('GPT_OSS_API_KEY');
    if (gptOssUrl && gptOssKey) {
      providers.push({
        name: 'gpt-oss',
        fn: () => callOpenAICompatible(gptOssUrl, gptOssKey, 'gpt-oss-120b', systemPrompt, text)
      });
    }

    if (Deno.env.get('OPENAI_API_KEY')) {
      providers.push({ name: 'openai', fn: () => callOpenAI(text, systemPrompt) });
    }
    if (Deno.env.get('MISTRAL_API_KEY')) {
      providers.push({ name: 'mistral', fn: () => callMistral(text, systemPrompt) });
    }
    if (Deno.env.get('DEEPSEEK_API_KEY')) {
      providers.push({ name: 'deepseek', fn: () => callDeepSeek(text, systemPrompt) });
    }

    const start = Date.now();
    let usedProvider = 'none';
    let answer = '';
    for (const p of providers) {
      try {
        const { text: out } = await p.fn();
        if (!isLowQuality(out)) {
          usedProvider = p.name;
          answer = out;
          break;
        }
      } catch (_e) {
        // try next
      }
    }

    if (!answer) {
      // Fallback conversational mode
      const msg = lang === 'fr'
        ? "Je ne peux pas joindre l'IA pour le moment. Voulez-vous consulter notre FAQ ou prendre rendez-vous ?"
        : "I can't reach the AI right now. Would you like to see our FAQ or book an appointment?";
      const actions = [
        { action: 'open_faq', type: 'link', label: lang === 'fr' ? 'Ouvrir la FAQ' : 'Open FAQ' },
        { action: 'book_appointment', type: 'booking', label: lang === 'fr' ? 'Prendre rendez-vous' : 'Book appointment' }
      ];
      return new Response(JSON.stringify({
        response: msg,
        provider: 'fallback',
        language: lang,
        confidence: 0.4,
        suggestions: lang === 'fr' ? ["Obtenir un devis", "Trouver un réparateur"] : ["Get a quote", "Find a repairer"],
        actions,
        latency_ms: Date.now() - start
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      response: answer,
      provider: usedProvider,
      language: lang,
      confidence: 0.75,
      suggestions: lang === 'fr' ? ["Continuer le diagnostic", "Trouver un réparateur"] : ["Continue diagnosis", "Find a repairer"],
      actions: [
        { action: 'request_location', type: 'location', label: lang === 'fr' ? 'Partager ma localisation' : 'Share my location' }
      ],
      latency_ms: Date.now() - start
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('ai-router error', e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});