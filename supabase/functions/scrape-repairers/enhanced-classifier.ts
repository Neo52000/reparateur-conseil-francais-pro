
import { BusinessData, ClassificationResult } from './types.ts';
import { classifyRepairer } from './classifier.ts';
import { GouvernementApiService } from './gouvernement-api-service.ts';
import { GouvernementCache } from './gouvernement-cache.ts';

export interface EnhancedClassificationResult extends ClassificationResult {
  gouvernement_verified: boolean;
  siret?: string;
  siren?: string;
  business_status: string;
  verification_method: string;
  gouvernement_data?: any;
}

export class EnhancedClassifier {
  private gouvernementService: GouvernementApiService;
  private gouvernementCache: GouvernementCache;

  constructor(supabase: any) {
    this.gouvernementService = new GouvernementApiService();
    this.gouvernementCache = new GouvernementCache(supabase);
  }

  async classifyRepairerWithGouvernement(businessData: BusinessData): Promise<EnhancedClassificationResult> {
    // 1. Classification de base par mots-clés
    const basicClassification = classifyRepairer(businessData);

    // 2. Vérifier si l'entreprise est déjà dans la liste des fermées
    const isInClosedList = await this.gouvernementCache.isBusinessInClosedList(
      businessData.name, 
      businessData.city
    );

    if (isInClosedList) {
      console.log(`❌ Entreprise déjà dans la liste des fermées: ${businessData.name}`);
      return {
        ...basicClassification,
        is_repairer: false,
        confidence: 0,
        gouvernement_verified: true,
        business_status: 'closed',
        verification_method: 'cached_closed'
      };
    }

    // 3. Si c'est potentiellement un réparateur, vérifier avec l'API Gouvernement
    if (basicClassification.is_repairer && basicClassification.confidence > 0.5) {
      try {
        // Vérifier le cache d'abord
        const siret = this.gouvernementService.extractSiretFromBusinessData(businessData);
        let cachedResult = null;
        
        if (siret) {
          cachedResult = await this.gouvernementCache.getCachedVerification(siret);
        }

        if (cachedResult) {
          console.log(`💾 Utilisation du cache Gouvernement pour ${businessData.name}`);
          
          if (!cachedResult.is_active) {
            // Entreprise fermée, sauvegarder dans la liste des fermées si pas déjà fait
            await this.gouvernementCache.saveClosedBusiness({
              siret: cachedResult.siret,
              siren: cachedResult.siren,
              name: businessData.name,
              address: businessData.address,
              city: businessData.city,
              postal_code: businessData.postal_code,
              status: cachedResult.business_status,
              gouvernement_data: cachedResult.gouvernement_data
            });
          }

          return {
            ...basicClassification,
            is_repairer: basicClassification.is_repairer && cachedResult.is_active,
            confidence: cachedResult.is_active ? basicClassification.confidence : 0,
            gouvernement_verified: true,
            siret: cachedResult.siret,
            siren: cachedResult.siren,
            business_status: cachedResult.business_status,
            verification_method: 'cached',
            gouvernement_data: cachedResult.gouvernement_data
          };
        }

        // Pas de cache, faire la vérification
        console.log(`🔍 Vérification API Gouvernement pour ${businessData.name}`);
        const gouvernementResult = await this.gouvernementService.verifyBusinessStatus(businessData);

        // Sauvegarder dans le cache
        if (gouvernementResult.siret) {
          await this.gouvernementCache.saveCacheEntry({
            siret: gouvernementResult.siret,
            siren: gouvernementResult.siren,
            is_active: gouvernementResult.isActive,
            business_status: gouvernementResult.businessStatus,
            gouvernement_data: gouvernementResult.gouvernementData
          });
        }

        // Si l'entreprise est fermée, l'ajouter à la liste des fermées
        if (!gouvernementResult.isActive && gouvernementResult.siret) {
          await this.gouvernementCache.saveClosedBusiness({
            siret: gouvernementResult.siret,
            siren: gouvernementResult.siren,
            name: businessData.name,
            address: businessData.address,
            city: businessData.city,
            postal_code: businessData.postal_code,
            status: gouvernementResult.businessStatus,
            gouvernement_data: gouvernementResult.gouvernementData
          });
        }

        return {
          ...basicClassification,
          is_repairer: basicClassification.is_repairer && gouvernementResult.isActive,
          confidence: gouvernementResult.isActive ? basicClassification.confidence : 0,
          gouvernement_verified: gouvernementResult.verificationMethod !== 'no_verification',
          siret: gouvernementResult.siret,
          siren: gouvernementResult.siren,
          business_status: gouvernementResult.businessStatus,
          verification_method: gouvernementResult.verificationMethod,
          gouvernement_data: gouvernementResult.gouvernementData
        };

      } catch (error) {
        console.error('Erreur lors de la vérification API Gouvernement:', error);
        
        // En cas d'erreur, retourner la classification de base
        return {
          ...basicClassification,
          gouvernement_verified: false,
          business_status: 'unknown',
          verification_method: 'error'
        };
      }
    }

    // Si ce n'est pas un réparateur selon la classification de base
    return {
      ...basicClassification,
      gouvernement_verified: false,
      business_status: 'unknown',
      verification_method: 'not_needed'
    };
  }
}
