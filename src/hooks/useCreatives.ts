
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
      
      // Mapper les données de la base vers notre type Creative
      const mappedCreatives: Creative[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || 'Sans nom',
        creative_type: item.creative_type as 'image' | 'video' | 'text',
        creative_url: item.creative_url,
        creative_data: item.creative_data as Record<string, any>,
        ai_generated: item.ai_generated,
        performance_score: item.performance_score || 0,
        status: item.status as 'draft' | 'active' | 'archived',
        campaign_id: item.campaign_id,
        tags: [], // Temporaire en attendant la mise à jour de la table
        metadata: item.metadata as Record<string, any>,
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at,
        created_by: item.created_by
      }));
      
      setCreatives(mappedCreatives);
    } catch (error) {
      console.error('Error fetching creatives:', error);
      toast.error('Erreur lors du chargement des créatifs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      // Utiliser des templates statiques pour l'instant
      const staticTemplates: CreativeTemplate[] = [
        {
          id: '1',
          name: 'Bannière Simple',
          category: 'image',
          template_data: { width: 728, height: 90, background: '#ffffff' },
          preview_url: undefined,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          name: 'Vidéo Courte',
          category: 'video',
          template_data: { duration: 15, aspect_ratio: '16:9' },
          preview_url: undefined,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];
      setTemplates(staticTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erreur lors du chargement des templates');
    }
  };

  const createCreative = async (creativeData: CreateCreativeData): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('campaign_creatives')
        .insert([{
          name: creativeData.name,
          creative_type: creativeData.creative_type,
          creative_url: creativeData.creative_url,
          creative_data: creativeData.creative_data || {},
          ai_generated: creativeData.ai_generated || false,
          campaign_id: creativeData.campaign_id,
          metadata: creativeData.metadata || {}
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Mapper vers notre type Creative
      const newCreative: Creative = {
        id: data.id,
        name: data.name || 'Sans nom',
        creative_type: data.creative_type as 'image' | 'video' | 'text',
        creative_url: data.creative_url,
        creative_data: data.creative_data as Record<string, any>,
        ai_generated: data.ai_generated,
        performance_score: data.performance_score || 0,
        status: data.status as 'draft' | 'active' | 'archived',
        campaign_id: data.campaign_id,
        tags: [],
        metadata: data.metadata as Record<string, any>,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at,
        created_by: data.created_by
      };
      
      setCreatives(prev => [newCreative, ...prev]);
      toast.success('Créatif créé avec succès');
    } catch (error) {
      console.error('Error creating creative:', error);
      toast.error('Erreur lors de la création du créatif');
      throw error;
    }
  };

  const updateCreative = async (id: string, updates: Partial<CreateCreativeData>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('campaign_creatives')
        .update({
          name: updates.name,
          creative_type: updates.creative_type,
          creative_url: updates.creative_url,
          creative_data: updates.creative_data,
          metadata: updates.metadata
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Mapper vers notre type Creative
      const updatedCreative: Creative = {
        id: data.id,
        name: data.name || 'Sans nom',
        creative_type: data.creative_type as 'image' | 'video' | 'text',
        creative_url: data.creative_url,
        creative_data: data.creative_data as Record<string, any>,
        ai_generated: data.ai_generated,
        performance_score: data.performance_score || 0,
        status: data.status as 'draft' | 'active' | 'archived',
        campaign_id: data.campaign_id,
        tags: [],
        metadata: data.metadata as Record<string, any>,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at,
        created_by: data.created_by
      };

      setCreatives(prev => 
        prev.map(creative => creative.id === id ? updatedCreative : creative)
      );
      toast.success('Créatif modifié avec succès');
    } catch (error) {
      console.error('Error updating creative:', error);
      toast.error('Erreur lors de la modification du créatif');
      throw error;
    }
  };

  const deleteCreative = async (id: string): Promise<void> => {
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

  const duplicateCreative = async (id: string): Promise<void> => {
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
        metadata: original.metadata,
      };

      await createCreative(duplicate);
    } catch (error) {
      console.error('Error duplicating creative:', error);
      toast.error('Erreur lors de la duplication du créatif');
      throw error;
    }
  };

  const uploadFile = async (file: File, folder = 'creatives'): Promise<string> => {
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
