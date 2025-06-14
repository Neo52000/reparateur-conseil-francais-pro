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
    console.log("[useScrapingResults] 🔄 Début du chargement des résultats...");
    console.log("[useScrapingResults] État auth:", { 
      hasUser: !!user, 
      hasSession: !!session, 
      isAdmin,
      userId: user?.id 
    });

    try {
      setLoading(true);
      
      // Vérification de la session Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("[useScrapingResults] Session Supabase:", { 
        hasSession: !!sessionData.session,
        sessionError: sessionError?.message 
      });

      // Test de connexion à la base de données
      console.log("[useScrapingResults] 🔍 Test de connexion à la base...");
      const { count, error: countError } = await supabase
        .from('repairers')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error("[useScrapingResults] ❌ Erreur de connexion:", countError);
        throw new Error(`Erreur de connexion à la base: ${countError.message}`);
      }

      console.log("[useScrapingResults] ✅ Connexion OK, nombre total d'enregistrements:", count);

      // Requête principale
      console.log("[useScrapingResults] 🔍 Exécution de la requête principale...");
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error("[useScrapingResults] ❌ Erreur lors du chargement:", error);
        console.error("[useScrapingResults] Détails de l'erreur:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log("[useScrapingResults] ✅ Données récupérées:", data);
      console.log("[useScrapingResults] 📊 Nombre de résultats:", data?.length || 0);
      
      if (data && data.length > 0) {
        console.log("[useScrapingResults] 📝 Premier résultat:", data[0]);
      }
      
      setResults([...(data || [])]);
    } catch (error: any) {
      console.error('[useScrapingResults] 💥 Erreur complète:', error);
      toast({
        title: "Erreur de chargement",
        description: error.message || "Impossible de charger les résultats.",
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setLoading(false);
      console.log("[useScrapingResults] ✅ Chargement terminé");
    }
  };

  const checkAuthAndPermissions = () => {
    console.log("[useScrapingResults] 🔐 Vérification auth:", { 
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
    
    console.log("[useScrapingResults] 🔄 Changement de statut:", { 
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
        console.error("[useScrapingResults] ❌ Erreur lors de la mise à jour:", updateError);
        throw updateError;
      }

      console.log("[useScrapingResults] ✅ Données mises à jour:", updateData);

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
      const { data: deleteData, error: deleteError } = await supabase
        .from('repairers')
        .delete()
        .in('id', selectedItems)
        .select();

      if (deleteError) {
        console.error("[useScrapingResults] ❌ Erreur lors de la suppression:", deleteError);
        throw deleteError;
      }

      console.log("[useScrapingResults] ✅ Données supprimées:", deleteData);

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
    loadResults,
    handleChangeStatusSelected,
    handleDeleteSelected
  };
};

export type { RepairerResult };
