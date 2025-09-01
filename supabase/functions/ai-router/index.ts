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

// Integrated Fallback Chatbot Logic
interface FallbackResponse {
  response: string;
  suggestions: string[];
  actions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
  confidence: number;
}

interface KeywordPattern {
  keywords: string[];
  response: string;
  suggestions: string[];
  actions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
}

function createFallbackPatterns(language: 'fr' | 'en'): KeywordPattern[] {
  if (language === 'fr') {
    return [
      {
        keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'hey'],
        response: "Bonjour ! Je suis là pour vous aider avec la réparation de votre smartphone. Comment puis-je vous assister aujourd'hui ?",
        suggestions: ["Demander un devis", "Trouver un réparateur", "Questions fréquentes"],
        actions: [
          { type: 'redirect', label: 'Voir les réparateurs', data: { url: '/repairers' } }
        ]
      },
      {
        keywords: ['devis', 'prix', 'coût', 'tarif', 'combien', 'estimation'],
        response: "Pour obtenir un devis personnalisé, j'ai besoin de quelques informations sur votre appareil. Quelle est la marque et le modèle de votre smartphone ?",
        suggestions: ["iPhone", "Samsung", "Huawei", "Xiaomi", "Autre marque"],
        actions: [
          { type: 'form', label: 'Formulaire de devis', data: { form: 'quote' } }
        ]
      },
      {
        keywords: ['écran', 'cassé', 'fissure', 'noir', 'tactile'],
        response: "Les problèmes d'écran sont très courants. Selon le modèle, le remplacement d'écran coûte généralement entre 50€ et 200€. Voulez-vous trouver un réparateur près de chez vous ?",
        suggestions: ["Trouver un réparateur", "Demander un devis", "Conseils préventifs"],
        actions: [
          { type: 'location', label: 'Réparateurs à proximité' }
        ]
      },
      {
        keywords: ['batterie', 'charge', 'autonomie', 'décharge'],
        response: "Les problèmes de batterie sont fréquents après 2-3 ans d'utilisation. Le changement de batterie coûte généralement entre 30€ et 80€ selon le modèle.",
        suggestions: ["Changer la batterie", "Conseils d'entretien", "Diagnostic gratuit"],
        actions: [
          { type: 'tips', label: 'Conseils batterie' }
        ]
      },
      {
        keywords: ['réparateur', 'proche', 'près', 'magasin', 'atelier'],
        response: "Je peux vous aider à trouver des réparateurs qualifiés près de chez vous. Dans quelle ville vous trouvez-vous ?",
        suggestions: ["Paris", "Lyon", "Marseille", "Toulouse", "Autre ville"],
        actions: [
          { type: 'location', label: 'Géolocalisation' },
          { type: 'redirect', label: 'Carte des réparateurs', data: { url: '/repairers' } }
        ]
      },
      {
        keywords: ['urgent', 'vite', 'rapide', 'immédiat', 'express'],
        response: "Pour une réparation urgente, je recommande nos partenaires avec service express. Ils peuvent généralement intervenir dans les 24h.",
        suggestions: ["Service express", "Réparation à domicile", "Dépannage immédiat"],
        actions: [
          { type: 'urgent', label: 'Service express' }
        ]
      },
      {
        keywords: ['garantie', 'assurance', 'sav', 'remboursement'],
        response: "Tous nos réparateurs partenaires offrent une garantie sur leurs interventions. La durée varie selon le type de réparation (3 à 12 mois).",
        suggestions: ["Conditions de garantie", "Faire jouer la garantie", "SAV"],
        actions: [
          { type: 'info', label: 'Conditions de garantie' }
        ]
      }
    ];
  } else {
    return [
      {
        keywords: ['hello', 'hi', 'hey', 'bonjour', 'good morning'],
        response: "Hello! I'm here to help you with smartphone repairs. How can I assist you today?",
        suggestions: ["Get a quote", "Find a repairer", "FAQ"],
        actions: [
          { type: 'redirect', label: 'View repairers', data: { url: '/repairers' } }
        ]
      },
      {
        keywords: ['quote', 'price', 'cost', 'estimate', 'how much'],
        response: "To provide a personalized quote, I need some information about your device. What's the brand and model of your smartphone?",
        suggestions: ["iPhone", "Samsung", "Huawei", "Xiaomi", "Other brand"],
        actions: [
          { type: 'form', label: 'Quote form', data: { form: 'quote' } }
        ]
      },
      {
        keywords: ['screen', 'broken', 'crack', 'black', 'touch'],
        response: "Screen problems are very common. Depending on the model, screen replacement usually costs between €50 and €200. Would you like to find a repairer near you?",
        suggestions: ["Find a repairer", "Get a quote", "Prevention tips"],
        actions: [
          { type: 'location', label: 'Nearby repairers' }
        ]
      },
      {
        keywords: ['battery', 'charge', 'drain', 'power'],
        response: "Battery problems are common after 2-3 years of use. Battery replacement usually costs between €30 and €80 depending on the model.",
        suggestions: ["Replace battery", "Maintenance tips", "Free diagnosis"],
        actions: [
          { type: 'tips', label: 'Battery tips' }
        ]
      },
      {
        keywords: ['repairer', 'near', 'close', 'shop', 'store'],
        response: "I can help you find qualified repairers near you. What city are you in?",
        suggestions: ["Paris", "Lyon", "Marseille", "Toulouse", "Other city"],
        actions: [
          { type: 'location', label: 'Geolocation' },
          { type: 'redirect', label: 'Repairer map', data: { url: '/repairers' } }
        ]
      },
      {
        keywords: ['urgent', 'fast', 'quick', 'immediate', 'express'],
        response: "For urgent repairs, I recommend our partners with express service. They can usually intervene within 24 hours.",
        suggestions: ["Express service", "Home repair", "Emergency support"],
        actions: [
          { type: 'urgent', label: 'Express service' }
        ]
      },
      {
        keywords: ['warranty', 'guarantee', 'insurance', 'refund'],
        response: "All our partner repairers offer a warranty on their services. Duration varies by repair type (3 to 12 months).",
        suggestions: ["Warranty terms", "Claim warranty", "Customer service"],
        actions: [
          { type: 'info', label: 'Warranty conditions' }
        ]
      }
    ];
  }
}

