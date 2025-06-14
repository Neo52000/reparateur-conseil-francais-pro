
export interface Repairer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  priceRange: string;
  openingHours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  verified: boolean;
  responseTime: string;
  images?: string[];
  description?: string;
}

export const mockRepairers: Repairer[] = [
  {
    id: '1',
    name: 'TechRepair Pro',
    address: '15 Rue de Rivoli, 75001 Paris',
    phone: '01 42 36 78 90',
    email: 'contact@techrepair-pro.fr',
    website: 'https://techrepair-pro.fr',
    rating: 4.8,
    reviewCount: 342,
    specialties: ['iPhone', 'Samsung', 'Réparation écran', 'Batterie'],
    priceRange: '50-150€',
    openingHours: 'Lun-Ven 9h-18h, Sam 10h-16h',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    verified: true,
    responseTime: '< 2h',
    description: 'Spécialiste Apple et Samsung depuis 15 ans. Réparations express en 1h pour la plupart des pannes.',
    images: ['/placeholder.svg']
  },
  {
    id: '2',
    name: 'iRepair Express',
    address: '28 Boulevard Saint-Germain, 75005 Paris',
    phone: '01 43 25 67 89',
    email: 'info@irepair-express.fr',
    rating: 4.6,
    reviewCount: 256,
    specialties: ['Apple', 'Réparation écran', 'Dégât des eaux', 'Récupération données'],
    priceRange: '40-120€',
    openingHours: 'Lun-Sam 10h-19h',
    coordinates: { lat: 48.8499, lng: 2.3457 },
    verified: true,
    responseTime: '< 1h',
    description: 'Expert en réparation Apple. Service express et garantie 6 mois sur toutes nos réparations.',
    images: ['/placeholder.svg']
  },
  {
    id: '3',
    name: 'Mobile Care Lyon',
    address: '42 Rue de la République, 69002 Lyon',
    phone: '04 78 42 13 57',
    email: 'contact@mobilecare-lyon.fr',
    website: 'https://mobilecare-lyon.fr',
    rating: 4.7,
    reviewCount: 189,
    specialties: ['Toutes marques', 'Batterie', 'Écran', 'Réparation logicielle'],
    priceRange: '35-100€',
    openingHours: 'Mar-Sam 9h30-18h30',
    coordinates: { lat: 45.7640, lng: 4.8357 },
    verified: true,
    responseTime: '< 3h',
    description: 'Réparation multimarques avec diagnostic gratuit. Plus de 10 ans d\'expérience.',
    images: ['/placeholder.svg']
  },
  {
    id: '4',
    name: 'SmartFix Marseille',
    address: '67 La Canebière, 13001 Marseille',
    phone: '04 91 55 82 34',
    email: 'contact@smartfix-marseille.fr',
    rating: 4.5,
    reviewCount: 423,
    specialties: ['Samsung', 'Xiaomi', 'OnePlus', 'Problèmes réseau'],
    priceRange: '45-130€',
    openingHours: 'Lun-Ven 8h30-18h',
    coordinates: { lat: 43.2965, lng: 5.3698 },
    verified: true,
    responseTime: '< 4h',
    description: 'Spécialiste Android et réparations complexes. Intervention à domicile possible.',
    images: ['/placeholder.svg']
  },
  {
    id: '5',
    name: 'PhoneCare Toulouse',
    address: '33 Rue Alsace Lorraine, 31000 Toulouse',
    phone: '05 61 23 45 67',
    email: 'info@phonecare-toulouse.fr',
    rating: 4.9,
    reviewCount: 178,
    specialties: ['iPhone', 'iPad', 'MacBook', 'Apple Watch'],
    priceRange: '60-180€',
    openingHours: 'Lun-Sam 10h-19h',
    coordinates: { lat: 43.6047, lng: 1.4442 },
    verified: true,
    responseTime: '< 1h',
    description: 'Centre de service agréé Apple. Pièces d\'origine et techniciens certifiés.',
    images: ['/placeholder.svg']
  },
  {
    id: '6',
    name: 'TechnoRepair Nice',
    address: '89 Avenue Jean Médecin, 06000 Nice',
    phone: '04 93 87 62 41',
    email: 'contact@technorepair-nice.fr',
    website: 'https://technorepair-nice.fr',
    rating: 4.4,
    reviewCount: 267,
    specialties: ['Huawei', 'Honor', 'Oppo', 'Réparation rapide'],
    priceRange: '40-110€',
    openingHours: 'Mar-Sam 9h-18h',
    coordinates: { lat: 43.7102, lng: 7.2620 },
    verified: false,
    responseTime: '< 6h',
    description: 'Réparation toutes marques chinoises. Prix compétitifs et service de qualité.',
    images: ['/placeholder.svg']
  }
];

export const getRepairerById = (id: string): Repairer | undefined => {
  return mockRepairers.find(repairer => repairer.id === id);
};

export const getRepairersBySpecialty = (specialty: string): Repairer[] => {
  return mockRepairers.filter(repairer => 
    repairer.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  );
};

export const getRepairersByLocation = (city: string): Repairer[] => {
  return mockRepairers.filter(repairer => 
    repairer.address.toLowerCase().includes(city.toLowerCase())
  );
};
