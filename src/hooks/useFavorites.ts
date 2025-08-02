import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FavoriteRepairer {
  id: string;
  repairer_id: string;
  created_at: string;
  repairer_profile: {
    id: string;
    business_name: string;
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
      const { data, error } = await supabase
        .from('client_favorites')
        .select(`
          id,
          repairer_id,
          created_at,
          repairer_profile:repairer_profiles!repairer_id (
            id,
            business_name,
            name,
            city,
            postal_code,
            rating,
            review_count,
            phone
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
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