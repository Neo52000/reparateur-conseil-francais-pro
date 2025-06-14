
import { Repairer } from '@/types/repairer';

export const MOCK_REPAIRERS: Repairer[] = [
  {
    id: "1",
    name: "TechFix Pro",
    address: "123 Rue de la République",
    city: "Paris",
    postal_code: "75001",
    department: "75",
    region: "Île-de-France",
    lat: 48.8566,
    lng: 2.3522,
    rating: 4.8,
    review_count: 245,
    services: ["iPhone", "Samsung", "Xiaomi"],
    specialties: ["iPhone", "Samsung", "Xiaomi"],
    price_range: "medium",
    response_time: "< 1h",
    is_verified: true,
    is_open: true,
    source: "manual",
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Mobile Repair Center",
    address: "45 Avenue des Champs",
    city: "Lyon",
    postal_code: "69001",
    department: "69",
    region: "Auvergne-Rhône-Alpes",
    lat: 45.7640,
    lng: 4.8357,
    rating: 4.6,
    review_count: 182,
    services: ["iPhone", "Huawei", "OnePlus"],
    specialties: ["iPhone", "Huawei", "OnePlus"],
    price_range: "low",
    response_time: "< 2h",
    is_verified: true,
    is_open: true,
    source: "manual",
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "QuickFix Mobile",
    address: "78 Boulevard Victor Hugo",
    city: "Marseille",
    postal_code: "13001",
    department: "13",
    region: "Provence-Alpes-Côte d'Azur",
    lat: 43.2965,
    lng: 5.3698,
    rating: 4.9,
    review_count: 156,
    services: ["iPhone", "Samsung", "Google Pixel"],
    specialties: ["iPhone", "Samsung", "Google Pixel"],
    price_range: "high",
    response_time: "< 30min",
    is_verified: true,
    is_open: true,
    source: "manual",
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

export const MAP_CONFIG = {
  DEFAULT_CENTER: [2.3522, 48.8566] as [number, number],
  DEFAULT_ZOOM: 6,
  USER_LOCATION_ZOOM: 12,
  FLY_TO_DURATION: 1500
};
