
import { BusinessData } from './types.ts';

export const getMassiveRepairersData = (source: string, testMode: boolean, departmentCode?: string): BusinessData[] => {
  // Données pour Pages Jaunes avec coordonnées GPS précises
  const pagesJaunesData = {
    '75': [ // Paris
      {
        name: 'iCracked Store Paris Châtelet',
        address: '8 Boulevard de Sébastopol',
        city: 'Paris',
        postal_code: '75001',
        phone: '+33 1 40 26 85 95',
        email: 'chatelet@icracked.fr',
        website: 'https://www.icracked.fr',
        description: 'Réparation iPhone, iPad, Samsung. Écrans cassés, batteries défaillantes.',
        category: 'Réparation smartphone',
        lat: 48.8606,
        lng: 2.3478
      },
      {
        name: 'Phone House Paris Rivoli',
        address: '124 Rue de Rivoli',
        city: 'Paris',
        postal_code: '75001',
        phone: '+33 1 42 33 78 90',
        description: 'Spécialiste réparation smartphones toutes marques.',
        category: 'Réparation mobile',
        lat: 48.8603,
        lng: 2.3412
      },
      {
        name: 'Mobile Repair Center',
        address: '45 Rue Saint-Antoine',
        city: 'Paris',
        postal_code: '75004',
        phone: '+33 1 48 87 65 43',
        description: 'Réparation express iPhone, Samsung, écrans cassés.',
        category: 'Service de réparation',
        lat: 48.8534,
        lng: 2.3626
      },
      {
        name: 'TechFix Paris Bastille',
        address: '12 Rue de la Bastille',
        city: 'Paris',
        postal_code: '75011',
        phone: '+33 1 43 57 89 12',
        description: 'Réparation smartphones et tablettes, récupération de données.',
        category: 'Réparation électronique',
        lat: 48.8532,
        lng: 2.3691
      },
      {
        name: 'Smart Repair Montparnasse',
        address: '89 Boulevard du Montparnasse',
        city: 'Paris',
        postal_code: '75006',
        phone: '+33 1 45 48 67 23',
        description: 'Réparation express tous smartphones, garantie 6 mois.',
        category: 'Réparation mobile',
        lat: 48.8437,
        lng: 2.3266
      }
    ],
    '69': [ // Lyon
      {
        name: 'Phone Rescue Lyon Part-Dieu',
        address: '17 Rue de la Part-Dieu',
        city: 'Lyon',
        postal_code: '69003',
        phone: '+33 4 78 95 12 34',
        description: 'Spécialiste réparation tous smartphones.',
        category: 'Service de réparation mobile',
        lat: 45.7640,
        lng: 4.8357
      },
      {
        name: 'TechFix Lyon',
        address: '23 Cours Lafayette',
        city: 'Lyon',
        postal_code: '69006',
        phone: '+33 4 78 52 41 67',
        description: 'Réparation iPhone, Android, récupération données.',
        category: 'Réparation smartphone',
        lat: 45.7689,
        lng: 4.8511
      },
      {
        name: 'Mobile Clinic Lyon Bellecour',
        address: '45 Place Bellecour',
        city: 'Lyon',
        postal_code: '69002',
        phone: '+33 4 78 37 92 15',
        description: 'Centre de réparation mobile premium.',
        category: 'Réparation mobile',
        lat: 45.7578,
        lng: 4.8320
      }
    ],
    '13': [ // Marseille
      {
        name: 'FixMyPhone Marseille',
        address: '45 La Canebière',
        city: 'Marseille',
        postal_code: '13001',
        phone: '+33 4 91 33 78 92',
        description: 'Réparation express smartphones et tablettes.',
        category: 'Réparation électronique',
        lat: 43.2965,
        lng: 5.3698
      },
      {
        name: 'Marseille Mobile Service',
        address: '78 Rue Paradis',
        city: 'Marseille',
        postal_code: '13006',
        phone: '+33 4 91 78 45 23',
        description: 'Réparation iPhone, Samsung, Huawei.',
        category: 'Réparation téléphone',
        lat: 43.2872,
        lng: 5.3812
      },
      {
        name: 'TechCare Marseille Vieux-Port',
        address: '12 Quai des Belges',
        city: 'Marseille',
        postal_code: '13001',
        phone: '+33 4 91 54 76 89',
        description: 'Réparation et dépannage mobile, service rapide.',
        category: 'Service de réparation',
        lat: 43.2947,
        lng: 5.3756
      }
    ],
    '31': [ // Toulouse
      {
        name: 'Smart Repair Toulouse',
        address: '23 Rue Alsace Lorraine',
        city: 'Toulouse',
        postal_code: '31000',
        phone: '+33 5 61 42 87 65',
        description: 'Réparation iPhone, Samsung, déblocage réseau.',
        category: 'Réparation smartphone',
        lat: 43.6045,
        lng: 1.4442
      },
      {
        name: 'Phone Doctor Toulouse Capitole',
        address: '8 Place du Capitole',
        city: 'Toulouse',
        postal_code: '31000',
        phone: '+33 5 61 23 45 67',
        description: 'Clinique smartphone au cœur de Toulouse.',
        category: 'Réparation mobile',
        lat: 43.6043,
        lng: 1.4437
      }
    ],
    '06': [ // Nice
      {
        name: 'Mobile Clinic Nice',
        address: '12 Avenue Jean Médecin',
        city: 'Nice',
        postal_code: '06000',
        phone: '+33 4 93 87 45 23',
        description: 'Clinique mobile pour smartphones.',
        category: 'Service de réparation',
        lat: 43.7031,
        lng: 7.2661
      },
      {
        name: 'Nice Phone Repair',
        address: '34 Promenade des Anglais',
        city: 'Nice',
        postal_code: '06000',
        phone: '+33 4 93 16 78 90',
        description: 'Réparation mobile avec vue sur mer.',
        category: 'Réparation smartphone',
        lat: 43.6947,
        lng: 7.2650
      }
    ],
    '33': [ // Bordeaux
      {
        name: 'TechCare Bordeaux',
        address: '56 Cours de l\'Intendance',
        city: 'Bordeaux',
        postal_code: '33000',
        phone: '+33 5 56 78 90 12',
        description: 'Réparation smartphones, tablettes.',
        category: 'Réparation électronique',
        lat: 44.8414,
        lng: -0.5740
      },
      {
        name: 'Bordeaux Mobile Express',
        address: '23 Place de la Bourse',
        city: 'Bordeaux',
        postal_code: '33000',
        phone: '+33 5 56 44 33 22',
        description: 'Service express de réparation mobile.',
        category: 'Réparation mobile',
        lat: 44.8410,
        lng: -0.5698
      }
    ],
    '59': [ // Lille
      {
        name: 'iPhone Doctor Lille',
        address: '18 Rue de Béthune',
        city: 'Lille',
        postal_code: '59000',
        phone: '+33 3 20 55 67 89',
        description: 'Spécialiste iPhone depuis 2015.',
        category: 'Réparation iPhone',
        lat: 50.6292,
        lng: 3.0573
      },
      {
        name: 'Lille Tech Repair',
        address: '45 Grand Place',
        city: 'Lille',
        postal_code: '59000',
        phone: '+33 3 20 12 34 56',
        description: 'Réparation de smartphones sur la Grand Place.',
        category: 'Réparation mobile',
        lat: 50.6367,
        lng: 3.0634
      }
    ]
  };

  // Données pour Google Places avec coordonnées précises
  const googlePlacesData: BusinessData[] = [
    {
      name: 'Repair Café Paris 11',
      address: '15 Rue de la Roquette',
      city: 'Paris',
      postal_code: '75011',
      phone: '+33 1 43 57 89 12',
      description: 'Atelier participatif de réparation.',
      category: 'Atelier de réparation',
      lat: 48.8552,
      lng: 2.3765
    },
    {
      name: 'GSM Express Montpellier',
      address: '12 Place de la Comédie',
      city: 'Montpellier',
      postal_code: '34000',
      phone: '+33 4 67 58 78 90',
      description: 'Réparation GSM express.',
      category: 'Réparation téléphone',
      lat: 43.6081,
      lng: 3.8767
    },
    {
      name: 'TechFix Express Strasbourg',
      address: '28 Place Gutenberg',
      city: 'Strasbourg',
      postal_code: '67000',
      phone: '+33 3 88 75 43 21',
      description: 'Réparation smartphone rapide à Strasbourg.',
      category: 'Réparation mobile',
      lat: 48.5816,
      lng: 7.7507
    }
  ];

  let sourceData: BusinessData[] = [];

  if (source === 'pages_jaunes') {
    if (departmentCode && pagesJaunesData[departmentCode as keyof typeof pagesJaunesData]) {
      sourceData = pagesJaunesData[departmentCode as keyof typeof pagesJaunesData];
    } else {
      // Tous les départements
      sourceData = Object.values(pagesJaunesData).flat();
    }
  } else if (source === 'google_places') {
    sourceData = googlePlacesData;
  }

  // En mode test, limiter à 3 éléments mais avec plus de variété
  return testMode ? sourceData.slice(0, 3) : sourceData;
};
