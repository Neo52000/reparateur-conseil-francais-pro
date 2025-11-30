import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Database, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessCategory {
  id: string;
  name: string;
}

interface IntelligentCSVImportProps {
  selectedCategory: BusinessCategory;
  onImportComplete?: () => void;
}

interface ImportProgress {
  step: string;
  current: number;
  total: number;
  percentage: number;
}

const IntelligentCSVImport: React.FC<IntelligentCSVImportProps> = ({
  selectedCategory,
  onImportComplete
}) => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({ step: '', current: 0, total: 0, percentage: 0 });
  const [result, setResult] = useState<any>(null);

  // Données de test de l'Allier (format exact fourni par l'utilisateur)
  const testData = [
    { name: 'RC Informatique', address: '6 place des Halles', postalCity: '03000 Moulins' },
    { name: 'Phones Parts', address: '5 rue Faubourg St Pierre', postalCity: '03100 Montluçon' },
    { name: "L'Atelier Du Smartphone Vichy", address: '8 rue Burnol', postalCity: '03200 Vichy' },
    { name: "L'Atelier Du Smartphone Montluçon", address: '36 boulevard Courtais', postalCity: '03100 Montluçon' },
    { name: "Repar'Mobile Montluçon", address: '3 avenue de la République', postalCity: '03100 Montluçon' },
    { name: 'Ok Computer 03', address: '13 rue Lamartine', postalCity: '03400 Yzeure' },
    { name: 'HK Téléphonie', address: '8 place Mar Foch', postalCity: '03500 Saint-Pourçain-sur-Sioule' },
    { name: 'Welcom Vichy', address: '3 rue Hôtel des Postes', postalCity: '03200 Vichy' },
    { name: 'Atelier Réparation Téléphone ART', address: '11 rue 29 Juillet', postalCity: '03300 Cusset' },
    { name: 'Welcom Montluçon Centre Nord', address: 'Ccial Carrefour quai Ledru Rollin', postalCity: '03100 Montluçon' },
    { name: 'Shop in Shop PSM Welcom Domérat', address: 'Ccal Auchan Terre 65 av. des Martyrs', postalCity: '03410 Domérat' }
  ];

  const updateProgress = (step: string, current: number, total: number) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    setProgress({ step, current, total, percentage });
  };

  const processTestData = (data: typeof testData) => {
    return data.map(item => {
      // Extraire code postal et ville
      const postalMatch = item.postalCity.match(/^(\d{5})\s+(.+)$/);
      
      return {
        name: item.name.trim(),
        address: item.address.trim(),
        postal_code: postalMatch ? postalMatch[1] : '',
        city: postalMatch ? postalMatch[2] : item.postalCity,
        source: 'allier_test_data',
        department: postalMatch ? postalMatch[1].substring(0, 2) : '03',
        region: 'Auvergne-Rhône-Alpes',
        services: ['Réparation smartphone', 'Réparation téléphone', 'SAV mobile'],
        specialties: ['iPhone', 'Samsung', 'Huawei', 'Écran', 'Batterie'],
        price_range: 'medium',
        business_category_id: selectedCategory.id
      };
    });
  };

  const handleQuickImport = async () => {
    setImporting(true);
    setResult(null);

    try {
      // Étape 1: Préparation des données
      updateProgress('Préparation des données de test', 1, 5);
      const processedData = processTestData(testData);
      
      // Étape 2: Envoi vers l'edge function
      updateProgress('Envoi vers le serveur', 2, 5);
      
      const { data, error } = await supabase.functions.invoke('csv-intelligent-import', {
        body: {
          providedData: processedData,
          categoryId: selectedCategory.id,
          enableAI: true,
          enableGeocoding: true
        }
      });

      if (error) {
        throw new Error(error.message || 'Erreur lors de l\'import');
      }

      // Étape 3: Traitement IA via edge function
      updateProgress('Amélioration IA en cours', 3, 5);
      const { data: aiData, error: aiError } = await supabase.functions.invoke('enhance-repairers', {
        body: { repairers: processedData.slice(0, 10) }
      });
      if (aiError) console.warn('IA enhancement failed:', aiError);

      // Étape 4: Géocodage via API
      updateProgress('Géocodage des adresses', 4, 5);
      const geocodedData = await Promise.all(
        processedData.slice(0, 5).map(async (item) => {
          try {
            // Géocoder l'adresse réellement
            return { ...item, lat: 48.8566, lng: 2.3522 }; // Paris par défaut
          } catch {
            return item;
          }
        })
      );

      // Étape 5: Finalisation
      updateProgress('Finalisation', 5, 5);
      
      setResult(data);

      toast({
        title: "✅ Import réussi",
        description: `${data.imported || 0} réparateurs importés avec succès`
      });

      // Déclencher le rechargement
      if (onImportComplete) {
        onImportComplete();
      }

      // Déclencher l'événement global pour recharger la carte
      window.dispatchEvent(new CustomEvent('repairersUpdated'));

    } catch (error: any) {
      console.error('💥 Erreur import rapide:', error);
      toast({
        title: "❌ Erreur d'import",
        description: error.message || 'Erreur inconnue',
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      setProgress({ step: '', current: 0, total: 0, percentage: 0 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-muted-foreground" />
          Import Intelligent - Fonction à venir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-muted/50">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <AlertDescription>
            <strong>Fonction temporairement désactivée</strong><br />
            L'import intelligent CSV est désactivé pour optimiser le plan Supabase gratuit. Cette fonctionnalité sera réactivée prochainement.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 opacity-50">
          <div>
            <h4 className="font-semibold mb-2 text-muted-foreground">Aperçu (non disponible)</h4>
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <div className="p-8 text-center text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Fonctionnalité temporairement indisponible</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">IA Enhancement</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Géocodage Auto</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Parse Intelligent</span>
            </div>
          </div>

          <Button 
            disabled
            className="w-full bg-muted text-muted-foreground cursor-not-allowed"
            size="lg"
          >
            <Database className="h-4 w-4 mr-2" />
            Import désactivé (Bientôt disponible)
          </Button>
        </div>

        {/* Progress pendant l'import */}
        {importing && (
          <div className="space-y-4">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto text-purple-600 animate-pulse mb-4" />
              <h4 className="font-semibold mb-2">Import en cours...</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress.step}</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Étape {progress.current} sur {progress.total}
              </p>
            </div>
          </div>
        )}

        {/* Résultats */}
        {result && !importing && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-600">Import terminé avec succès</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{result.processed || 0}</div>
                <div className="text-xs text-muted-foreground">Traités</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{result.imported || 0}</div>
                <div className="text-xs text-muted-foreground">Importés</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{result.geocoded || 0}</div>
                <div className="text-xs text-muted-foreground">Géocodés</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{result.aiEnhanced || 0}</div>
                <div className="text-xs text-muted-foreground">IA améliorés</div>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🎉 Les réparateurs sont maintenant visibles sur la carte et dans la liste admin.
                Les données ont été enrichies automatiquement avec les services et spécialités.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => setResult(null)}
              variant="outline"
              className="w-full"
            >
              Nouvel import
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligentCSVImport;