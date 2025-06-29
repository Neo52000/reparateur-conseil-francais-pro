
import { supabase } from '@/integrations/supabase/client';
import { DemoDataService } from './demoDataService';
import { Repairer } from '@/types/repairer';

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

      const enabled = flags?.enabled || false;
      console.log('🎯 DataService - Mode démo vérifié:', enabled);
      return enabled;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du mode démo:', error);
      return false;
    }
  }

  /**
   * Récupère les réparateurs avec gestion automatique du mode démo
   */
  static async getRepairers(): Promise<Repairer[]> {
    const demoModeEnabled = await this.isDemoModeEnabled();
    console.log('🔄 DataService - Récupération réparateurs, mode démo:', demoModeEnabled);
    
    // Récupérer les données réelles
    const { data: realData, error } = await supabase
      .from('repairers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log('📊 DataService - Données réelles récupérées:', realData?.length || 0);

    // Transformer les données de la base pour correspondre au type Repairer
    const transformedRealData: Repairer[] = (realData || []).map(item => ({
      ...item,
      business_status: item.business_status || 'active',
      pappers_verified: item.pappers_verified || false,
      price_range: (['low', 'medium', 'high'].includes(item.price_range)) 
        ? item.price_range as 'low' | 'medium' | 'high'
        : 'medium',
      department: item.department || '',
      region: item.region || '',
      phone: item.phone || undefined,
      website: item.website || undefined,
      email: item.email || undefined,
      opening_hours: item.opening_hours ? 
        (typeof item.opening_hours === 'object' ? item.opening_hours as Record<string, string> : null) : 
        null,
      services: item.services || [],
      specialties: item.specialties || [],
      source: (['pages_jaunes', 'google_places', 'manual', 'demo'].includes(item.source)) 
        ? item.source as 'pages_jaunes' | 'google_places' | 'manual' | 'demo'
        : 'manual'
    }));

    // CORRECTION : Appliquer correctement la logique du mode démo
    let result: Repairer[];
    
    if (demoModeEnabled) {
      // Mode démo activé : données réelles (sans démo) + données démo
      const demoData = DemoDataService.getDemoRepairers();
      result = DemoDataService.combineWithDemoData(
        transformedRealData,
        demoData,
        true
      );
    } else {
      // Mode démo désactivé : UNIQUEMENT données réelles (filtrer toute donnée de démo)
      result = transformedRealData.filter(item => item.source !== 'demo');
    }

    console.log('✅ DataService - Résultat final:', result.length, 'réparateurs');
    return result;
  }

  /**
   * Filtre les données selon le mode démo actuel
   */
  static async filterByDemoMode<T extends { source?: string }>(data: T[]): Promise<T[]> {
    const demoModeEnabled = await this.isDemoModeEnabled();
    console.log('🔍 DataService - Filtrage par mode démo:', demoModeEnabled);
    return DemoDataService.filterDataByDemoMode(data, demoModeEnabled);
  }
}
