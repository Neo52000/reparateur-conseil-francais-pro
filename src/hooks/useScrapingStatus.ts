
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScrapingLog {
  id: string;
  source: string;
  status: 'running' | 'completed' | 'failed';
  items_scraped: number;
  items_added: number;
  items_updated: number;
  items_pappers_verified?: number;
  items_pappers_rejected?: number;
  pappers_api_calls?: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export const useScrapingStatus = () => {
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrapingRunning, setIsScrapingRunning] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  const testSupabaseConnection = async () => {
    try {
      console.log('🔍 Test de connexion Supabase...');
      
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log('🔐 Session auth:', { 
        hasSession: !!authData.session, 
        error: authError?.message 
      });

      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ Erreur de test DB:', testError);
        throw testError;
      }

      console.log('✅ Connexion Supabase OK');
      return true;
    } catch (error) {
      console.error('💥 Erreur de connexion Supabase:', error);
      toast({
        title: "Erreur de connexion Supabase",
        description: "Impossible de se connecter à la base de données. Vérifiez votre connexion.",
        variant: "destructive"
      });
      return false;
    }
  };

  const fetchLogs = async () => {
    try {
      console.log('🔄 Tentative de récupération des logs de scraping...');
      
      const connectionOk = await testSupabaseConnection();
      if (!connectionOk) {
        setLogs([]);
        setIsScrapingRunning(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('scraping_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erreur lors de la récupération des logs:', error);
        console.error('📝 Détails de l\'erreur:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        toast({
          title: "Erreur de récupération des logs",
          description: `Impossible de récupérer les logs: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }

      console.log('✅ Logs récupérés avec succès:', data?.length || 0, 'entrées');

      const typedLogs: ScrapingLog[] = (data || []).map(log => ({
        ...log,
        status: log.status as 'running' | 'completed' | 'failed'
      }));

      setLogs(typedLogs);
      setIsScrapingRunning(typedLogs.some(log => log.status === 'running') || false);
    } catch (error) {
      console.error('💥 Erreur complète fetchLogs:', error);
      setLogs([]);
      setIsScrapingRunning(false);
    } finally {
      setLoading(false);
    }
  };

  const startScraping = async (source: string, testMode: boolean = false, departmentCode: string | null = null) => {
    try {
      console.log(`🚀 Démarrage du scraping ${testMode ? 'TEST' : 'MASSIF'} pour: ${source}${departmentCode ? ` - Département: ${departmentCode}` : ''}`);
      
      const connectionOk = await testSupabaseConnection();
      if (!connectionOk) {
        throw new Error('Connexion Supabase défaillante');
      }

      const { data, error } = await supabase.functions.invoke('scrape-repairers', {
        body: { 
          source, 
          testMode,
          departmentCode 
        }
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw error;
      }

      console.log('✅ Réponse Edge Function:', data);

      const scrapingType = testMode ? "🧪 Test" : "🚀 Scraping MASSIF";
      const locationText = departmentCode ? ` (Département ${departmentCode})` : " (Toute la France)";

      toast({
        title: `${scrapingType} démarré`,
        description: `${scrapingType} de ${source}${locationText} lancé. ${data?.classification_method ? `Méthode: ${data.classification_method}` : ''}`,
      });

      setTimeout(fetchLogs, 2000);
      
      return data;
    } catch (error) {
      console.error('💥 Erreur start scraping:', error);
      
      toast({
        title: "❌ Erreur de scraping",
        description: error.message || "Impossible de démarrer le scraping. Vérifiez les logs.",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const stopScraping = async () => {
    try {
      console.log('🛑 Demande d\'arrêt du scraping...');
      
      const { data, error } = await supabase.functions.invoke('stop-scraping');

      if (error) {
        console.error('❌ Erreur lors de l\'arrêt:', error);
        throw error;
      }

      console.log('✅ Réponse arrêt scraping:', data);

      toast({
        title: "🛑 Scraping arrêté",
        description: data?.message || "Le scraping a été arrêté avec succès",
      });

      setTimeout(fetchLogs, 1000);
      
      return data;
    } catch (error) {
      console.error('💥 Erreur stop scraping:', error);
      
      toast({
        title: "❌ Erreur d'arrêt",
        description: error.message || "Impossible d'arrêter le scraping",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  useEffect(() => {
    if (channelRef.current) {
      console.log('🧹 Nettoyage de la subscription existante');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    fetchLogs();

    if (!channelRef.current && autoRefreshEnabled) {
      console.log('📡 Création de la subscription realtime');
      
      channelRef.current = supabase
        .channel(`scraping_logs_${Date.now()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'scraping_logs'
        }, (payload) => {
          console.log('🔄 Changement temps réel détecté:', payload);
          fetchLogs();
        });

      channelRef.current.subscribe((status: string) => {
        console.log('📡 Statut subscription:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscription realtime active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur de subscription realtime');
          toast({
            title: "Erreur temps réel",
            description: "La mise à jour automatique ne fonctionne pas.",
            variant: "destructive"
          });
        } else if (status === 'CLOSED') {
          console.warn('⚠️ Subscription fermée');
        }
      });
    }

    return () => {
      console.log('🧹 Nettoyage de la subscription lors du démontage');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [autoRefreshEnabled]);

  return {
    logs,
    loading,
    isScrapingRunning,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    startScraping,
    stopScraping,
    refetch: fetchLogs
  };
};
