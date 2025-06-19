
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
      console.log('📊 Détail des logs:', data?.map(log => ({
        id: log.id,
        status: log.status,
        source: log.source,
        started_at: log.started_at
      })));

      const typedLogs: ScrapingLog[] = (data || []).map(log => ({
        ...log,
        status: log.status as 'running' | 'completed' | 'failed'
      }));

      // DEBUG: Améliorer la logique de détection du scraping en cours
      const runningLogs = typedLogs.filter(log => {
        const isRunning = log.status === 'running';
        console.log(`🔍 Log ${log.id}: status=${log.status}, isRunning=${isRunning}`);
        return isRunning;
      });
      
      const hasRunningScrap = runningLogs.length > 0;
      
      console.log('🎯 ANALYSE DÉTAILLÉE DU STATUT SCRAPING:', {
        totalLogs: typedLogs.length,
        runningLogs: runningLogs.length,
        hasRunningScrap,
        isScrapingRunning: hasRunningScrap,
        runningDetails: runningLogs.map(log => ({
          id: log.id,
          source: log.source,
          status: log.status,
          started_at: log.started_at
        })),
        allStatuses: typedLogs.map(log => log.status)
      });

      setLogs(typedLogs);
      setIsScrapingRunning(hasRunningScrap);
      
      // Debug console pour l'état du bouton STOP
      console.log('🚨 ÉTAT FINAL POUR LE BOUTON STOP:', {
        isScrapingRunning: hasRunningScrap,
        shouldShowStopButton: hasRunningScrap,
        runningCount: runningLogs.length
      });
      
      if (hasRunningScrap) {
        console.log('🔴 SCRAPING EN COURS DÉTECTÉ - Le bouton STOP devrait être visible!');
        console.log('🔴 Logs en cours:', runningLogs);
      } else {
        console.log('⚪ Aucun scraping en cours - Bouton STOP masqué');
        console.log('⚪ Tous les statuts:', typedLogs.map(l => l.status));
      }
      
    } catch (error) {
      console.error('💥 Erreur complète fetchLogs:', error);
      setLogs([]);
      setIsScrapingRunning(false);
    } finally {
      setLoading(false);
    }
  };

  // Force la vérification du statut toutes les 5 secondes si pas de realtime
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Vérification périodique du statut de scraping...');
      fetchLogs();
    }, 5000);

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
    refetch: fetchLogs
  };
};
