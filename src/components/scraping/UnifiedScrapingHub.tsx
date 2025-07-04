import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Globe, 
  Upload, 
  Brain, 
  Zap, 
  MapPin, 
  Database,
  Target,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import des composants simplifiés
import CategorySelector from './CategorySelector';
import DataCollectionSection from './DataCollectionSection';
import AIEnhancementSection from './AIEnhancementSection';
import ImportExportSection from './ImportExportSection';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  search_keywords: string[];
  scraping_prompts: any;
}

const UnifiedScrapingHub: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
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
      
      // Sélectionner automatiquement "Réparation Smartphones" par défaut
      const defaultCategory = data?.find(cat => cat.name === 'Réparation Smartphones');
      if (defaultCategory) {
        setSelectedCategory(defaultCategory);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hub de Scraping Intelligent</h1>
          <p className="text-muted-foreground mt-2">
            Collecte, amélioration et import de données avec IA et catégorisation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-admin-purple-light text-admin-purple">
            🧠 IA Configurée
          </Badge>
          <Badge variant="secondary" className="bg-admin-green-light text-admin-green">
            🗺️ Géocodage Actif
          </Badge>
          <Badge variant="secondary" className="bg-admin-blue-light text-admin-blue">
            ✅ Prêt
          </Badge>
        </div>
      </div>

      {/* Sélecteur de catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-admin-orange" />
            Sélection de Catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategorySelector 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </CardContent>
      </Card>

      {selectedCategory && (
        <>
          {/* Section 1: Collecte de Données */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-admin-blue" />
                Collecte de Données - {selectedCategory.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataCollectionSection 
                category={selectedCategory}
                isLoading={isLoading}
                onLoadingChange={setIsLoading}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Section 2: Améliorations IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-admin-purple" />
                Améliorations IA et Géocodage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIEnhancementSection 
                category={selectedCategory}
                isLoading={isLoading}
                onLoadingChange={setIsLoading}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Section 3: Import/Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-admin-green" />
                Import & Export de Données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImportExportSection 
                category={selectedCategory}
                isLoading={isLoading}
                onLoadingChange={setIsLoading}
              />
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCategory && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Sélectionnez une catégorie
            </h3>
            <p className="text-muted-foreground">
              Choisissez le type de commerce à scraper pour commencer
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedScrapingHub;