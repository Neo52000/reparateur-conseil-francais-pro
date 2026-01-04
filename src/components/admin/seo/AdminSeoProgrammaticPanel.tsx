import React, { useState, useEffect } from 'react';
import { 
  FileText, Globe, TrendingUp, RefreshCw, Download, 
  ChevronRight, Eye, EyeOff, Trash2, Search, Filter,
  MapPin, Smartphone, AlertTriangle, CheckCircle, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { seoProgrammaticService, SeoProgrammaticPage } from '@/services/seoProgrammaticService';
import { seoProgrammaticGenerator } from '@/services/seo/seoProgrammaticGenerator';
import { sitemapGenerator } from '@/services/seo/sitemapGenerator';

interface AdminSeoProgrammaticPanelProps {
  className?: string;
}

/**
 * Panneau d'administration du SEO programmatique
 */
export function AdminSeoProgrammaticPanel({ className }: AdminSeoProgrammaticPanelProps) {
  const [pages, setPages] = useState<SeoProgrammaticPage[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    published: number;
    byType: Record<string, number>;
  }>({ total: 0, published: 0, byType: {} });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [totalUrls, setTotalUrls] = useState(0);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pagesData, statsData, urlCount] = await Promise.all([
        Promise.all([
          seoProgrammaticService.getPagesByType('hub_city', 100),
          seoProgrammaticService.getPagesByType('model_city', 100),
          seoProgrammaticService.getPagesByType('brand_city', 100),
          seoProgrammaticService.getPagesByType('symptom', 100)
        ]).then(results => results.flat()),
        seoProgrammaticService.getStats(),
        sitemapGenerator.countTotalUrls()
      ]);

      setPages(pagesData);
      setStats(statsData);
      setTotalUrls(urlCount);
    } catch (error) {
      console.error('Erreur chargement données SEO:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }

  // Générer les pages pour une ville
  async function generateForCity(city: string) {
    setGenerating(true);
    setGenerationProgress(10);

    try {
      const result = await seoProgrammaticGenerator.generateAllPagesForCity(city);
      setGenerationProgress(100);

      toast.success(
        `${result.success}/${result.total} pages générées pour ${city}`,
        { description: result.failed > 0 ? `${result.failed} erreurs` : undefined }
      );

      await loadData();
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  }

  // Générer les pages symptômes
  async function generateSymptomPages() {
    setGenerating(true);
    setGenerationProgress(20);

    try {
      const results = await seoProgrammaticGenerator.generateStandardSymptomPages();
      setGenerationProgress(100);

      const successCount = results.filter(r => r.success).length;
      toast.success(`${successCount}/${results.length} pages symptômes générées`);

      await loadData();
    } catch (error) {
      console.error('Erreur génération symptômes:', error);
      toast.error('Erreur lors de la génération des symptômes');
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  }

  // Toggle publication
  async function togglePublish(page: SeoProgrammaticPage) {
    const newStatus = !page.is_published;
    const success = await seoProgrammaticService.updatePage(page.id, { 
      is_published: newStatus 
    });

    if (success) {
      toast.success(newStatus ? 'Page publiée' : 'Page dépubliée');
      setPages(prev => prev.map(p => 
        p.id === page.id ? { ...p, is_published: newStatus } : p
      ));
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  // Supprimer une page
  async function deletePage(page: SeoProgrammaticPage) {
    const success = await seoProgrammaticService.deletePage(page.id);

    if (success) {
      toast.success('Page supprimée');
      setPages(prev => prev.filter(p => p.id !== page.id));
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  // Télécharger le sitemap
  async function downloadSitemap() {
    try {
      const sitemaps = await sitemapGenerator.generateAllSitemaps();
      
      // Créer un blob pour le sitemap principal
      const blob = new Blob([sitemaps['sitemap.xml']], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Sitemap téléchargé');
    } catch (error) {
      console.error('Erreur téléchargement sitemap:', error);
      toast.error('Erreur lors du téléchargement');
    }
  }

  // Filtrer les pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || page.page_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && page.is_published) ||
      (filterStatus === 'draft' && !page.is_published);
    return matchesSearch && matchesType && matchesStatus;
  });

  const pageTypeLabels: Record<string, string> = {
    hub_city: 'Hub Ville',
    model_city: 'Modèle + Ville',
    brand_city: 'Marque + Ville',
    symptom: 'Symptôme'
  };

  const pageTypeColors: Record<string, string> = {
    hub_city: 'bg-blue-500',
    model_city: 'bg-green-500',
    brand_city: 'bg-purple-500',
    symptom: 'bg-orange-500'
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Chargement des données SEO...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Pages totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Publiées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUrls}</p>
                <p className="text-sm text-muted-foreground">URLs Sitemap</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Taux publication</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par type de page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(pageTypeLabels).map(([type, label]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.byType[type] || 0}
                  </span>
                </div>
                <Progress 
                  value={stats.total > 0 ? ((stats.byType[type] || 0) / stats.total) * 100 : 0} 
                  className={`h-2 ${pageTypeColors[type]}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions de génération */}
      <Card>
        <CardHeader>
          <CardTitle>Génération de pages</CardTitle>
          <CardDescription>
            Générez automatiquement des pages SEO optimisées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generating && (
            <div className="space-y-2">
              <Progress value={generationProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Génération en cours... {generationProgress}%
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {/* Génération par ville */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium">Générer pour une ville</span>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nom de la ville"
                    id="city-input"
                    className="flex-1"
                  />
                  <Button 
                    size="sm"
                    disabled={generating}
                    onClick={() => {
                      const input = document.getElementById('city-input') as HTMLInputElement;
                      if (input.value) {
                        generateForCity(input.value);
                      }
                    }}
                  >
                    Générer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Génération symptômes */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Pages symptômes</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Génère les pages pour les problèmes courants
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={generating}
                  onClick={generateSymptomPages}
                >
                  Générer symptômes
                </Button>
              </CardContent>
            </Card>

            {/* Télécharger sitemap */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Download className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Sitemap XML</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {totalUrls} URLs indexées
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={downloadSitemap}
                >
                  Télécharger
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Liste des pages */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Pages générées</CardTitle>
              <CardDescription>
                {filteredPages.length} page(s) trouvée(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="hub_city">Hub Ville</SelectItem>
                <SelectItem value="model_city">Modèle + Ville</SelectItem>
                <SelectItem value="brand_city">Marque + Ville</SelectItem>
                <SelectItem value="symptom">Symptôme</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publiées</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Réparateurs</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.slice(0, 50).map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{page.title}</p>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={`${pageTypeColors[page.page_type]} text-white`}
                      >
                        {pageTypeLabels[page.page_type] || page.page_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{page.repairers_count}</TableCell>
                    <TableCell>
                      {page.is_published ? (
                        <Badge variant="default" className="bg-green-600">
                          Publié
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublish(page)}
                          title={page.is_published ? 'Dépublier' : 'Publier'}
                        >
                          {page.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a 
                            href={`/${page.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="Voir la page"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </a>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette page ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. La page "{page.title}" sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePage(page)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune page trouvée
            </div>
          )}

          {filteredPages.length > 50 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Affichage limité aux 50 premières pages. {filteredPages.length - 50} pages supplémentaires.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminSeoProgrammaticPanel;
