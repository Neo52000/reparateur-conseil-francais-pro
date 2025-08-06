
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useScrapingDatabase } from './useScrapingDatabase';
import { useScrapingAuth } from './useScrapingAuth';
import { useScrapingAutoRefresh } from './useScrapingAutoRefresh';
import { UseScrapingResultsReturn } from './types';

export const useScrapingResults = (): UseScrapingResultsReturn => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  const { checkAuthAndPermissions } = useScrapingAuth();
  const { 
    results, 
    loading, 
    loadResults, 
    updateItemsStatus, 
    deleteItems 
  } = useScrapingDatabase();

  useScrapingAutoRefresh({ autoRefreshEnabled, loadResults });

  const handleChangeStatusSelected = async (newStatus: "verified" | "unverified") => {
    if (!checkAuthAndPermissions()) return;

    if (selectedItems.length === 0) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner des éléments avant de changer le statut.",
        variant: "destructive"
      });
      return;
    }

    const isVerified = newStatus === "verified";
    
    console.log("[useScrapingResults] 🔄 Changement de statut:", { 
      selectedItems, 
      newStatus, 
      isVerified,
      itemCount: selectedItems.length
    });
    
    try {
      const updateData = await updateItemsStatus(selectedItems, isVerified);

      toast({
        title: "Modification du statut réussie",
        description: `${updateData?.length || selectedItems.length} entreprise(s) ${isVerified ? "vérifiées" : "remises en attente"}.`
      });

      setSelectedItems([]);
      
      setTimeout(() => {
        console.log("[useScrapingResults] 🔄 Rechargement après mise à jour du statut");
        loadResults();
      }, 500);
      
    } catch (error: any) {
      console.error("[useScrapingResults] ❌ Erreur lors du changement de statut:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le statut. Vérifiez vos permissions.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (!checkAuthAndPermissions()) return;

    if (selectedItems.length === 0) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner des éléments avant de supprimer.",
        variant: "destructive"
      });
      return;
    }

    console.log("[useScrapingResults] 🗑️ Tentative de suppression:", { 
      selectedItems,
      itemCount: selectedItems.length 
    });

    try {
      const deleteData = await deleteItems(selectedItems);

      toast({
        title: "Suppression réussie",
        description: `${deleteData?.length || selectedItems.length} entreprise(s) supprimée(s).`
      });

      setSelectedItems([]);
      
      setTimeout(() => {
        console.log("[useScrapingResults] 🔄 Rechargement après suppression");
        loadResults();
      }, 500);
      
    } catch (error: any) {
      console.error("[useScrapingResults] ❌ Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer les entreprises. Vérifiez vos permissions.",
        variant: "destructive"
      });
    }
  };

  return {
    results,
    loading,
    selectedItems,
    setSelectedItems,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    loadResults,
    handleChangeStatusSelected,
    handleDeleteSelected
  };
};

export type { RepairerResult } from './types';
