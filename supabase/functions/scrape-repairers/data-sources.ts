
import { BusinessData } from './types.ts';

export const getMassiveRepairersData = (source: string, testMode: boolean, departmentCode?: string): BusinessData[] => {
  // Données pour Pages Jaunes (organisées par département)
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
        category: 'Réparation smartphone'
      },
      {
        name: 'Phone House Paris Rivoli',
        address: '124 Rue de Rivoli',
        city: 'Paris',
        postal_code: '75001',
        phone: '+33 1 42 33 78 90',
        description: 'Spécialiste réparation smartphones toutes marques.',
        category: 'Réparation mobile'
      },
      {
        name: 'Mobile Repair Center',
        address: '45 Rue Saint-Antoine',
        city: 'Paris',
        postal_code: '75004',
        phone: '+33 1 48 87 65 43',
        description: 'Réparation express iPhone, Samsung, écrans cassés.',
        category: 'Service de réparation'
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
        category: 'Service de réparation mobile'
      },
      {
        name: 'TechFix Lyon',
        address: '23 Cours Lafayette',
        city: 'Lyon',
        postal_code: '69006',
        phone: '+33 4 78 52 41 67',
        description: 'Réparation iPhone, Android, récupération données.',
        category: 'Réparation smartphone'
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
        category: 'Réparation électronique'
      },
      {
        name: 'Marseille Mobile Service',
        address: '78 Rue Paradis',
        city: 'Marseille',
        postal_code: '13006',
        phone: '+33 4 91 78 45 23',
        description: 'Réparation iPhone, Samsung, Huawei.',
        category: 'Réparation téléphone'
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
        category: 'Réparation smartphone'
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
        category: 'Service de réparation'
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
        category: 'Réparation électronique'
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
        category: 'Réparation iPhone'
      }
    ],
    '44': [ // Nantes
      {
        name: 'Genius Phone Nantes',
        address: '34 Rue Crébillon',
        city: 'Nantes',
        postal_code: '44000',
        phone: '+33 2 40 89 76 54',
        description: 'Réparation smartphones toutes marques.',
        category: 'Réparation mobile'
      }
    ],
    '67': [ // Strasbourg
      {
        name: 'Phone Express Strasbourg',
        address: '15 Place Kléber',
        city: 'Strasbourg',
        postal_code: '67000',
        phone: '+33 3 88 32 45 67',
        description: 'Réparation rapide GSM, déblocage.',
        category: 'Réparation téléphone'
      }
    ],
    '35': [ // Rennes
      {
        name: 'Mobile Service Rennes',
        address: '28 Rue de la Monnaie',
        city: 'Rennes',
        postal_code: '35000',
        phone: '+33 2 99 78 56 34',
        description: 'Service de réparation mobile et tablette.',
        category: 'Réparation mobile'
      }
    ]
  };

  // Données pour Google Places
  const googlePlacesData: BusinessData[] = [
    {
      name: 'Repair Café Paris 11',
      address: '15 Rue de la Roquette',
      city: 'Paris',
      postal_code: '75011',
      phone: '+33 1 43 57 89 12',
      description: 'Atelier participatif de réparation.',
      category: 'Atelier de réparation'
    },
    {
      name: 'GSM Express Montpellier',
      address: '12 Place de la Comédie',
      city: 'Montpellier',
      postal_code: '34000',
      phone: '+33 4 67 58 78 90',
      description: 'Réparation GSM express.',
      category: 'Réparation téléphone'
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

  return testMode ? sourceData.slice(0, 3) : sourceData;
};
