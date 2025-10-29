import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { repairerSeoService } from '@/services/repairerSeoService';
import { Loader2, ExternalLink, Eye, EyeOff, Trash2, RefreshCw, Sparkles } from 'lucide-react';

const RepairerSeoPanel = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPages: 0,
    publishedPages: 0,
    totalViews: 0,
    averageViews: 0
  });
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pagesData, statsData] = await Promise.all([
        repairerSeoService.getAllPages(),
        repairerSeoService.getGlobalStats()
      ]);
      setPages(pagesData);
      setStats(statsData);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForAllPaid = async () => {
    setGenerating(true);
    setProgress({ current: 0, total: 0 });

    try {
      toast({
        title: '🚀 Génération lancée',
        description: 'Création des pages SEO pour tous les réparateurs payants...'
      });

      const result = await repairerSeoService.generateForAllPaidRepairers();

      toast({
        title: result.success > 0 ? '✅ Génération terminée' : '⚠️ Génération terminée avec erreurs',
        description: `${result.success} pages créées, ${result.failed} échecs sur ${result.total} réparateurs`
      });

      // Recharger les données
      await loadData();
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la génération',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleTogglePublish = async (pageId: string, currentStatus: boolean) => {
    try {
      const success = await repairerSeoService.togglePublish(pageId, !currentStatus);
      if (success) {
        toast({
          title: 'Succès',
          description: `Page ${!currentStatus ? 'publiée' : 'dépubliée'}`
        });
        await loadData();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la publication',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const success = await repairerSeoService.deletePage(pageId);
      if (success) {
        toast({
          title: 'Succès',
          description: 'Page supprimée'
        });
        await loadData();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la page',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total pages</h3>
          <p className="text-3xl font-bold">{stats.totalPages}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pages publiées</h3>
          <p className="text-3xl font-bold text-green-600">{stats.publishedPages}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total vues</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalViews}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Vues moyennes</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.averageViews}</p>
        </Card>
      </div>

      {/* Actions principales */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Génération automatique</h2>
        <p className="text-muted-foreground mb-4">
          Créez automatiquement des pages SEO optimisées pour tous les réparateurs ayant un plan payant.
        </p>
        
        {generating ? (
          <div className="space-y-4">
            <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} />
            <p className="text-sm text-muted-foreground text-center">
              Génération en cours... {progress.current} / {progress.total}
            </p>
          </div>
        ) : (
          <Button 
            onClick={handleGenerateForAllPaid} 
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Générer pour tous les réparateurs payants
          </Button>
        )}
      </Card>

      {/* Liste des pages */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Pages SEO réparateurs</h2>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune page SEO créée pour le moment.</p>
            <p className="text-sm mt-2">Utilisez le bouton ci-dessus pour générer automatiquement des pages.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <Card key={page.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{page.title}</h3>
                      {page.is_published ? (
                        <Badge variant="default">Publié</Badge>
                      ) : (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{page.meta_description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>👁 {page.page_views} vues</span>
                      <span>🔗 {page.url_path}</span>
                      <span>📅 {new Date(page.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(page.url_path, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(page.id, page.is_published)}
                    >
                      {page.is_published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default RepairerSeoPanel;
