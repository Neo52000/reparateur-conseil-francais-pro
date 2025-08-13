import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { detectLanguageClient } from '@/utils/languageDetection';
import { logConversationEvent } from '@/utils/analyticsLogger';

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
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          action: 'send_message',
          text,
          language_hint: lang,
          session_id: opts?.sessionId,
          user_id: user?.id || null
        }
      });
      if (error) throw error;
      const res = data as AIResponse;

      await logConversationEvent('chat.message', {
        provider: res.provider,
        latency_ms: res.latency_ms ?? Date.now() - start,
        language: res.language,
        confidence: res.confidence ?? null
      }, user?.id || undefined);

      return res;
    } finally {
      setLoading(false);
    }
  };

  const start = async (opts?: { languageHint?: 'fr' | 'en'; sessionId?: string }) => {
    const lang = opts?.languageHint ?? (typeof navigator !== 'undefined' && navigator.language.startsWith('fr') ? 'fr' : 'en');
    const { data, error } = await supabase.functions.invoke('ai-router', {
      body: {
        action: 'start_conversation',
        language_hint: lang,
        session_id: opts?.sessionId
      }
    });
    if (error) throw error;
    return data as AIResponse & { conversation_id: string };
  };

  return { loading, send, start };
}
