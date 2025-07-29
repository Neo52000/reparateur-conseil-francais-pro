import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  MapPin, 
  Star, 
  Users, 
  Globe, 
  Zap,
  BarChart3,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { localSeoService } from '@/services/localSeoService';
import { useToast } from '@/hooks/use-toast';

interface SeoSuggestion {
  city: string;
  repairerCount: number;
  potential: 'high' | 'medium' | 'low';
  estimatedViews: number;
  competition: number;
}

interface SeoMetrics {
  totalPages: number;
  publishedPages: number;
  totalViews: number;
  averageCTR: number;
  topPerformingCities: Array<{
    city: string;
    views: number;
    ctr: number;
  }>;
}

const LocalSeoOptimizer: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SeoSuggestion[]>([]);
  const [metrics, setMetrics] = useState<SeoMetrics | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState('smartphone');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [suggestedCities, globalStats] = await Promise.all([
        localSeoService.getSuggestedCities(),
        localSeoService.getGlobalStats()
      ]);

      // Enrichir les suggestions avec des métriques estimées
      const enrichedSuggestions: SeoSuggestion[] = suggestedCities.map(city => ({
        ...city,
        potential: city.repairerCount > 5 ? 'high' : city.repairerCount > 2 ? 'medium' : 'low',
        estimatedViews: Math.round(city.repairerCount * 150 + Math.random() * 300),
        competition: Math.round(Math.random() * 100)
      }));

      setSuggestions(enrichedSuggestions);
      setMetrics({
        ...globalStats,
        topPerformingCities: [
          { city: 'Paris', views: 1250, ctr: 3.2 },
          { city: 'Lyon', views: 890, ctr: 2.8 },
          { city: 'Marseille', views: 760, ctr: 2.5 }
        ]
      });
    } catch (error) {
      console.error('Erreur chargement données SEO:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données SEO",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSeoPage = async (city: string) => {
    setIsGenerating(city);
    try {
      const suggestion = suggestions.find(s => s.city === city);
      if (!suggestion) return;

      const result = await localSeoService.generateAndCreatePage({
        city: suggestion.city,
        serviceType: selectedService,
        repairerCount: suggestion.repairerCount,
        averageRating: 4.8
      });

      if (result) {
        toast({
          title: "Page SEO générée",
          description: `Page créée pour ${city} avec succès`,
        });
        
        // Mettre à jour les suggestions
        setSuggestions(prev => prev.filter(s => s.city !== city));
        loadData(); // Recharger les métriques
      }
    } catch (error) {
      console.error('Erreur génération page:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la page SEO",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques globales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{metrics.totalPages}</div>
                  <div className="text-sm text-muted-foreground">Pages totales</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{metrics.publishedPages}</div>
                  <div className="text-sm text-muted-foreground">Publiées</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Vues totales</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{metrics.averageCTR}%</div>
                  <div className="text-sm text-muted-foreground">CTR moyen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Optimiseur SEO Local
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smartphone">Smartphone</SelectItem>
                <SelectItem value="tablette">Tablette</SelectItem>
                <SelectItem value="ordinateur">Ordinateur</SelectItem>
                <SelectItem value="console">Console</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions de villes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Suggestions de villes ({filteredSuggestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredSuggestions.slice(0, 10).map((suggestion) => (
              <div
                key={suggestion.city}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{suggestion.city}</h3>
                      <Badge 
                        variant="secondary" 
                        className={`${getPotentialColor(suggestion.potential)} text-white text-xs`}
                      >
                        {suggestion.potential}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {suggestion.repairerCount} réparateurs
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        ~{suggestion.estimatedViews} vues/mois
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Concurrence: {suggestion.competition}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm">
                    <div className="font-medium text-green-600">
                      Potentiel élevé
                    </div>
                    <div className="text-muted-foreground">
                      ROI estimé: +{Math.round(suggestion.estimatedViews * 0.02)}€/mois
                    </div>
                  </div>
                  <Button
                    onClick={() => generateSeoPage(suggestion.city)}
                    disabled={isGenerating === suggestion.city}
                    size="sm"
                  >
                    {isGenerating === suggestion.city ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Générer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredSuggestions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune suggestion trouvée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top villes performantes */}
      {metrics?.topPerformingCities && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Top villes performantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topPerformingCities.map((city, index) => (
                <div key={city.city} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{city.city}</div>
                    <div className="text-sm text-muted-foreground">
                      {city.views} vues • CTR: {city.ctr}%
                    </div>
                  </div>
                  <Progress value={city.ctr * 10} className="w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocalSeoOptimizer;