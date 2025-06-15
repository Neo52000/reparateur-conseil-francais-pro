
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';

export const useRepairerProfileSave = () => {
  const saveProfile = async (formData: RepairerProfile, originalProfile: RepairerProfile): Promise<RepairerProfile> => {
    console.log('Attempting to save profile:', formData);
    
    // Vérifier si c'est un profil mocké (ID commence par "mock-")
    const isMockProfile = originalProfile.id.startsWith('mock-');
    
    if (isMockProfile) {
      console.log('Simulating save for mock profile:', formData);
      
      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Créer un profil mis à jour avec les nouvelles données
      return {
        ...formData,
        updated_at: new Date().toISOString()
      };
    }

    // Préparer les données pour la sauvegarde
    const profileData = {
      repairer_id: formData.repairer_id,
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
      has_qualirepar_label: formData.has_qualirepar_label,
      repair_types: formData.repair_types,
      updated_at: new Date().toISOString()
    };

    console.log('Profile data to save:', profileData);

    // D'abord essayer de mettre à jour un profil existant
    const { data: existingProfile, error: fetchError } = await supabase
      .from('repairer_profiles')
      .select('id')
      .eq('repairer_id', formData.repairer_id)
      .maybeSingle();

    console.log('Existing profile check:', { existingProfile, fetchError });

    let result;
    
    if (existingProfile) {
      // Mettre à jour le profil existant
      console.log('Updating existing profile with ID:', existingProfile.id);
      result = await supabase
        .from('repairer_profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single();
    } else {
      // Créer un nouveau profil
      console.log('Creating new profile for repairer_id:', formData.repairer_id);
      result = await supabase
        .from('repairer_profiles')
        .insert(profileData)
        .select()
        .single();
    }

    console.log('Save result:', result);

    if (result.error) {
      throw result.error;
    }

    return {
      ...result.data,
      id: result.data.id,
    };
  };

  return { saveProfile };
};