function analyzeFallbackMessage(message: string, language: 'fr' | 'en'): FallbackResponse {
  const normalizedMessage = message.toLowerCase().trim();
  const patterns = createFallbackPatterns(language);
  
  // Search for keyword matches
  for (const pattern of patterns) {
    const matchedKeywords = pattern.keywords.filter(keyword => 
      normalizedMessage.includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      return {
        response: pattern.response,
        suggestions: pattern.suggestions,
        actions: pattern.actions,
        confidence: Math.min(0.85, matchedKeywords.length / pattern.keywords.length + 0.3)
      };
    }
  }
  
  // Default response if no match
  const defaultResponses = language === 'fr' ? [
    "Je comprends votre question. Pouvez-vous me donner plus de détails sur votre problème de smartphone ?",
    "Intéressant ! Pouvez-vous préciser le type de réparation dont vous avez besoin ?",
    "Je vais vous aider. Quel est exactement le problème avec votre téléphone ?",
    "D'accord, je vois. Pouvez-vous me dire quelle est la marque et le modèle de votre appareil ?"
  ] : [
    "I understand your question. Can you give me more details about your smartphone problem?",
    "Interesting! Can you specify what type of repair you need?",
    "I'll help you. What exactly is the problem with your phone?",
    "I see. Can you tell me the brand and model of your device?"
  ];
  
  const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  
  return {
    response: randomResponse,
    suggestions: language === 'fr' 
      ? ["Demander un devis", "Trouver un réparateur", "Questions fréquentes", "Parler à un conseiller"]
      : ["Get a quote", "Find a repairer", "FAQ", "Talk to an advisor"],
    confidence: 0.6
  };
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
      // Use integrated fallback chatbot for intelligent responses
      console.log('No AI provider available, using intelligent fallback for message:', text);
      const fallbackResponse = analyzeFallbackMessage(text, lang);
      
      return new Response(JSON.stringify({
        response: fallbackResponse.response,
        provider: 'local_chatbot',
        language: lang,
        confidence: fallbackResponse.confidence,
        suggestions: fallbackResponse.suggestions,
        actions: fallbackResponse.actions || [
          { action: 'open_faq', type: 'link', label: lang === 'fr' ? 'Ouvrir la FAQ' : 'Open FAQ' },
          { action: 'book_appointment', type: 'booking', label: lang === 'fr' ? 'Prendre rendez-vous' : 'Book appointment' }
        ],
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