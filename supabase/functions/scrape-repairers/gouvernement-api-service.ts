
import { BusinessData, ClassificationResult } from './types.ts';

interface GouvernementResponse {
  results: Array<{
    siren: string;
    siret: string;
    nom_complet: string;
    nom_raison_sociale: string;
    adresse: string;
    code_postal: string;
    libelle_commune: string;
    etat_administratif_entreprise: string; // 'A' = Active, 'C' = Cessée
    date_cessation_entreprise?: string;
    date_creation_entreprise: string;
    activite_principale: string;
    matching_score: number;
  }>;
  total_results: number;
}

export class GouvernementApiService {
  private baseUrl = 'https://recherche-entreprises.api.gouv.fr/search';

  async searchCompanyBySiret(siret: string): Promise<GouvernementResponse | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}?siret=${siret}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn(`API Gouvernement error for SIRET ${siret}:`, response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'appel API Gouvernement:', error);
      return null;
    }
  }

  async searchCompaniesByName(name: string, city?: string): Promise<GouvernementResponse | null> {
    try {
      let searchQuery = name;
      if (city) {
        searchQuery += ` ${city}`;
      }

      const response = await fetch(
        `${this.baseUrl}?q=${encodeURIComponent(searchQuery)}&per_page=10`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn(`API Gouvernement search error for ${name}:`, response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la recherche API Gouvernement:', error);
      return null;
    }
  }

  isCompanyActive(company: GouvernementResponse['results'][0]): boolean {
    return company.etat_administratif_entreprise === 'A';
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
    gouvernementData?: any;
    verificationMethod: string;
  }> {
    // 1. Essayer de trouver un SIRET dans les données
    let siret = this.extractSiretFromBusinessData(businessData);
    
    if (siret) {
      console.log(`🔍 Vérification SIRET ${siret} pour ${businessData.name}`);
      const gouvernementResponse = await this.searchCompanyBySiret(siret);
      
      if (gouvernementResponse && gouvernementResponse.results.length > 0) {
        const company = gouvernementResponse.results[0];
        const isActive = this.isCompanyActive(company);
        return {
          isActive,
          siret: company.siret,
          siren: company.siren,
          businessStatus: company.etat_administratif_entreprise === 'A' ? 'active' : 'ceased',
          gouvernementData: company,
          verificationMethod: 'siret_direct'
        };
      }
    }

    // 2. Recherche par nom et ville
    console.log(`🔍 Recherche par nom "${businessData.name}" à ${businessData.city}`);
    const searchResponse = await this.searchCompaniesByName(businessData.name, businessData.city);
    
    if (searchResponse && searchResponse.results.length > 0) {
      // Prendre le résultat avec le meilleur score
      const bestMatch = searchResponse.results[0];
      
      if (bestMatch.matching_score > 0.7) { // Seuil de confiance
        const isActive = this.isCompanyActive(bestMatch);
        return {
          isActive,
          siret: bestMatch.siret,
          siren: bestMatch.siren,
          businessStatus: bestMatch.etat_administratif_entreprise === 'A' ? 'active' : 'ceased',
          gouvernementData: bestMatch,
          verificationMethod: 'name_search'
        };
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
