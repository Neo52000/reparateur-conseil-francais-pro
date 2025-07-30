import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCatalog } from '@/hooks/useCatalog';
import { toast } from 'sonner';
import { 
  Smartphone, 
  Tablet, 
  Laptop, 
  Headphones,
  Watch,
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Database,
  Globe
} from 'lucide-react';

interface ProductData {
  deviceType: string;
  brand: string;
  models: string[];
  category: string;
  icon: any;
}

// Données complètes des produits basées sur Mobilax et autres sources
const COMPLETE_PRODUCT_DATA: ProductData[] = [
  // SMARTPHONES
  {
    deviceType: 'Smartphone',
    brand: 'Apple',
    category: 'smartphone',
    icon: Smartphone,
    models: [
      'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
      'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
      'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
      'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
      'iPhone SE (3rd Gen)', 'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11'
    ]
  },
  {
    deviceType: 'Smartphone',
    brand: 'Samsung',
    category: 'smartphone',
    icon: Smartphone,
    models: [
      'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
      'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
      'Galaxy A54 5G', 'Galaxy A34 5G', 'Galaxy A24', 'Galaxy A14',
      'Galaxy Z Fold5', 'Galaxy Z Flip5', 'Galaxy Z Fold4', 'Galaxy Z Flip4',
      'Galaxy Note 20 Ultra', 'Galaxy Note 20'
    ]
  },
  {
    deviceType: 'Smartphone',
    brand: 'Xiaomi',
    category: 'smartphone',
    icon: Smartphone,
    models: [
      'Xiaomi 14 Ultra', 'Xiaomi 14', 'Xiaomi 13T Pro', 'Xiaomi 13T',
      'Redmi Note 13 Pro', 'Redmi Note 13', 'Redmi Note 12 Pro', 'Redmi Note 12',
      'POCO X6 Pro', 'POCO X6', 'POCO F6', 'POCO M6 Pro'
    ]
  },
  {
    deviceType: 'Smartphone',
    brand: 'Huawei',
    category: 'smartphone',
    icon: Smartphone,
    models: [
      'P60 Pro', 'P60', 'Mate 60 Pro', 'Mate 50 Pro',
      'Nova 11', 'Nova 11 Pro', 'P50 Pro', 'P50'
    ]
  },
  {
    deviceType: 'Smartphone',
    brand: 'OnePlus',
    category: 'smartphone',
    icon: Smartphone,
    models: [
      'OnePlus 12', 'OnePlus 11', 'OnePlus Nord 3', 'OnePlus Nord CE 3',
      'OnePlus 10 Pro', 'OnePlus 9 Pro', 'OnePlus 9'
    ]
  },
  {
    deviceType: 'Smartphone',
    brand: 'Oppo',
    category: 'smartphone',
    icon: Smartphone,
    models: [
      'Find X7 Ultra', 'Find X6 Pro', 'Reno 11 Pro', 'Reno 10 Pro',
      'A98', 'A78', 'A58'
    ]
  },

  // TABLETTES
  {
    deviceType: 'Tablette',
    brand: 'Apple',
    category: 'tablet',
    icon: Tablet,
    models: [
      'iPad Pro 12.9" (6th Gen)', 'iPad Pro 11" (4th Gen)',
      'iPad Air (5th Gen)', 'iPad (10th Gen)', 'iPad mini (6th Gen)'
    ]
  },
  {
    deviceType: 'Tablette',
    brand: 'Samsung',
    category: 'tablet',
    icon: Tablet,
    models: [
      'Galaxy Tab S9 Ultra', 'Galaxy Tab S9+', 'Galaxy Tab S9',
      'Galaxy Tab A9+', 'Galaxy Tab Active 4 Pro'
    ]
  },
  {
    deviceType: 'Tablette',
    brand: 'Microsoft',
    category: 'tablet',
    icon: Tablet,
    models: [
      'Surface Pro 9', 'Surface Pro 8', 'Surface Go 3'
    ]
  },

  // ORDINATEURS PORTABLES
  {
    deviceType: 'Ordinateur Portable',
    brand: 'Apple',
    category: 'laptop',
    icon: Laptop,
    models: [
      'MacBook Pro 16" (M3)', 'MacBook Pro 14" (M3)',
      'MacBook Air 15" (M2)', 'MacBook Air 13" (M2)'
    ]
  },
  {
    deviceType: 'Ordinateur Portable',
    brand: 'Lenovo',
    category: 'laptop',
    icon: Laptop,
    models: [
      'ThinkPad X1 Carbon', 'ThinkPad T14', 'IdeaPad 5 Pro',
      'Legion 5 Pro', 'Yoga 9i'
    ]
  },
  {
    deviceType: 'Ordinateur Portable',
    brand: 'Dell',
    category: 'laptop',
    icon: Laptop,
    models: [
      'XPS 13', 'XPS 15', 'Inspiron 15 3000',
      'Latitude 7420', 'Alienware m15'
    ]
  },
  {
    deviceType: 'Ordinateur Portable',
    brand: 'HP',
    category: 'laptop',
    icon: Laptop,
    models: [
      'Spectre x360', 'Pavilion 15', 'EliteBook 840',
      'Omen 15', 'Envy x360'
    ]
  },

  // ÉCOUTEURS
  {
    deviceType: 'Écouteurs',
    brand: 'Apple',
    category: 'audio',
    icon: Headphones,
    models: [
      'AirPods Pro (2nd Gen)', 'AirPods (3rd Gen)', 'AirPods Max',
      'AirPods Pro (1st Gen)', 'AirPods (2nd Gen)'
    ]
  },
  {
    deviceType: 'Écouteurs',
    brand: 'Sony',
    category: 'audio',
    icon: Headphones,
    models: [
      'WH-1000XM5', 'WH-1000XM4', 'WF-1000XM4',
      'WH-CH720N', 'WF-C700N'
    ]
  },
  {
    deviceType: 'Écouteurs',
    brand: 'Samsung',
    category: 'audio',
    icon: Headphones,
    models: [
      'Galaxy Buds2 Pro', 'Galaxy Buds2', 'Galaxy Buds Live',
      'Galaxy Buds Pro'
    ]
  },

  // MONTRES CONNECTÉES
  {
    deviceType: 'Montre Connectée',
    brand: 'Apple',
    category: 'watch',
    icon: Watch,
    models: [
      'Apple Watch Series 9', 'Apple Watch Ultra 2', 'Apple Watch SE (2nd Gen)',
      'Apple Watch Series 8', 'Apple Watch Series 7'
    ]
  },
  {
    deviceType: 'Montre Connectée',
    brand: 'Samsung',
    category: 'watch',
    icon: Watch,
    models: [
      'Galaxy Watch6 Classic', 'Galaxy Watch6', 'Galaxy Watch5 Pro',
      'Galaxy Watch4'
    ]
  },
  {
    deviceType: 'Montre Connectée',
    brand: 'Garmin',
    category: 'watch',
    icon: Watch,
    models: [
      'Forerunner 965', 'Fenix 7X', 'Venu 3', 'Vivoactive 5'
    ]
  }
];

