
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

export const MAP_CONFIG = {
  DEFAULT_CENTER: [2.3522, 48.8566] as [number, number],
  DEFAULT_ZOOM: 11,
  USER_LOCATION_ZOOM: 15,
  FLY_TO_DURATION: 2000
};

// Données mockées supprimées - utilisation exclusive de Supabase
export const mockRepairers: Repairer[] = [];

// Données mockées supprimées - utilisation exclusive de Supabase
export const MOCK_REPAIRERS: any[] = [];

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
