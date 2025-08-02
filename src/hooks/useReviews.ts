import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  user_id: string | null;
  repairer_id: string;
  appointment_id?: string | null;
  quote_id?: string | null;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at?: string;
  client_name?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export const useReviews = (repairerId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!repairerId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Add mock client names for demo purposes
      const reviewsWithNames = (data || []).map(review => ({
        ...review,
        client_name: `Client ${review.user_id?.slice(0, 4) || 'Anonyme'}`
      }));

      setReviews(reviewsWithNames);

      // Calculate stats
      if (reviewsWithNames.length > 0) {
        const totalRating = reviewsWithNames.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviewsWithNames.length;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviewsWithNames.forEach(review => {
          ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        });

        setStats({
          averageRating,
          totalReviews: reviewsWithNames.length,
          ratingDistribution
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (reviewData: {
    repairer_id: string;
    rating: number;
    comment?: string;
    appointment_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) throw error;

      // Refresh reviews after successful submission
      await fetchReviews();

      return { data, error: null };
    } catch (error) {
      console.error('Error submitting review:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'avis' 
      };
    }
  };

  const updateReview = async (reviewId: string, updates: {
    rating?: number;
    comment?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;

      // Refresh reviews after successful update
      await fetchReviews();

      return { data, error: null };
    } catch (error) {
      console.error('Error updating review:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'avis' 
      };
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      // Refresh reviews after successful deletion
      await fetchReviews();

      return { error: null };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'avis' 
      };
    }
  };

  // Get reputation level based on average rating and review count
  const getReputationLevel = () => {
    if (stats.totalReviews === 0) return 'Nouveau';
    if (stats.totalReviews < 5) return 'Débutant';
    if (stats.averageRating >= 4.5 && stats.totalReviews >= 50) return 'Expert';
    if (stats.averageRating >= 4.0 && stats.totalReviews >= 20) return 'Expérimenté';
    if (stats.averageRating >= 3.5) return 'Confirmé';
    return 'En progression';
  };

  // Get reputation badges
  const getReputationBadges = () => {
    const badges = [];
    
    if (stats.averageRating >= 4.5 && stats.totalReviews >= 10) {
      badges.push({ name: 'Excellence', icon: '🏆', color: 'gold' });
    }
    
    if (stats.totalReviews >= 100) {
      badges.push({ name: 'Populaire', icon: '⭐', color: 'blue' });
    }
    
    if (stats.averageRating >= 4.0) {
      badges.push({ name: 'Qualité', icon: '✅', color: 'green' });
    }

    return badges;
  };

  useEffect(() => {
    fetchReviews();
  }, [repairerId]);

  return {
    reviews,
    stats,
    loading,
    error,
    submitReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
    reputationLevel: getReputationLevel(),
    reputationBadges: getReputationBadges()
  };
};

// Hook for getting reviews statistics across all repairers (admin use)
export const useReviewsStats = () => {
  const [globalStats, setGlobalStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    topRatedRepairers: [],
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);

  const fetchGlobalStats = async () => {
    try {
      setLoading(true);

      // Get total reviews and average rating
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating, repairer_id, created_at');

      if (error) throw error;

      if (reviews && reviews.length > 0) {
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

        setGlobalStats({
          totalReviews,
          averageRating,
          topRatedRepairers: [], // TODO: Implement top rated repairers logic
          recentReviews: [] // TODO: Implement recent reviews logic
        });
      }
    } catch (error) {
      console.error('Error fetching global stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  return {
    globalStats,
    loading,
    refetch: fetchGlobalStats
  };
};