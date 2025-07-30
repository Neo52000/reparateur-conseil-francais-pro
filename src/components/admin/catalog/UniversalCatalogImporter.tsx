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
      console.log('🚀 Début de l\'importation');
      
      let newDeviceTypes: any[] = [];
      let newBrands: any[] = [];
      let newModels: any[] = [];
      let skippedModels = 0;
      let errors: string[] = [];

      // Actualiser les données avant de commencer
      await fetchAllData();
      console.log('📦 Données actuelles:', { 
        deviceTypes: deviceTypes.length, 
        brands: brands.length 
      });

      const totalItems = filteredProducts.reduce((sum, product) => sum + product.models.length, 0);
      console.log(`📊 Total de modèles à traiter: ${totalItems}`);
      
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
        console.log(`🔧 Traitement du type: ${deviceTypeName}`);
        
        try {
          let deviceType = deviceTypes.find(dt => 
            dt.name.toLowerCase().trim() === deviceTypeName.toLowerCase().trim()
          );

          if (!deviceType) {
            console.log(`➕ Création du type: ${deviceTypeName}`);
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
              console.log(`✅ Type créé: ${deviceTypeName}`);
            } catch (typeError: any) {
              console.log(`⚠️ Erreur création type ${deviceTypeName}:`, typeError);
              if (typeError.message?.includes('duplicate') || typeError.message?.includes('already exists') || typeError.code === '23505') {
                await fetchAllData();
                deviceType = deviceTypes.find(dt => dt.name.toLowerCase().trim() === deviceTypeName.toLowerCase().trim());
                if (!deviceType) {
                  errors.push(`Type ${deviceTypeName} non trouvé après erreur de duplicate`);
                  continue;
                }
                console.log(`♻️ Type existant récupéré: ${deviceTypeName}`);
              } else {
                errors.push(`Erreur critique type ${deviceTypeName}: ${typeError.message}`);
                continue;
              }
            }
          } else {
            console.log(`✓ Type existant: ${deviceTypeName}`);
          }

          setProgress(10);

          // 2. Traiter chaque marque pour ce type d'appareil
          for (const [brandName, models] of Object.entries(groupedData[deviceTypeName])) {
            console.log(`🏷️ Traitement marque: ${brandName} (${models.length} modèles)`);
            
            try {
              // Normaliser le nom de la marque pour éviter les duplicatas
              const normalizedBrandName = brandName.trim();
              
              // Chercher la marque existante (insensible à la casse)
              let brand = brands.find(b => 
                b.name.toLowerCase().trim() === normalizedBrandName.toLowerCase()
              );

              if (!brand) {
                console.log(`➕ Création marque: ${normalizedBrandName}`);
                try {
                  brand = await createBrand({
                    name: normalizedBrandName,
                    logo_url: null
                  });
                  newBrands.push(brand);
                  console.log(`✅ Marque créée: ${normalizedBrandName}`);
                } catch (brandError: any) {
                  console.log(`⚠️ Erreur création marque ${normalizedBrandName}:`, brandError);
                  if (brandError.message?.includes('duplicate') || brandError.message?.includes('already exists') || brandError.code === '23505') {
                    await fetchAllData();
                    brand = brands.find(b => b.name.toLowerCase().trim() === normalizedBrandName.toLowerCase());
                    if (!brand) {
                      errors.push(`Marque ${normalizedBrandName} non trouvée après erreur de duplicate`);
                      continue;
                    }
                    console.log(`♻️ Marque existante récupérée: ${normalizedBrandName}`);
                  } else {
                    errors.push(`Erreur critique marque ${normalizedBrandName}: ${brandError.message}`);
                    continue;
                  }
                }
              } else {
                console.log(`✓ Marque existante: ${normalizedBrandName}`);
              }

              // 3. Créer les modèles
              for (const modelName of models) {
                const normalizedModelName = modelName.trim();
                console.log(`📱 Traitement modèle: ${normalizedModelName}`);
                
                // Vérifier AVANT de créer si le modèle existe déjà
                if (checkModelExists(normalizedModelName, brand.id, deviceType.id)) {
                  processedItems++;
                  skippedModels++;
                  console.log(`⚠️ Modèle déjà existant: ${normalizedModelName} (ignoré)`);
                  
                  const modelProgress = 10 + (processedItems / totalItems) * 85;
                  setProgress(modelProgress);
                  continue;
                }
                
                try {
                  const deviceModel = await createDeviceModel({
                    device_type_id: deviceType.id,
                    brand_id: brand.id,
                    model_name: normalizedModelName,
                    model_number: normalizedModelName,
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
                  console.log(`✅ Modèle créé: ${normalizedModelName} (${processedItems}/${totalItems})`);

                  const modelProgress = 10 + (processedItems / totalItems) * 85;
                  setProgress(modelProgress);

                  if (newModels.length % 5 === 0) {
                    toast.success(`${newModels.length} nouveaux modèles créés`);
                  }

                } catch (error: any) {
                  processedItems++;
                  const modelProgress = 10 + (processedItems / totalItems) * 85;
                  setProgress(modelProgress);
                  
                  if (error.message?.includes('duplicate') || error.message?.includes('already exists') || error.code === '23505') {
                    skippedModels++;
                    console.log(`⚠️ Modèle déjà existant (erreur DB): ${normalizedModelName} (ignoré)`);
                  } else {
                    console.error(`❌ Erreur réelle modèle ${normalizedModelName}:`, error);
                    errors.push(`Erreur modèle ${normalizedModelName}: ${error.message}`);
                  }
                }
              }

            } catch (error: any) {
              console.error(`❌ Erreur marque ${brandName}:`, error);
              errors.push(`Erreur marque ${brandName}: ${error.message}`);
            }
          }

        } catch (error: any) {
          console.error(`❌ Erreur type ${deviceTypeName}:`, error);
          errors.push(`Erreur type ${deviceTypeName}: ${error.message}`);
        }
      }

      setProgress(100);
      
      console.log('📋 Résumé final de l\'importation:');
      console.log(`  - Nouveaux types créés: ${newDeviceTypes.length}`);
      console.log(`  - Nouvelles marques créées: ${newBrands.length}`);
      console.log(`  - Nouveaux modèles créés: ${newModels.length}`);
      console.log(`  - Modèles déjà existants (ignorés): ${skippedModels}`);
      console.log(`  - Erreurs rencontrées: ${errors.length}`);

      // Actualiser les données
      await fetchAllData();

      setResults({
        deviceTypes: newDeviceTypes,
        brands: newBrands,
        models: newModels,
        errors
      });

      // Message de fin plus détaillé
      const successMessage = `Import terminé ! ✅ ${newModels.length} nouveaux modèles créés`;
      const skippedMessage = skippedModels > 0 ? ` (${skippedModels} déjà existants ignorés)` : '';
      const errorMessage = errors.length > 0 ? ` ⚠️ ${errors.length} erreurs` : '';
      
      toast.success(successMessage + skippedMessage + errorMessage);

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

  const handleMobilaxImport = async () => {
    setStatus('importing');
    setLogs([]);
    
    try {
      // Extract brand names from Mobilax
      const mobilaxBrands = [
        'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Honor', 'OPPO', 'Realme',
        'OnePlus', 'Motorola', 'Google', 'Vivo', 'Crosscall', 'Blackview',
        'TCL', 'Nokia', 'Alcatel', 'Sony', 'HTC', 'Wiko', 'LG', 'Asus',
        'BlackBerry', 'Nothing', 'Caterpillar', 'HMD'
      ];
      
      addLog(`🔍 Début de l'import Mobilax - ${mobilaxBrands.length} marques détectées`);
      
      let imported = 0;
      let skipped = 0;
      let errors = 0;
      
      for (const brandName of mobilaxBrands) {
        try {
          // Check if brand exists (case insensitive)
          const existingBrand = brands.find(b => 
            b.name.toLowerCase() === brandName.toLowerCase()
          );
          
          if (existingBrand) {
            addLog(`⚠️ Marque "${brandName}" déjà existante - ignorée`);
            skipped++;
            continue;
          }
          
          // Create new brand
          await createBrand({
            name: brandName,
            logo_url: null
          });
          
          addLog(`✅ Marque "${brandName}" créée avec succès`);
          imported++;
          
        } catch (error: any) {
          if (error.message?.includes('duplicate') || error.code === '23505') {
            addLog(`⚠️ Marque "${brandName}" déjà existante (BD) - ignorée`);
            skipped++;
          } else {
            addLog(`❌ Erreur lors de la création de "${brandName}": ${error.message}`);
            errors++;
          }
        }
      }
      
      addLog(`🎉 Import terminé: ${imported} créées, ${skipped} ignorées, ${errors} erreurs`);
      setStatus(errors > 0 ? 'error' : 'completed');
      
      if (imported > 0) {
        toast.success(`${imported} nouvelles marques Mobilax importées !`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erreur globale: ${error.message}`);
      setStatus('error');
      toast.error('Erreur lors de l\'import Mobilax');
    }
  };

  const handleMobilaxTabletModelsImport = async () => {
    setStatus('importing');
    setLogs([]);
    
    try {
      // Find Tablette device type
      const tabletteType = deviceTypes.find(dt => dt.name.toLowerCase() === 'tablette');
      if (!tabletteType) {
        addLog('❌ Type d\'appareil "Tablette" introuvable. Créez-le d\'abord.');
        setStatus('error');
        return;
      }

      // Extract tablet models from Mobilax
      const mobilaxTabletModels = [
        // Apple iPad models
        { brand: 'Apple', name: 'iPad 2', storage: ['16GB', '32GB', '64GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Apple', name: 'iPad 3', storage: ['16GB', '32GB', '64GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Apple', name: 'iPad 4', storage: ['16GB', '32GB', '64GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Apple', name: 'iPad Air', storage: ['16GB', '32GB', '64GB', '128GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Apple', name: 'iPad Air 2', storage: ['16GB', '32GB', '64GB', '128GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Apple', name: 'iPad Air 11 M2', storage: ['128GB', '256GB', '512GB', '1TB'], colors: ['Noir'] },
        { brand: 'Apple', name: 'iPad Air 13 M2', storage: ['128GB', '256GB', '512GB', '1TB'], colors: ['Noir'] },
        { brand: 'Apple', name: 'iPad Mini 4', storage: ['16GB', '32GB', '64GB', '128GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Apple', name: 'iPad Mini 6', storage: ['64GB', '256GB'], colors: ['Noir'] },
        { brand: 'Apple', name: 'iPad Pro 9.7', storage: ['32GB', '128GB', '256GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Apple', name: 'iPad Pro 12.9', storage: ['32GB', '128GB', '256GB'], colors: ['Noir'] },
        
        // Asus models
        { brand: 'Asus', name: 'Fonepad 7 FE171', storage: ['8GB', '16GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Asus', name: 'MeMo Pad 10 ME103', storage: ['16GB'], colors: ['Noir'] },
        { brand: 'Asus', name: 'ZenPad 10 Z300C', storage: ['16GB', '32GB'], colors: ['Noir'] },
        { brand: 'Asus', name: 'ZenPad 10 Z300M', storage: ['16GB', '32GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Asus', name: 'ZenPad 10 Z301', storage: ['16GB', '32GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Asus', name: 'ZenPad 7.0 Z370C', storage: ['8GB', '16GB'], colors: ['Blanc'] },
        { brand: 'Asus', name: 'ZenPad 8.0 Z380M', storage: ['16GB'], colors: ['Blanc'] },
        
        // Huawei models
        { brand: 'Huawei', name: 'MatePad', storage: ['64GB', '128GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Huawei', name: 'MatePad Pro 10.8', storage: ['128GB', '256GB', '512GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Huawei', name: 'MatePad T8', storage: ['32GB'], colors: ['Noir'] },
        { brand: 'Huawei', name: 'MatePad 10.4', storage: ['64GB', '128GB'], colors: ['Noir'] },
        { brand: 'Huawei', name: 'MatePad 11', storage: ['128GB', '256GB'], colors: ['Noir'] },
        { brand: 'Huawei', name: 'MediaPad M5 Lite 8', storage: ['32GB', '64GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Huawei', name: 'MediaPad M6 10.8', storage: ['64GB', '128GB'], colors: ['Blanc', 'Noir'] },
        { brand: 'Huawei', name: 'MediaPad T3 10', storage: ['16GB', '32GB'], colors: ['Blanc'] },
        { brand: 'Huawei', name: 'MediaPad T3 8', storage: ['16GB', '32GB'], colors: ['Blanc', 'Noir'] },
        
        // Honor models
        { brand: 'Honor', name: 'Pad 8', storage: ['128GB'], colors: ['Noir'] },
        { brand: 'Honor', name: 'Pad X8a', storage: ['128GB'], colors: ['Noir'] },
        
        // Other brands
        { brand: 'Blackview', name: 'Tab 11', storage: ['128GB'], colors: ['Noir'] },
        { brand: 'Crosscall', name: 'Core-T4', storage: ['64GB'], colors: ['Noir'] },
        { brand: 'Microsoft', name: 'Surface Go', storage: ['64GB', '128GB'], colors: ['Noir'] },
        { brand: 'Nokia', name: 'T10', storage: ['32GB', '64GB'], colors: ['Noir'] },
        { brand: 'Nokia', name: 'T20', storage: ['64GB'], colors: ['Noir'] },
        
        // Lenovo models (ajoutés depuis les données scrapées)
        { brand: 'Lenovo', name: 'Tab M10 FHD Plus', storage: ['64GB', '128GB'], colors: ['Noir'] },
        { brand: 'Lenovo', name: 'Tab M10 HD Gen 2', storage: ['32GB', '64GB'], colors: ['Noir'] },
        { brand: 'Lenovo', name: 'Tab M11', storage: ['128GB'], colors: ['Noir'] },
        { brand: 'Lenovo', name: 'Tab P11 Gen 2', storage: ['128GB', '256GB'], colors: ['Noir'] },
        { brand: 'Lenovo', name: 'Tab P11 Plus', storage: ['128GB', '256GB'], colors: ['Noir'] },
        { brand: 'Lenovo', name: 'Tab P11 Pro Gen 2', storage: ['256GB'], colors: ['Noir'] }
      ];
      
      addLog(`🔍 Début de l'import modèles Mobilax Tablettes - ${mobilaxTabletModels.length} modèles détectés`);
      
      let modelsImported = 0;
      let modelsSkipped = 0;
      let modelsErrors = 0;
      let brandsCreated = 0;
      
      for (const modelData of mobilaxTabletModels) {
        try {
          // Find or create brand
          let brand = brands.find(b => 
            b.name.toLowerCase() === modelData.brand.toLowerCase()
          );
          
          if (!brand) {
            try {
              brand = await createBrand({
                name: modelData.brand,
                logo_url: null
              });
              brandsCreated++;
              addLog(`✅ Marque "${modelData.brand}" créée`);
            } catch (brandError: any) {
              if (brandError.message?.includes('duplicate') || brandError.code === '23505') {
                // Brand was created by another process, try to find it again
                await fetchAllData();
                brand = brands.find(b => 
                  b.name.toLowerCase() === modelData.brand.toLowerCase()
                );
              } else {
                throw brandError;
              }
            }
          }
          
          if (!brand) {
            addLog(`❌ Impossible de créer/trouver la marque "${modelData.brand}"`);
            modelsErrors++;
            continue;
          }
          
          // Check if model exists
          const existingModel = await checkModelExists(modelData.name, brand.id, tabletteType.id);
          if (existingModel) {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant - ignoré`);
            modelsSkipped++;
            continue;
          }
          
          // Create new model
          await createDeviceModel({
            device_type_id: tabletteType.id,
            brand_id: brand.id,
            model_name: modelData.name,
            model_number: '',
            release_date: '2025-01-01',
            screen_size: '10.1',
            screen_resolution: '1920x1080',
            screen_type: 'LCD',
            battery_capacity: '5000',
            operating_system: 'Android',
            is_active: true
          });
          
          addLog(`✅ Modèle "${modelData.brand} ${modelData.name}" créé avec succès`);
          modelsImported++;
          
        } catch (error: any) {
          if (error.message?.includes('duplicate') || error.code === '23505') {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant (BD) - ignoré`);
            modelsSkipped++;
          } else {
            addLog(`❌ Erreur lors de la création de "${modelData.brand} ${modelData.name}": ${error.message}`);
            modelsErrors++;
          }
        }
      }
      
      addLog(`🎉 Import terminé: ${modelsImported} modèles créés, ${modelsSkipped} ignorés, ${modelsErrors} erreurs, ${brandsCreated} marques créées`);
      setStatus(modelsErrors > 0 ? 'error' : 'completed');
      
      if (modelsImported > 0) {
        toast.success(`${modelsImported} nouveaux modèles de tablettes Mobilax importés !`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erreur globale: ${error.message}`);
      setStatus('error');
      toast.error('Erreur lors de l\'import des modèles Mobilax tablettes');
    }
  };

  const handleMobilaxWatchModelsImport = async () => {
    setStatus('importing');
    setLogs([]);
    
    try {
      // Find Montre device type
      const montreType = deviceTypes.find(dt => dt.name.toLowerCase() === 'montre');
      if (!montreType) {
        addLog('❌ Type d\'appareil "Montre" introuvable. Créez-le d\'abord.');
        setStatus('error');
        return;
      }

      // Extract watch models from Mobilax
      const mobilaxWatchModels = [
        // Apple Watch models
        { brand: 'Apple', name: 'Watch Ultra', storage: ['32GB'], colors: ['Noir'], sizes: ['49mm'] },
        { brand: 'Apple', name: 'Watch Ultra 2', storage: ['64GB'], colors: ['Noir'], sizes: ['49mm'] },
        { brand: 'Apple', name: 'Watch SE (1e génération)', storage: ['32GB'], colors: ['Noir'], sizes: ['40mm', '44mm'] },
        { brand: 'Apple', name: 'Watch SE (2e génération)', storage: ['32GB'], colors: ['Noir'], sizes: ['40mm', '44mm'] },
        { brand: 'Apple', name: 'Watch Series 1', storage: ['8GB'], colors: ['Noir'], sizes: ['38mm', '42mm'] },
        { brand: 'Apple', name: 'Watch Series 2', storage: ['8GB'], colors: ['Noir'], sizes: ['38mm', '42mm'] },
        { brand: 'Apple', name: 'Watch Series 3', storage: ['16GB'], colors: ['Noir'], sizes: ['38mm', '42mm'] },
        { brand: 'Apple', name: 'Watch Series 4', storage: ['16GB'], colors: ['Noir'], sizes: ['40mm', '44mm'] },
        { brand: 'Apple', name: 'Watch Series 5', storage: ['32GB'], colors: ['Noir'], sizes: ['40mm', '44mm'] },
        { brand: 'Apple', name: 'Watch Series 6', storage: ['32GB'], colors: ['Noir'], sizes: ['40mm', '44mm'] },
        { brand: 'Apple', name: 'Watch Series 7', storage: ['32GB'], colors: ['Noir'], sizes: ['41mm', '45mm'] },
        { brand: 'Apple', name: 'Watch Series 8', storage: ['32GB'], colors: ['Noir'], sizes: ['41mm', '45mm'] },
        { brand: 'Apple', name: 'Watch Series 9', storage: ['64GB'], colors: ['Noir'], sizes: ['41mm', '45mm'] },
        { brand: 'Apple', name: 'Watch Series 10', storage: ['64GB'], colors: ['Noir'], sizes: ['42mm', '46mm'] },
        
        // Samsung Galaxy Watch models
        { brand: 'Samsung', name: 'Galaxy Watch 5', storage: ['16GB'], colors: ['Noir'], sizes: ['40mm', '44mm'] },
        { brand: 'Samsung', name: 'Galaxy Watch 6', storage: ['16GB'], colors: ['Noir'], sizes: ['40mm', '44mm'] },
        { brand: 'Samsung', name: 'Galaxy Watch 6 Classic', storage: ['16GB'], colors: ['Noir'], sizes: ['43mm', '47mm'] },
        { brand: 'Samsung', name: 'Galaxy Watch 7', storage: ['32GB'], colors: ['Noir'], sizes: ['40mm', '44mm'] }
      ];
      
      addLog(`🔍 Début de l'import modèles Mobilax Montres - ${mobilaxWatchModels.length} modèles détectés`);
      
      let modelsImported = 0;
      let modelsSkipped = 0;
      let modelsErrors = 0;
      let brandsCreated = 0;
      
      for (const modelData of mobilaxWatchModels) {
        try {
          // Find or create brand
          let brand = brands.find(b => 
            b.name.toLowerCase() === modelData.brand.toLowerCase()
          );
          
          if (!brand) {
            try {
              brand = await createBrand({
                name: modelData.brand,
                logo_url: null
              });
              brandsCreated++;
              addLog(`✅ Marque "${modelData.brand}" créée`);
            } catch (brandError: any) {
              if (brandError.message?.includes('duplicate') || brandError.code === '23505') {
                // Brand was created by another process, try to find it again
                await fetchAllData();
                brand = brands.find(b => 
                  b.name.toLowerCase() === modelData.brand.toLowerCase()
                );
              } else {
                throw brandError;
              }
            }
          }
          
          if (!brand) {
            addLog(`❌ Impossible de créer/trouver la marque "${modelData.brand}"`);
            modelsErrors++;
            continue;
          }
          
          // Check if model exists
          const existingModel = await checkModelExists(modelData.name, brand.id, montreType.id);
          if (existingModel) {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant - ignoré`);
            modelsSkipped++;
            continue;
          }
          
          // Create new model
          await createDeviceModel({
            device_type_id: montreType.id,
            brand_id: brand.id,
            model_name: modelData.name,
            model_number: '',
            release_date: '2025-01-01',
            screen_size: modelData.sizes[0].replace('mm', ''),
            screen_resolution: '368x448',
            screen_type: 'OLED',
            battery_capacity: '300',
            operating_system: modelData.brand === 'Apple' ? 'watchOS' : 'Wear OS',
            is_active: true
          });
          
          addLog(`✅ Modèle "${modelData.brand} ${modelData.name}" créé avec succès`);
          modelsImported++;
          
        } catch (error: any) {
          if (error.message?.includes('duplicate') || error.code === '23505') {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant (BD) - ignoré`);
            modelsSkipped++;
          } else {
            addLog(`❌ Erreur lors de la création de "${modelData.brand} ${modelData.name}": ${error.message}`);
            modelsErrors++;
          }
        }
      }
      
      addLog(`🎉 Import terminé: ${modelsImported} modèles créés, ${modelsSkipped} ignorés, ${modelsErrors} erreurs, ${brandsCreated} marques créées`);
      setStatus(modelsErrors > 0 ? 'error' : 'completed');
      
      if (modelsImported > 0) {
        toast.success(`${modelsImported} nouveaux modèles de montres Mobilax importés !`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erreur globale: ${error.message}`);
      setStatus('error');
      toast.error('Erreur lors de l\'import des modèles Mobilax montres');
    }
  };

  const handleMobilaxLaptopModelsImport = async () => {
    setStatus('importing');
    setLogs([]);
    
    try {
      // Find Ordinateur device type
      const ordinateurType = deviceTypes.find(dt => dt.name.toLowerCase() === 'ordinateur');
      if (!ordinateurType) {
        addLog('❌ Type d\'appareil "Ordinateur" introuvable. Créez-le d\'abord.');
        setStatus('error');
        return;
      }

      // Extract MacBook models from Mobilax
      const mobilaxLaptopModels = [
        // MacBook Air models
        { brand: 'Apple', name: 'MacBook Air 13', storage: ['256GB', '512GB', '1TB'], colors: ['Argent', 'Gris sidéral', 'Or'], screen: '13.3' },
        { brand: 'Apple', name: 'MacBook Air 13 M1', storage: ['256GB', '512GB', '1TB', '2TB'], colors: ['Argent', 'Gris sidéral', 'Or'], screen: '13.3' },
        { brand: 'Apple', name: 'MacBook Air 13 M2', storage: ['256GB', '512GB', '1TB', '2TB'], colors: ['Argent', 'Gris sidéral', 'Or', 'Minuit'], screen: '13.6' },
        { brand: 'Apple', name: 'MacBook Air 15 M2', storage: ['256GB', '512GB', '1TB', '2TB'], colors: ['Argent', 'Gris sidéral', 'Or', 'Minuit'], screen: '15.3' },
        
        // MacBook Pro 13" models
        { brand: 'Apple', name: 'MacBook Pro 13', storage: ['256GB', '512GB', '1TB'], colors: ['Argent', 'Gris sidéral'], screen: '13.3' },
        { brand: 'Apple', name: 'MacBook Pro 13 M1', storage: ['256GB', '512GB', '1TB', '2TB'], colors: ['Argent', 'Gris sidéral'], screen: '13.3' },
        { brand: 'Apple', name: 'MacBook Pro 13 Touch Bar', storage: ['256GB', '512GB', '1TB'], colors: ['Argent', 'Gris sidéral'], screen: '13.3' },
        
        // MacBook Pro 14" models
        { brand: 'Apple', name: 'MacBook Pro 14 M1 Pro', storage: ['512GB', '1TB', '2TB', '4TB', '8TB'], colors: ['Argent', 'Gris sidéral'], screen: '14.2' },
        { brand: 'Apple', name: 'MacBook Pro 14 M1 Max', storage: ['1TB', '2TB', '4TB', '8TB'], colors: ['Argent', 'Gris sidéral'], screen: '14.2' },
        { brand: 'Apple', name: 'MacBook Pro 14 M2 Pro', storage: ['512GB', '1TB', '2TB', '4TB', '8TB'], colors: ['Argent', 'Gris sidéral'], screen: '14.2' },
        { brand: 'Apple', name: 'MacBook Pro 14 M2 Max', storage: ['1TB', '2TB', '4TB', '8TB'], colors: ['Argent', 'Gris sidéral'], screen: '14.2' },
        
        // MacBook Pro 16" models
        { brand: 'Apple', name: 'MacBook Pro 16', storage: ['512GB', '1TB', '2TB', '4TB'], colors: ['Argent', 'Gris sidéral'], screen: '16' },
        { brand: 'Apple', name: 'MacBook Pro 16 M1 Pro', storage: ['512GB', '1TB', '2TB', '4TB', '8TB'], colors: ['Argent', 'Gris sidéral'], screen: '16' },
        { brand: 'Apple', name: 'MacBook Pro 16 M1 Max', storage: ['1TB', '2TB', '4TB', '8TB'], colors: ['Argent', 'Gris sidéral'], screen: '16' },
        { brand: 'Apple', name: 'MacBook Pro 16 M2 Pro', storage: ['512GB', '1TB', '2TB', '4TB', '8TB'], colors: ['Argent', 'Gris sidéral'], screen: '16' },
        { brand: 'Apple', name: 'MacBook Pro 16 M2 Max', storage: ['1TB', '2TB', '4TB', '8TB'], colors: ['Argent', 'Gris sidéral'], screen: '16' }
      ];
      
      addLog(`🔍 Début de l'import modèles Mobilax Ordinateurs - ${mobilaxLaptopModels.length} modèles détectés`);
      
      let modelsImported = 0;
      let modelsSkipped = 0;
      let modelsErrors = 0;
      let brandsCreated = 0;
      
      for (const modelData of mobilaxLaptopModels) {
        try {
          // Find or create brand
          let brand = brands.find(b => 
            b.name.toLowerCase() === modelData.brand.toLowerCase()
          );
          
          if (!brand) {
            try {
              brand = await createBrand({
                name: modelData.brand,
                logo_url: null
              });
              brandsCreated++;
              addLog(`✅ Marque "${modelData.brand}" créée`);
            } catch (brandError: any) {
              if (brandError.message?.includes('duplicate') || brandError.code === '23505') {
                // Brand was created by another process, try to find it again
                await fetchAllData();
                brand = brands.find(b => 
                  b.name.toLowerCase() === modelData.brand.toLowerCase()
                );
              } else {
                throw brandError;
              }
            }
          }
          
          if (!brand) {
            addLog(`❌ Impossible de créer/trouver la marque "${modelData.brand}"`);
            modelsErrors++;
            continue;
          }
          
          // Check if model exists
          const existingModel = await checkModelExists(modelData.name, brand.id, ordinateurType.id);
          if (existingModel) {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant - ignoré`);
            modelsSkipped++;
            continue;
          }
          
          // Create new model
          await createDeviceModel({
            device_type_id: ordinateurType.id,
            brand_id: brand.id,
            model_name: modelData.name,
            model_number: '',
            release_date: '2025-01-01',
            screen_size: modelData.screen,
            screen_resolution: modelData.screen === '13.3' || modelData.screen === '13.6' ? '2560x1600' : 
                              modelData.screen === '14.2' ? '3024x1964' : '3456x2234',
            screen_type: 'Retina',
            battery_capacity: modelData.screen === '13.3' || modelData.screen === '13.6' ? '52.6' : 
                             modelData.screen === '14.2' ? '70' : '100',
            operating_system: 'macOS',
            is_active: true
          });
          
          addLog(`✅ Modèle "${modelData.brand} ${modelData.name}" créé avec succès`);
          modelsImported++;
          
        } catch (error: any) {
          if (error.message?.includes('duplicate') || error.code === '23505') {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant (BD) - ignoré`);
            modelsSkipped++;
          } else {
            addLog(`❌ Erreur lors de la création de "${modelData.brand} ${modelData.name}": ${error.message}`);
            modelsErrors++;
          }
        }
      }
      
      addLog(`🎉 Import terminé: ${modelsImported} modèles créés, ${modelsSkipped} ignorés, ${modelsErrors} erreurs, ${brandsCreated} marques créées`);
      setStatus(modelsErrors > 0 ? 'error' : 'completed');
      
      if (modelsImported > 0) {
        toast.success(`${modelsImported} nouveaux modèles d'ordinateurs Mobilax importés !`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erreur globale: ${error.message}`);
      setStatus('error');
      toast.error('Erreur lors de l\'import des modèles Mobilax ordinateurs');
    }
  };

  const handleMobilaxScooterModelsImport = async () => {
    setStatus('importing');
    setLogs([]);
    
    try {
      // Find Trottinette device type (or create it if it doesn't exist)
      let trottinetteType = deviceTypes.find(dt => dt.name.toLowerCase() === 'trottinette');
      if (!trottinetteType) {
        addLog('⚠️ Type d\'appareil "Trottinette" introuvable. Création...');
        try {
          trottinetteType = await createDeviceType({
            name: 'Trottinette',
            description: 'Trottinettes électriques'
          });
          addLog('✅ Type d\'appareil "Trottinette" créé avec succès');
        } catch (error: any) {
          addLog(`❌ Erreur lors de la création du type "Trottinette": ${error.message}`);
          setStatus('error');
          return;
        }
      }

      // Extract scooter models from Mobilax e-mobility section
      const mobilaxScooterModels = [
        // Xiaomi models
        { brand: 'Xiaomi', name: 'Mi Electric Scooter M365', battery: '280Wh', autonomy: '30km', speed: '25km/h' },
        { brand: 'Xiaomi', name: 'Mi Electric Scooter M365 Pro', battery: '474Wh', autonomy: '45km', speed: '25km/h' },
        { brand: 'Xiaomi', name: 'Mi Electric Scooter M365 Pro 2', battery: '474Wh', autonomy: '45km', speed: '25km/h' },
        { brand: 'Xiaomi', name: 'Mi Electric Scooter 1S', battery: '280Wh', autonomy: '30km', speed: '25km/h' },
        { brand: 'Xiaomi', name: 'Mi Electric Scooter Essential', battery: '187Wh', autonomy: '20km', speed: '20km/h' },
        { brand: 'Xiaomi', name: 'Mi Electric Scooter 3', battery: '280Wh', autonomy: '30km', speed: '25km/h' },
        { brand: 'Xiaomi', name: 'Mi Electric Scooter 4 Pro', battery: '474Wh', autonomy: '55km', speed: '25km/h' },
        
        // Ninebot/Segway models
        { brand: 'Ninebot', name: 'Kickscooter ES1', battery: '185Wh', autonomy: '25km', speed: '20km/h' },
        { brand: 'Ninebot', name: 'Kickscooter ES2', battery: '187Wh', autonomy: '25km', speed: '25km/h' },
        { brand: 'Ninebot', name: 'Kickscooter ES4', battery: '374Wh', autonomy: '45km', speed: '30km/h' },
        { brand: 'Ninebot', name: 'Kickscooter MAX G30', battery: '551Wh', autonomy: '65km', speed: '25km/h' },
        { brand: 'Ninebot', name: 'Kickscooter MAX G30LE', battery: '367Wh', autonomy: '40km', speed: '25km/h' },
        { brand: 'Ninebot', name: 'Kickscooter F20', battery: '365Wh', autonomy: '20km', speed: '25km/h' },
        { brand: 'Ninebot', name: 'Kickscooter F25E', battery: '365Wh', autonomy: '25km', speed: '25km/h' },
        { brand: 'Ninebot', name: 'Kickscooter F30E', battery: '367Wh', autonomy: '30km', speed: '25km/h' },
        { brand: 'Ninebot', name: 'Kickscooter F40E', battery: '367Wh', autonomy: '40km', speed: '25km/h' },
        
        // Kugoo models
        { brand: 'Kugoo', name: 'S1', battery: '350Wh', autonomy: '30km', speed: '30km/h' },
        { brand: 'Kugoo', name: 'S2', battery: '350Wh', autonomy: '35km', speed: '30km/h' },
        { brand: 'Kugoo', name: 'S3', battery: '350Wh', autonomy: '35km', speed: '30km/h' },
        { brand: 'Kugoo', name: 'G2 Pro', battery: '500Wh', autonomy: '50km', speed: '50km/h' }
      ];
      
      addLog(`🔍 Début de l'import modèles Mobilax Trottinettes - ${mobilaxScooterModels.length} modèles détectés`);
      
      let modelsImported = 0;
      let modelsSkipped = 0;
      let modelsErrors = 0;
      let brandsCreated = 0;
      
      for (const modelData of mobilaxScooterModels) {
        try {
          // Find or create brand
          let brand = brands.find(b => 
            b.name.toLowerCase() === modelData.brand.toLowerCase()
          );
          
          if (!brand) {
            try {
              brand = await createBrand({
                name: modelData.brand,
                logo_url: null
              });
              brandsCreated++;
              addLog(`✅ Marque "${modelData.brand}" créée`);
            } catch (brandError: any) {
              if (brandError.message?.includes('duplicate') || brandError.code === '23505') {
                // Brand was created by another process, try to find it again
                await fetchAllData();
                brand = brands.find(b => 
                  b.name.toLowerCase() === modelData.brand.toLowerCase()
                );
              } else {
                throw brandError;
              }
            }
          }
          
          if (!brand) {
            addLog(`❌ Impossible de créer/trouver la marque "${modelData.brand}"`);
            modelsErrors++;
            continue;
          }
          
          // Check if model exists
          const existingModel = await checkModelExists(modelData.name, brand.id, trottinetteType.id);
          if (existingModel) {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant - ignoré`);
            modelsSkipped++;
            continue;
          }
          
          // Create new model
          await createDeviceModel({
            device_type_id: trottinetteType.id,
            brand_id: brand.id,
            model_name: modelData.name,
            model_number: '',
            release_date: '2025-01-01',
            screen_size: '0',
            screen_resolution: '',
            screen_type: 'LED',
            battery_capacity: modelData.battery.replace('Wh', ''),
            operating_system: 'Propriétaire',
            is_active: true
          });
          
          addLog(`✅ Modèle "${modelData.brand} ${modelData.name}" créé avec succès`);
          modelsImported++;
          
        } catch (error: any) {
          if (error.message?.includes('duplicate') || error.code === '23505') {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant (BD) - ignoré`);
            modelsSkipped++;
          } else {
            addLog(`❌ Erreur lors de la création de "${modelData.brand} ${modelData.name}": ${error.message}`);
            modelsErrors++;
          }
        }
      }
      
      addLog(`🎉 Import terminé: ${modelsImported} modèles créés, ${modelsSkipped} ignorés, ${modelsErrors} erreurs, ${brandsCreated} marques créées`);
      setStatus(modelsErrors > 0 ? 'error' : 'completed');
      
      if (modelsImported > 0) {
        toast.success(`${modelsImported} nouveaux modèles de trottinettes Mobilax importés !`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erreur globale: ${error.message}`);
      setStatus('error');
      toast.error('Erreur lors de l\'import des modèles Mobilax trottinettes');
    }
  };

  const importConsolesFromUtopya = async () => {
    setStatus('importing');
    setLogs([]);
    
    try {
      // Find Console device type
      const consoleType = deviceTypes.find(dt => dt.name.toLowerCase().includes('console'));
      if (!consoleType) {
        addLog('❌ Type d\'appareil "Console de jeux" introuvable. Créez-le d\'abord.');
        setStatus('error');
        return;
      }

      // Extract Nintendo console models from Utopya data
      const nintendoConsoleModels = [
        // Nintendo Switch models
        { brand: 'Nintendo', name: 'Switch', storage: ['32GB'], colors: ['Noir', 'Gris'], type: 'Portable/Home' },
        { brand: 'Nintendo', name: 'Switch OLED', storage: ['64GB'], colors: ['Blanc', 'Noir'], type: 'Portable/Home' },
        { brand: 'Nintendo', name: 'Switch Lite', storage: ['32GB'], colors: ['Jaune', 'Gris', 'Turquoise', 'Corail', 'Bleu', 'Blanc'], type: 'Portable' },
        
        // Nintendo 3DS models
        { brand: 'Nintendo', name: '3DS', storage: ['2GB'], colors: ['Noir', 'Bleu'], type: 'Portable' },
        { brand: 'Nintendo', name: '3DS XL', storage: ['4GB'], colors: ['Noir', 'Bleu', 'Rouge'], type: 'Portable' },
        { brand: 'Nintendo', name: 'New 3DS', storage: ['4GB'], colors: ['Noir', 'Blanc'], type: 'Portable' },
        { brand: 'Nintendo', name: 'New 3DS XL', storage: ['4GB'], colors: ['Noir', 'Rouge', 'Métallique'], type: 'Portable' },
        
        // Nintendo Wii/Wii U
        { brand: 'Nintendo', name: 'Wii', storage: ['512MB'], colors: ['Blanc'], type: 'Home' },
        { brand: 'Nintendo', name: 'Wii U', storage: ['8GB', '32GB'], colors: ['Blanc', 'Noir'], type: 'Home' },
        
        // Nintendo DS
        { brand: 'Nintendo', name: 'DS', storage: ['4MB'], colors: ['Gris'], type: 'Portable' },
        { brand: 'Nintendo', name: 'DS Lite', storage: ['4MB'], colors: ['Blanc', 'Noir'], type: 'Portable' },
        { brand: 'Nintendo', name: 'DSi', storage: ['256MB'], colors: ['Noir', 'Blanc'], type: 'Portable' },
        { brand: 'Nintendo', name: 'DSi XL', storage: ['256MB'], colors: ['Bordeaux', 'Blanc'], type: 'Portable' },
        
        // Nintendo Game Boy series (rétro-gaming)
        { brand: 'Nintendo', name: 'Game Boy', storage: ['8KB'], colors: ['Gris'], type: 'Portable' },
        { brand: 'Nintendo', name: 'Game Boy Color', storage: ['32KB'], colors: ['Violet', 'Transparent'], type: 'Portable' },
        { brand: 'Nintendo', name: 'Game Boy Advance', storage: ['256KB'], colors: ['Violet', 'Glacier'], type: 'Portable' },
        { brand: 'Nintendo', name: 'Game Boy Advance SP', storage: ['256KB'], colors: ['Argent', 'Noir'], type: 'Portable' }
      ];
      
      addLog(`🔍 Début de l'import modèles Nintendo Utopya - ${nintendoConsoleModels.length} modèles détectés`);
      
      let modelsImported = 0;
      let modelsSkipped = 0;
      let modelsErrors = 0;
      let brandsCreated = 0;
      
      for (const modelData of nintendoConsoleModels) {
        try {
          // Find or create brand
          let brand = brands.find(b => 
            b.name.toLowerCase() === modelData.brand.toLowerCase()
          );
          
          if (!brand) {
            try {
              brand = await createBrand({
                name: modelData.brand,
                logo_url: null
              });
              brandsCreated++;
              addLog(`✅ Marque "${modelData.brand}" créée`);
            } catch (brandError: any) {
              if (brandError.message?.includes('duplicate') || brandError.code === '23505') {
                // Brand was created by another process, try to find it again
                await fetchAllData();
                brand = brands.find(b => 
                  b.name.toLowerCase() === modelData.brand.toLowerCase()
                );
              } else {
                throw brandError;
              }
            }
          }
          
          if (!brand) {
            addLog(`❌ Impossible de créer/trouver la marque "${modelData.brand}"`);
            modelsErrors++;
            continue;
          }
          
          // Check if model exists
          const existingModel = await checkModelExists(modelData.name, brand.id, consoleType.id);
          if (existingModel) {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant - ignoré`);
            modelsSkipped++;
            continue;
          }
          
          // Create new model
          await createDeviceModel({
            device_type_id: consoleType.id,
            brand_id: brand.id,
            model_name: modelData.name,
            model_number: '',
            release_date: '2025-01-01',
            screen_size: modelData.type === 'Portable' ? '6.2' : '0',
            screen_resolution: modelData.type === 'Portable' ? '1280x720' : '',
            screen_type: modelData.type === 'Portable' ? 'LCD' : '',
            battery_capacity: modelData.type === 'Portable' ? '4310' : '0',
            operating_system: 'Nintendo OS',
            is_active: true
          });
          
          addLog(`✅ Modèle "${modelData.brand} ${modelData.name}" créé avec succès`);
          modelsImported++;
          
        } catch (error: any) {
          if (error.message?.includes('duplicate') || error.code === '23505') {
            addLog(`⚠️ Modèle "${modelData.brand} ${modelData.name}" déjà existant (BD) - ignoré`);
            modelsSkipped++;
          } else {
            addLog(`❌ Erreur lors de la création de "${modelData.brand} ${modelData.name}": ${error.message}`);
            modelsErrors++;
          }
        }
      }
      
      addLog(`🎉 Import terminé: ${modelsImported} modèles créés, ${modelsSkipped} ignorés, ${modelsErrors} erreurs, ${brandsCreated} marques créées`);
      setStatus(modelsErrors > 0 ? 'error' : 'completed');
      
      if (modelsImported > 0) {
        toast.success(`${modelsImported} nouveaux modèles de consoles Nintendo importés !`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erreur globale: ${error.message}`);
      setStatus('error');
      toast.error('Erreur lors de l\'import des modèles de consoles Nintendo');
    }
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

          <div className="space-y-3">
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

            <Button 
              onClick={handleMobilaxImport} 
              disabled={status === 'importing'}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {status === 'importing' ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Import Mobilax...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Importer les 25 marques Mobilax (Téléphones)
                </>
              )}
            </Button>

            <Button 
              onClick={handleMobilaxTabletModelsImport} 
              disabled={status === 'importing'}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {status === 'importing' ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Import Modèles Tablettes...
                </>
              ) : (
                <>
                  <Tablet className="h-4 w-4 mr-2" />
                  Importer les modèles de tablettes Mobilax
                </>
              )}
            </Button>

            <Button 
              onClick={handleMobilaxWatchModelsImport} 
              disabled={status === 'importing'}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {status === 'importing' ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Import Modèles Montres...
                </>
              ) : (
                <>
                  <Watch className="h-4 w-4 mr-2" />
                  Importer les modèles de montres Mobilax
                </>
              )}
            </Button>

            <Button 
              onClick={handleMobilaxLaptopModelsImport} 
              disabled={status === 'importing'}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {status === 'importing' ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Import Modèles Ordinateurs...
                </>
              ) : (
                <>
                  <Laptop className="h-4 w-4 mr-2" />
                  Importer les modèles d'ordinateurs Mobilax
                </>
              )}
            </Button>

            <Button 
              onClick={handleMobilaxScooterModelsImport} 
              disabled={status === 'importing'}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {status === 'importing' ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Import Modèles Trottinettes...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Importer les modèles de trottinettes Mobilax
                </>
              )}
            </Button>

            <Button 
              onClick={importConsolesFromUtopya} 
              disabled={status === 'importing'}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {status === 'importing' ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Import Modèles Consoles...
                </>
              ) : (
                <>
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Importer les modèles de consoles Nintendo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs de l'import Mobilax */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Logs Import Mobilax
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg max-h-60 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="py-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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