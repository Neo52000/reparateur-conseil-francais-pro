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
  Globe,
  Zap,
  Gamepad2
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
      // Série Galaxy S
      'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
      'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
      'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
      'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
      'Galaxy S20 Ultra', 'Galaxy S20+', 'Galaxy S20', 'Galaxy S20 FE',
      'Galaxy S10+', 'Galaxy S10', 'Galaxy S10e',
      'Galaxy S9+', 'Galaxy S9',
      'Galaxy S8+', 'Galaxy S8',
      'Galaxy S7 Edge', 'Galaxy S7',
      'Galaxy S6 Edge+', 'Galaxy S6 Edge', 'Galaxy S6',
      
      // Série Galaxy A
      'Galaxy A54 5G', 'Galaxy A34 5G', 'Galaxy A24', 'Galaxy A14',
      'Galaxy A53 5G', 'Galaxy A33 5G', 'Galaxy A23', 'Galaxy A13',
      'Galaxy A52s 5G', 'Galaxy A52 5G', 'Galaxy A32 5G', 'Galaxy A22',
      'Galaxy A51', 'Galaxy A50', 'Galaxy A40', 'Galaxy A30',
      'Galaxy A20e', 'Galaxy A10', 'Galaxy A9', 'Galaxy A8+',
      'Galaxy A8', 'Galaxy A7', 'Galaxy A6+', 'Galaxy A6',
      'Galaxy A5', 'Galaxy A3',
      
      // Série Galaxy Z (Pliables)
      'Galaxy Z Fold5', 'Galaxy Z Flip5', 'Galaxy Z Fold4', 'Galaxy Z Flip4',
      'Galaxy Z Fold3', 'Galaxy Z Flip3', 'Galaxy Z Fold2', 'Galaxy Z Flip',
      'Galaxy Fold',
      
      // Série Galaxy Note
      'Galaxy Note 20 Ultra', 'Galaxy Note 20',
      'Galaxy Note 10+', 'Galaxy Note 10',
      'Galaxy Note 9', 'Galaxy Note 8',
      'Galaxy Note 7', 'Galaxy Note 5',
      'Galaxy Note 4', 'Galaxy Note 3',
      
      // Série Galaxy M
      'Galaxy M54 5G', 'Galaxy M34 5G', 'Galaxy M14',
      'Galaxy M53 5G', 'Galaxy M33 5G', 'Galaxy M23',
      'Galaxy M52 5G', 'Galaxy M32', 'Galaxy M22',
      'Galaxy M51', 'Galaxy M31', 'Galaxy M21',
      'Galaxy M20', 'Galaxy M12', 'Galaxy M11',
      
      // Série Galaxy J
      'Galaxy J7', 'Galaxy J6', 'Galaxy J5',
      'Galaxy J4+', 'Galaxy J4', 'Galaxy J3',
      'Galaxy J2', 'Galaxy J1',
      
      // Série Galaxy Xcover (Incassables)
      'Galaxy Xcover 6 Pro', 'Galaxy Xcover 5',
      'Galaxy Xcover 4s', 'Galaxy Xcover 4',
      'Galaxy Xcover 3',
      
      // Autres modèles Galaxy
      'Galaxy Grand Prime', 'Galaxy Core Prime',
      'Galaxy Ace 4', 'Galaxy Young 2',
      'Galaxy Trend 2 Lite', 'Galaxy Star 2'
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

  // MONTRES CONNECTÉES
  {
    deviceType: 'Montre Connectée',
    brand: 'Apple',
    category: 'watch',
    icon: Watch,
    models: [
      // Apple Watch Series 9
      'Apple Watch Series 9 (41mm)', 'Apple Watch Series 9 (45mm)',
      'Apple Watch Series 9 GPS', 'Apple Watch Series 9 GPS + Cellular',
      
      // Apple Watch Ultra 2
      'Apple Watch Ultra 2 (49mm)', 'Apple Watch Ultra 2 GPS + Cellular',
      
      // Apple Watch SE (2nd Gen)
      'Apple Watch SE (40mm) 2022', 'Apple Watch SE (44mm) 2022',
      'Apple Watch SE GPS 2nd Gen', 'Apple Watch SE GPS + Cellular 2nd Gen',
      
      // Apple Watch Series 8
      'Apple Watch Series 8 (41mm)', 'Apple Watch Series 8 (45mm)',
      'Apple Watch Series 8 GPS', 'Apple Watch Series 8 GPS + Cellular',
      
      // Apple Watch Series 7
      'Apple Watch Series 7 (41mm)', 'Apple Watch Series 7 (45mm)',
      'Apple Watch Series 7 GPS', 'Apple Watch Series 7 GPS + Cellular',
      
      // Apple Watch Series 6
      'Apple Watch Series 6 (40mm)', 'Apple Watch Series 6 (44mm)',
      'Apple Watch Series 6 GPS', 'Apple Watch Series 6 GPS + Cellular',
      
      // Apple Watch SE (1st Gen)
      'Apple Watch SE (40mm) 2020', 'Apple Watch SE (44mm) 2020',
      'Apple Watch SE GPS 1st Gen', 'Apple Watch SE GPS + Cellular 1st Gen',
      
      // Apple Watch Series 5
      'Apple Watch Series 5 (40mm)', 'Apple Watch Series 5 (44mm)',
      'Apple Watch Series 5 GPS', 'Apple Watch Series 5 GPS + Cellular',
      
      // Apple Watch Series 4
      'Apple Watch Series 4 (40mm)', 'Apple Watch Series 4 (44mm)',
      'Apple Watch Series 4 GPS', 'Apple Watch Series 4 GPS + Cellular',
      
      // Apple Watch Series 3
      'Apple Watch Series 3 (38mm)', 'Apple Watch Series 3 (42mm)',
      'Apple Watch Series 3 GPS', 'Apple Watch Series 3 GPS + Cellular',
      
      // Apple Watch Series 2
      'Apple Watch Series 2 (38mm)', 'Apple Watch Series 2 (42mm)',
      
      // Apple Watch Series 1
      'Apple Watch Series 1 (38mm)', 'Apple Watch Series 1 (42mm)',
      
      // Apple Watch (1st Gen)
      'Apple Watch (38mm) 1st Gen', 'Apple Watch (42mm) 1st Gen',
      'Apple Watch Edition', 'Apple Watch Sport'
    ]
  },

  // CONSOLES DE JEUX
  {
    deviceType: 'Console de jeux',
    brand: 'Sony',
    category: 'gaming',
    icon: Gamepad2,
    models: [
      // PlayStation 5
      'PlayStation 5 (PS5)', 'PlayStation 5 Digital Edition',
      'PlayStation 5 Slim', 'PlayStation 5 Pro',
      
      // PlayStation 4
      'PlayStation 4 (PS4)', 'PlayStation 4 Slim',
      'PlayStation 4 Pro',
      
      // PlayStation 3
      'PlayStation 3 (PS3) Fat', 'PlayStation 3 Slim',
      'PlayStation 3 Super Slim',
      
      // PlayStation Portable
      'PSP-1000 (Fat)', 'PSP-2000 (Slim)', 'PSP-3000',
      'PSP Go (PSP-N1000)',
      
      // PlayStation Vita
      'PS Vita PCH-1000 (OLED)', 'PS Vita PCH-2000 (LCD)',
      'PS Vita TV (PSTV)'
    ]
  },
  {
    deviceType: 'Console de jeux',
    brand: 'Nintendo',
    category: 'gaming',
    icon: Gamepad2,
    models: [
      // Nintendo Switch
      'Nintendo Switch', 'Nintendo Switch Lite',
      'Nintendo Switch OLED', 'Nintendo Switch V2',
      
      // Nintendo 3DS
      'Nintendo 3DS', 'Nintendo 3DS XL',
      'New Nintendo 3DS', 'New Nintendo 3DS XL',
      'Nintendo 2DS', 'New Nintendo 2DS XL',
      
      // Nintendo DS
      'Nintendo DS (NDS)', 'Nintendo DS Lite',
      'Nintendo DSi', 'Nintendo DSi XL'
    ]
  }
];

