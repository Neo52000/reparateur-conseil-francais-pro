import { supabase } from "@/integrations/supabase/client";

export async function logConversationEvent(eventType: string, data: any, userId?: string) {
  try {
    // Lightweight aggregate metric
    await supabase.rpc('increment_chatbot_metric', {
      metric_name: eventType,
      increment_by: 1,
    });

    // Optional: finer-grained metrics when available (provider, language)
    if (data?.provider) {
      await supabase.rpc('increment_chatbot_metric', {
        metric_name: `${eventType}.${data.provider}`,
        increment_by: 1,
      });
    }
    if (data?.language) {
      await supabase.rpc('increment_chatbot_metric', {
        metric_name: `${eventType}.lang.${data.language}`,
        increment_by: 1,
      });
    }
  } catch (e) {
    console.warn('Analytics log failed', e);
  }
}
