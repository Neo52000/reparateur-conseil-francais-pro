import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PendingScrapingSession {
  id: string;
  session_id: string;
  city: string;
  source: string;
  results_count: number;
  result_data: any[];
  created_at: string;
  expires_at: string;
  status: string;
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
}

export const useScrapingPersistence = () => {
  const [pendingSessions, setPendingSessions] = useState<PendingScrapingSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate a new session ID
  const createSession = useCallback(() => {
    const sessionId = crypto.randomUUID();
    setCurrentSessionId(sessionId);
    return sessionId;
  }, []);

  // Save results progressively during scraping
  const saveResults = useCallback(async (
    sessionId: string,
    results: GooglePlaceResult[],
    metadata: {
      city: string;
      source?: string;
      searchMode?: string;
      department?: string;
      departments?: string[];
      region?: string;
    }
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn('No authenticated user, cannot save scraping results');
        return false;
      }

      // Calculate expiry (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const locationLabel = metadata.region || metadata.department || metadata.city;

      // Check if session already exists
      const { data: existing } = await supabase
        .from('scraping_pending_results')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      // Cast results to JSON-compatible format
      const resultDataJson = JSON.parse(JSON.stringify(results));

      if (existing) {
        // Update existing session
        const { error } = await supabase
          .from('scraping_pending_results')
          .update({
            result_data: resultDataJson,
            results_count: results.length,
            expires_at: expiresAt.toISOString(),
          })
          .eq('session_id', sessionId);

        if (error) throw error;
      } else {
        // Create new session
        const { error } = await supabase
          .from('scraping_pending_results')
          .insert([{
            session_id: sessionId,
            user_id: userData.user.id,
            city: locationLabel,
            source: metadata.source || 'google_places',
            result_data: resultDataJson,
            results_count: results.length,
            expires_at: expiresAt.toISOString(),
            status: 'pending',
          }]);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error saving scraping results:', error);
      return false;
    }
  }, []);

  // Load pending sessions
  const loadPendingSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('scraping_pending_results')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingSessions((data || []).map(session => ({
        ...session,
        result_data: session.result_data as any[]
      })));
    } catch (error) {
      console.error('Error loading pending sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Resume a session (load its results)
  const resumeSession = useCallback(async (sessionId: string): Promise<GooglePlaceResult[]> => {
    try {
      const { data, error } = await supabase
        .from('scraping_pending_results')
        .select('result_data, session_id')
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;

      setCurrentSessionId(sessionId);
      // Parse result_data safely
      const resultData = data?.result_data;
      if (Array.isArray(resultData)) {
        return resultData as unknown as GooglePlaceResult[];
      }
      return [];
    } catch (error) {
      console.error('Error resuming session:', error);
      return [];
    }
  }, []);

  // Mark session as imported
  const markAsImported = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('scraping_pending_results')
        .update({
          status: 'imported',
          imported_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      setPendingSessions(prev => prev.filter(s => s.session_id !== sessionId));
      
      toast({
        title: "Session marquée comme importée",
        description: "Les résultats ont été importés avec succès",
      });
    } catch (error) {
      console.error('Error marking session as imported:', error);
    }
  }, [toast]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('scraping_pending_results')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;

      setPendingSessions(prev => prev.filter(s => s.session_id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }

      toast({
        title: "Session supprimée",
        description: "Les résultats en attente ont été supprimés",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la session",
        variant: "destructive",
      });
    }
  }, [currentSessionId, toast]);

  // Load sessions on mount
  useEffect(() => {
    loadPendingSessions();
  }, [loadPendingSessions]);

  return {
    pendingSessions,
    currentSessionId,
    loading,
    createSession,
    saveResults,
    loadPendingSessions,
    resumeSession,
    markAsImported,
    deleteSession,
  };
};