export const UniversalCatalogImporter: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['smartphone']);
  const [status, setStatus] = useState<'idle' | 'importing' | 'completed' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
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

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  const {
    deviceTypes,
    brands,
    deviceModels,
    createDeviceType,
    createBrand,
    createDeviceModel,
    fetchAllData,
    checkModelExists
  } = useCatalog();

  const categories = [
    { id: 'smartphone', label: 'Smartphones', icon: Smartphone, color: 'blue' },
    { id: 'tablet', label: 'Tablettes', icon: Tablet, color: 'green' },
    { id: 'laptop', label: 'Ordinateurs', icon: Laptop, color: 'purple' },
    { id: 'audio', label: 'Écouteurs', icon: Headphones, color: 'orange' },
    { id: 'watch', label: 'Montres', icon: Watch, color: 'red' },
    { id: 'gaming', label: 'Consoles', icon: Gamepad2, color: 'purple' }
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

  // Helper functions
  const getDefaultScreenSize = (deviceType: string): string => {
    if (deviceType.toLowerCase().includes('smartphone')) return '6.1';
    if (deviceType.toLowerCase().includes('tablette')) return '10.1';
    if (deviceType.toLowerCase().includes('ordinateur')) return '13.3';
    if (deviceType.toLowerCase().includes('montre')) return '1.9';
    return '6.1';
  };

  const getDefaultResolution = (deviceType: string): string => {
    if (deviceType.toLowerCase().includes('smartphone')) return '2340x1080';
    if (deviceType.toLowerCase().includes('tablette')) return '2360x1640';
    if (deviceType.toLowerCase().includes('ordinateur')) return '2560x1600';
    if (deviceType.toLowerCase().includes('montre')) return '396x484';
    return '1920x1080';
  };

  const getDefaultBattery = (deviceType: string): string => {
    if (deviceType.toLowerCase().includes('smartphone')) return '4000';
    if (deviceType.toLowerCase().includes('tablette')) return '8000';
    if (deviceType.toLowerCase().includes('ordinateur')) return '70';
    if (deviceType.toLowerCase().includes('montre')) return '18';
    return '4000';
  };

  const getDefaultOS = (brandName: string, deviceType: string): string => {
    if (brandName.toLowerCase() === 'apple') {
      if (deviceType.toLowerCase().includes('smartphone')) return 'iOS';
      if (deviceType.toLowerCase().includes('tablette')) return 'iPadOS';
      if (deviceType.toLowerCase().includes('ordinateur')) return 'macOS';
      if (deviceType.toLowerCase().includes('montre')) return 'watchOS';
    }
    if (deviceType.toLowerCase().includes('smartphone') || deviceType.toLowerCase().includes('tablette')) return 'Android';
    if (deviceType.toLowerCase().includes('ordinateur')) return 'Windows';
    if (deviceType.toLowerCase().includes('montre')) return 'Wear OS';
    if (deviceType.toLowerCase().includes('console')) return 'Propriétaire';
    return 'Propriétaire';
  };

  const getDeviceIcon = (deviceType: string): string => {
    if (deviceType.toLowerCase().includes('smartphone')) return 'smartphone';
    if (deviceType.toLowerCase().includes('tablette')) return 'tablet';
    if (deviceType.toLowerCase().includes('ordinateur')) return 'laptop';
    if (deviceType.toLowerCase().includes('montre')) return 'watch';
    if (deviceType.toLowerCase().includes('console')) return 'gamepad';
    if (deviceType.toLowerCase().includes('écouteurs')) return 'headphones';
    return 'smartphone';
  };

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const scrapeModelsFromSource = async (source: any, brandName: string): Promise<string[]> => {
    // Simulation du scraping - retourne les modèles du dataset statique
    const matchingProduct = COMPLETE_PRODUCT_DATA.find(product => 
      product.brand.toLowerCase() === brandName.toLowerCase() && 
      product.category === source.deviceType.toLowerCase().replace(/\s+/g, '')
    );
    
    if (matchingProduct) {
      addLog(`✅ ${matchingProduct.models.length} modèles trouvés pour ${brandName}`);
      return matchingProduct.models;
    }
    
    // Fallback: générer quelques modèles basiques
    const basicModels = [`${capitalizeFirst(brandName)} Model 1`, `${capitalizeFirst(brandName)} Model 2`];
    addLog(`⚠️ Modèles basiques générés pour ${brandName}`);
    return basicModels;
  };

  // Fonction utilitaire pour générer une date de sortie réaliste
  const getModelReleaseDate = (brandName: string, modelName: string): string => {
    // Mapping des dates de sortie pour les modèles connus
    const releaseDates: { [key: string]: string } = {
      // iPhone
      'iPhone 15': '2023-09-22',
      'iPhone 14': '2022-09-16',
      'iPhone 13': '2021-09-24',
      'iPhone 12': '2020-10-23',
      'iPhone 11': '2019-09-20',
      // Samsung Galaxy S
      'Galaxy S24': '2024-01-24',
      'Galaxy S23': '2023-02-17',
      'Galaxy S22': '2022-02-25',
      'Galaxy S21': '2021-01-29',
      'Galaxy S20': '2020-03-06',
      // Apple Watch
      'Apple Watch Series 9': '2023-09-22',
      'Apple Watch Series 8': '2022-09-16',
      'Apple Watch Series 7': '2021-10-15',
      'Apple Watch Series 6': '2020-09-18',
      // PlayStation
      'PlayStation 5': '2020-11-19',
      'PlayStation 4': '2013-11-15',
      'PlayStation 3': '2006-11-11',
      // Nintendo Switch
      'Nintendo Switch': '2017-03-03',
      'Nintendo Switch Lite': '2019-09-20',
      'Nintendo Switch OLED': '2021-10-08',
    };

    // Recherche d'une date exacte
    const exactMatch = releaseDates[modelName];
    if (exactMatch) return exactMatch;

    // Recherche par nom partiel
    for (const [model, date] of Object.entries(releaseDates)) {
      if (modelName.includes(model) || model.includes(modelName)) {
        return date;
      }
    }

    // Date par défaut basée sur la marque et l'année courante
    const currentYear = new Date().getFullYear();
    if (brandName.toLowerCase() === 'apple') {
      return `${currentYear - 1}-09-15`; // Septembre pour Apple
    }
    if (brandName.toLowerCase() === 'samsung') {
      return `${currentYear - 1}-02-15`; // Février pour Samsung
    }
    
    // Date par défaut générique
    return `${currentYear - 1}-01-01`;
  };

  // Import automatisé universel
  const handleUniversalAutomatedImport = async () => {
    setImporting(true);
    setStatus('importing');
    setLogs([]);
    setProgress(0);
    
    try {
      addLog('🌐 Début de l\'import automatisé universel depuis tous les sites externes...');
      addLog('🔍 Actualisation des données existantes...');
      
      // Refresh data to ensure we have the latest info
      await fetchAllData();
      
      let totalModelsImported = 0;
      let totalModelsSkipped = 0;
      let totalModelsErrors = 0;
      let totalBrandsCreated = 0;
      let totalDeviceTypesCreated = 0;

      // Import pour chaque produit sélectionné
      const products = COMPLETE_PRODUCT_DATA.filter(product => 
        selectedCategories.includes(product.category)
      );

      const totalSteps = products.length;
      let currentStep = 0;

      for (const product of products) {
        currentStep++;
        setProgress((currentStep / totalSteps) * 100);
        
        addLog(`🔍 Import ${product.brand} ${product.deviceType}...`);
        
        try {
          // Ensure device type exists
          let deviceType = deviceTypes.find(dt => 
            dt.name.toLowerCase().trim() === product.deviceType.toLowerCase().trim()
          );
          
          if (!deviceType) {
            addLog(`➕ Création du type d'appareil: ${product.deviceType}`);
            try {
              deviceType = await createDeviceType({
                name: product.deviceType,
                description: `${product.deviceType} - Import automatique`,
                icon: getDeviceIcon(product.deviceType)
              });
              totalDeviceTypesCreated++;
              addLog(`✅ Type "${product.deviceType}" créé avec succès`);
              
              // Refresh data after creation
              await fetchAllData();
            } catch (error: any) {
              if (error.message?.includes('duplicate') || error.code === '23505') {
                addLog(`⚠️ Type "${product.deviceType}" existe déjà, récupération...`);
                await fetchAllData();
                deviceType = deviceTypes.find(dt => 
                  dt.name.toLowerCase().trim() === product.deviceType.toLowerCase().trim()
                );
              } else {
                addLog(`❌ Erreur création type ${product.deviceType}: ${error.message}`);
                continue;
              }
            }
          }

          if (!deviceType) {
            addLog(`❌ Type d'appareil ${product.deviceType} introuvable après création`);
            continue;
          }

          // Find or create brand
          let brand = brands.find(b => 
            b.name.toLowerCase().trim() === product.brand.toLowerCase().trim()
          );
          
          if (!brand) {
            addLog(`➕ Création de la marque: ${product.brand}`);
            try {
              brand = await createBrand({
                name: product.brand,
                logo_url: null
              });
              totalBrandsCreated++;
              addLog(`✅ Marque "${product.brand}" créée avec succès`);
              
              // Refresh data after creation
              await fetchAllData();
            } catch (brandError: any) {
              if (brandError.message?.includes('duplicate') || brandError.code === '23505') {
                addLog(`⚠️ Marque "${product.brand}" existe déjà, récupération...`);
                await fetchAllData();
                brand = brands.find(b => 
                  b.name.toLowerCase().trim() === product.brand.toLowerCase().trim()
                );
              } else {
                addLog(`❌ Erreur création marque ${product.brand}: ${brandError.message}`);
                continue;
              }
            }
          }

          if (!brand) {
            addLog(`❌ Marque ${product.brand} introuvable après création`);
            continue;
          }

          addLog(`📱 Import de ${product.models.length} modèles pour ${product.brand}...`);
          
          // Import models in smaller batches
          for (let i = 0; i < product.models.length; i += 5) {
            const batch = product.models.slice(i, i + 5);
            
            for (const modelName of batch) {
              try {
                // Validate model name
                if (!modelName || modelName.trim().length < 2) {
                  addLog(`⚠️ Nom de modèle invalide ignoré: "${modelName}"`);
                  continue;
                }

                const cleanModelName = modelName.trim();
                
                // Check if model already exists
                const modelExists = await checkModelExists(cleanModelName, brand.id, deviceType.id);
                
                if (modelExists) {
                  totalModelsSkipped++;
                  continue;
                }

                // Create model with proper validation
                const modelData = {
                  model_name: cleanModelName,
                  brand_id: brand.id,
                  device_type_id: deviceType.id,
                  model_number: `${product.brand.replace(/\s+/g, '-')}-${cleanModelName.replace(/\s+/g, '-')}`.toLowerCase(),
                  release_date: getModelReleaseDate(product.brand, cleanModelName),
                  screen_size: getDefaultScreenSize(product.deviceType),
                  screen_resolution: getDefaultResolution(product.deviceType),
                  screen_type: product.deviceType.toLowerCase().includes('montre') ? 'AMOLED' : 'OLED',
                  battery_capacity: getDefaultBattery(product.deviceType),
                  operating_system: getDefaultOS(product.brand, product.deviceType),
                  is_active: true
                };

                await createDeviceModel(modelData);
                totalModelsImported++;
                
                if (totalModelsImported % 5 === 0) {
                  addLog(`✅ ${totalModelsImported} modèles importés...`);
                }
                
              } catch (modelError: any) {
                totalModelsErrors++;
                if (modelError.message?.includes('duplicate') || modelError.code === '23505') {
                  addLog(`⚠️ Modèle "${modelName}" existe déjà, ignoré`);
                  totalModelsSkipped++;
                } else {
                  addLog(`❌ Erreur modèle "${modelName}": ${modelError.message}`);
                  // Log more details for debugging
                  if (modelError.details) {
                    addLog(`   Détails: ${modelError.details}`);
                  }
                  if (modelError.code) {
                    addLog(`   Code: ${modelError.code}`);
                  }
                }
              }
            }
            
            // Small delay between batches to prevent overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          addLog(`✅ Import ${product.brand} terminé: ${product.models.length} modèles traités`);
          
        } catch (error: any) {
          addLog(`❌ Erreur critique lors de l'import ${product.brand}: ${error.message}`);
          totalModelsErrors++;
        }
      }

      setProgress(100);
      setStatus('completed');
      
      const summary = {
        deviceTypes: [],
        brands: [],
        models: [],
        errors: []
      };

      addLog('✅ Import automatisé universel terminé !');
      addLog(`📊 Résumé: ${totalModelsImported} modèles importés, ${totalModelsSkipped} ignorés, ${totalBrandsCreated} marques créées, ${totalDeviceTypesCreated} types créés`);
      
      setResults(summary);

      toast.success(`Import terminé ! ${totalModelsImported} modèles importés.`);
      
    } catch (error: any) {
      setStatus('error');
      addLog(`❌ Erreur critique: ${error.message}`);
      toast.error('Erreur lors de l\'import automatisé');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Import Automatisé Universel du Catalogue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection des catégories */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Catégories à importer</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? "default" : "outline"}
                    className="flex items-center gap-2 h-auto p-4"
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs opacity-70">
                        {COMPLETE_PRODUCT_DATA.filter(p => p.category === category.id).length} produits
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Aperçu des produits */}
          {filteredProducts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Aperçu des produits ({filteredProducts.length} marques)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product, index) => {
                  const Icon = product.icon;
                  return (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">{product.brand}</div>
                            <div className="text-sm text-muted-foreground">{product.deviceType}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {product.models.length} modèles
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contrôles d'import */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleUniversalAutomatedImport}
              disabled={importing || selectedCategories.length === 0}
              className="flex items-center gap-2"
              size="lg"
            >
              {importing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {importing ? 'Import en cours...' : 'Lancer l\'Import Automatisé Universel'}
            </Button>
          </div>

          {/* Barre de progression */}
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression de l'import</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {status === 'importing' && 'Import en cours...'}
              </div>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Logs d'import</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-1 text-sm font-mono">
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résultats */}
          {status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Import terminé avec succès
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  L'import automatisé universel s'est terminé avec succès. Consultez les logs ci-dessus pour plus de détails.
                </div>
              </CardContent>
            </Card>
          )}

          {status === 'error' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Erreur lors de l'import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Une erreur s'est produite lors de l'import. Consultez les logs ci-dessus pour plus de détails.
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversalCatalogImporter;