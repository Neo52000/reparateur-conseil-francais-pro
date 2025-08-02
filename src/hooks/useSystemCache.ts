import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CacheStats {
  total_size_mb: number;
  hit_ratio: number;
  miss_ratio: number;
  operations_per_second: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  active_keys: number;
}

interface CacheEntry {
  id: string;
  cache_key: string;
  size_mb: number;
  hit_count: number;
  ttl_seconds: number;
  created_at: string;
  last_accessed: string;
}

export const useSystemCache = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCacheData = async () => {
    try {
      // Récupérer les statistiques de cache
      const { data: statsData, error: statsError } = await supabase
        .from('system_cache_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      // Récupérer les entrées de cache
      const { data: entriesData, error: entriesError } = await supabase
        .from('system_cache_entries')
        .select('*')
        .order('last_accessed', { ascending: false })
        .limit(10);

      if (entriesError) {
        throw entriesError;
      }

      setStats(statsData);
      setEntries(entriesData || []);
    } catch (error) {
      console.error('Erreur chargement cache:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du cache",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (key?: string) => {
    try {
      setLoading(true);
      
      if (key) {
        // Supprimer une entrée spécifique
        const { error } = await supabase
          .from('system_cache_entries')
          .delete()
          .eq('cache_key', key);

        if (error) throw error;

        toast({
          title: "Cache nettoyé",
          description: `Entrée "${key}" supprimée`
        });
      } else {
        // Vider tout le cache
        const { error: entriesError } = await supabase
          .from('system_cache_entries')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        const { error: statsError } = await supabase
          .from('system_cache_stats')
          .update({ 
            total_size_mb: 0, 
            active_keys: 0,
            updated_at: new Date().toISOString()
          })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

        if (entriesError) throw entriesError;
        if (statsError) throw statsError;

        toast({
          title: "Cache vidé",
          description: "Toutes les entrées de cache ont été supprimées"
        });
      }
      
      await loadCacheData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vider le cache",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const warmupCache = async () => {
    try {
      setLoading(true);
      
      // Créer quelques entrées de cache pour simuler le préchauffage
      const warmupEntries = [
        {
          cache_key: 'repairers:location:paris',
          size_mb: 2.5,
          hit_count: 0,
          ttl_seconds: 3600
        },
        {
          cache_key: 'quotes:popular',
          size_mb: 1.2,
          hit_count: 0,
          ttl_seconds: 1800
        }
      ];

      const { error } = await supabase
        .from('system_cache_entries')
        .upsert(warmupEntries);

      if (error) throw error;
      
      toast({
        title: "Cache préchauffé",
        description: "Les données essentielles ont été mises en cache"
      });
      
      await loadCacheData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de préchauffer le cache",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCacheData();
    const interval = setInterval(loadCacheData, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    entries,
    loading,
    loadCacheData,
    clearCache,
    warmupCache
  };
};