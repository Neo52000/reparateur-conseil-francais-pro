
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RepairerResult } from './types';
import { testDatabaseConnection } from './utils/databaseConnection';
import { fetchRepairersData, updateRepairersStatus, deleteRepairers } from './services/repairerDataService';
import { handleDataUpdate } from './utils/dataSync';

export const useScrapingDatabase = () => {
  const { toast } = useToast();
  const [results, setResults] = useState<RepairerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

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

      const data = await fetchRepairersData();
      
      if (!isAutoRefresh) {
        console.log("[useScrapingDatabase] ✅ Données récupérées:", data);
        console.log("[useScrapingDatabase] 📊 Nombre de résultats:", data?.length || 0);
      }
      
      const newResultsCount = handleDataUpdate(
        data,
        lastUpdateTime,
        isAutoRefresh,
        setResults,
        setLastUpdateTime
      );

      if (newResultsCount > 0 && isAutoRefresh) {
        toast({
          title: "🔄 Nouveaux résultats",
          description: `${newResultsCount} nouveau(x) réparateur(s) ajouté(s)`,
        });
      }
      
    } catch (error: any) {
      console.error('[useScrapingDatabase] 💥 Erreur complète:', error);
      
      if (!isAutoRefresh) {
        toast({
          title: "Erreur de chargement",
          description: `Erreur: ${error.message}`,
          variant: "destructive"
        });
      }
      setResults([]);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
        console.log("[useScrapingDatabase] ✅ Chargement terminé");
      }
    }
  };

  const updateItemsStatus = async (selectedItems: string[], isVerified: boolean) => {
    const updateData = await updateRepairersStatus(selectedItems, isVerified);
    return updateData;
  };

  const deleteItems = async (selectedItems: string[]) => {
    const deleteData = await deleteRepairers(selectedItems);
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
