import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  BarChart3,
  MapPin,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  RefreshCw,
  ExternalLink,
  Crown
} from 'lucide-react';
import { localSeoService, LocalSeoPage } from '@/services/localSeoService';
import { useToast } from '@/hooks/use-toast';

const LocalSeoManagement = () => {
  const [pages, setPages] = useState<LocalSeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<LocalSeoPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalPages: 0,
    publishedPages: 0,
    totalViews: 0,
    averageCTR: 0
  });
  const [suggestedCities, setSuggestedCities] = useState<Array<{city: string, repairerCount: number}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      // Vérifier l'accès
      const access = await localSeoService.hasAccess();
      setHasAccess(access);

      if (access) {
        // Charger les données
        const [pagesData, statsData, citiesData] = await Promise.all([
          localSeoService.getPages(),
          localSeoService.getGlobalStats(),
          localSeoService.getSuggestedCities()
        ]);

        setPages(pagesData);
        setGlobalStats(statsData);
        setSuggestedCities(citiesData);
      }
    } catch (error) {
      console.error('Erreur initialisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données SEO",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (pageId: string, isPublished: boolean) => {
    try {
      const success = await localSeoService.togglePublish(pageId, !isPublished);
      if (success) {
        setPages(pages.map(p => 
          p.id === pageId ? { ...p, is_published: !isPublished } : p
        ));
        toast({
          title: "Succès",
          description: `Page ${!isPublished ? 'publiée' : 'dépubliée'}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de publication",
        variant: "destructive"
      });
    }
  };

  const handleGenerateContent = async (city: string, serviceType: string = 'smartphone') => {
    setIsGenerating(true);
    try {
      // Compter les réparateurs dans cette ville (simulé)
      const repairerCount = suggestedCities.find(c => c.city === city)?.repairerCount || 1;
      
      const response = await localSeoService.generateContent({
        city,
        serviceType,
        repairerCount,
        averageRating: 4.8
      });

      if (response.success) {
        const newPage = {
          slug: `reparateur-${serviceType}-${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          city,
          city_slug: city.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          service_type: serviceType,
          title: response.content.title,
          meta_description: response.content.metaDescription,
          h1_title: response.content.h1,
          content_paragraph_1: response.content.paragraph1,
          content_paragraph_2: response.content.paragraph2,
          cta_text: 'Obtenez un devis gratuitement',
          repairer_count: repairerCount,
          average_rating: 4.8,
          is_published: false,
          generated_by_ai: true,
          ai_model: response.model
        };

        const createdPage = await localSeoService.createPage(newPage);
        if (createdPage) {
          setPages([createdPage, ...pages]);
          setSuggestedCities(suggestedCities.filter(c => c.city !== city));
          toast({
            title: "Page créée",
            description: `Page SEO générée pour ${city}`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la page",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const success = await localSeoService.deletePage(pageId);
      if (success) {
        setPages(pages.filter(p => p.id !== pageId));
        toast({
          title: "Page supprimée",
          description: "La page SEO a été supprimée",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la page",
        variant: "destructive"
      });
    }
  };

  const filteredPages = pages.filter(page => 
    page.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">Fonctionnalité Premium</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Le module SEO Local est exclusivement disponible pour les abonnements Premium et Enterprise.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Avantages du SEO Local :</h3>
            <ul className="text-sm text-left space-y-1">
              <li>• Pages optimisées automatiquement pour chaque ville</li>
              <li>• Génération de contenu IA unique</li>
              <li>• Intégration cartes et données locales</li>
              <li>• Analytics et métriques détaillées</li>
              <li>• Boost significatif du référencement local</li>
            </ul>
          </div>
          <Button className="w-full">
            Passer à Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pages totales</p>
                <p className="text-2xl font-bold">{globalStats.totalPages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publiées</p>
                <p className="text-2xl font-bold">{globalStats.publishedPages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vues totales</p>
                <p className="text-2xl font-bold">{globalStats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CTR moyen</p>
                <p className="text-2xl font-bold">{globalStats.averageCTR}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Gestion des pages</TabsTrigger>
          <TabsTrigger value="generate">Génération automatique</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          {/* Barre de recherche et actions */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une ville ou un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => initializeData()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Liste des pages SEO */}
          <div className="grid gap-4">
            {filteredPages.map((page) => (
              <Card key={page.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{page.title}</h3>
                        <Badge variant={page.is_published ? "default" : "secondary"}>
                          {page.is_published ? "Publiée" : "Brouillon"}
                        </Badge>
                        {page.generated_by_ai && (
                          <Badge variant="outline" className="text-purple-600">
                            <Sparkles className="w-3 h-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {page.meta_description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {page.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {page.repairer_count} réparateurs
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {page.page_views} vues
                        </span>
                        <span>/{page.slug}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedPage(page);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={page.is_published}
                        onCheckedChange={() => handleTogglePublish(page.id, page.is_published)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePage(page.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPages.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Aucune page SEO trouvée</h3>
                  <p className="text-muted-foreground">
                    Commencez par générer des pages pour vos villes principales.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Génération automatique de pages SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Les pages sont générées automatiquement avec du contenu unique optimisé SEO pour chaque ville où vous avez des réparateurs.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">Villes suggérées</h4>
                <div className="grid gap-3">
                  {suggestedCities.slice(0, 10).map((city) => (
                    <div key={city.city} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{city.city}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({city.repairerCount} réparateurs)
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateContent(city.city)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Générer
                      </Button>
                    </div>
                  ))}
                  
                  {suggestedCities.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      Toutes les villes avec des réparateurs ont déjà leurs pages SEO.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics SEO Local</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analytics détaillées disponibles prochainement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog d'édition */}
      {isEditing && selectedPage && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Éditer la page SEO - {selectedPage.city}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre SEO</label>
                <Input value={selectedPage.title} readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Description</label>
                <Textarea value={selectedPage.meta_description} readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu paragraphe 1</label>
                <Textarea value={selectedPage.content_paragraph_1} readOnly rows={4} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu paragraphe 2</label>
                <Textarea value={selectedPage.content_paragraph_2} readOnly rows={4} />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Fermer
                </Button>
                <Button onClick={() => localSeoService.refreshPageContent(selectedPage.id)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Régénérer avec IA
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LocalSeoManagement;