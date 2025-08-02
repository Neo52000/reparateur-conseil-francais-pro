import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FavoriteRepairer {
  id: string;
  repairer_id: string;
  created_at: string;
  repairer: {
    id: string;
    name: string;
    city: string;
    postal_code: string;
    rating: number;
    review_count: number;
    phone: string;
  };
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteRepairer[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Récupérer d'abord les favoris
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('client_favorites')
        .select('id, repairer_id, created_at')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) throw favoritesError;

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        return;
      }

      // Récupérer les informations des réparateurs
      const repairerIds = favoritesData.map(fav => fav.repairer_id);
      const { data: repairersData, error: repairersError } = await supabase
        .from('repairers')
        .select('id, name, city, postal_code, rating, review_count, phone')
        .in('id', repairerIds);

      if (repairersError) throw repairersError;

      // Combiner les données
      const combinedData = favoritesData.map(favorite => ({
        ...favorite,
        repairer: repairersData?.find(repairer => repairer.id === favorite.repairer_id) || null
      })).filter(item => item.repairer !== null);

      setFavorites(combinedData);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos favoris",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (repairerId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des favoris",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('client_favorites')
        .insert([{
          client_id: user.id,
          repairer_id: repairerId
        }]);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Réparateur ajouté aux favoris",
      });
      
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter aux favoris",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromFavorites = async (repairerId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('client_favorites')
        .delete()
        .eq('client_id', user.id)
        .eq('repairer_id', repairerId);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Réparateur retiré des favoris",
      });
      
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive",
      });
      return false;
    }
  };

  const isFavorite = (repairerId: string): boolean => {
    return favorites.some(fav => fav.repairer_id === repairerId);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refetch: fetchFavorites
  };
};