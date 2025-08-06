
import type { CatalogTreeNode, RepairerCatalogPreference, RepairerBrandSetting } from '@/types/repairerCatalog';

export class CatalogTreeBuilder {
  /**
   * Construire l'arbre hiérarchique du catalogue
   */
  static buildCatalogTree(
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
        const modelNode = this.buildModelNode(model, repairTypes, basePrices, preferences, customPrices);
        brandNode.children!.push(modelNode);
      });

      tree.push(brandNode);
    });

    return tree;
  }

  private static buildModelNode(
    model: any,
    repairTypes: any[],
    basePrices: any[],
    preferences: RepairerCatalogPreference[],
    customPrices: any[]
  ): CatalogTreeNode {
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
        const priceNode = this.buildPriceNode(basePrice, repairType, customPrices, preferences);
        modelNode.prices!.push(priceNode);
      }
    });

    return modelNode;
  }

  private static buildPriceNode(
    basePrice: any,
    repairType: any,
    customPrices: any[],
    preferences: RepairerCatalogPreference[]
  ) {
    const customPrice = customPrices.find(cp => cp.repair_price_id === basePrice.id);
    const repairTypePreference = preferences.find(p => 
      p.entity_type === 'repair_type' && p.entity_id === repairType.id
    );

    return {
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
  }
}
