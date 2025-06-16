
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';
import { RepairerProfileMapper } from '@/services/repairerProfileMapper';

/**
 * Repository pour les opérations de données de profil réparateur
 */
export class ProfileDataRepository {
  /**
   * Charge les données d'un profil depuis Supabase
   */
  static async fetchProfile(id: string): Promise<RepairerProfile | null> {
    console.log('🔄 Fetching profile data for ID:', id);
    
    if (id.startsWith('mock-')) {
      console.log('🎭 Loading mock profile');
      const { getMockProfile } = await import('@/services/mockRepairerProfiles');
      return getMockProfile(id);
    }

    try {
      // Essayer d'abord de chercher par ID dans repairer_profiles
      let { data: profileData, error } = await supabase
        .from('repairer_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      // Si pas trouvé par ID, essayer par user_id
      if (!profileData && !error) {
        console.log('🔍 Profile not found by ID, trying by user_id...');
        const result = await supabase
          .from('repairer_profiles')
          .select('*')
          .eq('user_id', id)
          .maybeSingle();
        
        profileData = result.data;
        error = result.error;
      }

      // Si toujours pas trouvé, essayer de chercher par email dans repairers puis dans repairer_profiles
      if (!profileData && !error) {
        console.log('🔍 Profile not found by user_id, checking repairers table for email...');
        const { data: repairerData } = await supabase
          .from('repairers')
          .select('email')
          .eq('id', id)
          .maybeSingle();

        if (repairerData?.email) {
          console.log('📧 Found email in repairers table, searching profiles by email...');
          const result = await supabase
            .from('repairer_profiles')
            .select('*')
            .eq('email', repairerData.email)
            .maybeSingle();
          
          profileData = result.data;
          error = result.error;
        }
      }

      if (error) {
        console.error('❌ Error fetching profile:', error);
        throw error;
      }

      if (!profileData) {
        console.log('📭 No profile found in repairer_profiles, trying to create from repairers table...');
        return null;
      }

      console.log('📥 Raw profile data from Supabase:', profileData);
      
      // Mapper les données vers l'interface RepairerProfile
      const mappedProfile = RepairerProfileMapper.mapDatabaseToProfile(profileData);
      
      console.log('✅ Mapped profile data:', mappedProfile);
      return mappedProfile;

    } catch (error: any) {
      console.error('❌ Error in fetchProfile:', error);
      throw error;
    }
  }
}
