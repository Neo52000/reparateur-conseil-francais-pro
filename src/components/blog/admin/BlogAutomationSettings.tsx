import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Zap, AlertCircle, CheckCircle2, ChevronDown, ExternalLink, ShieldAlert, ImagePlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BlogScheduleList } from './BlogScheduleList';
import { BlogPromptsByCategory } from './BlogPromptsByCategory';
import { CronStatus } from '@/types/blogAutomation';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BlogAutomationSettings = () => {
  const { toast } = useToast();
  const { isAdmin, loading: authLoading } = useAuth();
  const [cronStatus, setCronStatus] = useState<CronStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [updatingImages, setUpdatingImages] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);

  const loadCronStatus = async () => {
    try {
      const { data, error }: any = await supabase
        .rpc('get_blog_automation_status' as any)
        .single();

      if (error) throw error;
      setCronStatus(data);
    } catch (error: any) {
      // Silent fallback: RPC function may not exist yet
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
      if (authLoading) return;
      
      setLoading(true);
      if (isAdmin) {
        await loadCronStatus();
        // Charger les catégories pour le test
        const { data } = await supabase
          .from('blog_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        setCategories(data || []);
      }
      setLoading(false);
    };
    load();
  }, [isAdmin, authLoading]);

  const handleTestNow = async () => {
    setTesting(true);
    try {
      // Call blog-ai-generator directly (simpler and more reliable)
      const { data, error } = await supabase.functions.invoke('blog-ai-generator', {
        body: {
          topic: 'Actualités de la réparation mobile',
          category_id: selectedCategory && selectedCategory !== 'none' ? selectedCategory : undefined,
          target_audience: 'public',
          tone: 'professionnel',
          auto_publish: false, // Create as draft for review
          keywords: ['réparation', 'smartphone', 'mobile']
        }
      });

      if (error) throw error;

      if (data?.success && data?.post?.id) {
        toast({
          title: "Test réussi ✅",
          description: `Article créé : ${data.post.title}`,
        });
        
        // Redirect to blog posts list
        window.location.href = '/admin?tab=blog&blogTab=posts';
      } else {
        throw new Error(data?.error || 'Article non créé');
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

  // TODO: Réactiver quand blog-update-images sera actif
  const handleUpdateImages = async () => {
    toast({
      title: "Fonction désactivée",
      description: "Cette fonctionnalité sera disponible prochainement.",
      variant: "default"
    });
  };

  if (loading || authLoading) {
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
  if (!isAdmin) {
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

          {/* Moderation Statistics */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Modération automatique activée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Tous les articles générés par IA sont automatiquement analysés et modérés avant publication.
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 border rounded-lg">
                  <div className="text-xs text-muted-foreground">Analysés</div>
                  <div className="text-lg font-semibold">✓</div>
                </div>
                <div className="p-2 border rounded-lg">
                  <div className="text-xs text-muted-foreground">Qualité SEO</div>
                  <div className="text-lg font-semibold">✓</div>
                </div>
                <div className="p-2 border rounded-lg">
                  <div className="text-xs text-muted-foreground">Sécurité</div>
                  <div className="text-lg font-semibold">✓</div>
                </div>
              </div>
              <Alert className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Les articles avec un score &lt; 60/100 sont mis en attente de validation manuelle. 
                  Consultez l'onglet "Modération" pour voir la file d'attente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Tabs for Schedules and Prompts */}
          <Tabs defaultValue="schedules" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedules">Planifications</TabsTrigger>
              <TabsTrigger value="prompts">Prompts par catégorie</TabsTrigger>
            </TabsList>
            <TabsContent value="schedules" className="space-y-4 pt-4">
              <BlogScheduleList />
            </TabsContent>
            <TabsContent value="prompts" className="space-y-4 pt-4">
              <BlogPromptsByCategory />
            </TabsContent>
          </Tabs>

          {/* Category Selection for Test */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie (optionnelle)</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune catégorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          {/* Update Images Button - Disabled */}
          <Button
            onClick={handleUpdateImages}
            disabled={true}
            variant="secondary"
            className="w-full opacity-50"
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            🖼️ Ajouter images aux articles (Bientôt)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
