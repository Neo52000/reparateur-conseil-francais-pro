import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ZapierIntegration {
  id: string;
  webhook_url: string;
  integration_name: string;
  trigger_events: string[];
  is_active: boolean;
  last_triggered_at?: string;
  success_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

export const useZapierIntegrations = () => {
  const [integrations, setIntegrations] = useState<ZapierIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('zapier_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les intégrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createIntegration = async (data: Omit<ZapierIntegration, 'id' | 'created_at' | 'updated_at' | 'success_count' | 'error_count' | 'last_triggered_at'>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('zapier_integrations')
        .insert(data);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Intégration Zapier créée",
      });

      await fetchIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'intégration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIntegration = async (id: string, updates: Partial<ZapierIntegration>) => {
    try {
      const { error } = await supabase
        .from('zapier_integrations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Intégration mise à jour",
      });

      await fetchIntegrations();
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'intégration",
        variant: "destructive",
      });
    }
  };

  const triggerWebhook = async (integrationId: string, eventType: string, eventData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('trigger-zapier-webhook', {
        body: {
          integrationId,
          eventType,
          eventData
        }
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Webhook déclenché pour ${data.integration_name}`,
      });

      await fetchIntegrations();
      return data;
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déclencher le webhook",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('zapier_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Intégration supprimée",
      });

      await fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'intégration",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    loading,
    createIntegration,
    updateIntegration,
    triggerWebhook,
    deleteIntegration,
    refetch: fetchIntegrations,
  };
};