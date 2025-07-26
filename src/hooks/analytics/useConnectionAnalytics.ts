/**
 * Hook pour le tracking et l'analyse des connexions utilisateur
 * Automatise l'enregistrement des événements de session
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ConnectionEvent {
  id: string;
  user_id: string | null;
  session_id: string;
  event_type: 'login' | 'logout' | 'session_timeout';
  user_role?: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: any;
  location_info?: any;
  session_duration?: number;
  created_at: string;
}

export interface ConnectionStats {
  date: string;
  event_type: string;
  user_role: string;
  event_count: number;
  unique_users: number;
  avg_session_duration: number;
}

/**
 * Hook principal pour la gestion des analytics de connexion
 */
export const useConnectionAnalytics = () => {
  const { toast } = useToast();
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  /**
   * Génère un ID de session unique
   */
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Détecte les informations du device et de localisation
   */
  const getDeviceInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }, []);

  /**
   * Enregistre un événement de connexion
   */
  const logConnectionEvent = useCallback(async (
    eventType: 'login' | 'logout' | 'session_timeout',
    userRole?: string,
    sessionDuration?: number
  ) => {
    try {
      const user = await supabase.auth.getUser();
      const sessionId = currentSessionId || generateSessionId();

      const eventData = {
        user_id: user.data.user?.id || null,
        session_id: sessionId,
        event_type: eventType,
        user_role: userRole,
        device_info: getDeviceInfo(),
        session_duration: sessionDuration
      };

      const { error } = await supabase
        .from('connection_analytics')
        .insert([eventData]);

      if (error) {
        console.error('Erreur lors de l\'enregistrement de l\'événement:', error);
        return;
      }

      // Mettre à jour l'état local
      if (eventType === 'login') {
        setCurrentSessionId(sessionId);
        setSessionStartTime(Date.now());
      } else if (eventType === 'logout') {
        setCurrentSessionId(null);
        setSessionStartTime(null);
      }

    } catch (error) {
      console.error('Erreur dans logConnectionEvent:', error);
    }
  }, [currentSessionId, generateSessionId, getDeviceInfo]);

  /**
   * Déclenche automatiquement le login event
   */
  const trackLogin = useCallback(async (userRole?: string) => {
    await logConnectionEvent('login', userRole);
  }, [logConnectionEvent]);

  /**
   * Déclenche automatiquement le logout event avec durée de session
   */
  const trackLogout = useCallback(async (userRole?: string) => {
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : undefined;
    await logConnectionEvent('logout', userRole, duration);
  }, [logConnectionEvent, sessionStartTime]);

  /**
   * Déclenche un timeout de session
   */
  const trackSessionTimeout = useCallback(async (userRole?: string) => {
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : undefined;
    await logConnectionEvent('session_timeout', userRole, duration);
  }, [logConnectionEvent, sessionStartTime]);

  /**
   * Auto-setup des listeners d'événements
   */
  useEffect(() => {
    // Listener pour les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Déterminer le rôle utilisateur depuis les métadonnées ou profil
        const userRole = session.user.user_metadata?.role || 'user';
        await trackLogin(userRole);
      } else if (event === 'SIGNED_OUT') {
        await trackLogout();
      }
    });

    // Cleanup pour logout automatique à la fermeture
    const handleBeforeUnload = () => {
      if (currentSessionId) {
        // Utilisation de sendBeacon pour garantir l'envoi
        navigator.sendBeacon('/api/analytics/logout', JSON.stringify({
          sessionId: currentSessionId,
          duration: sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackLogin, trackLogout, currentSessionId, sessionStartTime]);

  return {
    trackLogin,
    trackLogout,
    trackSessionTimeout,
    currentSessionId,
    sessionStartTime
  };
};

/**
 * Hook pour récupérer les statistiques de connexion (admin uniquement)
 */
export const useConnectionStats = (startDate?: Date, endDate?: Date) => {
  const [stats, setStats] = useState<ConnectionStats[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_connection_stats', {
        start_date: startDate?.toISOString().split('T')[0] || undefined,
        end_date: endDate?.toISOString().split('T')[0] || undefined
      });

      if (error) {
        toast({
          title: "Erreur de chargement",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setStats(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de connexion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    refetch: loadStats
  };
};