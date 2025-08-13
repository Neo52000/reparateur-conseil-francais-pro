import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { detectLanguageClient } from '@/utils/languageDetection';
import { logConversationEvent } from '@/utils/analyticsLogger';
import { sendMessageViaRouter, startConversationViaRouter } from '@/services/aiRouter';

interface AIResponse {
  response: string;
  provider: string;
  language: 'fr' | 'en';
  confidence?: number;
  suggestions?: string[];
  actions?: any[];
  latency_ms?: number;
}

export function useAIProvider() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const send = async (text: string, opts?: { languageHint?: 'fr' | 'en'; sessionId?: string }) => {
    setLoading(true);
    const lang = detectLanguageClient(text, opts?.languageHint);
    const start = Date.now();
    try {
      const res = await sendMessageViaRouter(text, {
        languageHint: lang,
        sessionId: opts?.sessionId,
        userId: user?.id || null,
      });

      await logConversationEvent('chat.message', {
        provider: res.provider,
        latency_ms: res.latency_ms ?? Date.now() - start,
        language: res.language,
        confidence: res.confidence ?? null
      }, user?.id || undefined);

      return res as AIResponse;
    } finally {
      setLoading(false);
    }
  };

  const start = async (opts?: { languageHint?: 'fr' | 'en'; sessionId?: string }) => {
    const lang = opts?.languageHint ?? (typeof navigator !== 'undefined' && navigator.language.startsWith('fr') ? 'fr' : 'en');
    const res = await startConversationViaRouter({
      languageHint: lang,
      sessionId: opts?.sessionId,
      userId: user?.id || null,
    });
    return res as AIResponse & { conversation_id: string };
  };

  return { loading, send, start };
}
