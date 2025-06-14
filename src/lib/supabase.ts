
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Créer un client par défaut si les variables d'environnement manquent
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Fonction pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Types pour la base de données
export interface RepairerDB {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  department: string;
  region: string;
  phone?: string;
  website?: string;
  email?: string;
  lat: number;
  lng: number;
  rating?: number;
  review_count?: number;
  services: string[];
  specialties: string[];
  price_range: 'low' | 'medium' | 'high';
  response_time?: string;
  opening_hours?: Record<string, string>;
  is_verified: boolean;
  is_open?: boolean;
  source: 'pages_jaunes' | 'google_places' | 'manual';
  scraped_at: string;
  updated_at: string;
  created_at: string;
}

export interface ScrapingLog {
  id: string;
  source: string;
  status: 'running' | 'completed' | 'failed';
  items_scraped: number;
  items_added: number;
  items_updated: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}
