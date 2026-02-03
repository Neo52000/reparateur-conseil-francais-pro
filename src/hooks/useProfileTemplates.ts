import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileTemplate, ProfileWidget, ProfileTheme, DEFAULT_THEME } from '@/types/profileBuilder';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour gérer les templates de profils réparateurs
 */
export const useProfileTemplates = () => {
  const [templates, setTemplates] = useState<ProfileTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Charge tous les templates depuis la base de données
   */
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: queryError } = await supabase
        .from('profile_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      // Parse les widgets JSONB avec cast via unknown
      const parsed = (data || []).map(t => ({
        ...t,
        widgets: t.widgets as unknown as ProfileWidget[],
        theme_data: t.theme_data as unknown as ProfileTheme,
      }));

      setTemplates(parsed);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère le template par défaut
   */
  const getDefaultTemplate = useCallback((): ProfileTemplate | null => {
    return templates.find(t => t.is_default) || templates[0] || null;
  }, [templates]);

  /**
   * Récupère un template par son ID
   */
  const getTemplateById = useCallback((id: string): ProfileTemplate | null => {
    return templates.find(t => t.id === id) || null;
  }, [templates]);

  /**
   * Crée un nouveau template
   */
  const createTemplate = async (
    name: string, 
    description: string, 
    widgets: ProfileWidget[],
    themeData: ProfileTheme = DEFAULT_THEME,
    isAIGenerated: boolean = false
  ): Promise<ProfileTemplate | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('profile_templates')
        .insert({
          name,
          description,
          widgets: widgets as any,
          theme_data: themeData as any,
          is_default: false,
          is_ai_generated: isAIGenerated,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newTemplate = {
        ...data,
        widgets: data.widgets as unknown as ProfileWidget[],
        theme_data: data.theme_data as unknown as ProfileTheme,
      };

      setTemplates(prev => [newTemplate, ...prev]);
      
      toast({
        title: "Template créé",
        description: `Le template "${name}" a été créé avec succès.`,
      });

      return newTemplate;
    } catch (err: any) {
      console.error('Error creating template:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer le template.",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Met à jour un template existant
   */
  const updateTemplate = async (
    id: string, 
    updates: Partial<Pick<ProfileTemplate, 'name' | 'description' | 'widgets' | 'theme_data'>>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('profile_templates')
        .update({
          ...updates,
          widgets: updates.widgets as any,
          theme_data: updates.theme_data as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setTemplates(prev => prev.map(t => 
        t.id === id 
          ? { ...t, ...updates, updated_at: new Date().toISOString() } 
          : t
      ));

      toast({
        title: "Template mis à jour",
        description: "Les modifications ont été enregistrées.",
      });

      return true;
    } catch (err: any) {
      console.error('Error updating template:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le template.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Définit un template comme template par défaut
   */
  const setAsDefault = async (id: string): Promise<boolean> => {
    try {
      // D'abord retirer is_default de tous les templates
      await supabase
        .from('profile_templates')
        .update({ is_default: false })
        .neq('id', id);

      // Puis définir le nouveau par défaut
      const { error: updateError } = await supabase
        .from('profile_templates')
        .update({ is_default: true })
        .eq('id', id);

      if (updateError) throw updateError;

      setTemplates(prev => prev.map(t => ({
        ...t,
        is_default: t.id === id,
      })));

      toast({
        title: "Template par défaut",
        description: "Ce template est maintenant le template par défaut.",
      });

      return true;
    } catch (err: any) {
      console.error('Error setting default template:', err);
      toast({
        title: "Erreur",
        description: "Impossible de définir le template par défaut.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Duplique un template
   */
  const duplicateTemplate = async (id: string): Promise<ProfileTemplate | null> => {
    const original = getTemplateById(id);
    if (!original) return null;

    return createTemplate(
      `${original.name} (copie)`,
      original.description || '',
      original.widgets,
      original.theme_data,
      original.is_ai_generated
    );
  };

  /**
   * Supprime un template
   */
  const deleteTemplate = async (id: string): Promise<boolean> => {
    const template = getTemplateById(id);
    
    if (template?.is_default) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template par défaut.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('profile_templates')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setTemplates(prev => prev.filter(t => t.id !== id));

      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé.",
      });

      return true;
    } catch (err: any) {
      console.error('Error deleting template:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Exporte un template en JSON
   */
  const exportTemplate = (id: string): string | null => {
    const template = getTemplateById(id);
    if (!template) return null;

    const exportData = {
      name: template.name,
      description: template.description,
      widgets: template.widgets,
      theme_data: template.theme_data,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  };

  /**
   * Importe un template depuis JSON
   */
  const importTemplate = async (jsonString: string): Promise<ProfileTemplate | null> => {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.name || !data.widgets || !Array.isArray(data.widgets)) {
        throw new Error('Format de template invalide');
      }

      return createTemplate(
        data.name,
        data.description || '',
        data.widgets,
        data.theme_data || DEFAULT_THEME,
        false
      );
    } catch (err: any) {
      console.error('Error importing template:', err);
      toast({
        title: "Erreur d'import",
        description: "Le fichier JSON n'est pas un template valide.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Charge les templates au montage
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getDefaultTemplate,
    getTemplateById,
    createTemplate,
    updateTemplate,
    setAsDefault,
    duplicateTemplate,
    deleteTemplate,
    exportTemplate,
    importTemplate,
  };
};
