
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { RepairerProfile } from '@/types/repairerProfile';

type RepairerProfileRow = Tables<'repairer_profiles'>;
type RepairerProfileInsert = TablesInsert<'repairer_profiles'>;
type RepairerProfileUpdate = TablesUpdate<'repairer_profiles'>;

/**
 * Repository pour la gestion des profils réparateurs dans la base de données
 */
export class RepairerProfileRepository {
  /**
   * Recherche un profil existant par user_id ou email
   */
  static async findExistingProfile(userId: string, email: string) {
    const { data: existingProfile, error: searchError } = await supabase
      .from('repairer_profiles')
      .select('id, user_id, email')
      .or(`user_id.eq.${userId},email.eq.${email}`)
      .maybeSingle();

    if (searchError) {
      console.error('❌ Error searching for existing profile:', searchError);
      throw searchError;
    }

    return existingProfile;
  }

  /**
   * Crée un nouveau profil réparateur
   */
  static async createProfile(profileData: RepairerProfileInsert) {
    console.log('🆕 Creating new profile...');
    const result = await supabase
      .from('repairer_profiles')
      .insert(profileData)
      .select()
      .maybeSingle();

    if (result.error) {
      console.error('❌ Supabase create error:', result.error);
      throw new Error(result.error.message || "Erreur lors de la création");
    }

    // Synchroniser avec la table repairers — pass the full row from
    // Supabase, not the partial input, so all required fields are present
    // (notably `email` for the lookup and `repair_types`/`services_offered`
    // for the array merge).
    if (result.data) {
      await this.syncWithRepairersTable(result.data);
    }

    return result;
  }

  /**
   * Met à jour un profil réparateur existant
   */
  static async updateProfile(profileId: string, profileData: RepairerProfileUpdate) {
    console.log('🔄 Updating existing profile with ID:', profileId);
    const result = await supabase
      .from('repairer_profiles')
      .update(profileData)
      .eq('id', profileId)
      .select()
      .maybeSingle();

    if (result.error) {
      console.error('❌ Supabase update error:', result.error);
      throw new Error(result.error.message || "Erreur lors de la mise à jour");
    }

    // Synchroniser avec la table repairers (full row, see createProfile)
    if (result.data) {
      await this.syncWithRepairersTable(result.data);
    }

    return result;
  }

  /**
   * Synchronise les données du profil avec la table repairers.
   * Accepte uniquement la ligne complète retournée par Supabase — passer
   * une mise à jour partielle ferait un lookup avec un email undefined et
   * écraserait les tableaux specialties/services avec [].
   */
  static async syncWithRepairersTable(profileData: RepairerProfileRow) {
    console.log('🔄 Synchronizing with repairers table...');
    
    try {
      // Récupérer le réparateur existant par email
      const { data: existingRepairer } = await supabase
        .from('repairers')
        .select('id')
        .eq('email', profileData.email)
        .maybeSingle();

      const repairerUpdateData = {
        name: profileData.business_name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postal_code,
        website: profileData.website,
        specialties: profileData.repair_types || [],
        services: profileData.services_offered || [],
        opening_hours: profileData.opening_hours,
        response_time: profileData.response_time,
        updated_at: new Date().toISOString()
      };

      if (existingRepairer) {
        // Mettre à jour le réparateur existant
        await supabase
          .from('repairers')
          .update(repairerUpdateData)
          .eq('id', existingRepairer.id);
        
        console.log('✅ Updated existing repairer record');
      } else {
        // Créer un nouvel enregistrement dans repairers si nécessaire
        await supabase
          .from('repairers')
          .insert({
            ...repairerUpdateData,
            source: 'profile_creation',
            created_at: new Date().toISOString()
          });
        
        console.log('✅ Created new repairer record');
      }
    } catch (error) {
      console.error('❌ Error syncing with repairers table:', error);
      // Ne pas faire échouer la sauvegarde du profil si la sync échoue
    }
  }

  /**
   * Met à jour les coordonnées géographiques dans la table repairers
   */
  static async updateGeographicCoordinates(email: string, geoLat: number, geoLng: number, address: string, city: string, postalCode: string) {
    console.log('🗺️ Updating geographic coordinates...');
    const { data: repairer } = await supabase
      .from('repairers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (repairer) {
      await supabase
        .from('repairers')
        .update({
          lat: geoLat,
          lng: geoLng,
          address: address,
          city: city,
          postal_code: postalCode
        })
        .eq('id', repairer.id);
    }
  }
}
