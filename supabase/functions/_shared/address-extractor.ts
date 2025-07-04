// Service d'extraction d'adresses robuste avec multiples sources et patterns

interface AddressExtractionResult {
  address: string;
  confidence: number;
  source: string;
  raw_data?: any;
}

export class AddressExtractor {
  
  // Patterns regex améliorés pour les adresses françaises
  private readonly addressPatterns = [
    // Pattern principal pour adresses complètes (numéro + rue + ville + code postal)
    /(\d+[a-z]?\s+(?:rue|avenue|boulevard|place|impasse|allée|chemin|square|cours|quai|passage|villa|cité)[^,.\n]+,?\s*\d{5}\s+[a-z\s-]+)/gi,
    
    // Pattern pour adresses avec code postal à la fin
    /(\d+[a-z]?\s+[^,.\n]+,?\s*\d{5}\s+[a-z\s-]+)/gi,
    
    // Pattern pour adresses avec "à" ou "sur" (ex: "Rue de la Paix à Paris")
    /(\d+[a-z]?\s+[^,.\n]+\s+(?:à|sur)\s+[a-z\s-]+)/gi,
    
    // Pattern pour adresses courtes (numéro + rue)
    /(\d+[a-z]?\s+(?:rue|avenue|boulevard|place|impasse|allée|chemin|square|cours|quai|passage|villa|cité)\s+[^,.\n]{5,40})/gi,
    
    // Pattern pour adresses sans numéro mais avec type de voie
    /((?:rue|avenue|boulevard|place|impasse|allée|chemin|square|cours|quai|passage|villa|cité)\s+[^,.\n]{5,40})/gi,
    
    // Pattern pour codes postaux avec ville
    /(\d{5}\s+[a-z\s-]{3,30})/gi,
  ];

  // Mots-clés qui indiquent une adresse
  private readonly addressKeywords = [
    'rue', 'avenue', 'boulevard', 'place', 'impasse', 'allée', 'chemin', 'square', 
    'cours', 'quai', 'passage', 'villa', 'cité', 'route', 'voie', 'esplanade'
  ];

  // Mots-clés à exclure (pas des adresses)
  private readonly excludeKeywords = [
    'téléphone', 'phone', 'email', 'site', 'www', 'http', 'contact', 'horaires'
  ];

  /**
   * Extrait l'adresse principale depuis un texte (snippet, description, etc.)
   */
  extractFromText(text: string): AddressExtractionResult {
    if (!text || text.trim().length === 0) {
      return { address: '', confidence: 0, source: 'text_empty' };
    }

    const results: AddressExtractionResult[] = [];

    // Tester tous les patterns
    for (let i = 0; i < this.addressPatterns.length; i++) {
      const pattern = this.addressPatterns[i];
      const matches = text.match(pattern);
      
      if (matches) {
        for (const match of matches) {
          const cleanAddress = this.cleanAddress(match);
          if (cleanAddress.length > 5) {
            const confidence = this.calculateConfidence(cleanAddress, i);
            results.push({
              address: cleanAddress,
              confidence,
              source: `pattern_${i}`,
              raw_data: { original_match: match, pattern_index: i }
            });
          }
        }
      }
    }

    // Si aucun pattern ne marche, essayer extraction basique
    if (results.length === 0) {
      const basicAddress = this.extractBasicAddress(text);
      if (basicAddress) {
        results.push({
          address: basicAddress,
          confidence: 0.3,
          source: 'basic_extraction'
        });
      }
    }

    // Retourner le meilleur résultat
    if (results.length > 0) {
      results.sort((a, b) => b.confidence - a.confidence);
      return results[0];
    }

    return { address: '', confidence: 0, source: 'no_match' };
  }

