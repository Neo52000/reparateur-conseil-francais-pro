import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MapPin, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Activity,
  TrendingUp,
  Database,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancementStats {
  total_repairers: number;
  deepseek_enhanced: number;
  mistral_enhanced: number;
  geocoded: number;
  unique_ids_generated: number;
  avg_quality_score: number;
  pending_enhancements: number;
}

interface ConfigStatus {
  deepseek: boolean;
  mistral: boolean;
  geocoding: boolean;
  data_cleaning: boolean;
}

const AutoEnhancementDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<EnhancementStats | null>(null);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger les statistiques d'amélioration
      const { data: repairersData } = await supabase
        .from('repairers')
        .select('unique_id, deepseek_confidence, mistral_enhanced, lat, lng, data_quality_score, enhancement_status');

      // Charger la configuration
      const { data: configData } = await supabase
        .from('scraping_enhancement_config')
        .select('config_key, config_value')
        .in('config_key', ['deepseek_enabled', 'mistral_enabled', 'geocoding_enabled', 'data_cleaning_enabled']);

      if (repairersData) {
        const enhancementStats: EnhancementStats = {
          total_repairers: repairersData.length,
          deepseek_enhanced: repairersData.filter(r => r.deepseek_confidence > 0).length,
          mistral_enhanced: repairersData.filter(r => r.mistral_enhanced).length,
          geocoded: repairersData.filter(r => r.lat && r.lng).length,
          unique_ids_generated: repairersData.filter(r => r.unique_id).length,
          avg_quality_score: repairersData.reduce((sum, r) => sum + (r.data_quality_score || 0), 0) / repairersData.length,
          pending_enhancements: repairersData.filter(r => r.enhancement_status === 'pending').length
        };
        setStats(enhancementStats);
      }

      if (configData) {
        const configStatus = configData.reduce((acc, item) => {
          const configValue = typeof item.config_value === 'string' 
            ? JSON.parse(item.config_value) 
            : item.config_value;
          acc[item.config_key.replace('_enabled', '')] = configValue?.enabled || false;
          return acc;
        }, {} as ConfigStatus);
        setConfig(configStatus);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      });
    }
  };

  const triggerAutoEnhancement = async (enhancementType: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-enhance-repairers', {
        body: { enhancement_type: enhancementType }
      });

      if (error) throw error;

      toast({
        title: "Amélioration lancée",
        description: `Processus d'amélioration ${enhancementType} démarré avec succès`
      });

      // Recharger les données après quelques secondes
      setTimeout(loadDashboardData, 3000);
    } catch (error: any) {
      console.error('Erreur lors du lancement de l\'amélioration:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de lancer l'amélioration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!stats || !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-admin-purple" />
        <span className="ml-2 text-muted-foreground">Chargement du tableau de bord...</span>
      </div>
    );
  }

  const completionPercentage = Math.round((stats.total_repairers - stats.pending_enhancements) / stats.total_repairers * 100);

  return (
    <div className="space-y-6">
      {/* Header avec statut global */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Améliorations Automatiques</h2>
          <p className="text-muted-foreground">Suivi des améliorations IA et de la qualité des données</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={completionPercentage > 80 ? "default" : "secondary"}>
            {completionPercentage}% complété
          </Badge>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-admin-purple" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">DeepSeek Classification</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.deepseek_enhanced}/{stats.total_repairers}
                </p>
                <Progress 
                  value={(stats.deepseek_enhanced / stats.total_repairers) * 100} 
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-admin-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Mistral Amélioration</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.mistral_enhanced}/{stats.total_repairers}
                </p>
                <Progress 
                  value={(stats.mistral_enhanced / stats.total_repairers) * 100} 
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-admin-green" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Géocodage Nominatim</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.geocoded}/{stats.total_repairers}
                </p>
                <Progress 
                  value={(stats.geocoded / stats.total_repairers) * 100} 
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-admin-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Score Qualité Moyen</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(stats.avg_quality_score)}%
                </p>
                <Progress 
                  value={stats.avg_quality_score} 
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets détaillés */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="deepseek">DeepSeek IA</TabsTrigger>
          <TabsTrigger value="mistral">Mistral IA</TabsTrigger>
          <TabsTrigger value="geocoding">Géocodage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-admin-purple" />
                Actions d'amélioration automatique
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => triggerAutoEnhancement('all')}
                disabled={isLoading}
                className="h-16 bg-admin-purple hover:bg-admin-purple/90"
              >
                <Brain className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Amélioration Complète</div>
                  <div className="text-sm opacity-90">DeepSeek + Mistral + Géocodage</div>
                </div>
              </Button>

              <Button 
                onClick={() => triggerAutoEnhancement('unique_ids')}
                disabled={isLoading}
                variant="outline"
                className="h-16"
              >
                <Database className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Générer IDs Uniques</div>
                  <div className="text-sm opacity-70">
                    {stats.unique_ids_generated}/{stats.total_repairers} générés
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration des Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${config.deepseek ? 'bg-admin-green' : 'bg-admin-orange'}`} />
                  <span className="text-sm font-medium">DeepSeek</span>
                  {config.deepseek ? <CheckCircle className="h-4 w-4 text-admin-green" /> : <AlertCircle className="h-4 w-4 text-admin-orange" />}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${config.mistral ? 'bg-admin-green' : 'bg-admin-orange'}`} />
                  <span className="text-sm font-medium">Mistral</span>
                  {config.mistral ? <CheckCircle className="h-4 w-4 text-admin-green" /> : <AlertCircle className="h-4 w-4 text-admin-orange" />}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${config.geocoding ? 'bg-admin-green' : 'bg-admin-orange'}`} />
                  <span className="text-sm font-medium">Géocodage</span>
                  {config.geocoding ? <CheckCircle className="h-4 w-4 text-admin-green" /> : <AlertCircle className="h-4 w-4 text-admin-orange" />}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${config.data_cleaning ? 'bg-admin-green' : 'bg-admin-orange'}`} />
                  <span className="text-sm font-medium">Nettoyage</span>
                  {config.data_cleaning ? <CheckCircle className="h-4 w-4 text-admin-green" /> : <AlertCircle className="h-4 w-4 text-admin-orange" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deepseek" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-admin-purple" />
                Classification et Validation DeepSeek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-admin-purple-light rounded-lg">
                  <h4 className="font-semibold text-admin-purple mb-2">🤖 Fonctionnalités DeepSeek</h4>
                  <ul className="text-sm text-admin-purple space-y-1">
                    <li>• <strong>Classification automatique:</strong> Validation des réparateurs vs autres commerces</li>
                    <li>• <strong>Score de confiance:</strong> Évaluation de 0 à 100% de la fiabilité</li>
                    <li>• <strong>Détection spécialités:</strong> Identification automatique des services</li>
                    <li>• <strong>Validation continue:</strong> Réévaluation périodique des données</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => triggerAutoEnhancement('deepseek')}
                  disabled={isLoading}
                  className="w-full bg-admin-purple hover:bg-admin-purple/90"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Lancer Classification DeepSeek
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mistral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-admin-blue" />
                Amélioration de Contenu Mistral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-admin-blue-light rounded-lg">
                  <h4 className="font-semibold text-admin-blue mb-2">✨ Améliorations Mistral</h4>
                  <ul className="text-sm text-admin-blue space-y-1">
                    <li>• <strong>Descriptions enrichies:</strong> Amélioration du contenu existant</li>
                    <li>• <strong>Services standardisés:</strong> Normalisation des offres</li>
                    <li>• <strong>Contenu manquant:</strong> Génération de descriptions vides</li>
                    <li>• <strong>Optimisation SEO:</strong> Mots-clés et structure optimisés</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => triggerAutoEnhancement('mistral')}
                  disabled={isLoading}
                  className="w-full bg-admin-blue hover:bg-admin-blue/90"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Lancer Amélioration Mistral
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geocoding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-admin-green" />
                Géocodage Automatique Nominatim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-admin-green-light rounded-lg">
                  <h4 className="font-semibold text-admin-green mb-2">🗺️ Géocodage Nominatim</h4>
                  <ul className="text-sm text-admin-green space-y-1">
                    <li>• <strong>Coordonnées GPS:</strong> Conversion automatique des adresses</li>
                    <li>• <strong>Validation d'adresses:</strong> Vérification et normalisation</li>
                    <li>• <strong>Fallback intelligent:</strong> Coordonnées par ville si échec</li>
                    <li>• <strong>Historique complet:</strong> Traçage de tous les géocodages</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => triggerAutoEnhancement('geocoding')}
                  disabled={isLoading}
                  className="w-full bg-admin-green hover:bg-admin-green/90"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Lancer Géocodage Nominatim
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoEnhancementDashboard;