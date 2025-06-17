
export interface CacheEntry {
  siret: string;
  siren?: string;
  is_active: boolean;
  business_status: string;
  pappers_data?: any;
  last_verified: string;
}

export class PappersCache {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async getCachedVerification(siret: string): Promise<CacheEntry | null> {
    try {
      const { data, error } = await this.supabase
        .from('pappers_verification_cache')
        .select('*')
        .eq('siret', siret)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la récupération du cache Pappers:', error);
        return null;
      }

      // Vérifier si le cache n'est pas trop ancien (7 jours)
      if (data) {
        const lastVerified = new Date(data.last_verified);
        const now = new Date();
        const daysSinceLastCheck = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastCheck < 7) {
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur cache Pappers:', error);
      return null;
    }
  }

  async saveCacheEntry(entry: Omit<CacheEntry, 'last_verified'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('pappers_verification_cache')
        .upsert({
          ...entry,
          last_verified: new Date().toISOString()
        }, {
          onConflict: 'siret'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde du cache Pappers:', error);
      }
    } catch (error) {
      console.error('Erreur sauvegarde cache Pappers:', error);
    }
  }

  async saveClosedBusiness(businessData: {
    siret?: string;
    siren?: string;
    name: string;
    address?: string;
    city?: string;
    postal_code?: string;
    status: string;
    closure_date?: string;
    pappers_data?: any;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('closed_businesses')
        .insert({
          ...businessData,
          verification_date: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde de l\'entreprise fermée:', error);
      } else {
        console.log(`📝 Entreprise fermée enregistrée: ${businessData.name}`);
      }
    } catch (error) {
      console.error('Erreur sauvegarde entreprise fermée:', error);
    }
  }

  async isBusinessInClosedList(name: string, city?: string): Promise<boolean> {
    try {
      let query = this.supabase
        .from('closed_businesses')
        .select('id')
        .eq('name', name);

      if (city) {
        query = query.eq('city', city);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Erreur lors de la vérification des entreprises fermées:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erreur vérification entreprises fermées:', error);
      return false;
    }
  }
}
