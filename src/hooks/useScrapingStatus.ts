
import { useState, useEffect } from 'react';
import { supabase, ScrapingLog } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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

      setLogs(data || []);
      setIsScrapingRunning(data?.some(log => log.status === 'running') || false);
    } catch (error) {
      console.error('Error fetching scraping logs:', error);
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
