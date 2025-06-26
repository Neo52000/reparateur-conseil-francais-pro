
import type { Database } from '@/integrations/supabase/types';
import type { Repairer } from '@/types/repairer';

type SupabaseRepairer = Database['public']['Tables']['repairers']['Row'];

export class RepairersDataTransformer {
  static transformSupabaseData(data: SupabaseRepairer[]): Repairer[] {
    return data.map((repairer: SupabaseRepairer): Repairer => ({
      id: repairer.id,
      name: repairer.name,
      business_name: repairer.name,
      address: repairer.address,
      city: repairer.city,
      postal_code: repairer.postal_code,
      department: repairer.department || '',
      region: repairer.region || '',
      phone: repairer.phone || undefined,
      website: repairer.website || undefined,
      email: repairer.email || undefined,
      lat: Number(repairer.lat) || 0,
      lng: Number(repairer.lng) || 0,
      rating: repairer.rating || undefined,
      review_count: repairer.review_count || undefined,
      services: repairer.services || [],
      specialties: repairer.specialties || [],
      price_range: (repairer.price_range === 'low' || repairer.price_range === 'medium' || repairer.price_range === 'high') 
        ? repairer.price_range 
        : 'medium',
      response_time: repairer.response_time || undefined,
      opening_hours: repairer.opening_hours ? 
        (typeof repairer.opening_hours === 'object' ? repairer.opening_hours as Record<string, string> : null) : 
        null,
      is_verified: repairer.is_verified || false,
      is_open: repairer.is_open || undefined,
      has_qualirepar_label: false,
      source: repairer.source as 'pages_jaunes' | 'google_places' | 'manual',
      scraped_at: repairer.scraped_at,
      updated_at: repairer.updated_at,
      created_at: repairer.created_at
    }));
  }
}
