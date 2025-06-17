
import { BusinessData, ClassificationResult } from './types.ts';
import { classifyRepairer } from './classifier.ts';
import { PappersService } from './pappers-service.ts';
import { PappersCache } from './pappers-cache.ts';

export interface EnhancedClassificationResult extends ClassificationResult {
  pappers_verified: boolean;
  siret?: string;
  siren?: string;
  business_status: string;
  verification_method: string;
  pappers_data?: any;
}

export class EnhancedClassifier {
  private pappersService: PappersService;
  private pappersCache: PappersCache;

  constructor(pappersApiKey: string, supabase: any) {
    this.pappersService = new PappersService(pappersApiKey);
    this.pappersCache = new PappersCache(supabase);
  }

  async classifyRepairerWithPappers(businessData: BusinessData): Promise<EnhancedClassificationResult> {
    // 1. Classification de base par mots-clés
    const basicClassification = classifyRepairer(businessData);

    // 2. Vérifier si l'entreprise est déjà dans la liste des fermées
    const isInClosedList = await this.pappersCache.isBusinessInClosedList(
      businessData.name, 
      businessData.city
    );

    if (isInClosedList) {
      console.log(`❌ Entreprise déjà dans la liste des fermées: ${businessData.name}`);
      return {
        ...basicClassification,
        is_repairer: false,
        confidence: 0,
        pappers_verified: true,
        business_status: 'closed',
        verification_method: 'cached_closed'
      };
    }

    // 3. Si c'est potentiellement un réparateur, vérifier avec Pappers
    if (basicClassification.is_repairer && basicClassification.confidence > 0.5) {
      try {
        // Vérifier le cache d'abord
        const siret = this.pappersService.extractSiretFromBusinessData(businessData);
        let cachedResult = null;
        
        if (siret) {
          cachedResult = await this.pappersCache.getCachedVerification(siret);
        }

        if (cachedResult) {
          console.log(`💾 Utilisation du cache Pappers pour ${businessData.name}`);
          
          if (!cachedResult.is_active) {
            // Entreprise fermée, sauvegarder dans la liste des fermées si pas déjà fait
            await this.pappersCache.saveClosedBusiness({
              siret: cachedResult.siret,
              siren: cachedResult.siren,
              name: businessData.name,
              address: businessData.address,
              city: businessData.city,
              postal_code: businessData.postal_code,
              status: cachedResult.business_status,
              pappers_data: cachedResult.pappers_data
            });
          }

          return {
            ...basicClassification,
            is_repairer: basicClassification.is_repairer && cachedResult.is_active,
            confidence: cachedResult.is_active ? basicClassification.confidence : 0,
            pappers_verified: true,
            siret: cachedResult.siret,
            siren: cachedResult.siren,
            business_status: cachedResult.business_status,
            verification_method: 'cached',
            pappers_data: cachedResult.pappers_data
          };
        }

        // Pas de cache, faire la vérification
        console.log(`🔍 Vérification Pappers pour ${businessData.name}`);
        const pappersResult = await this.pappersService.verifyBusinessStatus(businessData);

        // Sauvegarder dans le cache
        if (pappersResult.siret) {
          await this.pappersCache.saveCacheEntry({
            siret: pappersResult.siret,
            siren: pappersResult.siren,
            is_active: pappersResult.isActive,
            business_status: pappersResult.businessStatus,
            pappers_data: pappersResult.pappersData
          });
        }

        // Si l'entreprise est fermée, l'ajouter à la liste des fermées
        if (!pappersResult.isActive && pappersResult.siret) {
          await this.pappersCache.saveClosedBusiness({
            siret: pappersResult.siret,
            siren: pappersResult.siren,
            name: businessData.name,
            address: businessData.address,
            city: businessData.city,
            postal_code: businessData.postal_code,
            status: pappersResult.businessStatus,
            pappers_data: pappersResult.pappersData
          });
        }

        return {
          ...basicClassification,
          is_repairer: basicClassification.is_repairer && pappersResult.isActive,
          confidence: pappersResult.isActive ? basicClassification.confidence : 0,
          pappers_verified: pappersResult.verificationMethod !== 'no_verification',
          siret: pappersResult.siret,
          siren: pappersResult.siren,
          business_status: pappersResult.businessStatus,
          verification_method: pappersResult.verificationMethod,
          pappers_data: pappersResult.pappersData
        };

      } catch (error) {
        console.error('Erreur lors de la vérification Pappers:', error);
        
        // En cas d'erreur, retourner la classification de base
        return {
          ...basicClassification,
          pappers_verified: false,
          business_status: 'unknown',
          verification_method: 'error'
        };
      }
    }

    // Si ce n'est pas un réparateur selon la classification de base
    return {
      ...basicClassification,
      pappers_verified: false,
      business_status: 'unknown',
      verification_method: 'not_needed'
    };
  }
}
