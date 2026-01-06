/**
 * Service de parsing IA des requêtes utilisateur
 * Analyse le langage naturel pour extraire l'intention de recherche
 */

export interface ParsedSearchIntent {
  // Type d'appareil
  deviceType?: 'smartphone' | 'tablet' | 'laptop' | 'console' | 'watch';
  
  // Marque détectée
  brand?: string;
  
  // Modèle détecté
  model?: string;
  
  // Type de réparation
  repairType?: string;
  
  // Symptôme/problème
  symptom?: string;
  
  // Localisation
  location?: {
    city?: string;
    postalCode?: string;
    department?: string;
  };
  
  // Critères de recherche
  criteria?: {
    urgent?: boolean;
    cheapest?: boolean;
    bestRated?: boolean;
    nearest?: boolean;
    certified?: boolean;
    openNow?: boolean;
  };
  
  // Score de confiance (0-1)
  confidence: number;
  
  // Requête originale
  originalQuery: string;
  
  // Mots-clés extraits
  keywords: string[];
}

// Dictionnaires de reconnaissance
const BRANDS_DICT: Record<string, string[]> = {
  'apple': ['apple', 'iphone', 'ipad', 'macbook', 'mac', 'airpods', 'watch'],
  'samsung': ['samsung', 'galaxy', 'note', 'fold', 'flip'],
  'huawei': ['huawei', 'honor', 'mate', 'p30', 'p40', 'p50'],
  'xiaomi': ['xiaomi', 'redmi', 'poco', 'mi'],
  'google': ['google', 'pixel', 'nexus'],
  'oneplus': ['oneplus', 'one plus', '1+'],
  'oppo': ['oppo', 'find', 'reno'],
  'sony': ['sony', 'xperia', 'playstation', 'ps4', 'ps5'],
  'lg': ['lg'],
  'motorola': ['motorola', 'moto'],
  'nokia': ['nokia'],
  'asus': ['asus', 'rog', 'zenfone'],
  'realme': ['realme'],
  'vivo': ['vivo'],
  'honor': ['honor'],
  'nintendo': ['nintendo', 'switch'],
  'microsoft': ['microsoft', 'xbox', 'surface'],
};

const REPAIR_TYPES_DICT: Record<string, string[]> = {
  'ecran': ['écran', 'ecran', 'vitre', 'affichage', 'display', 'lcd', 'oled', 'cassé', 'fissuré', 'rayé'],
  'batterie': ['batterie', 'battery', 'autonomie', 'charge', 'chargement', 'décharge'],
  'connecteur': ['connecteur', 'port', 'usb', 'lightning', 'type-c', 'charge', 'chargeur'],
  'camera': ['caméra', 'camera', 'photo', 'appareil photo', 'objectif', 'flash'],
  'haut-parleur': ['haut-parleur', 'speaker', 'son', 'audio', 'micro', 'microphone'],
  'bouton': ['bouton', 'power', 'volume', 'home', 'touch id', 'face id'],
  'eau': ['eau', 'water', 'oxydation', 'liquide', 'mouillé', 'noyé', 'tombé dans l\'eau'],
  'logiciel': ['logiciel', 'software', 'bug', 'système', 'ios', 'android', 'mise à jour', 'lent', 'bloqué'],
  'stockage': ['stockage', 'mémoire', 'espace', 'gb', 'données'],
  'reseau': ['réseau', 'wifi', 'bluetooth', '4g', '5g', 'signal', 'antenne', 'sim'],
  'coque': ['coque', 'chassis', 'arrière', 'dos', 'vitre arrière', 'back glass'],
};

const SYMPTOMS_DICT: Record<string, string[]> = {
  'ecran_noir': ['écran noir', 'écran reste noir', 'ne s\'allume plus', 'ecran noir'],
  'ecran_casse': ['écran cassé', 'vitre cassée', 'fissuré', 'brisé'],
  'ne_charge_pas': ['ne charge pas', 'charge plus', 'ne se charge pas', 'problème de charge'],
  'batterie_vide': ['batterie vide', 'se décharge', 'tient pas la charge', 'décharge vite'],
  'surchauffe': ['chauffe', 'surchauffe', 'trop chaud', 'brûlant'],
  'redemarrage': ['redémarre', 'reboot', 'loop', 'boucle de démarrage'],
  'lent': ['lent', 'rame', 'lag', 'freeze', 'bloque'],
  'eau': ['tombé dans l\'eau', 'mouillé', 'oxydé'],
  'son_absent': ['pas de son', 'son absent', 'muet', 'audio marche pas'],
  'camera_floue': ['camera floue', 'photo floue', 'objectif rayé'],
};

