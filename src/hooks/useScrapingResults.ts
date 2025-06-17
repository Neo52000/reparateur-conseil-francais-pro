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
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

  const testDatabaseConnection = async () => {
    try {
      console.log("[useScrapingResults] 🔍 Test de connectivité à la base...");
      
      // Test de session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("[useScrapingResults] Session:", { 
        hasSession: !!sessionData.session,
        error: sessionError?.message 
      });

      // Test de la table repairers
      const { count, error: countError } = await supabase
        .from('repairers')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error("[useScrapingResults] ❌ Erreur de connexion DB:", countError);
        throw new Error(`Erreur DB: ${countError.message}`);
      }

      console.log("[useScrapingResults] ✅ Connexion OK, total repairers:", count);
      return true;
    } catch (error) {
      console.error("[useScrapingResults] 💥 Test de connexion échoué:", error);
      return false;
    }
  };

  const loadResults = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      console.log("[useScrapingResults] 🔄 Début du chargement des résultats...");
    }
    console.log("[useScrapingResults] État auth:", { 
      hasUser: !!user, 
      hasSession: !!session, 
      isAdmin,
      userId: user?.id 
    });

    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }
      
      // Test de connexion d'abord
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

      // Requête principale avec tri par date de scraping pour voir les plus récents en premier
      console.log("[useScrapingResults] 🔍 Exécution de la requête principale...");
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(200); // Augmenté pour voir plus de résultats

      if (error) {
        console.error("[useScrapingResults] ❌ Erreur lors du chargement:", error);
        console.error("[useScrapingResults] Détails de l'erreur:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
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
        console.log("[useScrapingResults] ✅ Données récupérées:", data);
        console.log("[useScrapingResults] 📊 Nombre de résultats:", data?.length || 0);
      }
      
      if (data && data.length > 0) {
        const latestScrapedAt = data[0]?.scraped_at;
        
        // Vérifier si on a de nouvelles données
        if (latestScrapedAt !== lastUpdateTime) {
          console.log("[useScrapingResults] 🆕 Nouvelles données détectées!");
          setLastUpdateTime(latestScrapedAt);
          
          if (isAutoRefresh && lastUpdateTime) {
            // Afficher un toast pour les nouvelles données en temps réel
            const newResults = data.filter(item => item.scraped_at > lastUpdateTime);
            if (newResults.length > 0) {
              toast({
                title: "🔄 Nouveaux résultats",
                description: `${newResults.length} nouveau(x) réparateur(s) ajouté(s)`,
              });
            }
          }
        }
        
        if (!isAutoRefresh) {
          console.log("[useScrapingResults] 📝 Premier résultat:", data[0]);
        }
      }
      
      setResults([...(data || [])]);
    } catch (error: any) {
      console.error('[useScrapingResults] 💥 Erreur complète:', error);
      setResults([]);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
        console.log("[useScrapingResults] ✅ Chargement terminé");
      }
    }
  };

  // Auto-refresh pendant le scraping
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Vérifier s'il y a un scraping en cours
    const checkForActiveScraping = async () => {
      try {
        const { data: activeLogs } = await supabase
          .from('scraping_logs')
          .select('status')
          .eq('status', 'running')
          .limit(1);

        const isScrapingActive = activeLogs && activeLogs.length > 0;

        if (isScrapingActive) {
          console.log("[useScrapingResults] 🔄 Scraping actif détecté - activation du refresh automatique");
          
          // Rafraîchir toutes les 3 secondes pendant le scraping
          intervalId = setInterval(() => {
            loadResults(true);
          }, 3000);
        } else if (intervalId) {
          console.log("[useScrapingResults] ⏹️ Fin du scraping - arrêt du refresh automatique");
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (error) {
        console.error("[useScrapingResults] Erreur lors de la vérification du scraping:", error);
      }
    };

    // Vérifier immédiatement
    checkForActiveScraping();

    // Puis vérifier périodiquement si un scraping est actif
    const checkInterval = setInterval(checkForActiveScraping, 5000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      clearInterval(checkInterval);
    };
  }, [user, session, isAdmin]);

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
