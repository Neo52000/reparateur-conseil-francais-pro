
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCleanupQuery } from '@/components/scraping/utils/cleanupUtils';

export const useHistoryCleanup = () => {
  const { toast } = useToast();
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const performCleanup = async (cleanupFilter: string, logsCount: number) => {
    if (logsCount === 0) {
      toast({
        title: "Aucun log à supprimer",
        description: "Aucun log ne correspond aux critères sélectionnés.",
        variant: "destructive"
      });
      return false;
    }

    setIsCleaningUp(true);
    
    try {
      const query = getCleanupQuery(cleanupFilter);
      
      if (query) {
        // Use the most basic delete operations to avoid TypeScript complexity
        if (query.operator === 'lt' && query.column === 'started_at') {
          const { error } = await supabase
            .from('scraping_logs')
            .delete()
            .lt('started_at', query.value);
          if (error) throw error;
        } else if (query.operator === 'eq' && query.column === 'status') {
          const { error } = await supabase
            .from('scraping_logs')
            .delete()
            .eq('status', query.value);
          if (error) throw error;
        }
      } else {
        // Pour supprimer tout, on utilise une condition qui match toujours
        const { error } = await supabase
          .from('scraping_logs')
          .delete()
          .gte('created_at', '1970-01-01');
        if (error) throw error;
      }
      
      toast({
        title: "Nettoyage réussi",
        description: `${logsCount} log(s) supprimé(s) avec succès.`
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Erreur lors du nettoyage:', error);
      toast({
        title: "Erreur de nettoyage",
        description: error.message || "Impossible de supprimer les logs.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCleaningUp(false);
    }
  };

  const deleteAllHistory = async () => {
    setIsCleaningUp(true);
    
    try {
      const { error } = await supabase
        .from('scraping_logs')
        .delete()
        .gte('created_at', '1970-01-01');
      
      if (error) throw error;
      
      toast({
        title: "Historique supprimé",
        description: "Tout l'historique de scraping a été supprimé."
      });
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'historique.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCleaningUp(false);
    }
  };

  return {
    isCleaningUp,
    performCleanup,
    deleteAllHistory
  };
};
