
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
        // Use separate queries to avoid TypeScript complexity
        if (query.operator === 'lt') {
          const { error } = await supabase
            .from('scraping_logs')
            .delete()
            .lt(query.column, query.value);
          if (error) throw error;
        } else if (query.operator === 'eq') {
          const { error } = await supabase
            .from('scraping_logs')
            .delete()
            .eq(query.column, query.value);
          if (error) throw error;
        }
      } else {
        // Pour supprimer tout, on utilise une condition simple
        const { error } = await supabase
          .from('scraping_logs')
          .delete()
          .neq('id', '');
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

  return {
    isCleaningUp,
    performCleanup
  };
};
