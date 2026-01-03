import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RepairerLevel } from '@/components/profile/levels';

interface RepairerLevelData {
  level: RepairerLevel;
  seoScore: number;
  completionPercent: number;
  claimedAt: string | null;
  exclusivityZoneId: string | null;
}

interface UseRepairerLevelReturn {
  levelData: RepairerLevelData | null;
  loading: boolean;
  error: string | null;
  refreshLevel: () => Promise<void>;
  updateLevel: (newLevel: RepairerLevel) => Promise<boolean>;
}

export const useRepairerLevel = (repairerId?: string): UseRepairerLevelReturn => {
  const [levelData, setLevelData] = useState<RepairerLevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevelData = useCallback(async () => {
    if (!repairerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('repairer_profiles')
        .select('repairer_level, seo_score, profile_completion_percent, claimed_at, exclusivity_zone_id')
        .eq('id', repairerId)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setLevelData({
          level: (data.repairer_level || 0) as RepairerLevel,
          seoScore: data.seo_score || 0,
          completionPercent: data.profile_completion_percent || 0,
          claimedAt: data.claimed_at,
          exclusivityZoneId: data.exclusivity_zone_id
        });
      }
    } catch (err) {
      console.error('Erreur récupération niveau:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [repairerId]);

  const updateLevel = useCallback(async (newLevel: RepairerLevel): Promise<boolean> => {
    if (!repairerId) return false;

    try {
      const updateData: Record<string, unknown> = {
        repairer_level: newLevel
      };

      // Si passage de 0 à 1, marquer comme revendiqué
      if (newLevel === 1 && levelData?.level === 0) {
        updateData.claimed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('repairer_profiles')
        .update(updateData)
        .eq('id', repairerId);

      if (updateError) throw updateError;

      await fetchLevelData();
      return true;
    } catch (err) {
      console.error('Erreur mise à jour niveau:', err);
      return false;
    }
  }, [repairerId, levelData?.level, fetchLevelData]);

  useEffect(() => {
    fetchLevelData();
  }, [fetchLevelData]);

  return {
    levelData,
    loading,
    error,
    refreshLevel: fetchLevelData,
    updateLevel
  };
};

export default useRepairerLevel;
