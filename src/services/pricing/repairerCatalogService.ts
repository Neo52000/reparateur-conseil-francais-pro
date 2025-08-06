
import { CatalogDataService } from './catalogDataService';
import { CatalogTreeBuilder } from './catalogTreeBuilder';
import { CatalogPreferencesService } from './catalogPreferencesService';
import type { RepairerCatalogPreference, RepairerBrandSetting } from '@/types/repairerCatalog';

export class RepairerCatalogService {
  /**
   * Récupérer toutes les préférences de catalogue d'un réparateur
   */
  static async getRepairerCatalogPreferences(repairerId: string): Promise<RepairerCatalogPreference[]> {
    return CatalogDataService.getRepairerCatalogPreferences(repairerId);
  }

  /**
   * Récupérer tous les paramètres de marques d'un réparateur
   */
  static async getRepairerBrandSettings(repairerId: string): Promise<RepairerBrandSetting[]> {
    return CatalogDataService.getRepairerBrandSettings(repairerId);
  }

  /**
   * Récupérer le catalogue complet avec les préférences du réparateur
   */
  static async getFullCatalogWithPreferences(repairerId: string) {
    try {
      // Récupérer toutes les données du catalogue
      const { brands, models, repairTypes, basePrices } = await CatalogDataService.getBaseCatalogData();

      // Récupérer les préférences et prix personnalisés du réparateur
      const [preferences, brandSettings, customPrices] = await Promise.all([
        this.getRepairerCatalogPreferences(repairerId),
        this.getRepairerBrandSettings(repairerId),
        CatalogDataService.getCustomPrices(repairerId)
      ]);

      // Construire l'arbre du catalogue
      const catalogTree = CatalogTreeBuilder.buildCatalogTree(
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
   * Sauvegarder une préférence de catalogue
   */
  static async saveCatalogPreference(data: Omit<RepairerCatalogPreference, 'id' | 'created_at' | 'updated_at'>) {
    return CatalogPreferencesService.saveCatalogPreference(data);
  }

  /**
   * Sauvegarder un paramètre de marque
   */
  static async saveBrandSetting(data: Omit<RepairerBrandSetting, 'id' | 'created_at' | 'updated_at'>) {
    return CatalogPreferencesService.saveBrandSetting(data);
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
    return CatalogPreferencesService.bulkUpdateCatalogItems(repairerId, updates);
  }
}
