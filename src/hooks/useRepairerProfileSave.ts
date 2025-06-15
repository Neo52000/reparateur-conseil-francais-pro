
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

    // Préparer les données pour Supabase - mapper repairer_id vers user_id
    const supabaseData = {
      user_id: formData.repairer_id,
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

    console.log('Supabase data to save:', supabaseData);

    // Vérifier si un profil existe déjà
    const { data: existingProfile, error: fetchError } = await supabase
      .from('repairer_profiles')
      .select('id')
      .eq('user_id', formData.repairer_id)
      .maybeSingle();

    console.log('Existing profile check:', { existingProfile, fetchError });

    let result;
    
    if (existingProfile) {
      // Mettre à jour le profil existant
      console.log('Updating existing profile with ID:', existingProfile.id);
      result = await supabase
        .from('repairer_profiles')
        .update(supabaseData)
        .eq('id', existingProfile.id)
        .select()
        .single();
    } else {
      // Créer un nouveau profil
      console.log('Creating new profile for repairer_id:', formData.repairer_id);
      result = await supabase
        .from('repairer_profiles')
        .insert(supabaseData)
        .select()
        .single();
    }

    console.log('Save result:', result);

    if (result.error) {
      console.error('Supabase save error:', result.error);
      throw result.error;
    }

    // Mapper la réponse vers notre interface
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

    console.log('Mapped saved profile:', savedProfile);
    return savedProfile;
  };

  return { saveProfile };
};
