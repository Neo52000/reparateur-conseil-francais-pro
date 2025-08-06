import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FooterSection {
  id: string;
  section_key: string;
  title: string;
  content: string;
  links: Array<{
    title: string;
    url: string;
    className?: string;
  }>;
  display_order: number;
  is_active: boolean;
  parent_id?: string | null;
}

export const useFooterConfig = () => {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFooterConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_configuration')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      // Transformer les données pour s'assurer que links est un tableau
      const transformedData = (data || []).map(item => ({
        ...item,
        links: Array.isArray(item.links) ? item.links : 
               typeof item.links === 'string' ? JSON.parse(item.links) : []
      }));
      
      setSections(transformedData);
    } catch (error) {
      console.error('Error loading footer config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration du footer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (sectionId: string, updates: Partial<FooterSection>) => {
    try {
      const { error } = await supabase
        .from('footer_configuration')
        .update(updates)
        .eq('id', sectionId);

      if (error) throw error;
      
      await loadFooterConfig();
      toast({
        title: "Succès",
        description: "Section mise à jour avec succès"
      });
    } catch (error) {
      console.error('Error updating footer section:', error);
      toast({
        title: "Erreur", 
        description: "Impossible de mettre à jour la section",
        variant: "destructive"
      });
    }
  };

  const createSection = async (section: Omit<FooterSection, 'id'>) => {
    try {
      const { error } = await supabase
        .from('footer_configuration')
        .insert([section]);

      if (error) throw error;
      
      await loadFooterConfig();
      toast({
        title: "Succès",
        description: "Section créée avec succès"
      });
    } catch (error) {
      console.error('Error creating footer section:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la section", 
        variant: "destructive"
      });
    }
  };

  const reorderSections = async (sourceIndex: number, destinationIndex: number, parentId?: string | null) => {
    try {
      const sectionsToReorder = sections
        .filter(s => s.parent_id === parentId)
        .sort((a, b) => a.display_order - b.display_order);
      
      const [removed] = sectionsToReorder.splice(sourceIndex, 1);
      sectionsToReorder.splice(destinationIndex, 0, removed);
      
      // Mettre à jour les ordres d'affichage
      for (let i = 0; i < sectionsToReorder.length; i++) {
        await updateSection(sectionsToReorder[i].id, { display_order: i });
      }
      
      toast({
        title: "Succès",
        description: "Sections réorganisées avec succès"
      });
    } catch (error) {
      console.error('Error reordering sections:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réorganiser les sections",
        variant: "destructive"
      });
    }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('footer_configuration')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      
      await loadFooterConfig();
      toast({
        title: "Succès",
        description: "Section supprimée avec succès"
      });
    } catch (error) {
      console.error('Error deleting footer section:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la section",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadFooterConfig();
  }, []);

  return {
    sections,
    loading,
    updateSection,
    createSection,
    deleteSection,
    reorderSections,
    refreshConfig: loadFooterConfig
  };
};