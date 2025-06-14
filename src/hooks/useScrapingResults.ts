
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface RepairerResult {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  services: string[];
  price_range: string;
  source: string;
  is_verified: boolean;
  rating?: number;
  scraped_at: string;
}

export const useScrapingResults = () => {
  const { toast } = useToast();
  const { user, session, isAdmin } = useAuth();
  const [results, setResults] = useState<RepairerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const loadResults = async () => {
    console.log("[ScrapingResults] Chargement des résultats...");
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error("[ScrapingResults] Erreur lors du chargement:", error);
        throw error;
      }
      
      console.log("[ScrapingResults] Données récupérées:", data);
      console.log("[ScrapingResults] Nombre de résultats:", data?.length || 0);
      
      setResults([...(data || [])]);
    } catch (error: any) {
      console.error('Error loading results:', error);
      toast({
        title: "Erreur de chargement",
        description: error.message || "Impossible de charger les résultats.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAuthAndPermissions = () => {
    console.log("[ScrapingResults] Vérification auth:", { 
      user: !!user, 
      session: !!session, 
      isAdmin,
      userId: user?.id 
    });

    if (!user || !session) {
      toast({
        title: "Non authentifié",
        description: "Vous devez être connecté pour effectuer cette action.",
        variant: "destructive"
      });
      return false;
    }

    if (!isAdmin) {
      toast({
        title: "Permissions insuffisantes",
        description: "Vous devez être administrateur pour effectuer cette action.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

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
    
    console.log("[ScrapingResults] Changement de statut:", { 
      selectedItems, 
      newStatus, 
      isVerified,
      itemCount: selectedItems.length,
      userRole: isAdmin ? 'admin' : 'non-admin'
    });
    
    try {
      const { data: updateData, error: updateError } = await supabase
        .from('repairers')
        .update({ is_verified: isVerified })
        .in('id', selectedItems)
        .select();

      if (updateError) {
        console.error("[ScrapingResults] Erreur lors de la mise à jour:", updateError);
        throw updateError;
      }

      console.log("[ScrapingResults] Données mises à jour:", updateData);

      toast({
        title: "Modification du statut réussie",
        description: `${updateData?.length || selectedItems.length} entreprise(s) ${isVerified ? "vérifiées" : "remises en attente"}.`
      });

      setSelectedItems([]);
      
      setTimeout(() => {
        console.log("[ScrapingResults] Rechargement après mise à jour du statut");
        loadResults();
      }, 500);
      
    } catch (error: any) {
      console.error("[ScrapingResults] Erreur lors du changement de statut:", error);
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

    console.log("[ScrapingResults] Tentative de suppression:", { 
      selectedItems,
      itemCount: selectedItems.length 
    });

    try {
      const { data: deleteData, error: deleteError } = await supabase
        .from('repairers')
        .delete()
        .in('id', selectedItems)
        .select();

      if (deleteError) {
        console.error("[ScrapingResults] Erreur lors de la suppression:", deleteError);
        throw deleteError;
      }

      console.log("[ScrapingResults] Données supprimées:", deleteData);

      toast({
        title: "Suppression réussie",
        description: `${deleteData?.length || selectedItems.length} entreprise(s) supprimée(s).`
      });

      setSelectedItems([]);
      
      setTimeout(() => {
        console.log("[ScrapingResults] Rechargement après suppression");
        loadResults();
      }, 500);
      
    } catch (error: any) {
      console.error("[ScrapingResults] Erreur lors de la suppression:", error);
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
    loadResults,
    handleChangeStatusSelected,
    handleDeleteSelected
  };
};

export type { RepairerResult };
