
import { supabase } from '@/integrations/supabase/client';
import type { RepairerCatalogPreference, RepairerBrandSetting, CatalogTreeNode } from '@/types/repairerCatalog';

export class RepairerCatalogService {
  /**
   * Récupérer toutes les préférences de catalogue d'un réparateur
   */
  static async getRepairerCatalogPreferences(repairerId: string): Promise<RepairerCatalogPreference[]> {
    const { data, error } = await supabase
      .from('repairer_catalog_preferences')
      .select('*')
      .eq('repairer_id', repairerId);

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      entity_type: item.entity_type as 'brand' | 'device_model' | 'repair_type'
    }));
  }

  /**
   * Récupérer tous les paramètres de marques d'un réparateur
   */
  static async getRepairerBrandSettings(repairerId: string): Promise<RepairerBrandSetting[]> {
    const { data, error } = await supabase
      .from('repairer_brand_settings')
      .select('*')
      .eq('repairer_id', repairerId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Récupérer le catalogue complet avec les préférences du réparateur
   */
  static async getFullCatalogWithPreferences(repairerId: string) {
    try {
      // Récupérer toutes les données du catalogue
      const [brandsResponse, modelsResponse, repairTypesResponse, pricesResponse] = await Promise.all([
        supabase.from('brands').select('*').order('name'),
        supabase.from('device_models').select(`
          *,
          brand:brands(*)
        `).eq('is_active', true).order('model_name'),
        supabase.from('repair_types').select(`
          *,
          category:repair_categories(*)
        `).eq('is_active', true).order('name'),
        supabase.from('repair_prices').select(`
          *,
          device_model:device_models(*),
          repair_type:repair_types(*)
        `).eq('is_available', true)
      ]);

      // Récupérer les préférences et prix personnalisés du réparateur
      const [preferencesResponse, brandSettingsResponse, customPricesResponse] = await Promise.all([
        this.getRepairerCatalogPreferences(repairerId),
        this.getRepairerBrandSettings(repairerId),
        supabase.from('repairer_custom_prices').select('*').eq('repairer_id', repairerId)
      ]);

      if (brandsResponse.error) throw brandsResponse.error;
      if (modelsResponse.error) throw modelsResponse.error;
      if (repairTypesResponse.error) throw repairTypesResponse.error;
      if (pricesResponse.error) throw pricesResponse.error;
      if (customPricesResponse.error) throw customPricesResponse.error;

      const brands = brandsResponse.data || [];
      const models = modelsResponse.data || [];
      const repairTypes = repairTypesResponse.data || [];
      const basePrices = pricesResponse.data || [];
      const preferences = preferencesResponse;
      const brandSettings = brandSettingsResponse;
      const customPrices = customPricesResponse.data || [];

      // Construire l'arbre du catalogue
      const catalogTree = this.buildCatalogTree(
        brands,
        models,
        repairTypes,
        basePrices,
        preferences,
        brandSettings,
        customPrices
      );

      return {
        catalogTree,
        stats: {
          totalBrands: brands.length,
          totalModels: models.length,
          totalRepairTypes: repairTypes.length,
          totalBasePrices: basePrices.length,
          customPricesCount: customPrices.length,
          activeBrands: brandSettings.filter(bs => bs.is_active).length,
          inactiveBrands: brandSettings.filter(bs => !bs.is_active).length
        }
      };
    } catch (error) {
      console.error('Error fetching full catalog:', error);
      throw error;
    }
  }

  /**
   * Construire l'arbre hiérarchique du catalogue
   */
  private static buildCatalogTree(
    brands: any[],
    models: any[],
    repairTypes: any[],
    basePrices: any[],
    preferences: RepairerCatalogPreference[],
    brandSettings: RepairerBrandSetting[],
    customPrices: any[]
  ): CatalogTreeNode[] {
    const tree: CatalogTreeNode[] = [];

    brands.forEach(brand => {
      const brandSetting = brandSettings.find(bs => bs.brand_id === brand.id);
      const brandPreference = preferences.find(p => p.entity_type === 'brand' && p.entity_id === brand.id);
      
      const brandNode: CatalogTreeNode = {
        id: brand.id,
        name: brand.name,
        type: 'brand',
        is_active: brandSetting?.is_active ?? brandPreference?.is_active ?? true,
        margin_percentage: brandSetting?.default_margin_percentage || brandPreference?.default_margin_percentage,
        children: []
      };

      // Ajouter les modèles de cette marque
      const brandModels = models.filter(model => model.brand_id === brand.id);
      brandModels.forEach(model => {
        const modelPreference = preferences.find(p => p.entity_type === 'device_model' && p.entity_id === model.id);
        
        const modelNode: CatalogTreeNode = {
          id: model.id,
          name: model.model_name,
          type: 'device_model',
          is_active: modelPreference?.is_active ?? true,
          margin_percentage: modelPreference?.default_margin_percentage,
          children: [],
          prices: []
        };

        // Ajouter les prix de réparation pour ce modèle
        repairTypes.forEach(repairType => {
          const basePrice = basePrices.find(bp => 
            bp.device_model_id === model.id && bp.repair_type_id === repairType.id
          );
          
          if (basePrice) {
            const customPrice = customPrices.find(cp => cp.repair_price_id === basePrice.id);
            const repairTypePreference = preferences.find(p => 
              p.entity_type === 'repair_type' && p.entity_id === repairType.id
            );

            const priceNode = {
              id: basePrice.id,
              name: repairType.name,
              type: 'repair_type',
              is_active: repairTypePreference?.is_active ?? true,
              base_price: basePrice.price_eur,
              custom_price: customPrice?.custom_price_eur,
              price_type: customPrice?.price_type || 'fixed',
              is_starting_price: customPrice?.is_starting_price || false,
              margin_percentage: customPrice?.margin_percentage,
              has_custom_price: !!customPrice
            };

            modelNode.prices!.push(priceNode);
          }
        });

        brandNode.children!.push(modelNode);
      });

      tree.push(brandNode);
    });

    return tree;
  }

  /**
   * Sauvegarder une préférence de catalogue
   */
  static async saveCatalogPreference(data: Omit<RepairerCatalogPreference, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('repairer_catalog_preferences')
      .upsert([data], {
        onConflict: 'repairer_id,entity_type,entity_id'
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  /**
   * Sauvegarder un paramètre de marque
   */
  static async saveBrandSetting(data: Omit<RepairerBrandSetting, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('repairer_brand_settings')
      .upsert([data], {
        onConflict: 'repairer_id,brand_id'
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  /**
   * Actions en masse
   */
  static async bulkUpdateCatalogItems(
    repairerId: string,
    updates: Array<{
      entity_type: 'brand' | 'device_model' | 'repair_type';
      entity_id: string;
      is_active?: boolean;
      margin_percentage?: number;
    }>
  ) {
    const operations = updates.map(update => ({
      repairer_id: repairerId,
      entity_type: update.entity_type,
      entity_id: update.entity_id,
      is_active: update.is_active ?? true,
      default_margin_percentage: update.margin_percentage
    }));

    const { data, error } = await supabase
      .from('repairer_catalog_preferences')
      .upsert(operations, {
        onConflict: 'repairer_id,entity_type,entity_id'
      });

    if (error) throw error;
    return data;
  }
}
