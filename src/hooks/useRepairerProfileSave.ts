
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';
import { RepairerUserService } from '@/services/repairerUserService';
import { RepairerProfileRepository } from '@/services/repairerProfileRepository';
import { RepairerProfileMapper } from '@/services/repairerProfileMapper';

/**
 * Hook pour la sauvegarde des profils réparateurs
 * Coordonne les différents services pour la sauvegarde complète
 */
export const useRepairerProfileSave = () => {
  /**
   * Sauvegarde le profil réparateur dans Supabase
   */
  const saveProfile = async (formData: RepairerProfile, originalProfile: RepairerProfile): Promise<RepairerProfile> => {
    console.log('💾 Starting profile save process...');
    console.log('📝 Form data:', formData);
    console.log('📄 Original profile:', originalProfile);

    // Gestion des profils mock (pour les tests)
    if (originalProfile.id.startsWith('mock-')) {
      console.log('🎭 Mock profile detected, simulating save');
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        ...formData,
        updated_at: new Date().toISOString()
      };
    }

    try {
      // Récupérer l'utilisateur actuellement connecté
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ Error getting current user:', authError);
        throw new Error('Utilisateur non authentifié');
      }

      let userId = user?.id;
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }

      console.log('👤 Current authenticated user ID:', userId);

      // Vérifier si un profil existe déjà pour cet utilisateur ou avec cet email
      const existingProfile = await RepairerProfileRepository.findExistingProfile(userId, formData.email);
      console.log('📋 Existing profile search result:', existingProfile);

      // Si pas de profil existant, créer l'utilisateur si nécessaire
      if (!existingProfile) {
        console.log('👤 No existing profile found');
        
        // Vérifier si l'email correspond à un utilisateur différent
        if (formData.email !== user.email) {
          console.log('📧 Email differs from current user, creating new user...');
          const createdUserId = await RepairerUserService.createUserIfNotExists(
            formData.email,
            formData.business_name,
            undefined,
            formData.phone
          );
          
          if (!createdUserId) {
            throw new Error("Impossible de créer l'utilisateur pour cet email");
          }
          userId = createdUserId;
          console.log('✅ User created with ID:', userId);
        }
      } else {
        // Si un profil existe mais avec un user_id différent, utiliser le user_id existant
        if (existingProfile.user_id !== userId && existingProfile.email === formData.email) {
          console.log('🔄 Using existing profile user_id:', existingProfile.user_id);
          userId = existingProfile.user_id;
        }
      }

      // Préparer les données pour Supabase
      const profileData = RepairerProfileMapper.prepareProfileData(formData, userId);
      console.log('📤 Sending profile data to Supabase:', profileData);

      // Sauvegarder ou mettre à jour le profil
      let result;
      if (existingProfile) {
        result = await RepairerProfileRepository.updateProfile(existingProfile.id, profileData);
      } else {
        result = await RepairerProfileRepository.createProfile(profileData);
      }

      console.log('📥 Supabase operation result:', result);

      // Mettre à jour la table repairers si coordonnées géographiques disponibles
      if (formData.geo_lat && formData.geo_lng) {
        await RepairerProfileRepository.updateGeographicCoordinates(
          formData.email,
          formData.geo_lat,
          formData.geo_lng,
          formData.address,
          formData.city,
          formData.postal_code
        );
      }

      // Mapper les données de retour vers l'interface RepairerProfile
      const savedProfile = RepairerProfileMapper.mapDatabaseToProfile(result.data);

      console.log('✅ Profile saved successfully:', savedProfile);
      return savedProfile;
      
    } catch (error: any) {
      console.error('❌ Error in saveProfile:', error);
      throw new Error(error.message || "Erreur lors de la sauvegarde du profil");
    }
  };

  return { saveProfile };
};
