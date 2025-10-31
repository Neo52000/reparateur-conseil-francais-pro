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
      // Load schedules via Edge Function (admin-protected)
      const { data: schedulesResp, error: schedulesError } = await supabase
        .functions.invoke('blog-schedules', { body: { action: 'list' } });

      console.log('📋 blog-schedules response:', { schedulesResp, schedulesError });

      if (schedulesError) throw schedulesError;

      const schedulesList = (schedulesResp as any)?.schedules || [];
      console.log('✅ Schedules loaded:', schedulesList.length);
      setSchedules(schedulesList);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      
      let errorMsg = "Impossible de charger les planifications";
      if (error?.message?.includes('forbidden') || error?.message?.includes('Admin required')) {
        errorMsg = "Accès refusé. Seuls les administrateurs peuvent gérer les planifications.";
      }
      
      toast({
        title: "Erreur",
        description: errorMsg,
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

      console.log('➕ Creating schedule:', newSchedule);
      const { data, error } = await supabase.functions.invoke('blog-schedules', {
        body: { action: 'create', payload: newSchedule }
      });

      console.log('📝 Create response:', { data, error });

      if (error) throw error;

      const created = (data as any)?.schedule;
      setSchedules([...schedules, created]);
      toast({
        title: "Planification créée",
        description: "Configurez les détails de votre nouvelle planification"
      });
    } catch (error: any) {
      console.error('❌ Error adding schedule:', error);
      
      let errorMsg = "Impossible de créer la planification";
      if (error?.message?.includes('forbidden') || error?.message?.includes('Admin required')) {
        errorMsg = "Accès refusé. Vous devez être administrateur.";
      }
      
      toast({
        title: "Erreur",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  const handleUpdateSchedule = async (updatedSchedule: BlogAutomationSchedule) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-schedules', {
        body: { action: 'update', id: updatedSchedule.id, payload: updatedSchedule }
      });

      if (error) throw error;

      const saved = (data as any)?.schedule ?? updatedSchedule;
      setSchedules(schedules.map(s => s.id === updatedSchedule.id ? saved : s));
      
      
      toast({
        title: "Sauvegardé",
        description: "Planification mise à jour avec succès"
      });
    } catch (error: any) {
      console.error('❌ Error updating schedule:', error);
      
      let errorMsg = "Impossible de sauvegarder la planification";
      if (error?.message?.includes('forbidden') || error?.message?.includes('Admin required')) {
        errorMsg = "Accès refusé. Vous devez être administrateur.";
      }
      
      toast({
        title: "Erreur",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase.functions.invoke('blog-schedules', {
        body: { action: 'delete', id: scheduleId }
      });

      if (error) throw error;

      setSchedules(schedules.filter(s => s.id !== scheduleId));
      
      toast({
        title: "Supprimée",
        description: "Planification supprimée avec succès"
      });
    } catch (error: any) {
      console.error('❌ Error deleting schedule:', error);
      
      let errorMsg = "Impossible de supprimer la planification";
      if (error?.message?.includes('forbidden') || error?.message?.includes('Admin required')) {
        errorMsg = "Accès refusé. Vous devez être administrateur.";
      }
      
      toast({
        title: "Erreur",
        description: errorMsg,
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
