import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  MapPin, 
  Database, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  search_keywords: string[];
  scraping_prompts: any;
}

interface AIEnhancementSectionProps {
  category: BusinessCategory;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

interface EnhancementStats {
  total_repairers: number;
  deepseek_enhanced: number;
  mistral_enhanced: number;
  geocoded: number;
  pending_enhancements: number;
  avg_quality_score: number;
}

const AIEnhancementSection: React.FC<AIEnhancementSectionProps> = ({
  category,
  isLoading,
  onLoadingChange
}) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<EnhancementStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    loadEnhancementStats();
  }, []);

  const loadEnhancementStats = async () => {
    setIsLoadingStats(true);
    try {
      const { data: repairersData } = await supabase
        .from('repairers')
        .select('unique_id, deepseek_confidence, mistral_enhanced, lat, lng, data_quality_score, enhancement_status');

      if (repairersData) {
        const enhancementStats: EnhancementStats = {
          total_repairers: repairersData.length,
          deepseek_enhanced: repairersData.filter(r => r.deepseek_confidence > 0).length,
          mistral_enhanced: repairersData.filter(r => r.mistral_enhanced).length,
          geocoded: repairersData.filter(r => r.lat && r.lng).length,
          pending_enhancements: repairersData.filter(r => r.enhancement_status === 'pending').length,
          avg_quality_score: repairersData.reduce((sum, r) => sum + (r.data_quality_score || 0), 0) / repairersData.length
        };
        setStats(enhancementStats);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const triggerEnhancement = async (enhancementType: string) => {
    onLoadingChange(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-enhance-repairers', {
        body: { enhancement_type: enhancementType }
      });

      if (error) throw error;

      toast({
        title: "Amélioration lancée",
        description: `Processus d'amélioration ${enhancementType} démarré avec succès`
      });

      // Recharger les stats après quelques secondes
      setTimeout(loadEnhancementStats, 3000);
    } catch (error: any) {
      console.error('Erreur lors du lancement de l\'amélioration:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de lancer l'amélioration",
        variant: "destructive"
      });
    } finally {
      onLoadingChange(false);
    }
  };

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-admin-purple" />
        <span className="ml-2 text-muted-foreground">Chargement des statistiques...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques d'amélioration */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Brain className="h-6 w-6 text-admin-purple" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Classification IA</p>
                  <p className="text-lg font-bold text-foreground">
                    {stats.deepseek_enhanced}/{stats.total_repairers}
                  </p>
                  <Progress 
                    value={(stats.deepseek_enhanced / stats.total_repairers) * 100} 
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Zap className="h-6 w-6 text-admin-blue" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Amélioration Mistral</p>
                  <p className="text-lg font-bold text-foreground">
                    {stats.mistral_enhanced}/{stats.total_repairers}
                  </p>
                  <Progress 
                    value={(stats.mistral_enhanced / stats.total_repairers) * 100} 
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-admin-green" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Géocodage</p>
                  <p className="text-lg font-bold text-foreground">
                    {stats.geocoded}/{stats.total_repairers}
                  </p>
                  <Progress 
                    value={(stats.geocoded / stats.total_repairers) * 100} 
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions d'amélioration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Brain className="h-4 w-4 mr-2 text-admin-purple" />
              Classification IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Valide et classe automatiquement les commerces avec DeepSeek
            </p>
            <div className="p-3 bg-admin-purple-light rounded-lg">
              <p className="text-xs text-admin-purple">
                <strong>Spécialisé pour:</strong> {category.name}
              </p>
            </div>
            <Button 
              onClick={() => triggerEnhancement('deepseek')}
              disabled={isLoading}
              className="w-full bg-admin-purple hover:bg-admin-purple/90"
            >
              <Brain className="h-4 w-4 mr-2" />
              Lancer Classification
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Zap className="h-4 w-4 mr-2 text-admin-blue" />
              Amélioration Contenu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enrichit les descriptions avec Mistral IA
            </p>
            <div className="p-3 bg-admin-blue-light rounded-lg">
              <p className="text-xs text-admin-blue">
                <strong>Optimisé pour:</strong> {category.description}
              </p>
            </div>
            <Button 
              onClick={() => triggerEnhancement('mistral')}
              disabled={isLoading}
              className="w-full bg-admin-blue hover:bg-admin-blue/90"
            >
              <Zap className="h-4 w-4 mr-2" />
              Améliorer Contenu
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <MapPin className="h-4 w-4 mr-2 text-admin-green" />
              Géocodage Nominatim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ajoute les coordonnées GPS automatiquement
            </p>
            <div className="p-3 bg-admin-green-light rounded-lg">
              <p className="text-xs text-admin-green">
                <strong>Service gratuit</strong> OpenStreetMap
              </p>
            </div>
            <Button 
              onClick={() => triggerEnhancement('geocoding')}
              disabled={isLoading}
              className="w-full bg-admin-green hover:bg-admin-green/90"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Géocoder Adresses
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Database className="h-4 w-4 mr-2 text-admin-orange" />
              Amélioration Complète
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Exécute toutes les améliorations en une fois
            </p>
            <div className="p-3 bg-admin-orange-light rounded-lg">
              <p className="text-xs text-admin-orange">
                <strong>Processus complet:</strong> Classification + Amélioration + Géocodage
              </p>
            </div>
            <Button 
              onClick={() => triggerEnhancement('all')}
              disabled={isLoading}
              className="w-full bg-admin-orange hover:bg-admin-orange/90"
            >
              <Database className="h-4 w-4 mr-2" />
              Lancer Tout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Indicateur de statut */}
      {stats && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-admin-green" />
                <span className="text-sm font-medium">Statut global</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span>Score qualité moyen: <strong>{Math.round(stats.avg_quality_score)}%</strong></span>
                <span>En attente: <strong>{stats.pending_enhancements}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIEnhancementSection;