import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AICreative {
  id: string;
  name: string;
  template_type: 'text' | 'image' | 'video' | 'carousel';
  creative_style: 'technique' | 'proximite' | 'urgence' | 'humour' | 'premium';
  template_data: any;
  ai_model: string;
  generation_prompt?: string;
  performance_score: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GenerateCreativeRequest {
  type: 'text' | 'image' | 'video';
  prompt: string;
  style: 'technique' | 'proximite' | 'urgence' | 'humour' | 'premium';
  dimensions?: { width: number; height: number };
}

export const useAICreatives = () => {
  const [creatives, setCreatives] = useState<AICreative[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCreatives = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_campaign_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCreatives(data as AICreative[] || []);
    } catch (error) {
      console.error('Error fetching creatives:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créatifs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCreative = async (request: GenerateCreativeRequest) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-creative', {
        body: request
      });

      if (error) throw error;

      // Sauvegarder le créatif généré
      const { error: saveError } = await supabase
        .from('ai_campaign_templates')
        .insert({
          name: `Créatif ${request.type} ${request.style}`,
          template_type: request.type,
          creative_style: request.style,
          template_data: data.creative,
          ai_model: 'mistral',
          generation_prompt: request.prompt,
        });

      if (saveError) throw saveError;

      toast({
        title: "Succès",
        description: "Créatif généré avec succès",
      });

      await fetchCreatives();
      return data.creative;
    } catch (error) {
      console.error('Error generating creative:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le créatif",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCreative = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_campaign_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Créatif supprimé",
      });

      await fetchCreatives();
    } catch (error) {
      console.error('Error deleting creative:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le créatif",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCreatives();
  }, []);

  return {
    creatives,
    loading,
    generateCreative,
    deleteCreative,
    refetch: fetchCreatives,
  };
};