export const UniversalCatalogImporter: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['smartphone']);
  const [results, setResults] = useState<{
    deviceTypes: any[];
    brands: any[];
    models: any[];
    errors: string[];
  }>({
    deviceTypes: [],
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

  const categories = [
    { id: 'smartphone', label: 'Smartphones', icon: Smartphone, color: 'blue' },
    { id: 'tablet', label: 'Tablettes', icon: Tablet, color: 'green' },
    { id: 'laptop', label: 'Ordinateurs', icon: Laptop, color: 'purple' },
    { id: 'audio', label: 'Écouteurs', icon: Headphones, color: 'orange' },
    { id: 'watch', label: 'Montres', icon: Watch, color: 'red' }
  ];

  const filteredProducts = COMPLETE_PRODUCT_DATA.filter(product => 
    selectedCategories.includes(product.category)
  );

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResults({ deviceTypes: [], brands: [], models: [], errors: [] });

    try {
      let newDeviceTypes: any[] = [];
      let newBrands: any[] = [];
      let newModels: any[] = [];
      let errors: string[] = [];

      const totalItems = filteredProducts.reduce((sum, product) => sum + product.models.length, 0);
      let processedItems = 0;

      // Grouper par type d'appareil et marque
      const groupedData = filteredProducts.reduce((acc, product) => {
        if (!acc[product.deviceType]) {
          acc[product.deviceType] = {};
        }
        if (!acc[product.deviceType][product.brand]) {
          acc[product.deviceType][product.brand] = [];
        }
        acc[product.deviceType][product.brand].push(...product.models);
        return acc;
      }, {} as Record<string, Record<string, string[]>>);

      setProgress(5);

      // 1. Créer/récupérer les types d'appareils
      for (const deviceTypeName of Object.keys(groupedData)) {
        try {
          let deviceType = deviceTypes.find(dt => 
            dt.name.toLowerCase() === deviceTypeName.toLowerCase()
          );

          if (!deviceType) {
            try {
              deviceType = await createDeviceType({
                name: deviceTypeName,
                description: `${deviceTypeName} - Import automatique`,
                icon: deviceTypeName.toLowerCase().includes('smartphone') ? 'smartphone' :
                     deviceTypeName.toLowerCase().includes('tablette') ? 'tablet' :
                     deviceTypeName.toLowerCase().includes('ordinateur') ? 'laptop' :
                     deviceTypeName.toLowerCase().includes('écouteur') ? 'headphones' :
                     deviceTypeName.toLowerCase().includes('montre') ? 'watch' : 'device'
              });
              newDeviceTypes.push(deviceType);
              toast.success(`Type "${deviceTypeName}" créé`);
            } catch (typeError: any) {
              if (typeError.message?.includes('duplicate') || typeError.message?.includes('already exists')) {
                // Le type existe déjà, le récupérer
                await fetchAllData();
                deviceType = deviceTypes.find(dt => dt.name.toLowerCase() === deviceTypeName.toLowerCase());
                if (!deviceType) {
                  errors.push(`Impossible de récupérer le type ${deviceTypeName}`);
                  continue;
                }
              } else {
                throw typeError;
              }
            }
          }

          setProgress(10);

          // 2. Traiter chaque marque pour ce type d'appareil
          for (const [brandName, models] of Object.entries(groupedData[deviceTypeName])) {
            try {
              // Créer/récupérer la marque
              let brand = brands.find(b => 
                b.name.toLowerCase() === brandName.toLowerCase()
              );

              if (!brand) {
                try {
                  brand = await createBrand({
                    name: brandName,
                    logo_url: null
                  });
                  newBrands.push(brand);
                  toast.success(`Marque ${brandName} créée`);
                } catch (brandError: any) {
                  if (brandError.message?.includes('duplicate') || brandError.message?.includes('already exists')) {
                    // La marque existe déjà, la récupérer
                    await fetchAllData();
                    brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
                    if (!brand) {
                      errors.push(`Impossible de récupérer la marque ${brandName}`);
                      continue;
                    }
                  } else {
                    throw brandError;
                  }
                }
              }

              // 3. Créer les modèles
              for (const modelName of models) {
                try {
                  const deviceModel = await createDeviceModel({
                    device_type_id: deviceType.id,
                    brand_id: brand.id,
                    model_name: modelName,
                    model_number: modelName,
                    release_date: new Date().getFullYear().toString(),
                    screen_size: getDefaultScreenSize(deviceTypeName),
                    screen_resolution: getDefaultResolution(deviceTypeName),
                    screen_type: 'LCD',
                    battery_capacity: getDefaultBattery(deviceTypeName),
                    operating_system: getDefaultOS(brandName, deviceTypeName),
                    is_active: true
                  });

                  newModels.push(deviceModel);
                  processedItems++;

                  const modelProgress = 10 + (processedItems / totalItems) * 85;
                  setProgress(modelProgress);

                  if (processedItems % 10 === 0) {
                    toast.success(`${processedItems}/${totalItems} modèles ajoutés`);
                  }

                } catch (error: any) {
                  if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
                    // Le modèle existe déjà, passer au suivant
                    processedItems++;
                    continue;
                  } else {
                    errors.push(`Erreur modèle ${modelName}: ${error.message}`);
                  }
                }
              }

            } catch (error) {
              errors.push(`Erreur marque ${brandName}: ${error.message}`);
            }
          }

        } catch (error) {
          errors.push(`Erreur type ${deviceTypeName}: ${error.message}`);
        }
      }

      setProgress(100);

      // Actualiser les données
      await fetchAllData();

      setResults({
        deviceTypes: newDeviceTypes,
        brands: newBrands,
        models: newModels,
        errors
      });

      toast.success(
        `Import terminé: ${newDeviceTypes.length} types, ${newBrands.length} marques, ${newModels.length} modèles`
      );

    } catch (error) {
      console.error('Erreur import universel:', error);
      toast.error('Erreur lors de l\'import du catalogue');
    } finally {
      setImporting(false);
    }
  };

  // Fonctions helper pour les valeurs par défaut
  const getDefaultScreenSize = (deviceType: string): string => {
    if (deviceType.includes('Smartphone')) return '6.1';
    if (deviceType.includes('Tablette')) return '10.9';
    if (deviceType.includes('Ordinateur')) return '14.0';
    if (deviceType.includes('Montre')) return '1.9';
    return '6.0';
  };

  const getDefaultResolution = (deviceType: string): string => {
    if (deviceType.includes('Smartphone')) return '2556x1179';
    if (deviceType.includes('Tablette')) return '2360x1640';
    if (deviceType.includes('Ordinateur')) return '2560x1600';
    if (deviceType.includes('Montre')) return '396x484';
    return '1920x1080';
  };

  const getDefaultBattery = (deviceType: string): string => {
    if (deviceType.includes('Smartphone')) return '3200';
    if (deviceType.includes('Tablette')) return '8600';
    if (deviceType.includes('Ordinateur')) return '5200';
    if (deviceType.includes('Montre')) return '300';
    if (deviceType.includes('Écouteurs')) return '50';
    return '3000';
  };

  const getDefaultOS = (brand: string, deviceType: string): string => {
    if (brand === 'Apple') {
      if (deviceType.includes('Smartphone')) return 'iOS';
      if (deviceType.includes('Tablette')) return 'iPadOS';
      if (deviceType.includes('Ordinateur')) return 'macOS';
      if (deviceType.includes('Montre')) return 'watchOS';
    }
    if (deviceType.includes('Ordinateur')) return 'Windows 11';
    if (deviceType.includes('Montre')) return 'Wear OS';
    return 'Android';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Import Universel du Catalogue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Importez automatiquement un catalogue complet de produits : smartphones, tablettes, 
            ordinateurs, écouteurs et montres connectées avec leurs marques et modèles.
          </div>

          {/* Sélection des catégories */}
          <div>
            <h4 className="font-medium mb-3">Sélectionner les catégories à importer</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <IconComponent className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {category.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aperçu des données */}
          {filteredProducts.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Aperçu des données à importer</h4>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium flex items-center gap-2">
                        <product.icon className="h-4 w-4" />
                        {product.brand}
                      </div>
                      <div className="text-muted-foreground">{product.deviceType}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.models.length} modèles
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Total: {filteredProducts.reduce((sum, p) => sum + p.models.length, 0)} modèles à importer
              </div>
            </div>
          )}

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
            disabled={importing || filteredProducts.length === 0}
            className="w-full"
            size="lg"
          >
            {importing ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Importer le Catalogue ({filteredProducts.reduce((sum, p) => sum + p.models.length, 0)} modèles)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Résultats */}
      {(results.deviceTypes.length > 0 || results.brands.length > 0 || results.models.length > 0 || results.errors.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Résultats de l'Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Résumé</TabsTrigger>
                <TabsTrigger value="types">Types ({results.deviceTypes.length})</TabsTrigger>
                <TabsTrigger value="brands">Marques ({results.brands.length})</TabsTrigger>
                <TabsTrigger value="errors">Erreurs ({results.errors.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.deviceTypes.length}</div>
                    <div className="text-sm text-muted-foreground">Types créés</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.brands.length}</div>
                    <div className="text-sm text-muted-foreground">Marques créées</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{results.models.length}</div>
                    <div className="text-sm text-muted-foreground">Modèles créés</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{results.errors.length}</div>
                    <div className="text-sm text-muted-foreground">Erreurs</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="types">
                <div className="flex flex-wrap gap-2">
                  {results.deviceTypes.map((type) => (
                    <Badge key={type.id} variant="default">{type.name}</Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="brands">
                <div className="flex flex-wrap gap-2">
                  {results.brands.map((brand) => (
                    <Badge key={brand.id} variant="outline">{brand.name}</Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="errors">
                {results.errors.length > 0 ? (
                  <div className="space-y-2">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-xs text-destructive bg-destructive/10 p-2 rounded border-l-2 border-destructive">
                        {error}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    Aucune erreur ! 🎉
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};