
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: any;
  created_at: string;
}

export const useAnalyticsEvents = (userId?: string) => {
  const [saving, setSaving] = useState(false);

  const logEvent = useCallback(async (event_type: string, event_data: any) => {
    setSaving(true);
    await supabase.from("analytics_events").insert([{ user_id: userId, event_type, event_data }]);
    setSaving(false);
  }, [userId]);

  return { logEvent, saving };
};
