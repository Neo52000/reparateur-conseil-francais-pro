
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
      
      // D'abord vérifier s'il y a des scraping en cours
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

  return {
    startScraping,
    stopScraping
  };
};
