
/**
 * Index central pour tous les services de l'application
 */

// Services de données
export { RepairersDataService } from './repairers/repairersDataService';
export { RepairersDataTransformer } from './repairers/repairersDataTransformer';
export { PriorityRepairersService } from './repairers/priorityRepairersService';

// Services d'authentification
export { authService } from './authService';

// Services de profil
export { profileService } from './profileService';
export { RepairerProfileRepository } from './repairerProfileRepository';

// Services de géocodage
export { GeocodingService } from '../utils/GeocodingService';

// Services de scraping
export { ScrapingOrchestrator } from './scraping/ScrapingOrchestrator';
export { PlaywrightScraper } from './scraping/PlaywrightScraper';

// Services de catalogue
export { brandsService } from './catalog/brandsService';
export { deviceModelsService } from './catalog/deviceModelsService';
export { deviceTypesService } from './catalog/deviceTypesService';
export { repairTypesService } from './catalog/repairTypesService';

// Services de prix
export { RepairerCatalogService } from './pricing/repairerCatalogService';
export { RepairerCustomPricesService } from './pricing/repairerCustomPricesService';

// Services de publicité IA
export { AdvertisingCampaignService } from './advertising/AdvertisingCampaignService';
export { CatalogSyncService } from './advertising/CatalogSyncService';
export { BudgetOptimizationService } from './advertising/BudgetOptimizationService';

// Services de blog
export { ContentCleaner } from './blog/contentCleaner';
export { ContentValidator } from './blog/contentValidator';

// Services de paiement
export { PaymentService } from './paymentService';

// Services d'audit
export { AdminAuditService } from './adminAuditService';

// Services de documentation
export { DocumentationPDFService } from './documentationPDFService';
export { DocumentationManagerService } from './documentationManagerService';

// Services NF203 - Conformité comptable
export { NF203ChainService } from './nf203ChainService';
export type { ChainIntegrityReport, ChainEntry, AuditEntry } from './nf203ChainService';
