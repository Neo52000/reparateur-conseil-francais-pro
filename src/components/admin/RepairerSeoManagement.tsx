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
  const [testingConnection, setTestingConnection] = useState(false);
  const [fixingEncoding, setFixingEncoding] = useState(false);

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

  const testApiConnection = async () => {
    setTestingConnection(true);
    try {
      console.log('🔄 Test de connexion à l\'API IA...');
      
      const testResult = await localSeoService.generateContent({
        city: 'Paris',
        serviceType: 'smartphone',
        repairerCount: 5,
        averageRating: 4.8
      });
      
      console.log('✅ Test réussi:', testResult);
      toast.success('Connexion à l\'API IA fonctionnelle !');
    } catch (error) {
      console.error('❌ Test échoué:', error);
      
      let errorMessage = 'Erreur de connexion à l\'API IA';
      if (error instanceof Error) {
        if (error.message.includes('Aucune clé API IA configurée')) {
          errorMessage = 'Aucune clé API IA configurée (MISTRAL_API_KEY ou OPENAI_API_KEY)';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Clé API IA invalide ou expirée';
        } else if (error.message.includes('429')) {
          errorMessage = 'Limite de requêtes dépassée - Réessayez plus tard';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Problème de connexion réseau';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(`Test échoué: ${errorMessage}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const generateSeoPage = async (city: string, repairerCount: number) => {
    setGenerating(city);
    try {
      // Validation des données d'entrée
      if (!city || city.trim().length === 0) {
        throw new Error('Le nom de la ville est requis');
      }
      if (repairerCount < 1) {
        throw new Error('Au moins un réparateur doit être présent dans la ville');
      }
      
      console.log('🚀 Démarrage génération pour:', city);
      
      const createdPage = await localSeoService.generateAndCreatePage({
        city: city.trim(),
        serviceType: 'smartphone',
        repairerCount,
        averageRating: 4.8
      });

      if (createdPage) {
        toast.success(`Page SEO créée avec succès pour ${city}`);
        await loadSeoData(); // Recharger les données
      } else {
        throw new Error('La page n\'a pas pu être créée');
      }
    } catch (error) {
      console.error('❌ Erreur génération page SEO:', error);
      
      let errorMessage = 'Erreur lors de la génération';
      if (error instanceof Error) {
        if (error.message.includes('Aucune clé API IA configurée')) {
          errorMessage = 'Aucune clé API IA configurée (MISTRAL_API_KEY ou OPENAI_API_KEY)';
        } else if (error.message.includes('Format de réponse invalide')) {
          errorMessage = 'Erreur de format de l\'IA - Veuillez réessayer';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Clé API IA invalide ou expirée';
        } else if (error.message.includes('429')) {
          errorMessage = 'Limite de requêtes dépassée - Réessayez plus tard';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Problème de connexion réseau - Vérifiez votre connexion';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(`${errorMessage} pour ${city}`);
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

  const fixEncodingIssues = async () => {
    setFixingEncoding(true);
    try {
      console.log('🔧 Correction des problèmes d\'encodage...');
      
      const { data: repairers } = await supabase
        .from('repairers')
        .select('id, name, city, address');

      let fixedCount = 0;
      
      if (repairers) {
        for (const repairer of repairers) {
          // Check for encoding issues (diamond characters)
          const hasEncodingIssue = 
            (repairer.name && repairer.name.includes('�')) ||
            (repairer.city && repairer.city.includes('�')) ||
            (repairer.address && repairer.address.includes('�'));
          
          if (hasEncodingIssue) {
            console.log('🔧 Correction pour:', repairer.name);
            
            // Apply basic encoding fixes (replace � with common French characters)
            const fixedName = repairer.name?.replace(/�/g, 'é') || repairer.name;
            const fixedCity = repairer.city?.replace(/�/g, 'é') || repairer.city;
            const fixedAddress = repairer.address?.replace(/�/g, 'é') || repairer.address;
            
            await supabase
              .from('repairers')
              .update({
                name: fixedName,
                city: fixedCity,
                address: fixedAddress
              })
              .eq('id', repairer.id);
            
            fixedCount++;
          }
        }
      }
      
      if (fixedCount > 0) {
        toast.success(`${fixedCount} réparateur(s) corrigé(s)`);
        await loadSeoData();
      } else {
        toast.success('Aucun problème d\'encodage détecté');
      }
    } catch (error) {
      console.error('Erreur correction encodage:', error);
      toast.error('Erreur lors de la correction des caractères');
    } finally {
      setFixingEncoding(false);
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
            <div className="flex items-center gap-2">
              <Button 
                onClick={testApiConnection} 
                variant="outline" 
                size="sm"
                disabled={testingConnection}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100"
              >
                {testingConnection ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2 text-green-600" />
                )}
                <span className="text-green-700">Test API IA</span>
              </Button>
              <Button
                onClick={fixEncodingIssues}
                variant="outline"
                size="sm"
                disabled={fixingEncoding}
                className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 hover:from-orange-100 hover:to-amber-100"
              >
                {fixingEncoding ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                )}
                <span className="text-orange-700">Corriger Encodage</span>
              </Button>
              <Button onClick={loadSeoData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
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