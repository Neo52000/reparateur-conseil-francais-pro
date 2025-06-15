
import { RepairerProfile } from '@/types/repairerProfile';
import { createUserIfNotExists } from '@/services/repairerUserService';
import { mapFormDataToSupabaseData, mapSupabaseDataToProfile } from '@/services/repairerProfileMapper';
import { updateRepairerLocation } from '@/services/repairerLocationService';
import { findExistingProfile, updateExistingProfile, createNewProfile } from '@/services/repairerProfileRepository';

export const useRepairerProfileSave = () => {
  const saveProfile = async (formData: RepairerProfile, originalProfile: RepairerProfile): Promise<RepairerProfile> => {
    console.log('Attempting to save profile:', formData);

    // Si c'est un profil mock (existant)
    const isMockProfile = originalProfile.id.startsWith('mock-');
    if (isMockProfile) {
      console.log('Simulating save for mock profile:', formData);
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        ...formData,
        updated_at: new Date().toISOString()
      };
    }

    // Recherche si un profil existe déjà sur ce repairer_id
    let userId = formData.repairer_id;

    try {
      const existingProfile = await findExistingProfile(userId);
      console.log('Existing profile found:', existingProfile);

      // Si profil non trouvé, s'assurer que l'utilisateur existe sinon le créer
      if (!existingProfile) {
        console.log('No existing profile found, creating user...');
        userId = await createUserIfNotExists(
          formData.email,
          formData?.business_name ?? "",
          undefined,
          formData?.phone ?? ""
        );
        
        if (!userId) {
          throw new Error("Impossible de créer ou récupérer l'utilisateur");
        }
      }

      // Structure des données à enregistrer dans Supabase
      const supabaseData = mapFormDataToSupabaseData(formData, userId);

      // Mettre à jour aussi la table repairers si on a des coordonnées géographiques
      await updateRepairerLocation(formData);

      // Utiliser upsert pour gérer les cas de création et mise à jour
      let result;
      if (existingProfile) {
        console.log('Updating existing profile with ID:', existingProfile.id);
        result = await updateExistingProfile(existingProfile.id, supabaseData);
      } else {
        console.log('Creating new profile for user_id:', userId);
        result = await createNewProfile(supabaseData);
      }

      if (result.error) {
        console.error('Supabase save error:', result.error);
        throw new Error(result.error.message || "Erreur lors de l'enregistrement");
      }

      const savedProfile = mapSupabaseDataToProfile(result.data);
      console.log('Profile saved successfully:', savedProfile);
      return savedProfile;
      
    } catch (error) {
      console.error('Error in saveProfile:', error);
      throw error;
    }
  };

  return { saveProfile };
};
