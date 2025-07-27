import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface RepairerService {
  id: string;
  service_name: string;
  description?: string;
  base_price?: number;
  duration_minutes: number;
  is_active: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useRepairerServices = () => {
  const [services, setServices] = useState<RepairerService[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchServices = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('repairer_services')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching repairer services:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Omit<RepairerService, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('repairer_services')
        .insert({
          ...serviceData,
          repairer_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [data, ...prev]);
      toast({
        title: "Service créé",
        description: "Le service a été ajouté avec succès"
      });

      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le service",
        variant: "destructive"
      });
    }
  };

  const updateService = async (id: string, updates: Partial<RepairerService>) => {
    try {
      const { data, error } = await supabase
        .from('repairer_services')
        .update(updates)
        .eq('id', id)
        .eq('repairer_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setServices(prev => 
        prev.map(service => service.id === id ? data : service)
      );

      toast({
        title: "Service mis à jour",
        description: "Les modifications ont été sauvegardées"
      });

      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le service",
        variant: "destructive"
      });
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('repairer_services')
        .delete()
        .eq('id', id)
        .eq('repairer_id', user?.id);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.id !== id));
      toast({
        title: "Service supprimé",
        description: "Le service a été supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service",
        variant: "destructive"
      });
    }
  };

  const toggleServiceStatus = async (id: string, isActive: boolean) => {
    await updateService(id, { is_active: isActive });
  };

  useEffect(() => {
    fetchServices();
  }, [user?.id]);

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    refetch: fetchServices
  };
};