import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ActivityItem {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  icon: string | null;
  metadata: any;
  created_at: string;
}

export const useRecentActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recent_activities')
        .select('*')
        .or(`user_id.eq.${user.id},repairer_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activityData: {
    activity_type: string;
    title: string;
    description?: string;
    icon?: string;
    metadata?: any;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recent_activities')
        .insert({
          user_id: user.id,
          ...activityData
        });

      if (error) throw error;
      await loadActivities();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadActivities();
      
      // Actualiser toutes les 30 secondes
      const interval = setInterval(loadActivities, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    activities,
    loading,
    loadActivities,
    addActivity
  };
};