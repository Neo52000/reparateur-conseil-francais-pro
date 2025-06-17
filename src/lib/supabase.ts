
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://nbugpbakfkyvvjzgfjmw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWdwYmFrZmt5dnZqemdmam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTgyMjQsImV4cCI6MjA2NTQ3NDIyNH0.3D_IxWcSNpA2Xk5PtsJVyfjAk9kC1KbMG2n1FJ32tWc";

// Créer un client par défaut avec configuration robuste
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Fonction pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Note: RepairerDB interface is now defined in src/hooks/useRepairers.ts
// Import it from there: import { RepairerDB } from '@/hooks/useRepairers';

export interface ScrapingLog {
  id: string;
  source: string;
  status: 'running' | 'completed' | 'failed';
  items_scraped: number;
  items_added: number;
  items_updated: number;
  items_pappers_verified?: number;
  items_pappers_rejected?: number;
  pappers_api_calls?: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}
