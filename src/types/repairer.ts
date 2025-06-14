
export interface Repairer {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  services: string[];
  averagePrice: string;
  responseTime: string;
}
