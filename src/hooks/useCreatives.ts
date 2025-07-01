
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Creative, CreateCreativeData, CreativeTemplate } from '@/types/creatives';
import { toast } from 'sonner';

export const useCreatives = () => {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [templates, setTemplates] = useState<CreativeTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCreatives = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_creatives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCreatives(data || []);
    } catch (error) {
      console.error('Error fetching creatives:', error);
      toast.error('Erreur lors du chargement des créatifs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('creative_templates')
        .select('*')
        .eq('is_active', true)
        .order('category');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erreur lors du chargement des templates');
    }
  };

  const createCreative = async (creativeData: CreateCreativeData) => {
    try {
      const { data, error } = await supabase
        .from('campaign_creatives')
        .insert([creativeData])
        .select()
        .single();

      if (error) throw error;
      
      setCreatives(prev => [data, ...prev]);
      toast.success('Créatif créé avec succès');
      return data;
    } catch (error) {
      console.error('Error creating creative:', error);
      toast.error('Erreur lors de la création du créatif');
      throw error;
    }
  };

  const updateCreative = async (id: string, updates: Partial<CreateCreativeData>) => {
    try {
      const { data, error } = await supabase
        .from('campaign_creatives')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCreatives(prev => 
        prev.map(creative => creative.id === id ? data : creative)
      );
      toast.success('Créatif modifié avec succès');
      return data;
    } catch (error) {
      console.error('Error updating creative:', error);
      toast.error('Erreur lors de la modification du créatif');
      throw error;
    }
  };

  const deleteCreative = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaign_creatives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCreatives(prev => prev.filter(creative => creative.id !== id));
      toast.success('Créatif supprimé avec succès');
    } catch (error) {
      console.error('Error deleting creative:', error);
      toast.error('Erreur lors de la suppression du créatif');
      throw error;
    }
  };

  const duplicateCreative = async (id: string) => {
    try {
      const original = creatives.find(c => c.id === id);
      if (!original) throw new Error('Créatif introuvable');

      const duplicate = {
        name: `${original.name} (Copie)`,
        creative_type: original.creative_type,
        creative_url: original.creative_url,
        creative_data: original.creative_data,
        ai_generated: original.ai_generated,
        campaign_id: original.campaign_id,
        tags: original.tags,
        metadata: original.metadata,
      };

      return await createCreative(duplicate);
    } catch (error) {
      console.error('Error duplicating creative:', error);
      toast.error('Erreur lors de la duplication du créatif');
      throw error;
    }
  };

  const uploadFile = async (file: File, folder = 'creatives') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('creatives')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('creatives')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors du téléchargement du fichier');
      throw error;
    }
  };

  useEffect(() => {
    fetchCreatives();
    fetchTemplates();
  }, []);

  return {
    creatives,
    templates,
    loading,
    fetchCreatives,
    createCreative,
    updateCreative,
    deleteCreative,
    duplicateCreative,
    uploadFile,
  };
};
