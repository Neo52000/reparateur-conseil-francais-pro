
import { RepairerProfile } from '@/types/repairerProfile';

/**
 * Service pour la transformation des données entre les formats
 */
export class RepairerProfileMapper {
  /**
   * Prépare les données pour l'insertion/mise à jour dans Supabase
   */
  static prepareProfileData(formData: RepairerProfile, userId: string) {
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
      whatsapp_url: formData.whatsapp_url || null,
      telegram_url: formData.telegram_url || null,
      tiktok_url: formData.tiktok_url || null,
      has_qualirepar_label: formData.has_qualirepar_label || false,
      repair_types: formData.repair_types || [],
      // Nouvelles colonnes ajoutées
      opening_hours: formData.opening_hours || null,
      services_offered: formData.services_offered || [],
      certifications: formData.certifications || [],
      years_experience: formData.years_experience || null,
      languages_spoken: formData.languages_spoken || [],
      payment_methods: formData.payment_methods || [],
      warranty_duration: formData.warranty_duration || null,
      response_time: formData.response_time || null,
      emergency_service: formData.emergency_service || false,
      home_service: formData.home_service || false,
      pickup_service: formData.pickup_service || false,
      pricing_info: formData.pricing_info || null,
      shop_photos: formData.shop_photos || [],
      other_services: formData.other_services || null,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Mappe les données de retour vers l'interface RepairerProfile
   */
  static mapDatabaseToProfile(data: any): RepairerProfile {
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
      whatsapp_url: data.whatsapp_url,
      telegram_url: data.telegram_url,
      tiktok_url: data.tiktok_url,
      has_qualirepar_label: data.has_qualirepar_label,
      repair_types: data.repair_types,
      profile_image_url: data.profile_image_url,
      // Mapper les nouvelles colonnes
      opening_hours: data.opening_hours,
      services_offered: data.services_offered,
      certifications: data.certifications,
      years_experience: data.years_experience,
      languages_spoken: data.languages_spoken,
      payment_methods: data.payment_methods,
      warranty_duration: data.warranty_duration,
      response_time: data.response_time,
      emergency_service: data.emergency_service,
      home_service: data.home_service,
      pickup_service: data.pickup_service,
      pricing_info: data.pricing_info,
      shop_photos: data.shop_photos || [],
      other_services: data.other_services,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}
