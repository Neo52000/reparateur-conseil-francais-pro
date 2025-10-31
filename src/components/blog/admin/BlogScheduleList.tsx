import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2 } from 'lucide-react';
import { BlogScheduleCard } from './BlogScheduleCard';
import { BlogAutomationSchedule } from '@/types/blogAutomation';
import { BlogCategory } from '@/types/blog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const BlogScheduleList = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<BlogAutomationSchedule[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('blog_automation_schedules')
        .select(`
          *,
          category:blog_categories(id, name, slug, icon)
        `)
        .order('schedule_day', { ascending: true })
        .order('schedule_time', { ascending: true });

      if (schedulesError) throw schedulesError;

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      setSchedules(schedulesData || []);
      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les planifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    try {
      const newSchedule = {
        name: 'Nouvelle planification',
        enabled: true,
        category_id: null,
        schedule_day: 1, // Monday
        schedule_time: '08:00',
        auto_publish: false,
        ai_model: 'google/gemini-2.5-flash',
        prompt_template: null
      };

      const { data, error } = await supabase
        .from('blog_automation_schedules')
        .insert(newSchedule)
        .select(`
          *,
          category:blog_categories(id, name, slug, icon)
        `)
        .single();

      if (error) throw error;

      setSchedules([...schedules, data]);
      toast({
        title: "Planification créée",
        description: "Configurez les détails de votre nouvelle planification"
      });
    } catch (error: any) {
      console.error('Error adding schedule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la planification",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSchedule = async (updatedSchedule: BlogAutomationSchedule) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('blog_automation_schedules')
        .update({
          name: updatedSchedule.name,
          enabled: updatedSchedule.enabled,
          category_id: updatedSchedule.category_id,
          schedule_day: updatedSchedule.schedule_day,
          schedule_time: updatedSchedule.schedule_time,
          auto_publish: updatedSchedule.auto_publish
        })
        .eq('id', updatedSchedule.id);

      if (error) throw error;

      setSchedules(schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s));
      
      toast({
        title: "Sauvegardé",
        description: "Planification mise à jour avec succès"
      });
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la planification",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('blog_automation_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      setSchedules(schedules.filter(s => s.id !== scheduleId));
      
      toast({
        title: "Supprimée",
        description: "Planification supprimée avec succès"
      });
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la planification",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aucune planification</AlertTitle>
          <AlertDescription>
            Créez votre première planification d'articles automatisés en cliquant sur le bouton ci-dessous.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <BlogScheduleCard
              key={schedule.id}
              schedule={schedule}
              categories={categories}
              onUpdate={handleUpdateSchedule}
              onDelete={() => handleDeleteSchedule(schedule.id)}
            />
          ))}
        </div>
      )}

      <Button onClick={handleAddSchedule} className="w-full" disabled={saving}>
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une planification
      </Button>
    </div>
  );
};
