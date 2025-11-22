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
import { getBlogErrorMessage } from '@/hooks/blog/utils/errorHandler';

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

      // Verify session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        return;
      }

      // Use Edge Function to fetch schedules (bypasses RLS issues)
      const { data, error } = await supabase.functions.invoke('blog-schedules', {
        body: { action: 'list' }
      });

      if (error) throw error;

      setSchedules(data?.schedules || []);

      // Load categories directly (public read access, no RLS issue)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      setCategories(categoriesData || []);
      
      console.log('✅ Loaded', data?.schedules?.length || 0, 'schedules');
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
      // Refresh session and verify authentication
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !session) {
        toast({ 
          title: "Session expirée", 
          description: "Veuillez vous reconnecter",
          variant: "destructive" 
        });
        return;
      }

      const newSchedule = {
        name: 'Nouvelle planification',
        enabled: true,
        category_id: null,
        schedule_day: 1, // Monday (0-6)
        schedule_time: '08:00', // HH:mm format
        auto_publish: false,
        ai_model: 'mistral-large-latest',
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
      
      // Use Edge Function (bypasses RLS, uses service role key)
      const { data, error } = await supabase.functions.invoke('blog-schedules', {
        body: {
          action: 'create',
          payload: newSchedule
        }
      });

      if (error) throw error;

      toast({
        title: '✅ Planification créée',
        description: 'Configurez les détails de votre nouvelle planification'
      });

      // Reload data to get the new schedule
      await loadData();
    } catch (error: any) {
      console.error('❌ Error adding schedule:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      const errorMessage = getBlogErrorMessage(error);
      console.error('❌ Mapped error message:', errorMessage);
      
      toast({
        title: "Erreur lors de l'ajout",
        description: errorMessage.includes('permission') 
          ? `Permissions insuffisantes. Vérifiez que vous êtes admin. (${errorMessage})`
          : errorMessage || "Impossible de créer la planification",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSchedule = async (updatedSchedule: BlogAutomationSchedule) => {
    setSaving(true);
    try {
      // Refresh session before sensitive operation
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !session) {
        toast({ 
          title: "Session expirée", 
          description: "Veuillez vous reconnecter",
          variant: "destructive" 
        });
        return;
      }

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
      
      // Use Edge Function (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('blog-schedules', {
        body: {
          action: 'update',
          id: updatedSchedule.id,
          payload: updatePayload
        }
      });

      if (error) throw error;

      toast({
        title: '✅ Sauvegardé',
        description: 'Planification mise à jour avec succès'
      });

      // Reload to get fresh data
      await loadData();
    } catch (error: any) {
      console.error('❌ Error updating schedule:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details
      });
      
      const errorMessage = getBlogErrorMessage(error);
      
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage.includes('permission')
          ? `Permissions insuffisantes. (${errorMessage})`
          : errorMessage || "Impossible de sauvegarder la planification",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      // Refresh session before sensitive operation
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !session) {
        toast({ 
          title: "Session expirée", 
          description: "Veuillez vous reconnecter",
          variant: "destructive" 
        });
        return;
      }

      console.log('🗑️ Deleting schedule via Edge Function:', scheduleId);
      
      // Use Edge Function (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('blog-schedules', {
        body: {
          action: 'delete',
          id: scheduleId
        }
      });

      if (error) throw error;

      setSchedules(schedules.filter(s => s.id !== scheduleId));
      
      toast({
        title: 'Supprimée',
        description: 'Planification supprimée avec succès'
      });
    } catch (error: any) {
      console.error('❌ Error deleting schedule:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details
      });
      
      const errorMessage = getBlogErrorMessage(error);
      
      toast({
        title: "Erreur de suppression",
        description: errorMessage.includes('permission')
          ? `Permissions insuffisantes. (${errorMessage})`
          : errorMessage || "Impossible de supprimer la planification",
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