  /**
   * Extrait l'adresse depuis un résultat de recherche structuré
   */
  extractFromSearchResult(result: any): AddressExtractionResult[] {
    const results: AddressExtractionResult[] = [];

    // Source 1: Champ address direct
    if (result.address) {
      const cleaned = this.cleanAddress(result.address);
      if (cleaned.length > 5) {
        results.push({
          address: cleaned,
          confidence: 0.9,
          source: 'direct_address_field'
        });
      }
    }

    // Source 2: Titre/nom
    if (result.title || result.name) {
      const titleResult = this.extractFromText(result.title || result.name);
      if (titleResult.confidence > 0.5) {
        results.push({
          ...titleResult,
          source: 'title_extraction'
        });
      }
    }

    // Source 3: Snippet/description
    if (result.snippet || result.description) {
      const snippetResult = this.extractFromText(result.snippet || result.description);
      if (snippetResult.confidence > 0.4) {
        results.push({
          ...snippetResult,
          source: 'snippet_extraction'
        });
      }
    }

    // Source 4: Données structurées (rich snippets)
    if (result.structured_data || result.rich_snippet) {
      const structuredData = result.structured_data || result.rich_snippet;
      if (structuredData.address) {
        const cleaned = this.cleanAddress(structuredData.address);
        if (cleaned.length > 5) {
          results.push({
            address: cleaned,
            confidence: 0.8,
            source: 'structured_data'
          });
        }
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Trouve la meilleure adresse parmi plusieurs sources
   */
  getBestAddress(result: any): AddressExtractionResult {
    const candidates = this.extractFromSearchResult(result);
    
    if (candidates.length > 0) {
      return candidates[0];
    }

    // Fallback: essayer sur tous les champs texte
    const allText = [
      result.title,
      result.name, 
      result.snippet,
      result.description,
      result.displayLink
    ].filter(Boolean).join(' ');

    return this.extractFromText(allText);
  }

  /**
   * Nettoie et normalise une adresse
   */
  private cleanAddress(address: string): string {
    if (!address) return '';

    return address
      .trim()
      .replace(/\s+/g, ' ')           // Normaliser les espaces
      .replace(/[""«»]/g, '')         // Supprimer les guillemets  
      .replace(/^\W+|\W+$/g, '')      // Supprimer ponctuation début/fin
      .replace(/\n/g, ', ')           // Remplacer retours ligne par virgules
      .substring(0, 200);             // Limiter la longueur
  }

  /**
   * Calcule la confiance basée sur le pattern et le contenu
   */
  private calculateConfidence(address: string, patternIndex: number): number {
    let confidence = 0.5;

    // Bonus selon le pattern utilisé (les premiers sont plus fiables)
    confidence += (5 - patternIndex) * 0.1;

    // Bonus si contient des mots-clés d'adresse
    const lowerAddress = address.toLowerCase();
    let keywordCount = 0;
    for (const keyword of this.addressKeywords) {
      if (lowerAddress.includes(keyword)) {
        keywordCount++;
      }
    }
    confidence += keywordCount * 0.1;

    // Bonus si contient un code postal
    if (/\d{5}/.test(address)) {
      confidence += 0.2;
    }

    // Bonus si contient un numéro de rue
    if (/^\d+[a-z]?\s/.test(address.trim())) {
      confidence += 0.1;
    }

    // Malus si contient des mots-clés à exclure
    for (const exclude of this.excludeKeywords) {
      if (lowerAddress.includes(exclude)) {
        confidence -= 0.2;
      }
    }

    // Malus si trop court ou trop long
    if (address.length < 10) confidence -= 0.3;
    if (address.length > 150) confidence -= 0.2;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Extraction basique quand les patterns échouent
   */
  private extractBasicAddress(text: string): string | null {
    const lines = text.split(/[\n,]/).map(l => l.trim());
    
    for (const line of lines) {
      // Chercher une ligne qui ressemble à une adresse
      if (line.length > 10 && line.length < 100) {
        const hasNumber = /\d/.test(line);
        const hasStreetWord = this.addressKeywords.some(kw => 
          line.toLowerCase().includes(kw)
        );
        
        if (hasNumber && hasStreetWord) {
          return this.cleanAddress(line);
        }
      }
    }

    return null;
  }

  /**
   * Valide une adresse extraite
   */
  validateAddress(address: string): boolean {
    if (!address || address.length < 5) return false;
    if (address.length > 200) return false;
    
    // Doit contenir au moins un chiffre OU un mot-clé d'adresse
    const hasNumber = /\d/.test(address);
    const hasAddressKeyword = this.addressKeywords.some(kw => 
      address.toLowerCase().includes(kw)
    );
    
    return hasNumber || hasAddressKeyword;
  }
}