const URGENCY_KEYWORDS = ['urgent', 'urgence', 'rapidement', 'vite', 'aujourd\'hui', 'maintenant', 'tout de suite', 'express'];
const PRICE_KEYWORDS = ['pas cher', 'moins cher', 'économique', 'abordable', 'prix', 'tarif', 'devis'];
const QUALITY_KEYWORDS = ['meilleur', 'top', 'qualité', 'certifié', 'agréé', 'professionnel', 'expert', 'spécialiste'];
const PROXIMITY_KEYWORDS = ['près', 'proche', 'à côté', 'autour', 'proximité', 'quartier'];

// Patterns de villes françaises courantes
const CITY_PATTERNS = [
  /(?:à|a|sur|dans|vers|de)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s+\d{5})?$/i,
  /([A-Za-zÀ-ÿ\s-]+?)\s+(\d{5})$/,
  /(\d{5})\s+([A-Za-zÀ-ÿ\s-]+?)$/,
];

const POSTAL_CODE_PATTERN = /\b(\d{5})\b/;

export class AIQueryParser {
  
  /**
   * Parse une requête en langage naturel
   */
  static parse(query: string): ParsedSearchIntent {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);
    
    const intent: ParsedSearchIntent = {
      confidence: 0,
      originalQuery: query,
      keywords: [],
    };
    
    let confidenceScore = 0;
    
    // Détection de la marque
    const brand = this.detectBrand(normalizedQuery);
    if (brand) {
      intent.brand = brand;
      confidenceScore += 0.2;
    }
    
    // Détection du modèle
    const model = this.detectModel(normalizedQuery, brand);
    if (model) {
      intent.model = model;
      confidenceScore += 0.15;
    }
    
    // Détection du type de réparation
    const repairType = this.detectRepairType(normalizedQuery);
    if (repairType) {
      intent.repairType = repairType;
      confidenceScore += 0.2;
    }
    
    // Détection du symptôme
    const symptom = this.detectSymptom(normalizedQuery);
    if (symptom) {
      intent.symptom = symptom;
      confidenceScore += 0.15;
    }
    
    // Détection de la localisation
    const location = this.detectLocation(normalizedQuery);
    if (location.city || location.postalCode) {
      intent.location = location;
      confidenceScore += 0.15;
    }
    
    // Détection des critères
    intent.criteria = this.detectCriteria(normalizedQuery);
    if (Object.values(intent.criteria).some(v => v)) {
      confidenceScore += 0.1;
    }
    
    // Détection du type d'appareil
    intent.deviceType = this.detectDeviceType(normalizedQuery, brand);
    if (intent.deviceType) {
      confidenceScore += 0.05;
    }
    
    // Extraction des mots-clés
    intent.keywords = this.extractKeywords(words);
    
    // Score de confiance final
    intent.confidence = Math.min(confidenceScore, 1);
    
