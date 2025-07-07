
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Upload, 
  Download, 
  Sparkles, 
  MapPin,
  Settings,
  BarChart3,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EnhancedImportExportSection from '@/components/scraping/EnhancedImportExportSection';
import IntelligentCSVImport from '@/components/scraping/IntelligentCSVImport';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  search_keywords: string[];
  scraping_prompts: any;
}

interface RepairerStats {
  total: number;
  byCategory: { [key: string]: number };
  recentlyAdded: number;
  verified: number;
  withGeodata: number;
}

const ScrapingDashboard: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [stats, setStats] = useState<RepairerStats>({
    total: 0,
    byCategory: {},
    recentlyAdded: 0,
    verified: 0,
    withGeodata: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setCategories(data || []);
      if (data && data.length > 0) {
        setSelectedCategory(data[0]);
      }
    } catch (error: any) {
      console.error('Erreur chargement catégories:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive"
      });
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('repairers')
        .select('id, business_category_id, created_at, is_verified, lat, lng');

      if (error) throw error;

      const total = data?.length || 0;
      const byCategory: { [key: string]: number } = {};
      const recentlyAdded = data?.filter(r => {
        const createdAt = new Date(r.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt > weekAgo;
      }).length || 0;
      
      const verified = data?.filter(r => r.is_verified).length || 0;
      const withGeodata = data?.filter(r => r.lat && r.lng).length || 0;

      data?.forEach(repairer => {
        if (repairer.business_category_id) {
          byCategory[repairer.business_category_id] = (byCategory[repairer.business_category_id] || 0) + 1;
        }
      });

      setStats({
        total,
        byCategory,
        recentlyAdded,
        verified,
        withGeodata
      });
    } catch (error: any) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleDataRefresh = () => {
    loadStats();
    toast({
      title: "Données actualisées",
      description: "Les statistiques ont été mises à jour"
    });
  };

  if (!selectedCategory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Chargement des catégories...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-admin-blue" />
              <div>
                <div className="text-2xl font-bold text-admin-blue">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total réparateurs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                <div className="text-xs text-muted-foreground">Vérifiés</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.withGeodata}</div>
                <div className="text-xs text-muted-foreground">Géolocalisés</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.recentlyAdded}</div>
                <div className="text-xs text-muted-foreground">Cette semaine</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sélecteur de catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Catégorie sélectionnée</span>
            <Button onClick={handleDataRefresh} variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory.id === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="flex items-center space-x-2"
              >
                <span>{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {stats.byCategory[category.id] || 0}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interface principale */}
      <Tabs defaultValue="quick-import" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick-import">Import Rapide</TabsTrigger>
          <TabsTrigger value="advanced-import">Import Avancé</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-import" className="space-y-4">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Import optimisé:</strong> Testez rapidement avec les 11 réparateurs de l'Allier fournis, 
              incluant géocodage automatique et amélioration IA.
            </AlertDescription>
          </Alert>
          
          <IntelligentCSVImport
            selectedCategory={selectedCategory}
            onImportComplete={handleDataRefresh}
          />
        </TabsContent>

        <TabsContent value="advanced-import" className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Import avancé:</strong> Configurez le mapping des colonnes, l'encodage, 
              les séparateurs et les options d'amélioration pour vos fichiers CSV personnalisés.
            </AlertDescription>
          </Alert>
          
          <EnhancedImportExportSection
            categories={categories}
            selectedCategory={selectedCategory}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              <strong>Export multi-format:</strong> Exportez les données par catégorie ou toutes 
              ensemble avec métadonnées complètes (géolocalisation, scores qualité, etc.).
            </AlertDescription>
          </Alert>
          
          <EnhancedImportExportSection
            categories={categories}
            selectedCategory={selectedCategory}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapingDashboard;
