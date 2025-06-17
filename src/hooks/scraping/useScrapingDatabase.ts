
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RepairerResult } from './types';

export const useScrapingDatabase = () => {
  const { toast } = useToast();
  const [results, setResults] = useState<RepairerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

  const testDatabaseConnection = async () => {
    try {
      console.log("[useScrapingDatabase] 🔍 Test de connectivité à la base...");
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("[useScrapingDatabase] Session:", { 
        hasSession: !!sessionData.session,
        error: sessionError?.message 
      });

      const { count, error: countError } = await supabase
        .from('repairers')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error("[useScrapingDatabase] ❌ Erreur de connexion DB:", countError);
        throw new Error(`Erreur DB: ${countError.message}`);
      }

      console.log("[useScrapingDatabase] ✅ Connexion OK, total repairers:", count);
      return true;
    } catch (error) {
      console.error("[useScrapingDatabase] 💥 Test de connexion échoué:", error);
      return false;
    }
  };

  const loadResults = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      console.log("[useScrapingDatabase] 🔄 Début du chargement des résultats...");
      setLoading(true);
    }

    try {
      const connectionOk = await testDatabaseConnection();
      if (!connectionOk) {
        if (!isAutoRefresh) {
          toast({
            title: "Erreur de connexion",
            description: "Impossible de se connecter à la base de données.",
            variant: "destructive"
          });
        }
        setResults([]);
        return;
      }

      console.log("[useScrapingDatabase] 🔍 Exécution de la requête principale...");
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error("[useScrapingDatabase] ❌ Erreur lors du chargement:", error);
        
        if (!isAutoRefresh) {
          toast({
            title: "Erreur de chargement",
            description: `Erreur: ${error.message}`,
            variant: "destructive"
          });
        }
        throw error;
      }
      
      if (!isAutoRefresh) {
        console.log("[useScrapingDatabase] ✅ Données récupérées:", data);
        console.log("[useScrapingDatabase] 📊 Nombre de résultats:", data?.length || 0);
      }
      
      if (data && data.length > 0) {
        const latestScrapedAt = data[0]?.scraped_at;
        
        // Mise à jour différentielle pour éviter les sauts
        if (latestScrapedAt !== lastUpdateTime) {
          if (isAutoRefresh && lastUpdateTime) {
            const newResults = data.filter(item => item.scraped_at > lastUpdateTime);
            if (newResults.length > 0) {
              console.log("[useScrapingDatabase] 🆕 Nouvelles données détectées!", newResults.length);
              toast({
                title: "🔄 Nouveaux résultats",
                description: `${newResults.length} nouveau(x) réparateur(s) ajouté(s)`,
              });
              
              // Mise à jour différentielle : ajouter seulement les nouveaux
              setResults(prevResults => {
                const existingIds = new Set(prevResults.map(r => r.id));
                const uniqueNewResults = newResults.filter(r => !existingIds.has(r.id));
                return [...uniqueNewResults, ...prevResults].slice(0, 200);
              });
            }
          } else {
            // Première charge ou refresh manuel
            setResults([...(data || [])]);
          }
          setLastUpdateTime(latestScrapedAt);
        }
      } else {
        setResults([...(data || [])]);
      }
      
    } catch (error: any) {
      console.error('[useScrapingDatabase] 💥 Erreur complète:', error);
      setResults([]);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
        console.log("[useScrapingDatabase] ✅ Chargement terminé");
      }
    }
  };

  const updateItemsStatus = async (selectedItems: string[], isVerified: boolean) => {
    const { data: updateData, error: updateError } = await supabase
      .from('repairers')
      .update({ is_verified: isVerified })
      .in('id', selectedItems)
      .select();

    if (updateError) {
      console.error("[useScrapingDatabase] ❌ Erreur lors de la mise à jour:", updateError);
      throw updateError;
    }

    console.log("[useScrapingDatabase] ✅ Données mises à jour:", updateData);
    return updateData;
  };

  const deleteItems = async (selectedItems: string[]) => {
    const { data: deleteData, error: deleteError } = await supabase
      .from('repairers')
      .delete()
      .in('id', selectedItems)
      .select();

    if (deleteError) {
      console.error("[useScrapingDatabase] ❌ Erreur lors de la suppression:", deleteError);
      throw deleteError;
    }

    console.log("[useScrapingDatabase] ✅ Données supprimées:", deleteData);
    return deleteData;
  };

  return {
    results,
    loading,
    setLoading,
    loadResults,
    updateItemsStatus,
    deleteItems
  };
};
