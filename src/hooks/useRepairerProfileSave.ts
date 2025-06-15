
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';

/**
 * Hook pour la sauvegarde des profils réparateurs
 * Gère la création d'utilisateurs et la sauvegarde des profils dans Supabase
 */
export const useRepairerProfileSave = () => {
  /**
   * Crée un utilisateur réparateur s'il n'existe pas déjà
   */
  const createUserIfNotExists = async (
    email: string,
    first_name?: string,
    last_name?: string,
    phone?: string
  ): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      
      console.log('🔧 Creating user with data:', { email, first_name, phone });
      
      const res = await fetch(
        "https://nbugpbakfkyvvjzgfjmw.functions.supabase.co/create-repairer-user",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ email, first_name, last_name, phone }),
        }
      );
      
      const data = await res.json();
      console.log('📥 User creation response:', { status: res.status, data });
      
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `Erreur HTTP ${res.status}`);
      }
      
      return data.user_id as string;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  };

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
      let userId = formData.repairer_id;
      console.log('🔍 Looking for existing profile with user_id:', userId);

      // Vérifier si un profil existe déjà
      const { data: existingProfile, error: searchError } = await supabase
        .from('repairer_profiles')
        .select('id, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (searchError) {
        console.error('❌ Error searching for existing profile:', searchError);
        throw searchError;
      }

      console.log('📋 Existing profile search result:', existingProfile);

      // Si aucun profil existant, créer l'utilisateur
      if (!existingProfile) {
        console.log('👤 No existing profile, creating user...');
        const createdUserId = await createUserIfNotExists(
          formData.email,
          formData.business_name,
          undefined,
          formData.phone
        );
        
        if (!createdUserId) {
          throw new Error("Impossible de créer ou récupérer l'utilisateur");
        }
        userId = createdUserId;
        console.log('✅ User created/retrieved with ID:', userId);
      }

      // Préparer les données pour Supabase
      const profileData = {
        user_id: userId,
        business_name: formData.business_name,
        siret_number: formData.siret_number || null,
        description: formData.description || null,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || null,
        facebook_url: formData.facebook_url || null,
        instagram_url: formData.instagram_url || null,
        linkedin_url: formData.linkedin_url || null,
        twitter_url: formData.twitter_url || null,
        has_qualirepar_label: formData.has_qualirepar_label || false,
        repair_types: formData.repair_types || [],
        updated_at: new Date().toISOString()
      };

      console.log('📤 Sending profile data to Supabase:', profileData);

      // Sauvegarder ou mettre à jour le profil
      let result;
      if (existingProfile) {
        console.log('🔄 Updating existing profile...');
        result = await supabase
          .from('repairer_profiles')
          .update(profileData)
          .eq('id', existingProfile.id)
          .select()
          .single();
      } else {
        console.log('🆕 Creating new profile...');
        result = await supabase
          .from('repairer_profiles')
          .insert(profileData)
          .select()
          .single();
      }

      console.log('📥 Supabase operation result:', result);

      if (result.error) {
        console.error('❌ Supabase save error:', result.error);
        throw new Error(result.error.message || "Erreur lors de l'enregistrement");
      }

      // Mettre à jour la table repairers si coordonnées géographiques disponibles
      if (formData.geo_lat && formData.geo_lng) {
        console.log('🗺️ Updating geographic coordinates...');
        const { data: repairer } = await supabase
          .from('repairers')
          .select('id')
          .eq('email', formData.email)
          .maybeSingle();

        if (repairer) {
          await supabase
            .from('repairers')
            .update({
              lat: formData.geo_lat,
              lng: formData.geo_lng,
              address: formData.address,
              city: formData.city,
              postal_code: formData.postal_code
            })
            .eq('id', repairer.id);
        }
      }

      // Mapper les données de retour vers l'interface RepairerProfile
      const savedProfile: RepairerProfile = {
        id: result.data.id,
        repairer_id: result.data.user_id,
        business_name: result.data.business_name,
        siret_number: result.data.siret_number,
        description: result.data.description,
        address: result.data.address,
        city: result.data.city,
        postal_code: result.data.postal_code,
        phone: result.data.phone,
        email: result.data.email,
        website: result.data.website,
        facebook_url: result.data.facebook_url,
        instagram_url: result.data.instagram_url,
        linkedin_url: result.data.linkedin_url,
        twitter_url: result.data.twitter_url,
        has_qualirepar_label: result.data.has_qualirepar_label,
        repair_types: result.data.repair_types,
        profile_image_url: result.data.profile_image_url,
        created_at: result.data.created_at,
        updated_at: result.data.updated_at
      };

      console.log('✅ Profile saved successfully:', savedProfile);
      return savedProfile;
      
    } catch (error: any) {
      console.error('❌ Error in saveProfile:', error);
      throw new Error(error.message || "Erreur lors de la sauvegarde du profil");
    }
  };

  return { saveProfile };
};
