
import { BusinessData, ClassificationResult } from './types.ts';

interface PappersResponse {
  entreprise: {
    siren: string;
    siret_siege: string;
    denomination: string;
    nom_commercial?: string;
    adresse_ligne_1: string;
    adresse_ligne_2?: string;
    code_postal: string;
    ville: string;
    etat_administratif: string; // 'A' = Actif, 'C' = Cessé
    date_cessation?: string;
    date_creation: string;
    activite_principale: string;
  };
}

interface PappersSearchResponse {
  resultats: Array<{
    siren: string;
    siret_siege: string;
    denomination: string;
    nom_commercial?: string;
    adresse: string;
    code_postal: string;
    ville: string;
    etat_administratif: string;
    score: number;
  }>;
}

export class PappersService {
  private apiKey: string;
  private baseUrl = 'https://api.pappers.fr/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchCompanyBySiret(siret: string): Promise<PappersResponse | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/entreprise?api_token=${this.apiKey}&siret=${siret}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn(`Pappers API error for SIRET ${siret}:`, response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'appel API Pappers:', error);
      return null;
    }
  }

  async searchCompaniesByName(name: string, city?: string): Promise<PappersSearchResponse | null> {
    try {
      let url = `${this.baseUrl}/recherche?api_token=${this.apiKey}&q=${encodeURIComponent(name)}`;
      if (city) {
        url += `&ville=${encodeURIComponent(city)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Pappers search API error for ${name}:`, response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la recherche Pappers:', error);
      return null;
    }
  }

  isCompanyActive(pappersData: PappersResponse): boolean {
    return pappersData.entreprise.etat_administratif === 'A';
  }

  extractSiretFromBusinessData(businessData: BusinessData): string | null {
    // Tenter d'extraire le SIRET depuis la description ou d'autres champs
    const text = `${businessData.description || ''} ${businessData.name} ${businessData.category || ''}`;
    const siretRegex = /\b\d{14}\b/g;
    const matches = text.match(siretRegex);
    return matches ? matches[0] : null;
  }

  async verifyBusinessStatus(businessData: BusinessData): Promise<{
    isActive: boolean;
    siret?: string;
    siren?: string;
    businessStatus: string;
    pappersData?: any;
    verificationMethod: string;
  }> {
    // 1. Essayer de trouver un SIRET dans les données
    let siret = this.extractSiretFromBusinessData(businessData);
    
    if (siret) {
      console.log(`🔍 Vérification SIRET ${siret} pour ${businessData.name}`);
      const pappersResponse = await this.searchCompanyBySiret(siret);
      
      if (pappersResponse) {
        const isActive = this.isCompanyActive(pappersResponse);
        return {
          isActive,
          siret,
          siren: pappersResponse.entreprise.siren,
          businessStatus: pappersResponse.entreprise.etat_administratif === 'A' ? 'active' : 'ceased',
          pappersData: pappersResponse,
          verificationMethod: 'siret_direct'
        };
      }
    }

    // 2. Recherche par nom et ville
    console.log(`🔍 Recherche par nom "${businessData.name}" à ${businessData.city}`);
    const searchResponse = await this.searchCompaniesByName(businessData.name, businessData.city);
    
    if (searchResponse && searchResponse.resultats.length > 0) {
      // Prendre le résultat avec le meilleur score
      const bestMatch = searchResponse.resultats[0];
      
      if (bestMatch.score > 0.7) { // Seuil de confiance
        const detailedResponse = await this.searchCompanyBySiret(bestMatch.siret_siege);
        
        if (detailedResponse) {
          const isActive = this.isCompanyActive(detailedResponse);
          return {
            isActive,
            siret: bestMatch.siret_siege,
            siren: bestMatch.siren,
            businessStatus: bestMatch.etat_administratif === 'A' ? 'active' : 'ceased',
            pappersData: detailedResponse,
            verificationMethod: 'name_search'
          };
        }
      }
    }

    // 3. Pas de vérification possible
    return {
      isActive: true, // Par défaut, on considère l'entreprise comme active
      businessStatus: 'unknown',
      verificationMethod: 'no_verification'
    };
  }
}
