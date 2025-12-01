import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2, Calendar, Clock } from 'lucide-react';
import { BlogScheduleCard } from './BlogScheduleCard';
import { BlogAutomationSchedule } from '@/types/blogAutomation';
import { BlogCategory } from '@/types/blog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getBlogErrorMessage } from '@/hooks/blog/utils/errorHandler';
import { CategoryIcon } from '../CategoryIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      console.log('🔄 Loading blog schedules...');

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

      // Load schedules directly (RLS policy allows admins to read)
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('blog_automation_schedules')
        .select(`
          *,
          category:blog_categories(id, name, slug, icon)
        `)
        .order('created_at', { ascending: false });

      if (schedulesError) throw schedulesError;

      setSchedules(schedulesData || []);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      setCategories(categoriesData || []);
      
      console.log('✅ Loaded', schedulesData?.length || 0, 'schedules');
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
        schedule_day: 1, // Monday
        schedule_time: '08:00',
        auto_publish: false,
        ai_model: 'mistral-large-latest',
        prompt_template: null
      };

      console.log('➕ Creating schedule:', newSchedule);
      
      // Direct insert (RLS policy allows admins)
      const { data, error } = await supabase
        .from('blog_automation_schedules')
        .insert(newSchedule)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '✅ Planification créée',
        description: 'Configurez les détails de votre nouvelle planification'
      });

      await loadData();
    } catch (error: any) {
      console.error('❌ Error adding schedule:', error);
      
      const errorMessage = getBlogErrorMessage(error);
      
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
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !session) {
        toast({ 
          title: "Session expirée", 
          description: "Veuillez vous reconnecter",
          variant: "destructive" 
        });
        return;
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
      
      // Direct update (RLS policy allows admins)
      const { error } = await supabase
        .from('blog_automation_schedules')
        .update(updatePayload)
        .eq('id', updatedSchedule.id);

      if (error) throw error;

      toast({
        title: '✅ Sauvegardé',
        description: 'Planification mise à jour avec succès'
      });

      await loadData();
    } catch (error: any) {
      console.error('❌ Error updating schedule:', error);
      
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
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !session) {
        toast({ 
          title: "Session expirée", 
          description: "Veuillez vous reconnecter",
          variant: "destructive" 
        });
        return;
      }

      console.log('🗑️ Deleting schedule:', scheduleId);
      
      // Direct delete (RLS policy allows admins)
      const { error } = await supabase
        .from('blog_automation_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      setSchedules(schedules.filter(s => s.id !== scheduleId));
      
      toast({
        title: 'Supprimée',
        description: 'Planification supprimée avec succès'
      });
    } catch (error: any) {
      console.error('❌ Error deleting schedule:', error);
      
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

  const weekdays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  // Group schedules by day for visual summary
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.schedule_day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, BlogAutomationSchedule[]>);

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
        <>
          {/* Visual Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Résumé des planifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const daySchedules = schedulesByDay[day] || [];
                  const enabledCount = daySchedules.filter(s => s.enabled).length;
                  
                  return (
                    <div 
                      key={day} 
                      className={`p-3 rounded-lg border text-center space-y-2 ${
                        enabledCount > 0 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="text-xs font-medium text-muted-foreground">
                        {weekdays[day]}
                      </div>
                      {daySchedules.length > 0 ? (
                        <div className="space-y-1">
                          {daySchedules.map((schedule) => {
                            const category = categories.find(c => c.id === schedule.category_id);
                            return (
                              <div 
                                key={schedule.id} 
                                className={`flex items-center justify-center gap-1 text-xs ${
                                  schedule.enabled ? 'text-foreground' : 'text-muted-foreground line-through'
                                }`}
                              >
                                <Clock className="h-3 w-3" />
                                <span>{schedule.schedule_time}</span>
                                {category && <CategoryIcon icon={category.icon} className="h-3 w-3" />}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">—</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Cards */}
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
        </>
      )}

      <Button onClick={handleAddSchedule} className="w-full" disabled={saving}>
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une planification
      </Button>
    </div>
  );
};
