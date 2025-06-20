
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScrapingLog } from './useScrapingStatusTypes';

export const useScrapingLogs = (autoRefreshEnabled: boolean) => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrapingRunning, setIsScrapingRunning] = useState(false);
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

      // Améliorer la détection du scraping en cours
      const runningLogs = typedLogs.filter(log => log.status === 'running');
      
      // Également vérifier les logs récents (moins de 2 minutes) sans "completed_at"
      const recentLogs = typedLogs.filter(log => {
        if (log.status === 'running') return true;
        
        const logTime = new Date(log.started_at).getTime();
        const now = Date.now();
        const twoMinutesAgo = now - (2 * 60 * 1000);
        
        return logTime > twoMinutesAgo && !log.completed_at && log.status !== 'failed';
      });
      
      const hasRunningScrap = runningLogs.length > 0 || recentLogs.length > 0;
      
      console.log('🎯 ANALYSE DÉTAILLÉE DU STATUT SCRAPING:', {
        totalLogs: typedLogs.length,
        runningLogs: runningLogs.length,
        recentLogs: recentLogs.length,
        hasRunningScrap,
        runningDetails: runningLogs.map(log => ({
          id: log.id,
          source: log.source,
          status: log.status,
          started_at: log.started_at,
          completed_at: log.completed_at
        }))
      });

      setLogs(typedLogs);
      setIsScrapingRunning(hasRunningScrap);
      
      if (hasRunningScrap) {
        console.log('🔴 SCRAPING EN COURS DÉTECTÉ - Le bouton STOP devrait être visible!');
      } else {
        console.log('⚪ Aucun scraping en cours - Bouton STOP masqué');
      }
      
    } catch (error) {
      console.error('💥 Erreur complète fetchLogs:', error);
      setLogs([]);
      setIsScrapingRunning(false);
    } finally {
      setLoading(false);
    }
  };

  // Vérification plus fréquente du statut
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Vérification périodique du statut de scraping...');
      fetchLogs();
    }, 3000); // Réduit à 3 secondes pour une meilleure réactivité

    return () => clearInterval(interval);
  }, []);

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
    refetch: fetchLogs
  };
};
