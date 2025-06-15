
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';

const createUserIfNotExists = async (
  email: string,
  first_name?: string,
  last_name?: string,
  phone?: string
): Promise<string | null> => {
  // Appelle la fonction edge Supabase pour créer/utiliser l’utilisateur
  const res = await fetch(
    "https://nbugpbakfkyvvjzgfjmw.functions.supabase.co/create-repairer-user",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, first_name, last_name, phone }),
    }
  );
  const data = await res.json();
  if (!res.ok || data?.error) {
    const msg = data?.error || "Erreur lors de la création du compte réparateur";
    throw new Error(msg);
  }
  return data.user_id as string;
};

export const useRepairerProfileSave = () => {
  const saveProfile = async (formData: RepairerProfile, originalProfile: RepairerProfile): Promise<RepairerProfile> => {
    console.log('Attempting to save profile:', formData);

    // Si c’est un profil mock (existant)
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

    const { data: existingProfile } = await supabase
      .from('repairer_profiles')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    // Si profil non trouvé, s’assurer que l’utilisateur existe sinon le créer
    if (!existingProfile) {
      // Cherche par email dans auth.users via edge function (plus sûr)
      userId = await createUserIfNotExists(
        formData.email,
        // Optionnellement on peut améliorer : enregistrer nom/phone depuis nouveaux champs pro
        formData?.business_name ?? "",
        undefined,
        formData?.phone ?? ""
      );
    }

    // Structure des données à enregistrer dans Supabase
    const supabaseData = {
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
      has_qualirepar_label: formData.has_qualirepar_label,
      repair_types: formData.repair_types,
      updated_at: new Date().toISOString()
    };

    // Vérifie si le repairer_profiles existe déjà : update sinon insert
    let result;
    if (existingProfile) {
      console.log('Updating existing profile with ID:', existingProfile.id);
      result = await supabase
        .from('repairer_profiles')
        .update(supabaseData)
        .eq('id', existingProfile.id)
        .select()
        .single();
    } else {
      console.log('Creating new profile for repairer_id/user_id:', userId);
      result = await supabase
        .from('repairer_profiles')
        .insert(supabaseData)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Supabase save error:', result.error);
      if (String(result.error.message).includes('violates foreign key constraint')) {
        throw new Error("Impossible d'enregistrer le profil : le compte utilisateur n’a pas pu être créé ou une erreur s’est produite.");
      }
      throw result.error;
    }

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
