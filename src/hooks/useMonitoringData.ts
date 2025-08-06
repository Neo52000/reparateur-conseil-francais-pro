import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MonitoringStats {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  avgResponseTime: number;
  uptime: number;
  incidents: number;
}

export interface MonitoredURL {
  id: string;
  url: string;
  url_type: string;
  is_active: boolean;
  last_check: string;
  priority: number;
  reference_id: string;
  created_at: string;
  updated_at: string;
}

export const useMonitoringData = () => {
  const [stats, setStats] = useState<MonitoringStats>({
    totalMonitors: 0,
    upMonitors: 0,
    downMonitors: 0,
    avgResponseTime: 0,
    uptime: 0,
    incidents: 0
  });
  const [monitoredUrls, setMonitoredUrls] = useState<MonitoredURL[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monitored_urls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMonitoredUrls(data || []);

      // Calculer les stats basiques
      const totalMonitors = data?.length || 0;
      const upMonitors = data?.filter(url => url.is_active).length || 0;
      const downMonitors = totalMonitors - upMonitors;
      const avgResponseTime = 200; // Valeur par défaut
      
      const uptime = totalMonitors > 0 ? (upMonitors / totalMonitors) * 100 : 100;

      setStats({
        totalMonitors,
        upMonitors,
        downMonitors,
        avgResponseTime: Math.round(avgResponseTime),
        uptime: Number(uptime.toFixed(1)),
        incidents: downMonitors
      });

    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de monitoring",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addUrlToMonitoring = async (url: string, urlType: string) => {
    try {
      const { error } = await supabase.functions.invoke('add-url-to-monitoring', {
        body: {
          url,
          url_type: urlType,
          priority: 5
        }
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "URL ajoutée au monitoring"
      });

      await fetchMonitoringData();
    } catch (error) {
      console.error('Error adding URL to monitoring:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'URL au monitoring",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  return {
    stats,
    monitoredUrls,
    loading,
    fetchMonitoringData,
    addUrlToMonitoring
  };
};