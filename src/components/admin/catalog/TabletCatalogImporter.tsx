import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCatalog } from '@/hooks/useCatalog';
import { toast } from 'sonner';
import { Tablet, Plus, CheckCircle, AlertCircle, Download } from 'lucide-react';

interface TabletData {
  brand: string;
  models: string[];
}

const TABLET_DATA: TabletData[] = [
  {
    brand: 'Apple',
    models: [
      'iPad Pro 12.9" (6th Gen)',
      'iPad Pro 12.9" (5th Gen)',
      'iPad Pro 11" (4th Gen)',
      'iPad Pro 11" (3rd Gen)',
      'iPad Air (5th Gen)',
      'iPad Air (4th Gen)',
      'iPad (10th Gen)',
      'iPad (9th Gen)',
      'iPad mini (6th Gen)',
      'iPad mini (5th Gen)'
    ]
  },
  {
    brand: 'Samsung',
    models: [
      'Galaxy Tab S9 Ultra',
      'Galaxy Tab S9+',
      'Galaxy Tab S9',
      'Galaxy Tab S8 Ultra',
      'Galaxy Tab S8+',
      'Galaxy Tab S8',
      'Galaxy Tab A8',
      'Galaxy Tab A7 Lite',
      'Galaxy Tab Active 4 Pro',
      'Galaxy Tab Active 3'
    ]
  },
  {
    brand: 'Xiaomi',
    models: [
      'Pad 6',
      'Pad 5',
      'Pad SE',
      'Redmi Pad',
      'Redmi Pad SE',
      'Mi Pad 5 Pro',
      'Mi Pad 5'
    ]
  },
  {
    brand: 'Huawei',
    models: [
      'MatePad Pro 12.6',
      'MatePad Pro 11',
      'MatePad 11.5"',
      'MatePad 11',
      'MatePad SE',
      'MatePad T10s',
      'MatePad T10'
    ]
  },
  {
    brand: 'Microsoft',
    models: [
      'Surface Pro 9',
      'Surface Pro 8',
      'Surface Pro X',
      'Surface Go 3',
      'Surface Go 2'
    ]
  },
  {
    brand: 'Lenovo',
    models: [
      'Tab P12 Pro',
      'Tab P11 Plus',
      'Tab P11',
      'Tab M10 Plus',
      'Tab M8',
      'Yoga Tab 13',
      'Yoga Tab 11'
    ]
  }
];

export const TabletCatalogImporter: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    deviceType?: any;
    brands: any[];
    models: any[];
    errors: string[];
  }>({
    brands: [],
    models: [],
    errors: []
  });

  const {
    deviceTypes,
    brands,
    createDeviceType,
    createBrand,
    createDeviceModel,
    fetchAllData
  } = useCatalog();

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResults({ brands: [], models: [], errors: [] });

    try {
      let deviceType;
      let newBrands: any[] = [];
      let newModels: any[] = [];
      let errors: string[] = [];

      // 1. Créer ou récupérer le device type "Tablette"
      setProgress(10);
      const existingTabletType = deviceTypes.find(dt => 
        dt.name.toLowerCase().includes('tablette') || 
        dt.name.toLowerCase().includes('tablet')
      );

      if (existingTabletType) {
        deviceType = existingTabletType;
        toast.success('Type d\'appareil "Tablette" trouvé');
      } else {
        try {
          deviceType = await createDeviceType({
            name: 'Tablette',
            description: 'Tablettes tactiles et iPad',
            icon: 'tablet'
          });
          toast.success('Type d\'appareil "Tablette" créé');
        } catch (error) {
          errors.push('Erreur création type tablette: ' + error.message);
        }
      }

      setProgress(20);

      // 2. Traiter chaque marque
      const totalBrands = TABLET_DATA.length;
      const totalModels = TABLET_DATA.reduce((sum, brand) => sum + brand.models.length, 0);
      let processedBrands = 0;
      let processedModels = 0;

      for (const tabletBrand of TABLET_DATA) {
        try {
          // Vérifier si la marque existe déjà
          let brand = brands.find(b => 
            b.name.toLowerCase() === tabletBrand.brand.toLowerCase()
          );

          if (!brand) {
            // Créer la marque
            brand = await createBrand({
              name: tabletBrand.brand,
              logo_url: null
            });
            newBrands.push(brand);
            toast.success(`Marque ${tabletBrand.brand} créée`);
          }

          processedBrands++;
          const brandProgress = 20 + (processedBrands / totalBrands) * 30;
          setProgress(brandProgress);

          // 3. Créer les modèles pour cette marque
          for (const modelName of tabletBrand.models) {
            try {
              const deviceModel = await createDeviceModel({
                device_type_id: deviceType.id,
                brand_id: brand.id,
                model_name: modelName,
                model_number: modelName,
                release_date: new Date().getFullYear().toString(),
                screen_size: "10.0",
                screen_resolution: "1920x1200",
                screen_type: 'LCD',
                battery_capacity: "8000",
                operating_system: brand.name === 'Apple' ? 'iPadOS' : 'Android',
                is_active: true
              });

              newModels.push(deviceModel);
              processedModels++;

              const modelProgress = 50 + (processedModels / totalModels) * 45;
              setProgress(modelProgress);

              if (processedModels % 5 === 0) {
                toast.success(`${processedModels}/${totalModels} modèles ajoutés`);
              }

            } catch (error) {
              errors.push(`Erreur modèle ${modelName}: ${error.message}`);
            }
          }

        } catch (error) {
          errors.push(`Erreur marque ${tabletBrand.brand}: ${error.message}`);
        }
      }

      setProgress(100);

      // 4. Actualiser les données
      await fetchAllData();

      setResults({
        deviceType,
        brands: newBrands,
        models: newModels,
        errors
      });

      toast.success(`Import terminé: ${newBrands.length} marques, ${newModels.length} modèles`);

    } catch (error) {
      console.error('Erreur import tablettes:', error);
      toast.error('Erreur lors de l\'import des tablettes');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tablet className="h-5 w-5" />
            Import Catalogue Tablettes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Cet outil va importer automatiquement les principales marques et modèles de tablettes 
            dans le catalogue produits basé sur les données de Mobilax.fr
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TABLET_DATA.map((brand) => (
              <div key={brand.brand} className="border rounded-lg p-3">
                <div className="font-medium">{brand.brand}</div>
                <div className="text-xs text-muted-foreground">
                  {brand.models.length} modèles
                </div>
              </div>
            ))}
          </div>

          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Import en cours...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={handleImport} 
            disabled={importing}
            className="w-full"
          >
            {importing ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Importer les Tablettes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {(results.brands.length > 0 || results.models.length > 0 || results.errors.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Résultats de l'Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.deviceType && (
              <div>
                <h4 className="font-medium mb-2">Type d'appareil</h4>
                <Badge variant="outline">{results.deviceType.name}</Badge>
              </div>
            )}

            {results.brands.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Nouvelles marques ({results.brands.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {results.brands.map((brand) => (
                    <Badge key={brand.id} variant="default">{brand.name}</Badge>
                  ))}
                </div>
              </div>
            )}

            {results.models.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Nouveaux modèles ({results.models.length})</h4>
                <div className="text-sm text-muted-foreground">
                  {results.models.length} modèles de tablettes ajoutés au catalogue
                </div>
              </div>
            )}

            {results.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Erreurs ({results.errors.length})
                </h4>
                <div className="space-y-1">
                  {results.errors.map((error, index) => (
                    <div key={index} className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};