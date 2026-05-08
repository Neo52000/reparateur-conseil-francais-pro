
/**
 * Hook unifié pour tous les événements analytics
 * Intègre les analytics génériques ET les analytics de connexion
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useConnectionAnalytics } from "@/hooks/analytics/useConnectionAnalytics";

// Matches the `event_data` JSON column shape; metadata helpers below pass
// through to this same column so they share the type.
export type AnalyticsEventData = { [key: string]: Json | undefined };

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: AnalyticsEventData;
  created_at: string;
}

/**
 * Hook principal pour tous les événements analytics de l'application
 * Consolidation de la logique de tracking
 */
export const useAnalyticsEvents = (userId?: string) => {
  const [saving, setSaving] = useState(false);
  const connectionAnalytics = useConnectionAnalytics();

  /**
   * Enregistre un événement analytics générique
   */
  const logEvent = useCallback(async (event_type: string, event_data: AnalyticsEventData) => {
    setSaving(true);
    try {
      await supabase.from("analytics_events").insert([{ 
        user_id: userId, 
        event_type, 
        event_data 
      }]);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'événement:', error);
    } finally {
      setSaving(false);
    }
  }, [userId]);

  /**
   * Méthodes raccourcis pour les événements courants
   */
  const logPageView = useCallback((page: string, metadata?: AnalyticsEventData) => {
    return logEvent('page_view', { page, ...metadata });
  }, [logEvent]);

  const logUserAction = useCallback((action: string, target: string, metadata?: AnalyticsEventData) => {
    return logEvent('user_action', { action, target, ...metadata });
  }, [logEvent]);

  const logError = useCallback((error: string, context?: AnalyticsEventData) => {
    return logEvent('error', { error, context });
  }, [logEvent]);

  const logFeatureUsage = useCallback((feature: string, metadata?: AnalyticsEventData) => {
    return logEvent('feature_usage', { feature, ...metadata });
  }, [logEvent]);

  return { 
    // Analytics génériques
    logEvent,
    logPageView,
    logUserAction, 
    logError,
    logFeatureUsage,
    saving,
    
    // Analytics de connexion (délégation)
    trackLogin: connectionAnalytics.trackLogin,
    trackLogout: connectionAnalytics.trackLogout,
    trackSessionTimeout: connectionAnalytics.trackSessionTimeout,
    currentSessionId: connectionAnalytics.currentSessionId
  };
};
