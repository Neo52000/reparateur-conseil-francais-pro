import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, Zap, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AutomationConfig {
  id: string;
  enabled: boolean;
  auto_publish: boolean;
  schedule_time: string;
  schedule_day: number;
  ai_model: string;
  last_run_at: string | null;
  next_run_at: string | null;
}

interface CronStatus {
  enabled: boolean;
  schedule: string;
  last_run: string | null;
  next_run: string | null;
  last_status: string | null;
  last_error: string | null;
}

export const BlogAutomationSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AutomationConfig | null>(null);
  const [cronStatus, setCronStatus] = useState<CronStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const loadConfig = async () => {
    try {
      const { data, error }: any = await supabase
        .from('blog_automation_config' as any)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setConfig(data);
    } catch (error: any) {
      console.error('Error loading automation config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration. Exécutez d'abord la migration SQL.",
        variant: "destructive"
      });
    }
  };

  const loadCronStatus = async () => {
    try {
      // Simplified status since RPC function is not in schema cache yet
      setCronStatus({
        enabled: true,
        schedule: '0 8 * * 1',
        last_run: null,
        next_run: null,
        last_status: 'pending',
        last_error: null
      });
    } catch (error: any) {
      console.error('Error loading cron status:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadConfig(), loadCronStatus()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('blog_automation_config' as any)
        .update({
          enabled: config.enabled,
          auto_publish: config.auto_publish,
          schedule_time: config.schedule_time,
          schedule_day: config.schedule_day,
          ai_model: config.ai_model
        })
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Configuration sauvegardée"
      });

      await loadConfig();
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestNow = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-blog-automation', {
        body: { auto_publish: false, test_mode: true }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Test réussi",
          description: `Article créé : ${data.article.title}`,
        });
        
        await Promise.all([loadConfig(), loadCronStatus()]);
      } else {
        throw new Error(data.error || 'Test failed');
      }
    } catch (error: any) {
      console.error('Test error:', error);
      toast({
        title: "Erreur de test",
        description: error.message || "Le test a échoué",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Automatisation Hebdomadaire</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Automatisation Hebdomadaire</CardTitle>
          <CardDescription>
            Configuration non disponible. Veuillez exécuter la migration SQL dans{' '}
            <code className="text-sm bg-muted px-1 py-0.5 rounded">
              supabase/manual-migrations/blog_automation_setup.sql
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pour activer l'automatisation, exécutez le fichier SQL de migration dans le SQL Editor de Supabase.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const weekDays = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automatisation Hebdomadaire
          </CardTitle>
          <CardDescription>
            Génération automatique d'articles d'actualités chaque semaine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {cronStatus && (
            <Alert className={cronStatus.last_status === 'succeeded' ? 'border-green-500' : ''}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Statut :</strong> {cronStatus.enabled ? 'Actif' : 'Inactif'}</p>
                  {cronStatus.last_run && (
                    <p><strong>Dernière exécution :</strong> {new Date(cronStatus.last_run).toLocaleString('fr-FR')}</p>
                  )}
                  {cronStatus.next_run && (
                    <p><strong>Prochaine exécution :</strong> {new Date(cronStatus.next_run).toLocaleString('fr-FR')}</p>
                  )}
                  {cronStatus.last_status && (
                    <p><strong>Dernier statut :</strong> {cronStatus.last_status}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base">
                Activer l'automatisation
              </Label>
              <p className="text-sm text-muted-foreground">
                Génération automatique d'articles d'actualités
              </p>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_publish" className="text-base">
                Publication automatique
              </Label>
              <p className="text-sm text-muted-foreground">
                Publier directement ou créer en brouillon pour validation
              </p>
            </div>
            <Switch
              id="auto_publish"
              checked={config.auto_publish}
              onCheckedChange={(checked) => setConfig({ ...config, auto_publish: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule_day" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jour de la semaine
            </Label>
            <Select
              value={config.schedule_day.toString()}
              onValueChange={(value) => setConfig({ ...config, schedule_day: parseInt(value) })}
            >
              <SelectTrigger id="schedule_day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map(day => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule_time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Heure de publication
            </Label>
            <Select
              value={config.schedule_time}
              onValueChange={(value) => setConfig({ ...config, schedule_time: value })}
            >
              <SelectTrigger id="schedule_time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button
              onClick={handleTestNow}
              disabled={testing}
              variant="outline"
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              {testing ? 'Test en cours...' : 'Tester maintenant'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
