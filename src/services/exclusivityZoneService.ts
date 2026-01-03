import { supabase } from '@/integrations/supabase/client';

export interface ExclusivityZone {
  id: string;
  city_slug: string;
  city_name: string;
  postal_codes: string[];
  radius_km: number;
  repairer_id: string | null;
  starts_at: string;
  expires_at: string | null;
  monthly_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class ExclusivityZoneService {
  /**
   * Vérifie si une zone est disponible
   */
  async isZoneAvailable(citySlug: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('exclusivity_zones')
      .select('id')
      .eq('city_slug', citySlug)
      .eq('is_active', true)
      .not('repairer_id', 'is', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur vérification zone:', error);
    }

    return !data;
  }

  /**
   * Récupère le partenaire exclusif d'une zone
   */
  async getExclusivePartner(citySlug: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('exclusivity_zones')
      .select('repairer_id')
      .eq('city_slug', citySlug)
      .eq('is_active', true)
      .not('repairer_id', 'is', null)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Erreur récupération partenaire:', error);
      }
      return null;
    }

    return data?.repairer_id || null;
  }

  /**
   * Récupère toutes les zones actives
   */
  async getActiveZones(): Promise<ExclusivityZone[]> {
    const { data, error } = await supabase
      .from('exclusivity_zones')
      .select('*')
      .eq('is_active', true)
      .order('city_name');

    if (error) {
      console.error('Erreur récupération zones:', error);
      return [];
    }

    return (data || []) as ExclusivityZone[];
  }

  /**
   * Récupère les zones disponibles (non attribuées)
   */
  async getAvailableZones(): Promise<ExclusivityZone[]> {
    const { data, error } = await supabase
      .from('exclusivity_zones')
      .select('*')
      .eq('is_active', true)
      .is('repairer_id', null)
      .order('city_name');

    if (error) {
      console.error('Erreur récupération zones disponibles:', error);
      return [];
    }

    return (data || []) as ExclusivityZone[];
  }

  /**
   * Attribue une zone à un réparateur
   */
  async assignZone(zoneId: string, repairerId: string): Promise<boolean> {
    const { error } = await supabase
      .from('exclusivity_zones')
      .update({
        repairer_id: repairerId,
        starts_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', zoneId);

    if (error) {
      console.error('Erreur attribution zone:', error);
      return false;
    }

    // Mettre à jour le niveau du réparateur à 3
    await supabase
      .from('repairer_profiles')
      .update({
        repairer_level: 3,
        exclusivity_zone_id: zoneId
      })
      .eq('id', repairerId);

    return true;
  }

  /**
   * Libère une zone
   */
  async releaseZone(zoneId: string): Promise<boolean> {
    // D'abord récupérer le réparateur associé
    const { data: zone } = await supabase
      .from('exclusivity_zones')
      .select('repairer_id')
      .eq('id', zoneId)
      .single();

    if (zone?.repairer_id) {
      // Downgrade le réparateur à niveau 2
      await supabase
        .from('repairer_profiles')
        .update({
          repairer_level: 2,
          exclusivity_zone_id: null
        })
        .eq('id', zone.repairer_id);
    }

    const { error } = await supabase
      .from('exclusivity_zones')
      .update({
        repairer_id: null,
        expires_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', zoneId);

    if (error) {
      console.error('Erreur libération zone:', error);
      return false;
    }

    return true;
  }

  /**
   * Crée une nouvelle zone d'exclusivité
   */
  async createZone(input: {
    citySlug: string;
    cityName: string;
    postalCodes: string[];
    radiusKm?: number;
    monthlyPrice?: number;
  }): Promise<ExclusivityZone | null> {
    const { data, error } = await supabase
      .from('exclusivity_zones')
      .insert({
        city_slug: input.citySlug,
        city_name: input.cityName,
        postal_codes: input.postalCodes,
        radius_km: input.radiusKm || 10,
        monthly_price: input.monthlyPrice || 299,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création zone:', error);
      return null;
    }

    return data as ExclusivityZone;
  }
}

export const exclusivityZoneService = new ExclusivityZoneService();
export default exclusivityZoneService;
