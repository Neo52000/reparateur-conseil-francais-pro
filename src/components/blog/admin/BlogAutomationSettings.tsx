import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Zap, AlertCircle, CheckCircle2, ChevronDown, ExternalLink, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BlogScheduleList } from './BlogScheduleList';
import { CronStatus } from '@/types/blogAutomation';

export const BlogAutomationSettings = () => {
  const { toast } = useToast();
  const [cronStatus, setCronStatus] = useState<CronStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const checkAccess = async () => {
    try {
      // Try via Edge Function (enforces admin on backend)
      const { error } = await supabase.functions.invoke('blog-schedules', {
        body: { action: 'list' }
      });

      if (error) {
        setHasAccess(false);
        return false;
      }
      setHasAccess(true);
      return true;
    } catch (error: any) {
      console.error('Error checking access:', error);
      setHasAccess(false);
      return false;
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
      const access = await checkAccess();
      if (access) {
        await loadCronStatus();
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleTestNow = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-auto-publish', {
        body: { auto_publish: false, test_mode: true }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Test réussi",
          description: `Article créé : ${data.article?.title || 'Article de test'}`,
        });
        
        await loadCronStatus();
      } else {
        throw new Error(data?.error || 'Test failed');
      }
    } catch (error: any) {
      console.error('Test error:', error);
      toast({
        title: "Erreur de test",
        description: error.message || "Le test a échoué.",
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
          <CardTitle>Automatisation des Articles</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Permission denied - show clear message
  if (!hasAccess) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automatisation des Articles de Blog
          </CardTitle>
          <CardDescription>
            Configurez plusieurs planifications automatiques avec des catégories et horaires différents
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
                    <li>Secret <code className="text-xs">LOVABLE_API_KEY</code> configuré</li>
                  </ul>
                  <p className="pt-2">
                    <a 
                      href="https://github.com/yourusername/yourrepo/blob/main/docs/BLOG_AUTOMATION.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      📚 Documentation complète
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </AlertDescription>
              </Alert>
            </CollapsibleContent>
          </Collapsible>

          {/* Schedules List */}
          <BlogScheduleList />

          {/* Test Button */}
          <Button
            onClick={handleTestNow}
            disabled={testing}
            variant="outline"
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            {testing ? 'Test en cours...' : 'Tester une génération maintenant'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
