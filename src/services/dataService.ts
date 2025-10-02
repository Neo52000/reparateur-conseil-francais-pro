
import { supabase } from '@/integrations/supabase/client';
import { Repairer } from '@/types/repairer';
import { SecureDataAccess } from '@/services/secureDataAccess';

/**
 * Service de données en production - uniquement données réelles
 * Utilise l'accès sécurisé automatique
 */
export class DataService {

  /**
   * Récupère uniquement les réparateurs réels (mode production)
   * Utilise les vues sécurisées pour le public
   */
  static async getRepairers(): Promise<Repairer[]> {
    console.log('🔄 DataService - Récupération réparateurs en mode production');
    
    // Utiliser l'accès sécurisé automatique
    const table = await SecureDataAccess.getRepairersTable();
    
    const { data: realData, error } = await (supabase as any)
      .from(table)
      .select('*')
      .neq('source', 'demo')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log('📊 DataService - Données réelles récupérées:', realData?.length || 0);

    // Transformer les données de la base pour correspondre au type Repairer
    const transformedRealData: Repairer[] = (realData || []).map((item: any) => ({
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
      source: (['pages_jaunes', 'google_places', 'manual'].includes(item.source)) 
        ? item.source as 'pages_jaunes' | 'google_places' | 'manual'
        : 'manual'
    }));

    console.log('✅ Mode production - Données réelles uniquement:', transformedRealData.length);
    return transformedRealData;
  }

  /**
   * Filtre les données pour ne conserver que les données réelles (mode production)
   */
  static async filterByDemoMode<T extends { source?: string }>(data: T[]): Promise<T[]> {
    console.log('🔍 DataService - Filtrage en mode production sur', data.length, 'éléments');
    
    // Mode production : exclure TOUTES les données avec source = 'demo'
    const filtered = data.filter(item => item.source !== 'demo');
    console.log('✅ Mode production - Données réelles uniquement:', filtered.length, 'éléments');
    return filtered;
  }

  /**
   * Vérifie l'intégrité des données en mode production
   * Note: Cette fonction nécessite un accès admin
   */
  static async auditDataIntegrity(): Promise<{
    demoModeEnabled: boolean;
    realDataCount: number;
    demoDataCount: number;
    inconsistencies: string[];
  }> {
    const allRepairers = await this.getRepairers();
    
    const realDataCount = allRepairers.length;
    const demoDataCount = 0;
    
    const inconsistencies: string[] = [];
    
    // Note: Vérification des données de démo nécessite accès admin
    // Utiliser la table complète uniquement pour les admins
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: demoData } = await supabase
          .from('repairers')
          .select('id')
          .eq('source', 'demo');
        
        if (demoData && demoData.length > 0) {
          inconsistencies.push(`ERREUR: ${demoData.length} données de démo trouvées en mode production`);
        }
      }
    } catch (error) {
      console.warn('Audit data integrity - limited access:', error);
    }

    return {
      demoModeEnabled: false, // Toujours false en production
      realDataCount,
      demoDataCount,
      inconsistencies
    };
  }
}
