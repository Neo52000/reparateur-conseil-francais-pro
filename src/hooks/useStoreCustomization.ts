import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StoreCustomization {
  id: string;
  store_name?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  custom_css?: string;
  theme_settings: any;
  domain_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useStoreCustomization = () => {
  const [customization, setCustomization] = useState<StoreCustomization | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCustomization = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_customizations')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCustomization(data);
    } catch (error) {
      console.error('Error fetching customization:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomization = async (updates: Partial<StoreCustomization>) => {
    try {
      setLoading(true);
      
      if (customization) {
        // Mettre à jour
        const { data, error } = await supabase
          .from('store_customizations')
          .update(updates)
          .eq('id', customization.id)
          .select()
          .single();

        if (error) throw error;
        setCustomization(data);
      } else {
        // Créer
        const { data, error } = await supabase
          .from('store_customizations')
          .insert(updates)
          .select()
          .single();

        if (error) throw error;
        setCustomization(data);
      }

      toast({
        title: "Succès",
        description: "Personnalisation mise à jour",
      });
    } catch (error) {
      console.error('Error updating customization:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la personnalisation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const themeColors = {
      light: {
        primary_color: '#4F46E5',
        secondary_color: '#10B981',
      },
      dark: {
        primary_color: '#6366F1',
        secondary_color: '#059669',
      },
      auto: {
        primary_color: '#4F46E5',
        secondary_color: '#10B981',
      }
    };

    updateCustomization({
      ...themeColors[theme],
      theme_settings: { ...customization?.theme_settings, theme }
    });
  };

  useEffect(() => {
    fetchCustomization();
  }, []);

  return {
    customization,
    loading,
    updateCustomization,
    applyTheme,
    refetch: fetchCustomization,
  };
};