    return intent;
  }
  
  private static detectBrand(query: string): string | undefined {
    for (const [brand, keywords] of Object.entries(BRANDS_DICT)) {
      if (keywords.some(kw => query.includes(kw))) {
        return brand;
      }
    }
    return undefined;
  }
  
  private static detectModel(query: string, brand?: string): string | undefined {
    // Patterns de modèles courants
    const modelPatterns: Record<string, RegExp[]> = {
      'apple': [
        /iphone\s*(\d{1,2})\s*(pro\s*max|pro|plus|mini)?/i,
        /ipad\s*(pro|air|mini)?\s*(\d+)?/i,
        /macbook\s*(pro|air)?\s*(\d+)?/i,
        /apple\s*watch\s*(ultra|se|\d+)?/i,
      ],
      'samsung': [
        /galaxy\s*(s|a|z|m|note|fold|flip)\s*(\d{1,2})\s*(ultra|plus|\+|fe)?/i,
      ],
      'google': [
        /pixel\s*(\d+)\s*(pro|a)?/i,
      ],
      'xiaomi': [
        /(redmi|poco|mi)\s*(note\s*)?\s*(\d{1,2})\s*(pro|ultra|t)?/i,
      ],
    };
    
    const patterns = brand ? modelPatterns[brand] : Object.values(modelPatterns).flat();
    
    for (const pattern of patterns || []) {
      const match = query.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return undefined;
  }
  
  private static detectRepairType(query: string): string | undefined {
    for (const [type, keywords] of Object.entries(REPAIR_TYPES_DICT)) {
      if (keywords.some(kw => query.includes(kw))) {
        return type;
      }
    }
    return undefined;
  }
  
  private static detectSymptom(query: string): string | undefined {
    for (const [symptom, keywords] of Object.entries(SYMPTOMS_DICT)) {
      if (keywords.some(kw => query.includes(kw))) {
        return symptom;
      }
    }
    return undefined;
  }
  
  private static detectLocation(query: string): { city?: string; postalCode?: string; department?: string } {
    const location: { city?: string; postalCode?: string; department?: string } = {};
    
    // Détection du code postal
    const postalMatch = query.match(POSTAL_CODE_PATTERN);
    if (postalMatch) {
      location.postalCode = postalMatch[1];
      location.department = postalMatch[1].substring(0, 2);
    }
    
    // Détection de la ville
    for (const pattern of CITY_PATTERNS) {
      const match = query.match(pattern);
      if (match) {
        const potentialCity = match[1]?.trim();
        // Éviter les faux positifs avec les marques/modèles
        if (potentialCity && potentialCity.length > 2 && !this.isKnownKeyword(potentialCity)) {
          location.city = this.capitalizeCity(potentialCity);
          break;
        }
      }
    }
    
    return location;
  }
  
  private static detectCriteria(query: string): ParsedSearchIntent['criteria'] {
    return {
      urgent: URGENCY_KEYWORDS.some(kw => query.includes(kw)),
      cheapest: PRICE_KEYWORDS.some(kw => query.includes(kw)),
      bestRated: QUALITY_KEYWORDS.some(kw => query.includes(kw)),
      nearest: PROXIMITY_KEYWORDS.some(kw => query.includes(kw)),
      certified: query.includes('certifié') || query.includes('agréé') || query.includes('officiel'),
      openNow: query.includes('ouvert') || query.includes('maintenant') || query.includes('disponible'),
    };
  }
  
  private static detectDeviceType(query: string, brand?: string): ParsedSearchIntent['deviceType'] {
    if (query.includes('iphone') || query.includes('galaxy') || query.includes('pixel') || 
        query.includes('smartphone') || query.includes('téléphone') || query.includes('portable')) {
      return 'smartphone';
    }
    if (query.includes('ipad') || query.includes('tablette') || query.includes('tablet')) {
      return 'tablet';
    }
    if (query.includes('macbook') || query.includes('laptop') || query.includes('ordinateur') || 
        query.includes('pc portable')) {
      return 'laptop';
    }
    if (query.includes('playstation') || query.includes('xbox') || query.includes('switch') || 
        query.includes('console')) {
      return 'console';
    }
    if (query.includes('watch') || query.includes('montre')) {
      return 'watch';
    }
    return undefined;
  }
  
  private static extractKeywords(words: string[]): string[] {
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'a', 'au', 'en', 
                       'et', 'ou', 'mon', 'ma', 'mes', 'son', 'sa', 'ses', 'ce', 'cette', 'ces',
                       'pour', 'avec', 'sur', 'dans', 'par', 'je', 'tu', 'il', 'elle', 'nous', 
                       'vous', 'ils', 'elles', 'qui', 'que', 'quoi', 'dont', 'où'];
    
    return words
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10);
  }
  
  private static isKnownKeyword(word: string): boolean {
    const allKeywords = [
      ...Object.values(BRANDS_DICT).flat(),
      ...Object.values(REPAIR_TYPES_DICT).flat(),
      ...URGENCY_KEYWORDS,
      ...PRICE_KEYWORDS,
      ...QUALITY_KEYWORDS,
      ...PROXIMITY_KEYWORDS,
    ];
    return allKeywords.includes(word.toLowerCase());
  }
  
  private static capitalizeCity(city: string): string {
    return city
      .split(/[\s-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Génère une description lisible de l'intention
   */
  static describeIntent(intent: ParsedSearchIntent): string {
    const parts: string[] = [];
    
    if (intent.repairType || intent.symptom) {
      parts.push(`Réparation ${intent.repairType || intent.symptom}`);
    }
    
    if (intent.brand || intent.model) {
      parts.push(`pour ${intent.model || intent.brand}`);
    }
    
    if (intent.location?.city) {
      parts.push(`à ${intent.location.city}`);
    } else if (intent.location?.postalCode) {
      parts.push(`dans le ${intent.location.postalCode}`);
    }
    
    if (intent.criteria?.urgent) {
      parts.push('(urgent)');
    }
    
    return parts.length > 0 ? parts.join(' ') : 'Recherche de réparateurs';
  }
}
