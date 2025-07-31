import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

export interface UIConfiguration {
  id: string;
  name: string;
  type: 'plan_visualization' | 'repairer_dashboard';
  configuration: Record<string, any>;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  version: number;
  description?: string | null;
  tags: string[];
}

export interface UITemplate {
  id: string;
  name: string;
  category: string;
  template_data: Record<string, any>;
  preview_image_url?: string | null;
  usage_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
  description?: string | null;
}

export interface UITheme {
  id: string;
  name: string;
  type: string;
  theme_data: Record<string, any>;
  css_variables?: Record<string, any> | null;
  tailwind_config?: Record<string, any> | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  preview_image_url?: string | null;
  accessibility_score?: number | null;
  description?: string | null;
}

export interface UIABTest {
  id: string;
  name: string;
  description?: string | null;
  control_config_id?: string | null;
  variant_config_id?: string | null;
  status: 'draft' | 'running' | 'paused' | 'completed';
  start_date?: string | null;
  end_date?: string | null;
  traffic_split: number;
  target_audience: Record<string, any>;
  success_metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useUIConfigurations = () => {
  const [configurations, setConfigurations] = useState<UIConfiguration[]>([]);
  const [templates, setTemplates] = useState<UITemplate[]>([]);
  const [themes, setThemes] = useState<UITheme[]>([]);
  const [abTests, setAbTests] = useState<UIABTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all configurations
  const fetchConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ui_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigurations((data || []) as UIConfiguration[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching configurations');
      toast({
        title: "Erreur",
        description: "Impossible de charger les configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ui_templates')
        .select('*')
        .order('is_featured', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as UITemplate[]);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, []);

  // Fetch themes
  const fetchThemes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ui_themes')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      setThemes((data || []) as UITheme[]);
    } catch (err) {
      console.error('Error fetching themes:', err);
    }
  }, []);

  // Fetch A/B tests
  const fetchABTests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ui_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAbTests((data || []) as UIABTest[]);
    } catch (err) {
      console.error('Error fetching A/B tests:', err);
    }
  }, []);

  // Save configuration
  const saveConfiguration = useCallback(async (config: Partial<UIConfiguration>) => {
    try {
      setLoading(true);
      
      if (config.id) {
        // Update existing
        const { data, error } = await supabase
          .from('ui_configurations')
          .update({
            name: config.name,
            configuration: config.configuration,
            is_active: config.is_active,
            description: config.description,
            tags: config.tags,
          })
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        
        setConfigurations(prev => 
          prev.map(c => c.id === config.id ? (data as UIConfiguration) : c)
        );
      } else {
        // Create new
        const { data, error } = await supabase
          .from('ui_configurations')
          .insert({
            name: config.name!,
            type: config.type!,
            configuration: config.configuration || {},
            is_active: config.is_active || false,
            description: config.description,
            tags: config.tags || [],
          })
          .select()
          .single();

        if (error) throw error;
        
        setConfigurations(prev => [data as UIConfiguration, ...prev]);
      }

      toast({
        title: "Succès",
        description: "Configuration sauvegardée",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving configuration');
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete configuration
  const deleteConfiguration = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('ui_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setConfigurations(prev => prev.filter(c => c.id !== id));
      
      toast({
        title: "Succès",
        description: "Configuration supprimée",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting configuration');
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la configuration",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Clone configuration
  const cloneConfiguration = useCallback(async (id: string, newName: string) => {
    try {
      const original = configurations.find(c => c.id === id);
      if (!original) throw new Error('Configuration not found');

      const { data, error } = await supabase
        .from('ui_configurations')
        .insert({
          name: newName,
          type: original.type,
          configuration: original.configuration,
          is_active: false,
          description: `Clone de ${original.name}`,
          tags: original.tags,
        })
        .select()
        .single();

      if (error) throw error;
      
      setConfigurations(prev => [data as UIConfiguration, ...prev]);
      
      toast({
        title: "Succès",
        description: "Configuration clonée",
      });
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cloning configuration');
      toast({
        title: "Erreur",
        description: "Impossible de cloner la configuration",
        variant: "destructive",
      });
    }
  }, [configurations, toast]);

  // Create A/B test
  const createABTest = useCallback(async (test: Partial<UIABTest>) => {
    try {
      const { data, error } = await supabase
        .from('ui_ab_tests')
        .insert({
          name: test.name!,
          description: test.description,
          control_config_id: test.control_config_id,
          variant_config_id: test.variant_config_id,
          status: test.status || 'draft',
          traffic_split: test.traffic_split || 0.5,
          target_audience: test.target_audience || {},
          success_metrics: test.success_metrics || {},
        })
        .select()
        .single();

      if (error) throw error;
      
      setAbTests(prev => [data as UIABTest, ...prev]);
      
      toast({
        title: "Succès",
        description: "Test A/B créé",
      });
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating A/B test');
      toast({
        title: "Erreur",
        description: "Impossible de créer le test A/B",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Track analytics event
  const trackAnalyticsEvent = useCallback(async (
    eventType: string,
    eventData: Record<string, any>,
    configurationId?: string,
    abTestId?: string
  ) => {
    try {
      await supabase
        .from('ui_analytics')
        .insert({
          configuration_id: configurationId,
          ab_test_id: abTestId,
          event_type: eventType,
          event_data: eventData,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        });
    } catch (err) {
      console.error('Error tracking analytics:', err);
    }
  }, []);

  useEffect(() => {
    fetchConfigurations();
    fetchTemplates();
    fetchThemes();
    fetchABTests();
  }, [fetchConfigurations, fetchTemplates, fetchThemes, fetchABTests]);

  return {
    configurations,
    templates,
    themes,
    abTests,
    loading,
    error,
    saveConfiguration,
    deleteConfiguration,
    cloneConfiguration,
    createABTest,
    trackAnalyticsEvent,
    refetch: () => {
      fetchConfigurations();
      fetchTemplates();
      fetchThemes();
      fetchABTests();
    },
  };
};