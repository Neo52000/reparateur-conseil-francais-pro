import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RelaunchLog {
  id: string;
  campaign_name: string;
  campaign_type: string;
  trigger_event: string;
  status: string;
  emails_sent: number;
  sms_sent: number;
  opened_count: number;
  clicked_count: number;
  converted_count: number;
  next_execution: string | null;
  created_at: string;
}

export const useRelaunchCampaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<RelaunchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEmails: 0,
    totalSMS: 0,
    totalOpened: 0,
    totalClicked: 0,
    conversionRate: 0
  });

  const loadCampaignData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('relaunch_campaign_logs')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLogs(data || []);

      // Calculer les statistiques
      const totalEmails = data?.reduce((sum, log) => sum + (log.emails_sent || 0), 0) || 0;
      const totalSMS = data?.reduce((sum, log) => sum + (log.sms_sent || 0), 0) || 0;
      const totalOpened = data?.reduce((sum, log) => sum + (log.opened_count || 0), 0) || 0;
      const totalClicked = data?.reduce((sum, log) => sum + (log.clicked_count || 0), 0) || 0;
      const totalConverted = data?.reduce((sum, log) => sum + (log.converted_count || 0), 0) || 0;

      setStats({
        totalCampaigns: data?.length || 0,
        activeCampaigns: data?.filter(log => log.status === 'running').length || 0,
        totalEmails,
        totalSMS,
        totalOpened,
        totalClicked,
        conversionRate: totalEmails > 0 ? (totalConverted / totalEmails) * 100 : 0
      });

    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les campagnes de relance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: {
    campaign_name: string;
    campaign_type: string;
    trigger_event: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('relaunch_campaign_logs')
        .insert({
          repairer_id: user.id,
          ...campaignData,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Campagne créée",
        description: "La nouvelle campagne de relance a été créée"
      });

      await loadCampaignData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la campagne",
        variant: "destructive"
      });
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('relaunch_campaign_logs')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;

      await loadCampaignData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadCampaignData();
    }
  }, [user]);

  return {
    logs,
    stats,
    loading,
    loadCampaignData,
    createCampaign,
    updateCampaignStatus
  };
};