
import { RepairerProfile } from '@/types/repairerProfile';

export const mapFormDataToSupabaseData = (formData: RepairerProfile, userId: string) => {
  return {
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
};

export const mapSupabaseDataToProfile = (data: any): RepairerProfile => {
  return {
    id: data.id,
    repairer_id: data.user_id,
    business_name: data.business_name,
    siret_number: data.siret_number,
    description: data.description,
    address: data.address,
    city: data.city,
    postal_code: data.postal_code,
    phone: data.phone,
    email: data.email,
    website: data.website,
    facebook_url: data.facebook_url,
    instagram_url: data.instagram_url,
    linkedin_url: data.linkedin_url,
    twitter_url: data.twitter_url,
    has_qualirepar_label: data.has_qualirepar_label,
    repair_types: data.repair_types,
    profile_image_url: data.profile_image_url,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};
