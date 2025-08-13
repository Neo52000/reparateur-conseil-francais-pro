import { supabase } from '@/integrations/supabase/client';
import { detectLanguageClient } from '@/utils/languageDetection';

// Types alignés avec l'Edge Function ai-router
export interface AIRouterResponse {
  response: string;
  provider: string;
  language: 'fr' | 'en';
  confidence?: number;
  suggestions?: string[];
  actions?: any[];
  latency_ms?: number;
  conversation_id?: string;
}

function isLowQuality(answer: string): boolean {
  const a = (answer || '').toLowerCase().trim();
  if (a.length < 10) return true;
  const refusalHints = [
    "i can't", "i cannot", "can't help", 'sorry',
    'désolé', "je ne peux pas", 'impossible', 'no puedo'
  ];
  return refusalHints.some(h => a.includes(h));
}

function buildFallback(text?: string, langHint?: 'fr' | 'en'): AIRouterResponse {
  const lang = detectLanguageClient(text, langHint);
  const isFr = lang === 'fr';
  return {
    response: isFr
      ? "Je ne peux pas contacter le service d'IA pour le moment. Voici quelques actions possibles :\n• Décrire le symptôme (ex: 'écran noir', 'ne charge plus')\n• Demander un devis\n• Prendre rendez-vous"
      : "I can't reach the AI service right now. You can try:\n• Describe the symptom (e.g., 'black screen', 'won't charge')\n• Request a quote\n• Book an appointment",
    provider: 'fallback',
    language: lang,
    confidence: 0.3,
    suggestions: isFr
      ? ['Demander un devis', 'Prendre rendez-vous', 'Parler à un humain']
      : ['Request a quote', 'Book an appointment', 'Talk to a human'],
    actions: [
      { type: 'open_booking', label: isFr ? 'Prendre rendez-vous' : 'Book appointment' },
      { type: 'open_faq', label: isFr ? 'FAQ' : 'FAQ' }
    ],
    latency_ms: 0,
    conversation_id: 'offline'
  };
}

export async function sendMessageViaRouter(
  text: string,
  opts?: {
    languageHint?: 'fr' | 'en';
    sessionId?: string;
    userId?: string | null;
    providerOverride?: string;
  }
): Promise<AIRouterResponse> {
  const lang = detectLanguageClient(text, opts?.languageHint);
  const startedAt = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('ai-router', {
      body: {
        action: 'send_message',
        text,
        language_hint: lang,
        session_id: opts?.sessionId,
        user_id: opts?.userId ?? null,
        provider_override: opts?.providerOverride ?? null,
      },
    });
    if (error) throw error;

    const res = data as AIRouterResponse;
    // Contrôle qualité minimal côté client pour déclencher un fallback doux
    if (!res?.response || isLowQuality(res.response)) {
      return { ...buildFallback(text, lang), latency_ms: Date.now() - startedAt };
    }
    return { ...res, latency_ms: res.latency_ms ?? Date.now() - startedAt };
  } catch (e) {
    return { ...buildFallback(text, lang), latency_ms: Date.now() - startedAt };
  }
}

export async function startConversationViaRouter(
  opts?: { languageHint?: 'fr' | 'en'; sessionId?: string; userId?: string | null; providerOverride?: string }
): Promise<AIRouterResponse & { conversation_id: string }> {
  const lang = opts?.languageHint ?? (typeof navigator !== 'undefined' && navigator.language.startsWith('fr') ? 'fr' : 'en');
  const startedAt = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('ai-router', {
      body: {
        action: 'start_conversation',
        language_hint: lang,
        session_id: opts?.sessionId,
        user_id: opts?.userId ?? null,
        provider_override: opts?.providerOverride ?? null,
      },
    });
    if (error) throw error;
    const res = data as AIRouterResponse & { conversation_id: string };
    return { ...res, latency_ms: res.latency_ms ?? Date.now() - startedAt };
  } catch (e) {
    const fb = buildFallback(undefined, lang);
    return { ...fb, conversation_id: fb.conversation_id || 'offline', latency_ms: Date.now() - startedAt };
  }
}
