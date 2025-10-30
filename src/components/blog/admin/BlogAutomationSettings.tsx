import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, Zap, FileText, AlertCircle, CheckCircle2, ChevronDown, ExternalLink, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [isPermissionError, setIsPermissionError] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const loadConfig = async () => {
    try {
      const { data, error }: any = await supabase
        .rpc('get_blog_automation_config' as any)
        .single();

      if (error) {
        // Check if it's a permission error (code 42501)
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          setIsPermissionError(true);
          toast({
            title: "Accès réservé aux administrateurs",
            description: "Seuls les administrateurs peuvent accéder à l'automatisation du blog.",
            variant: "destructive"
          });
          return;
        }
        
        // If function doesn't exist, it means migration wasn't run
        if (error.message?.includes('function') && error.message?.includes('does not exist')) {
          console.error('RPC function does not exist - migration required');
          return;
        }
        
        throw error;
      }
      
      // Data can be null if no config exists yet
      setConfig(data);
    } catch (error: any) {
      console.error('Error loading automation config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration.",
        variant: "destructive"
      });
    }
  };

  const loadCronStatus = async () => {
    try {
      const { data, error }: any = await supabase
        .rpc('get_blog_automation_status' as any)
        .single();

      if (error) throw error;
      setCronStatus(data);
    } catch (error: any) {
      console.error('Error loading cron status:', error);
      // Fallback status if RPC fails
      setCronStatus({
        enabled: true,
        schedule: '0 8 * * 1',
        last_run: null,
        next_run: null,
        last_status: 'unknown',
        last_error: null
      });
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

  const handleInitializeConfig = async () => {
    setInitializing(true);
    try {
      // Insert default configuration
      const { data, error } = await supabase
        .from('blog_automation_config' as any)
        .insert({
          enabled: false,
          auto_publish: false,
          schedule_time: '08:00',
          schedule_day: 1, // Monday
          ai_model: 'google/gemini-2.5-flash',
          prompt_template: 'Génère un article d\'actualité sur les dernières nouvelles de la réparation de smartphones et mobiles en France.'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Configuration initialisée",
        description: "La configuration par défaut a été créée avec succès.",
      });

      await loadConfig();
    } catch (error: any) {
      console.error('Error initializing config:', error);
      toast({
        title: "Erreur d'initialisation",
        description: error.message || "Impossible d'initialiser la configuration",
        variant: "destructive"
      });
    } finally {
      setInitializing(false);
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
        description: error.message || "Le test a échoué. Vérifiez que LOVABLE_API_KEY est configuré.",
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

  // Permission denied - show clear message
  if (isPermissionError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Accès Restreint
          </CardTitle>
          <CardDescription>
            Cette fonctionnalité est réservée aux administrateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Accès Refusé</AlertTitle>
            <AlertDescription>
              Seuls les utilisateurs avec le rôle <strong>admin</strong> peuvent accéder à la configuration de l'automatisation du blog.
              <br /><br />
              Si vous devriez avoir accès à cette fonctionnalité, contactez un administrateur système.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No config found - allow initialization
  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automatisation Hebdomadaire
          </CardTitle>
          <CardDescription>
            Configuration de la génération automatique d'articles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aucune configuration trouvée</AlertTitle>
            <AlertDescription>
              La table de configuration existe mais aucun enregistrement n'a été créé.
              Cliquez sur le bouton ci-dessous pour initialiser la configuration par défaut.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleInitializeConfig}
            disabled={initializing}
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            {initializing ? 'Initialisation...' : 'Initialiser la configuration'}
          </Button>

          <Collapsible open={showHelp} onOpenChange={setShowHelp}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
                Aide et vérification
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p><strong>Prérequis :</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Extensions <code>pg_cron</code> et <code>pg_net</code> activées dans Supabase</li>
                    <li>Edge Function <code>weekly-blog-automation</code> déployée</li>
                    <li>Secret <code>LOVABLE_API_KEY</code> configuré pour les tests</li>
                  </ul>
                  <p className="pt-2">
                    <a 
                      href="https://github.com/yourusername/yourrepo/blob/main/docs/BLOG_AUTOMATION.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Consulter la documentation complète
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </AlertDescription>
              </Alert>

              {cronStatus && (
                <Alert className={cronStatus.last_status === 'succeeded' ? 'border-green-500' : ''}>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Statut du Cron Job</AlertTitle>
                  <AlertDescription className="space-y-1 text-sm">
                    <p><strong>État :</strong> {cronStatus.enabled ? '✅ Actif' : '❌ Inactif'}</p>
                    <p><strong>Schedule :</strong> {cronStatus.schedule}</p>
                    {cronStatus.last_run && (
                      <p><strong>Dernière exécution :</strong> {new Date(cronStatus.last_run).toLocaleString('fr-FR')}</p>
                    )}
                    {cronStatus.next_run && (
                      <p><strong>Prochaine exécution :</strong> {new Date(cronStatus.next_run).toLocaleString('fr-FR')}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CollapsibleContent>
          </Collapsible>
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
          {/* Cron Status Alert */}
          {cronStatus && (
            <Alert className={cronStatus.last_status === 'succeeded' ? 'border-green-500' : ''}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Statut du Cron Job</AlertTitle>
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <p><strong>État :</strong> {cronStatus.enabled ? '✅ Actif' : '❌ Inactif'}</p>
                  <p><strong>Schedule :</strong> {cronStatus.schedule}</p>
                  {cronStatus.last_run && (
                    <p><strong>Dernière exécution :</strong> {new Date(cronStatus.last_run).toLocaleString('fr-FR')}</p>
                  )}
                  {cronStatus.next_run && (
                    <p><strong>Prochaine exécution :</strong> {new Date(cronStatus.next_run).toLocaleString('fr-FR')}</p>
                  )}
                  {cronStatus.last_status && (
                    <p><strong>Dernier statut :</strong> {cronStatus.last_status}</p>
                  )}
                  {cronStatus.last_error && (
                    <p className="text-destructive"><strong>Dernière erreur :</strong> {cronStatus.last_error}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Help Section */}
          <Collapsible open={showHelp} onOpenChange={setShowHelp}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
                Aide et documentation
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2 text-sm">
                  <p><strong>Configuration requise :</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Extensions <code className="text-xs">pg_cron</code> et <code className="text-xs">pg_net</code> activées</li>
                    <li>Edge Function <code className="text-xs">weekly-blog-automation</code> déployée</li>
                    <li>Secret <code className="text-xs">LOVABLE_API_KEY</code> configuré (pour les tests)</li>
                    <li>Catégorie blog <strong>actualites-reparation</strong> existante</li>
                  </ul>
                  <p className="pt-2">
                    <a 
                      href="https://github.com/yourusername/yourrepo/blob/main/docs/BLOG_AUTOMATION.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      📚 Documentation complète de l'automatisation
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </AlertDescription>
              </Alert>
            </CollapsibleContent>
          </Collapsible>

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
