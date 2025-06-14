
import { Repairer } from '@/types/repairer';

export const MOCK_REPAIRERS: Repairer[] = [
  {
    id: 1,
    name: "TechFix Pro",
    address: "123 Rue de la République, Paris",
    lat: 48.8566,
    lng: 2.3522,
    rating: 4.8,
    reviewCount: 245,
    services: ["iPhone", "Samsung", "Xiaomi"],
    averagePrice: "€€",
    responseTime: "< 1h"
  },
  {
    id: 2,
    name: "Mobile Repair Center",
    address: "45 Avenue des Champs, Lyon",
    lat: 45.7640,
    lng: 4.8357,
    rating: 4.6,
    reviewCount: 182,
    services: ["iPhone", "Huawei", "OnePlus"],
    averagePrice: "€",
    responseTime: "< 2h"
  },
  {
    id: 3,
    name: "QuickFix Mobile",
    address: "78 Boulevard Victor Hugo, Marseille",
    lat: 43.2965,
    lng: 5.3698,
    rating: 4.9,
    reviewCount: 156,
    services: ["iPhone", "Samsung", "Google Pixel"],
    averagePrice: "€€€",
    responseTime: "< 30min"
  }
];

export const MAP_CONFIG = {
  DEFAULT_CENTER: [2.3522, 48.8566] as [number, number],
  DEFAULT_ZOOM: 6,
  USER_LOCATION_ZOOM: 12,
  FLY_TO_DURATION: 1500
};
