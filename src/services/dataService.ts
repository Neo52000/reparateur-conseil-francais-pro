
import { supabase } from '@/integrations/supabase/client';
import { DemoDataService } from './demoDataService';

/**
 * Service de données unifié qui gère automatiquement le mode démo
 */
export class DataService {
  /**
   * Vérifie si le mode démo est activé pour l'utilisateur actuel
   */
  static async isDemoModeEnabled(): Promise<boolean> {
    try {
      const { data: flags } = await supabase
        .from('feature_flags_by_plan')
        .select('enabled')
        .eq('feature_key', 'demo_mode_enabled')
        .eq('plan_name', 'Enterprise')
        .single();

      return flags?.enabled || false;
    } catch (error) {
      console.error('Erreur lors de la vérification du mode démo:', error);
      return false;
    }
  }

  /**
   * Récupère les réparateurs avec gestion automatique du mode démo
   */
  static async getRepairers() {
    const demoModeEnabled = await this.isDemoModeEnabled();
    
    // Récupérer les données réelles
    const { data: realData, error } = await supabase
      .from('repairers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Appliquer la logique du mode démo
    const demoData = DemoDataService.getDemoRepairers();
    return DemoDataService.combineWithDemoData(
      realData || [],
      demoData,
      demoModeEnabled
    );
  }

  /**
   * Filtre les données selon le mode démo actuel
   */
  static async filterByDemoMode<T extends { source?: string }>(data: T[]): Promise<T[]> {
    const demoModeEnabled = await this.isDemoModeEnabled();
    return DemoDataService.filterDataByDemoMode(data, demoModeEnabled);
  }
}
