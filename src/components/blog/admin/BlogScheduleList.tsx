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
      console.log('🔄 Loading blog schedules from database...');

      // Direct DB access (RLS allows admin)
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('blog_automation_schedules')
        .select('*')
        .order('schedule_day', { ascending: true })
        .order('schedule_time', { ascending: true });

      if (schedulesError) throw schedulesError;

      setSchedules(schedulesData || []);

      // Load categories directly (read access)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les planifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    setSaving(true);
    try {
      const newSchedule = {
        name: 'Nouvelle planification',
        enabled: true,
        category_id: null,
        schedule_day: 1, // Monday (0-6)
        schedule_time: '08:00', // HH:mm format
        auto_publish: false,
        ai_model: 'google/gemini-2.5-flash',
        prompt_template: null
      };

      // Validate before insert
      if (newSchedule.schedule_day < 0 || newSchedule.schedule_day > 6) {
        throw new Error('Le jour doit être entre 0 (dimanche) et 6 (samedi)');
      }
      if (!/^\d{2}:\d{2}$/.test(newSchedule.schedule_time)) {
        throw new Error('L\'heure doit être au format HH:mm');
      }

      console.log('➕ Creating schedule:', newSchedule);
      
      // Direct insert (RLS admin policy) with fallback when SELECT is blocked by RLS
      const { data: insertedRows, error: insertError } = await supabase
        .from('blog_automation_schedules')
        .insert(newSchedule)
        .select('*');

      if (insertError) throw insertError;

      const inserted = Array.isArray(insertedRows) ? insertedRows[0] : undefined;

      if (inserted) {
        setSchedules([...schedules, inserted as BlogAutomationSchedule]);
      } else {
        // If RLS prevents returning the inserted row, reload the list
        await loadData();
      }

      toast({
        title: '✅ Planification créée',
        description: 'Configurez les détails de votre nouvelle planification'
      });
    } catch (error: any) {
      console.error('❌ Error adding schedule:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la planification",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSchedule = async (updatedSchedule: BlogAutomationSchedule) => {
    setSaving(true);
    try {
      // Validate fields
      if (updatedSchedule.schedule_day < 0 || updatedSchedule.schedule_day > 6) {
        throw new Error('Le jour doit être entre 0 (dimanche) et 6 (samedi)');
      }
      if (!/^\d{2}:\d{2}$/.test(updatedSchedule.schedule_time)) {
        throw new Error('L\'heure doit être au format HH:mm (ex: 08:00)');
      }

      const updatePayload = {
        name: updatedSchedule.name,
        enabled: updatedSchedule.enabled,
        category_id: updatedSchedule.category_id,
        schedule_day: updatedSchedule.schedule_day,
        schedule_time: updatedSchedule.schedule_time,
        auto_publish: updatedSchedule.auto_publish,
        ai_model: updatedSchedule.ai_model,
        prompt_template: updatedSchedule.prompt_template
      };

      console.log('💾 Updating schedule:', updatedSchedule.id, updatePayload);
      
      // Direct update (RLS admin policy) with fallback when SELECT is blocked by RLS
      const { data: updatedRows, error: updateError } = await supabase
        .from('blog_automation_schedules')
        .update(updatePayload)
        .eq('id', updatedSchedule.id)
        .select('*');

      if (updateError) throw updateError;

      const updated = Array.isArray(updatedRows) ? updatedRows[0] : undefined;

      if (updated) {
        setSchedules(schedules.map(s => s.id === updatedSchedule.id ? (updated as BlogAutomationSchedule) : s));
      } else {
        await loadData();
      }
      
      toast({
        title: '✅ Sauvegardé',
        description: 'Planification mise à jour avec succès'
      });
    } catch (error: any) {
      console.error('❌ Error updating schedule:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la planification",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      console.log('🗑️ Deleting schedule:', scheduleId);
      
      // Direct delete (RLS admin policy)
      const { error: deleteError } = await supabase
        .from('blog_automation_schedules')
        .delete()
        .eq('id', scheduleId);

      if (deleteError) throw deleteError;

      setSchedules(schedules.filter(s => s.id !== scheduleId));
      
      toast({
        title: 'Supprimée',
        description: 'Planification supprimée avec succès'
      });
    } catch (error: any) {
      console.error('❌ Error deleting schedule:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la planification",
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
