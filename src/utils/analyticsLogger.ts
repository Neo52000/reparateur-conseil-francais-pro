import { supabase } from "@/integrations/supabase/client";

export async function logConversationEvent(eventType: string, data: any, userId?: string) {
  try {
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_data: data,
      user_id: userId ?? null
    });
  } catch (e) {
    console.warn('Analytics log failed', e);
  }
}
