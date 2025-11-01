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
      console.log('🔄 Loading blog schedules via Edge Function...');

      // Load schedules via Edge Function
      const { data: schedulesResponse, error: schedulesError } = await supabase.functions.invoke('blog-schedules', {
        body: { action: 'list' }
      });

      if (schedulesError) {
        console.error('❌ Error loading schedules:', schedulesError);
        throw new Error('Erreur lors du chargement des planifications');
      }

      if (!schedulesResponse?.success) {
        console.error('❌ Edge function error:', schedulesResponse);
        if (schedulesResponse?.error === 'forbidden') {
          throw new Error('Accès refusé - connexion admin requise');
        }
        throw new Error(schedulesResponse?.message || 'Erreur lors du chargement');
      }

      console.log('✅ Schedules loaded:', schedulesResponse.schedules?.length || 0);
      setSchedules(schedulesResponse.schedules || []);

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
        title: "Erreur",
        description: error.message || "Impossible de charger les planifications",
        variant: "destructive"
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

      console.log('➕ Creating schedule via Edge Function:', newSchedule);
      const { data: response, error } = await supabase.functions.invoke('blog-schedules', {
        body: { action: 'create', payload: newSchedule }
      });

      if (error) {
        console.error('❌ Error creating schedule:', error);
        throw new Error('Erreur lors de la création');
      }

      if (!response?.success) {
        console.error('❌ Edge function error:', response);
        if (response?.error === 'forbidden') {
          throw new Error('Accès refusé - connexion admin requise');
        }
        throw new Error(response?.message || 'Erreur lors de la création');
      }

      setSchedules([...schedules, response.schedule]);
      toast({
        title: "✅ Planification créée",
        description: "Configurez les détails de votre nouvelle planification"
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

      console.log('💾 Updating schedule via Edge Function:', updatedSchedule.id, updatePayload);
      const { data: response, error } = await supabase.functions.invoke('blog-schedules', {
        body: { action: 'update', id: updatedSchedule.id, payload: updatePayload }
      });

      if (error) {
        console.error('❌ Error updating schedule:', error);
        throw new Error('Erreur lors de la mise à jour');
      }

      if (!response?.success) {
        console.error('❌ Edge function error:', response);
        if (response?.error === 'forbidden') {
          throw new Error('Accès refusé - connexion admin requise');
        }
        throw new Error(response?.message || 'Erreur lors de la mise à jour');
      }

      setSchedules(schedules.map(s => s.id === updatedSchedule.id ? response.schedule : s));
      
      toast({
        title: "✅ Sauvegardé",
        description: "Planification mise à jour avec succès"
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
      console.log('🗑️ Deleting schedule via Edge Function:', scheduleId);
      const { data: response, error } = await supabase.functions.invoke('blog-schedules', {
        body: { action: 'delete', id: scheduleId }
      });

      if (error) {
        console.error('❌ Error deleting schedule:', error);
        throw new Error('Erreur lors de la suppression');
      }

      if (!response?.success) {
        console.error('❌ Edge function error:', response);
        if (response?.error === 'forbidden') {
          throw new Error('Accès refusé - connexion admin requise');
        }
        throw new Error(response?.message || 'Erreur lors de la suppression');
      }

      setSchedules(schedules.filter(s => s.id !== scheduleId));
      
      toast({
        title: "Supprimée",
        description: "Planification supprimée avec succès"
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
