
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';

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
  static async createProfile(profileData: any) {
    console.log('🆕 Creating new profile...');
    const result = await supabase
      .from('repairer_profiles')
      .insert(profileData)
      .select()
      .single();

    if (result.error) {
      console.error('❌ Supabase create error:', result.error);
      throw new Error(result.error.message || "Erreur lors de la création");
    }

    return result;
  }

  /**
   * Met à jour un profil réparateur existant
   */
  static async updateProfile(profileId: string, profileData: any) {
    console.log('🔄 Updating existing profile with ID:', profileId);
    const result = await supabase
      .from('repairer_profiles')
      .update(profileData)
      .eq('id', profileId)
      .select()
      .single();

    if (result.error) {
      console.error('❌ Supabase update error:', result.error);
      throw new Error(result.error.message || "Erreur lors de la mise à jour");
    }

    return result;
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
