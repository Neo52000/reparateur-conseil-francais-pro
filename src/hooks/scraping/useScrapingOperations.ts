
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useScrapingOperations = () => {
  const { toast } = useToast();

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

  const startScraping = async (departmentCode: string, testMode: boolean = false) => {
    try {
      console.log(`🚀 Démarrage du scraping ${testMode ? 'TEST' : 'COMPLET'} pour département: ${departmentCode}`);
      
      const connectionOk = await testSupabaseConnection();
      if (!connectionOk) {
        throw new Error('Connexion Supabase défaillante');
      }

      const { data, error } = await supabase.functions.invoke('scrape-repairers', {
        body: { 
          department_code: departmentCode,
          test_mode: testMode,
          source: 'serper'
        }
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw error;
      }

      console.log('✅ Réponse Edge Function:', data);
      return data;
    } catch (error: any) {
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
      
      const { data: runningLogs, error: fetchError } = await supabase
        .from('scraping_logs')
        .select('*')
        .eq('status', 'running')
        .order('started_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Erreur lors de la vérification:', fetchError);
        throw fetchError;
      }

      if (!runningLogs || runningLogs.length === 0) {
        console.log('ℹ️ Aucun scraping en cours trouvé');
        toast({
          title: "ℹ️ Aucun scraping en cours",
          description: "Il n'y a actuellement aucun scraping à arrêter.",
        });
        return { success: true, message: 'Aucun scraping en cours', stopped_count: 0 };
      }

      const { data, error } = await supabase.functions.invoke('stop-scraping');

      if (error) {
        console.error('❌ Erreur lors de l\'arrêt:', error);
        throw error;
      }

      console.log('✅ Réponse arrêt scraping:', data);

      toast({
        title: "🛑 Scraping arrêté",
        description: `${data?.stopped_count || 0} scraping(s) arrêté(s) avec succès`,
      });

      return data;
    } catch (error: any) {
      console.error('💥 Erreur stop scraping:', error);
      
      toast({
        title: "❌ Erreur d'arrêt",
        description: error.message || "Impossible d'arrêter le scraping",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const validateScraping = async (logId: string, selectedIds: number[], results: any[]) => {
    try {
      console.log(`✅ Validation de ${selectedIds.length} réparateurs...`);

      const { data, error } = await supabase.functions.invoke('validate-scraping', {
        body: {
          log_id: logId,
          selected_ids: selectedIds,
          results
        }
      });

      if (error) {
        console.error('❌ Erreur validation:', error);
        throw error;
      }

      console.log('✅ Validation réussie:', data);

      toast({
        title: "✅ Validation réussie",
        description: `${data?.items_added || 0} ajoutés, ${data?.items_updated || 0} mis à jour`,
      });

      return data;
    } catch (error: any) {
      console.error('💥 Erreur validation:', error);
      
      toast({
        title: "❌ Erreur de validation",
        description: error.message || "Impossible de valider les résultats",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return {
    startScraping,
    stopScraping,
    validateScraping
  };
};
