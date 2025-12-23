import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  totalRepairers: number;
  citiesCovered: number;
  totalReviews: number;
  averageRating: number;
}

/**
 * Formate un nombre pour l'affichage marketing
 * Ex: 161 → "150+", 1234 → "1 200+", 45 → "45"
 */
export const formatStatForDisplay = (value: number, threshold: number = 50): string => {
  if (value < threshold) {
    return value.toString();
  }
  
  if (value < 100) {
    const rounded = Math.floor(value / 10) * 10;
    return `${rounded}+`;
  }
  
  if (value < 1000) {
    const rounded = Math.floor(value / 50) * 50;
    return `${rounded}+`;
  }
  
  const rounded = Math.floor(value / 100) * 100;
  return `${rounded.toLocaleString('fr-FR')}+`;
};

/**
 * Hook pour récupérer les statistiques réelles de la plateforme depuis Supabase
 */
export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async (): Promise<PlatformStats> => {
      // Utiliser repairers_safe (vue simplifiée)
      const repairersResult = await supabase
        .from('repairers_safe')
        .select('id, city');
      
      const repairers = repairersResult.data || [];
      const totalRepairers = repairers.length;
      
      // Villes uniques
      const uniqueCities = new Set(
        repairers.map(r => r.city?.toLowerCase().trim()).filter(Boolean)
      );
      const citiesCovered = uniqueCities.size;

      // Avis
      const reviewsResult = await supabase
        .from('reviews')
        .select('id, rating');
      
      const reviews = reviewsResult.data || [];
      const totalReviews = reviews.length;
      
      const ratings = reviews.map(r => r.rating).filter((r): r is number => r != null);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : 0;

      return {
        totalRepairers,
        citiesCovered,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export default usePlatformStats;
