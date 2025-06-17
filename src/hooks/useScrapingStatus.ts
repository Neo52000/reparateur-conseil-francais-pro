
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
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  const fetchLogs = async () => {
    try {
      console.log('🔄 Tentative de récupération des logs de scraping...');
      
      const { data, error } = await supabase
        .from('scraping_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erreur lors de la récupération des logs:', error);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de récupérer les logs de scraping. Vérifiez la connexion à la base de données.",
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
      
      // Test de connectivité
      try {
        const { data: testData } = await supabase.from('profiles').select('count').single();
        console.log('✅ Test de connectivité réussi');
      } catch (testError) {
        console.error('❌ Test de connectivité échoué:', testError);
        toast({
          title: "Problème de connexion",
          description: "La connexion à Supabase semble défaillante. Rechargez la page.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const startScraping = async (source: string, testMode: boolean = false, departmentCode: string | null = null) => {
    try {
      console.log(`🚀 Démarrage du scraping ${testMode ? 'TEST' : 'MASSIF'} pour: ${source}${departmentCode ? ` - Département: ${departmentCode}` : ''}`);
      
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

      // Rafraîchir les logs après un délai
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

  useEffect(() => {
    // Nettoyer toute subscription existante avant d'en créer une nouvelle
    if (channelRef.current) {
      console.log('🧹 Nettoyage de la subscription existante');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Charger les logs initiaux
    fetchLogs();

    // Créer une nouvelle subscription uniquement si on n'en a pas déjà une
    if (!channelRef.current) {
      console.log('📡 Création de la subscription realtime');
      
      channelRef.current = supabase
        .channel(`scraping_logs_${Date.now()}`) // Nom unique pour éviter les conflits
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'scraping_logs'
        }, (payload) => {
          console.log('🔄 Changement temps réel détecté:', payload);
          fetchLogs();
        });

      // S'abonner au canal
      channelRef.current.subscribe((status: string) => {
        console.log('📡 Statut subscription:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscription realtime active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur de subscription realtime');
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
  }, []); // Dépendances vides pour ne s'exécuter qu'une seule fois

  return {
    logs,
    loading,
    isScrapingRunning,
    startScraping,
    refetch: fetchLogs
  };
};
