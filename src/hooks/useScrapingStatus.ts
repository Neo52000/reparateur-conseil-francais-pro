
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScrapingLog {
  id: string;
  source: string;
  status: 'running' | 'completed' | 'failed';
  items_scraped: number;
  items_added: number;
  items_updated: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export const useScrapingStatus = () => {
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrapingRunning, setIsScrapingRunning] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Cast the data to our ScrapingLog type, ensuring status is properly typed
      const typedLogs: ScrapingLog[] = (data || []).map(log => ({
        ...log,
        status: log.status as 'running' | 'completed' | 'failed'
      }));

      setLogs(typedLogs);
      setIsScrapingRunning(typedLogs.some(log => log.status === 'running') || false);
    } catch (error) {
      console.error('Error fetching scraping logs:', error);
      setLogs([]);
      setIsScrapingRunning(false);
    } finally {
      setLoading(false);
    }
  };

  const startScraping = async (source: string) => {
    try {
      const { error } = await supabase.functions.invoke('scrape-repairers', {
        body: { source }
      });

      if (error) throw error;

      toast({
        title: "Scraping démarré",
        description: `Le scraping de ${source} a été lancé en arrière-plan.`
      });

      // Rafraîchir les logs après un délai
      setTimeout(fetchLogs, 2000);
    } catch (error) {
      console.error('Error starting scraping:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le scraping.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchLogs();

    // Écouter les changements en temps réel
    const subscription = supabase
      .channel('scraping_logs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scraping_logs'
      }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    logs,
    loading,
    isScrapingRunning,
    startScraping,
    refetch: fetchLogs
  };
};
