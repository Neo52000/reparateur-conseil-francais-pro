
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UseScrapingAutoRefreshProps {
  autoRefreshEnabled: boolean;
  loadResults: (isAutoRefresh?: boolean) => void;
}

export const useScrapingAutoRefresh = ({ 
  autoRefreshEnabled, 
  loadResults 
}: UseScrapingAutoRefreshProps) => {
  const { user, session, isAdmin } = useAuth();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const checkForActiveScraping = async () => {
      if (!autoRefreshEnabled) return;

      try {
        const { data: activeLogs } = await supabase
          .from('scraping_logs')
          .select('status')
          .eq('status', 'running')
          .limit(1);

        const isScrapingActive = activeLogs && activeLogs.length > 0;

        if (isScrapingActive) {
          console.log("[useScrapingAutoRefresh] 🔄 Scraping actif détecté - activation du refresh automatique");
          
          // Rafraîchir toutes les 5 secondes
          intervalId = setInterval(() => {
            loadResults(true);
          }, 5000);
        } else if (intervalId) {
          console.log("[useScrapingAutoRefresh] ⏹️ Fin du scraping - arrêt du refresh automatique");
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (error) {
        console.error("[useScrapingAutoRefresh] Erreur lors de la vérification du scraping:", error);
      }
    };

    checkForActiveScraping();
    const checkInterval = setInterval(checkForActiveScraping, 10000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      clearInterval(checkInterval);
    };
  }, [user, session, isAdmin, autoRefreshEnabled, loadResults]);
};
