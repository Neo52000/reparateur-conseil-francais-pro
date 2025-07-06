import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { localSeoService } from '@/services/localSeoService';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Zap, 
  Eye, 
  TrendingUp, 
  Globe, 
  RefreshCw,
  Plus,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CityData {
  city: string;
  repairerCount: number;
  hasPage: boolean;
  pageId?: string;
  pageViews?: number;
  isPublished?: boolean;
  seoScore?: number;
}

const RepairerSeoManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<CityData[]>([]);
  const [stats, setStats] = useState({
    totalPages: 0,
    publishedPages: 0,
    totalViews: 0,
    averageCTR: 0
  });
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    loadSeoData();
  }, []);

  const loadSeoData = async () => {
    setLoading(true);
    try {
      // Charger les statistiques globales
      const globalStats = await localSeoService.getGlobalStats();
      setStats(globalStats);

      // Charger les villes avec leurs données SEO
      const { data: repairersData } = await supabase
        .from('repairers')
        .select('city')
        .not('city', 'is', null);

      const { data: seoPages } = await supabase
        .from('local_seo_pages')
        .select('*');

      // Compter les réparateurs par ville
      const cityCount = (repairersData || []).reduce((acc: Record<string, number>, repairer) => {
        const city = repairer.city?.trim();
        if (city) {
          acc[city] = (acc[city] || 0) + 1;
        }
        return acc;
      }, {});

      // Créer un index des pages SEO par ville
      const pagesByCity = (seoPages || []).reduce((acc: Record<string, any>, page) => {
        acc[page.city] = page;
        return acc;
      }, {});

      // Combiner les données
      const citiesData: CityData[] = Object.entries(cityCount).map(([city, count]) => {
        const page = pagesByCity[city];
        return {
          city,
          repairerCount: count,
          hasPage: !!page,
          pageId: page?.id,
          pageViews: page?.page_views || 0,
          isPublished: page?.is_published || false,
          seoScore: page?.seo_score || 0
        };
      }).sort((a, b) => b.repairerCount - a.repairerCount);

      setCities(citiesData);
    } catch (error) {
      console.error('Erreur chargement données SEO:', error);
      toast.error('Erreur lors du chargement des données SEO');
    } finally {
      setLoading(false);
    }
  };

  const generateSeoPage = async (city: string, repairerCount: number) => {
    setGenerating(city);
    try {
      const content = await localSeoService.generateContent({
        city,
        serviceType: 'smartphone',
        repairerCount,
        averageRating: 4.8
      });

      if (content) {
        toast.success(`Page SEO générée pour ${city}`);
        await loadSeoData(); // Recharger les données
      }
    } catch (error) {
      console.error('Erreur génération page SEO:', error);
      toast.error(`Erreur lors de la génération pour ${city}`);
    } finally {
      setGenerating(null);
    }
  };

  const togglePagePublication = async (pageId: string, currentStatus: boolean) => {
    try {
      await localSeoService.togglePublish(pageId, !currentStatus);
      toast.success(currentStatus ? 'Page dépubliée' : 'Page publiée');
      await loadSeoData();
    } catch (error) {
      console.error('Erreur publication:', error);
      toast.error('Erreur lors de la publication');
    }
  };

  const refreshPageContent = async (pageId: string, city: string) => {
    try {
      await localSeoService.refreshPageContent(pageId);
      toast.success(`Contenu actualisé pour ${city}`);
      await loadSeoData();
    } catch (error) {
      console.error('Erreur actualisation:', error);
      toast.error('Erreur lors de l\'actualisation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement des données SEO...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pages SEO</p>
                <p className="text-2xl font-bold">{stats.totalPages}</p>
              </div>
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publiées</p>
                <p className="text-2xl font-bold text-green-600">{stats.publishedPages}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vues totales</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CTR Moyen</p>
                <p className="text-2xl font-bold">{stats.averageCTR}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des villes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Optimisation SEO par Ville</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez les pages SEO locales pour chaque ville avec des réparateurs
              </p>
            </div>
            <Button onClick={loadSeoData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ville</TableHead>
                <TableHead>Réparateurs</TableHead>
                <TableHead>Page SEO</TableHead>
                <TableHead>Score SEO</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((cityData) => (
                <TableRow key={cityData.city}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {cityData.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {cityData.repairerCount} réparateur{cityData.repairerCount > 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cityData.hasPage ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Créée
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        À créer
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {cityData.hasPage && (
                      <div className="flex items-center gap-2">
                        <Progress value={cityData.seoScore || 0} className="w-16" />
                        <span className="text-sm text-muted-foreground">
                          {cityData.seoScore || 0}%
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {cityData.hasPage && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {cityData.pageViews || 0}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {cityData.hasPage && (
                      <Badge variant={cityData.isPublished ? "default" : "secondary"}>
                        {cityData.isPublished ? 'Publiée' : 'Brouillon'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!cityData.hasPage ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => generateSeoPage(cityData.city, cityData.repairerCount)}
                          disabled={generating === cityData.city}
                        >
                          {generating === cityData.city ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          Créer
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePagePublication(cityData.pageId!, cityData.isPublished!)}
                          >
                            {cityData.isPublished ? 'Dépublier' : 'Publier'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => refreshPageContent(cityData.pageId!, cityData.city)}
                          >
                            <Zap className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/local-seo/${cityData.pageId}`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairerSeoManagement;