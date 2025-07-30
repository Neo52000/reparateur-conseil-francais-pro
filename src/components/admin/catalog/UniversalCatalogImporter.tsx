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
    return 'Propriétaire';
  };

  // Import automatisé universel
  const handleUniversalAutomatedImport = async () => {
    setStatus('importing');
    setLogs([]);
    
    try {
      addLog('🌐 Début de l\'import automatisé universel depuis tous les sites externes...');
      
      let totalModelsImported = 0;
      let totalModelsSkipped = 0;
      let totalModelsErrors = 0;
      let totalBrandsCreated = 0;
      let totalDeviceTypesCreated = 0;

      // Sites et configurations à scraper
      const scrapingSources = [
        {
          name: 'Mobilax Smartphones',
          baseUrl: 'https://www.mobilax.fr/pieces-detachees/telephonie',
          deviceType: 'Smartphone',
          brands: ['apple', 'samsung', 'xiaomi', 'huawei', 'honor', 'oppo', 'realme', 'oneplus', 'motorola', 'google', 'vivo', 'nothing']
        },
        {
          name: 'Mobilax Tablettes', 
          baseUrl: 'https://www.mobilax.fr/pieces-detachees/tablette',
          deviceType: 'Tablette',
          brands: ['apple', 'samsung', 'xiaomi', 'microsoft', 'lenovo']
        },
        {
          name: 'Mobilax Ordinateurs',
          baseUrl: 'https://www.mobilax.fr/protections/ordinateur',
          deviceType: 'Ordinateur Portable',
          brands: ['apple']
        },
        {
          name: 'Mobilax Trottinettes',
          baseUrl: 'https://www.mobilax.fr/e-mobility/pieces-detachees',
          deviceType: 'Trottinette',
          brands: ['xiaomi', 'ninebot', 'kugoo']
        },
        {
          name: 'Utopya Consoles',
          baseUrl: 'https://www.utopya.fr/autres-marques/nintendo.html',
          deviceType: 'Console de jeux',
          brands: ['nintendo']
        }
      ];

      // Import pour chaque source
      for (const source of scrapingSources) {
        addLog(`🔍 Scraping ${source.name}...`);
        
        try {
          // Ensure device type exists
          let deviceType = deviceTypes.find(dt => 
            dt.name.toLowerCase() === source.deviceType.toLowerCase()
          );
          
          if (!deviceType) {
            addLog(`➕ Création du type d'appareil: ${source.deviceType}`);
            try {
              deviceType = await createDeviceType({
                name: source.deviceType,
                description: `${source.deviceType} - Import automatique`,
                icon: getDeviceIcon(source.deviceType)
              });
              totalDeviceTypesCreated++;
            } catch (error: any) {
              if (error.message?.includes('duplicate') || error.code === '23505') {
                await fetchAllData();
                deviceType = deviceTypes.find(dt => 
                  dt.name.toLowerCase() === source.deviceType.toLowerCase()
                );
              } else {
                addLog(`❌ Erreur création type ${source.deviceType}: ${error.message}`);
                continue;
              }
            }
          }

          if (!deviceType) {
            addLog(`❌ Type d'appareil ${source.deviceType} introuvable`);
            continue;
          }

          // Import models for each brand
          for (const brandName of source.brands) {
            addLog(`🏷️ Import ${brandName} ${source.deviceType}...`);
            
            const models = await scrapeModelsFromSource(source, brandName);
            
            if (models.length === 0) {
              addLog(`⚠️ Aucun modèle trouvé pour ${brandName} sur ${source.name}`);
              continue;
            }

            // Find or create brand
            let brand = brands.find(b => 
              b.name.toLowerCase() === brandName.toLowerCase()
            );
            
            if (!brand) {
              try {
                brand = await createBrand({
                  name: capitalizeFirst(brandName),
                  logo_url: null
                });
                totalBrandsCreated++;
                addLog(`✅ Marque "${capitalizeFirst(brandName)}" créée`);
              } catch (brandError: any) {
                if (brandError.message?.includes('duplicate') || brandError.code === '23505') {
                  await fetchAllData();
                  brand = brands.find(b => 
                    b.name.toLowerCase() === brandName.toLowerCase()
                  );
                } else {
                  addLog(`❌ Erreur création marque ${brandName}: ${brandError.message}`);
                  continue;
                }
              }
            }

            if (!brand) {
              addLog(`❌ Marque ${brandName} introuvable`);
              continue;
            }

            // Import each model
            for (const modelData of models) {
              try {
                const cleanedModelName = cleanModelName(modelData.name);
                
                // Check if model exists
                const existingModel = await checkModelExists(cleanedModelName, brand.id, deviceType.id);
                if (existingModel) {
                  addLog(`⚠️ Modèle "${cleanedModelName}" déjà existant - ignoré`);
                  totalModelsSkipped++;
                  continue;
                }
                
                // Create new model with realistic specs
                const specs = getRealisticSpecs(source.deviceType, brandName, cleanedModelName, modelData);
                
                await createDeviceModel({
                  device_type_id: deviceType.id,
                  brand_id: brand.id,
                  model_name: cleanedModelName,
                  model_number: cleanedModelName,
                  release_date: specs.releaseYear,
                  screen_size: specs.screenSize || '6.1',
                  screen_resolution: specs.resolution || '2340x1080',
                  screen_type: specs.screenType || 'LCD',
                  battery_capacity: specs.battery || '4000',
                  operating_system: specs.os || getDefaultOS(brandName, source.deviceType),
                  is_active: true
                });
                
                addLog(`✅ Modèle "${cleanedModelName}" créé avec succès`);
                totalModelsImported++;
                
              } catch (error: any) {
                if (error.message?.includes('duplicate') || error.code === '23505') {
                  addLog(`⚠️ Modèle "${modelData.name}" déjà existant (BD) - ignoré`);
                  totalModelsSkipped++;
                } else {
                  addLog(`❌ Erreur création "${modelData.name}": ${error.message}`);
                  totalModelsErrors++;
                }
              }
            }
          }
          
        } catch (error: any) {
          addLog(`❌ Erreur source ${source.name}: ${error.message}`);
        }
      }
      
      addLog(`🎉 Import universel terminé:`);
      addLog(`  - ${totalDeviceTypesCreated} types d'appareils créés`);
      addLog(`  - ${totalBrandsCreated} marques créées`);
      addLog(`  - ${totalModelsImported} modèles créés`);
      addLog(`  - ${totalModelsSkipped} modèles ignorés (déjà existants)`);
      addLog(`  - ${totalModelsErrors} erreurs rencontrées`);
      
      setStatus(totalModelsErrors > 0 ? 'error' : 'completed');
      
      if (totalModelsImported > 0) {
        toast.success(`${totalModelsImported} nouveaux modèles importés automatiquement !`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erreur globale import universel: ${error.message}`);
      setStatus('error');
      toast.error('Erreur lors de l\'import automatisé universel');
    }
  };

  // Helper function to scrape models from a source
  const scrapeModelsFromSource = async (source: any, brandName: string): Promise<any[]> => {
    try {
      const url = `${source.baseUrl}/${brandName}`;
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract model names using various patterns
      const patterns = [
        new RegExp(`${capitalizeFirst(brandName)} ([^"<>]+)`, 'gi'),
        new RegExp(`${brandName.toUpperCase()} ([^"<>]+)`, 'gi'),
        new RegExp(`${capitalizeFirst(brandName)}\\s+([A-Za-z0-9\\s\\+\\-\\.]+)`, 'gi')
      ];
      
      let allMatches: string[] = [];
      patterns.forEach(pattern => {
        const matches = html.match(pattern) || [];
        allMatches.push(...matches);
      });
      
      // Clean and filter model names
      const models = allMatches
        .map(match => {
          const name = match
            .replace(new RegExp(`^${capitalizeFirst(brandName)}\\s+`, 'i'), '')
            .replace(new RegExp(`^${brandName.toUpperCase()}\\s+`, 'i'), '')
            .trim();
          return { name, brand: brandName };
        })
        .filter((model, index, arr) => 
          model.name.length > 2 && 
          model.name.length < 100 &&
          !model.name.includes('<') &&
          !model.name.includes('>') &&
          arr.findIndex(m => m.name === model.name) === index
        )
        .slice(0, 50); // Limit to 50 models per brand to avoid overload
      
      return models;
      
    } catch (error) {
      console.error(`Error scraping ${source.name} ${brandName}:`, error);
      return [];
    }
  };

  // Helper function to get device icon
  const getDeviceIcon = (deviceType: string): string => {
    const type = deviceType.toLowerCase();
    if (type.includes('smartphone') || type.includes('téléphone')) return 'smartphone';
    if (type.includes('tablette')) return 'tablet';
    if (type.includes('ordinateur')) return 'laptop';
    if (type.includes('trottinette')) return 'zap';
    if (type.includes('console')) return 'gamepad2';
    if (type.includes('écouteur')) return 'headphones';
    if (type.includes('montre')) return 'watch';
    return 'device';
  };

  // Helper function to capitalize first letter
  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Helper function to clean model names
  const cleanModelName = (name: string): string => {
    return name
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Helper function to get realistic specs based on device type and model
  const getRealisticSpecs = (deviceType: string, brandName: string, modelName: string, modelData: any) => {
    const name = modelName.toLowerCase();
    const brand = brandName.toLowerCase();
    const type = deviceType.toLowerCase();
    
    if (type.includes('smartphone')) {
      return getSmartphoneSpecs(brand, name);
    } else if (type.includes('tablette')) {
      return getTabletSpecs(brand, name);
    } else if (type.includes('ordinateur')) {
      return getLaptopSpecs(brand, name);
    } else if (type.includes('trottinette')) {
      return getScooterSpecs(brand, name);
    } else if (type.includes('console')) {
      return getConsoleSpecs(brand, name);
    }
    
    return {
      screenSize: '6.1',
      resolution: '1920x1080',
      screenType: 'LCD',
      battery: '4000',
      releaseYear: '2023',
      os: getDefaultOS(brandName, deviceType),
      storage: ['64GB'],
      colors: ['Noir'],
      connectivity: ['WiFi', 'Bluetooth'],
      features: []
    };
  };

  const getSmartphoneSpecs = (brand: string, name: string) => {
    // Logic for smartphone specs based on brand and model
    if (brand === 'apple') {
      return {
        screenSize: name.includes('pro max') ? '6.7' : name.includes('pro') ? '6.1' : name.includes('plus') ? '6.7' : '6.1',
        resolution: name.includes('pro') ? '2556x1179' : '2340x1080',
        screenType: 'Super Retina XDR OLED',
        battery: name.includes('pro max') ? '4422' : name.includes('pro') ? '3200' : '3279',
        releaseYear: name.includes('15') ? '2023' : name.includes('14') ? '2022' : '2021',
        os: 'iOS',
        storage: ['128GB', '256GB', '512GB', '1TB'],
        colors: ['Noir', 'Blanc', 'Bleu', 'Rose'],
        connectivity: ['5G', 'WiFi 6', 'Bluetooth 5.3'],
        features: ['Face ID', 'MagSafe', 'Résistant à l\'eau']
      };
    } else if (brand === 'samsung') {
      return getSamsungSpecs(name);
    }
    
    return {
      screenSize: '6.1',
      resolution: '2340x1080',
      screenType: 'AMOLED',
      battery: '4000',
      releaseYear: '2023',
      os: 'Android',
      storage: ['128GB', '256GB'],
      colors: ['Noir', 'Blanc'],
      connectivity: ['4G', 'WiFi', 'Bluetooth'],
      features: []
    };
  };

  const getSamsungSpecs = (name: string) => {
    if (name.includes('s24')) {
      return {
        screenSize: name.includes('ultra') ? '6.8' : name.includes('+') ? '6.7' : '6.2',
        resolution: name.includes('ultra') ? '3088x1440' : '2340x1080',
        screenType: 'Dynamic AMOLED',
        battery: name.includes('ultra') ? '5000' : '4000',
        releaseYear: '2024',
        os: 'Android',
        storage: ['256GB', '512GB', '1TB'],
        colors: ['Noir', 'Violet', 'Jaune', 'Vert'],
        connectivity: ['5G', 'WiFi 6E', 'Bluetooth 5.3'],
        features: ['S Pen', 'DeX', 'Knox']
      };
    } else if (name.includes('s23')) {
      return {
        screenSize: name.includes('ultra') ? '6.8' : name.includes('+') ? '6.6' : '6.1',
        resolution: name.includes('ultra') ? '3088x1440' : '2340x1080',
        screenType: 'Dynamic AMOLED',
        battery: name.includes('ultra') ? '5000' : '3900',
        releaseYear: '2023',
        os: 'Android',
        storage: ['128GB', '256GB', '512GB'],
        colors: ['Noir', 'Crème', 'Vert', 'Lavande'],
        connectivity: ['5G', 'WiFi 6', 'Bluetooth 5.3'],
        features: ['Knox', 'DeX', 'Ultra Wide Camera']
      };
    } else if (name.includes('z fold')) {
      return {
        screenSize: '7.6',
        resolution: '2176x1812',
        screenType: 'Dynamic AMOLED',
        battery: '4400',
        releaseYear: '2023',
        os: 'Android',
        storage: ['256GB', '512GB', '1TB'],
        colors: ['Noir', 'Beige', 'Bleu'],
        connectivity: ['5G', 'WiFi 6E', 'Bluetooth 5.3'],
        features: ['Pliable', 'S Pen', 'Multi-Active Window']
      };
    } else if (name.includes('z flip')) {
      return {
        screenSize: '6.7',
        resolution: '2640x1080',
        screenType: 'Dynamic AMOLED',
        battery: '3700',
        releaseYear: '2023',
        os: 'Android',
        storage: ['256GB', '512GB'],
        colors: ['Noir', 'Crème', 'Lavande', 'Menthe'],
        connectivity: ['5G', 'WiFi 6', 'Bluetooth 5.3'],
        features: ['Pliable', 'Flex Mode', 'Cover Screen']
      };
    } else if (name.includes('note')) {
      return {
        screenSize: '6.8',
        resolution: '3088x1440',
        screenType: 'Dynamic AMOLED',
        battery: '4300',
        releaseYear: '2020',
        os: 'Android',
        storage: ['128GB', '256GB', '512GB'],
        colors: ['Noir', 'Bronze', 'Blanc'],
        connectivity: ['5G', 'WiFi 6', 'Bluetooth 5.0'],
        features: ['S Pen', 'Knox', 'DeX']
      };
    } else if (name.includes('a5') || name.includes('a7')) {
      return {
        screenSize: '6.5',
        resolution: '2400x1080',
        screenType: 'Super AMOLED',
        battery: '4500',
        releaseYear: '2023',
        os: 'Android',
        storage: ['128GB', '256GB'],
        colors: ['Noir', 'Bleu', 'Blanc', 'Pêche'],
        connectivity: ['5G', 'WiFi', 'Bluetooth'],
        features: ['Knox', 'One UI']
      };
    }
    
    // Default specs for other Samsung models
    return {
      screenSize: '6.1',
      resolution: '2340x1080',
      screenType: 'Super AMOLED',
      battery: '4000',
      releaseYear: '2022',
      os: 'Android',
      storage: ['64GB', '128GB'],
      colors: ['Noir', 'Blanc'],
      connectivity: ['4G', 'WiFi', 'Bluetooth'],
      features: ['Knox']
    };
  };

  const getTabletSpecs = (brand: string, name: string) => {
    if (brand === 'apple') {
      return {
        screenSize: name.includes('12.9') ? '12.9' : name.includes('11') ? '11' : '10.9',
        resolution: name.includes('12.9') ? '2732x2048' : '2360x1640',
        screenType: 'Liquid Retina',
        battery: '10090',
        releaseYear: '2023',
        os: 'iPadOS',
        storage: ['128GB', '256GB', '512GB', '1TB'],
        colors: ['Gris', 'Argent'],
        connectivity: ['WiFi 6', 'Bluetooth 5.3'],
        features: ['Apple Pencil', 'Magic Keyboard']
      };
    }
    
    return {
      screenSize: '10.1',
      resolution: '1920x1200',
      screenType: 'LCD',
      battery: '8000',
      releaseYear: '2023',
      os: brand === 'microsoft' ? 'Windows' : 'Android',
      storage: ['64GB', '128GB'],
      colors: ['Noir', 'Argent'],
      connectivity: ['WiFi', 'Bluetooth'],
      features: []
    };
  };

  const getLaptopSpecs = (brand: string, name: string) => {
    return {
      screenSize: name.includes('16') ? '16' : name.includes('14') ? '14' : '13.3',
      resolution: name.includes('16') ? '3456x2234' : name.includes('14') ? '3024x1964' : '2560x1600',
      screenType: 'Retina',
      battery: name.includes('16') ? '100' : '70',
      releaseYear: '2024',
      os: 'macOS',
      storage: ['256GB', '512GB', '1TB', '2TB'],
      colors: ['Gris sidéral', 'Argent'],
      connectivity: ['WiFi 6E', 'Bluetooth 5.3', 'Thunderbolt'],
      features: ['Touch ID', 'Magic Keyboard', 'Force Touch']
    };
  };

  const getScooterSpecs = (brand: string, name: string) => {
    return {
      screenSize: '0',
      resolution: '',
      screenType: '',
      battery: name.includes('pro') ? '474' : name.includes('max') ? '551' : '280',
      releaseYear: '2023',
      os: 'Firmware',
      storage: [],
      colors: ['Noir'],
      connectivity: ['Bluetooth'],
      features: ['Pliable', 'Éclairage LED', 'Application mobile']
    };
  };

  const getConsoleSpecs = (brand: string, name: string) => {
    return {
      screenSize: name.includes('switch') ? '6.2' : name.includes('3ds') ? '3.5' : '0',
      resolution: name.includes('switch') ? '1280x720' : name.includes('3ds') ? '400x240' : '',
      screenType: name.includes('oled') ? 'OLED' : 'LCD',
      battery: name.includes('switch') ? '4310' : name.includes('3ds') ? '1300' : '0',
      releaseYear: '2023',
      os: 'Nintendo OS',
      storage: ['32GB', '64GB'],
      colors: ['Noir', 'Blanc', 'Rouge'],
      connectivity: ['WiFi', 'Bluetooth'],
      features: ['Portable', 'Dock TV', 'Joy-Con']
    };
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

      setStatus(errors.length > 0 ? 'error' : 'completed');

      if (newModels.length > 0) {
        toast.success(`${newModels.length} nouveaux modèles importés avec succès !`);
      } else if (skippedModels > 0) {
        toast.info(`${skippedModels} modèles déjà existants trouvés`);
      }

    } catch (error: any) {
      console.error('❌ Erreur globale:', error);
      setStatus('error');
      toast.error(`Erreur lors de l'import: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      {status !== 'idle' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {status === 'importing' && <Download className="h-4 w-4 animate-spin" />}
                {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                <span className="font-medium">
                  {status === 'importing' && 'Import en cours...'}
                  {status === 'completed' && 'Import terminé avec succès'}
                  {status === 'error' && 'Erreurs détectées lors de l\'import'}
                </span>
              </div>
              {importing && <Progress value={progress} className="w-32" />}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import universel automatisé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Import Automatisé Universel
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Import automatique de tous les types d'appareils, marques et modèles depuis les sites externes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Import Total Automatisé</span>
            </div>
            <p className="text-sm text-blue-700">
              Cette fonction scrape automatiquement tous les sites externes (Mobilax, Utopya) pour importer tous les appareils, marques et modèles disponibles.
            </p>
          </div>
          
          <Button 
            onClick={handleUniversalAutomatedImport}
            disabled={status === 'importing'}
            variant="default"
            className="w-full"
            size="lg"
          >
            {status === 'importing' ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Import Universel en cours...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Lancer l'Import Automatisé Universel
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import catalog standard (legacy) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Import Catalogue Standard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Import des données prédéfinies par catégorie
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sélection des catégories */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryToggle(category.id)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                <span className="hidden md:inline">{category.label}</span>
              </Button>
            ))}
          </div>

          {/* Aperçu des données sélectionnées */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium mb-2">Données à importer :</h4>
            <div className="space-y-2">
              {filteredProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <product.icon className="h-4 w-4" />
                    <span className="font-medium">{product.brand}</span>
                    <span className="text-muted-foreground">{product.deviceType}</span>
                  </div>
                  <Badge variant="secondary">{product.models.length} modèles</Badge>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="text-sm font-medium">
                Total : {filteredProducts.reduce((sum, product) => sum + product.models.length, 0)} modèles
              </div>
            </div>
          </div>

          {/* Bouton d'import */}
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
                Importer {filteredProducts.reduce((sum, product) => sum + product.models.length, 0)} modèles
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logs de l'import */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Logs Import Automatisé
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

export default UniversalCatalogImporter;