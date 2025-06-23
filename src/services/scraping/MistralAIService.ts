
interface RepairerClassification {
  isRepairer: boolean;
  confidence: number;
  services: string[];
  specialties: string[];
  priceRange: 'low' | 'medium' | 'high';
  reason: string;
}

export class MistralAIService {
  private apiKey: string;
  private baseUrl = 'https://api.mistral.ai/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async classifyRepairer(name: string, address: string, description?: string): Promise<RepairerClassification> {
    const prompt = `
Analyse cette entreprise et détermine si c'est un réparateur de smartphones/téléphones mobiles:

Nom: ${name}
Adresse: ${address}
Description: ${description || 'Non fournie'}

Réponds EXCLUSIVEMENT au format JSON suivant:
{
  "isRepairer": boolean,
  "confidence": number (0-1),
  "services": ["service1", "service2"],
  "specialties": ["marque1", "marque2"],
  "priceRange": "low|medium|high",
  "reason": "explication courte"
}

Services possibles: "Réparation écran", "Changement batterie", "Réparation boutons", "Déblocage", "Récupération données", "Réparation caméra", "Réparation haut-parleur"

Spécialités possibles: "iPhone", "Samsung", "Huawei", "Xiaomi", "OnePlus", "Google Pixel", "Tout mobile"

Critères pour isRepairer=true:
- Mots-clés: réparation, téléphone, smartphone, mobile, GSM, iPhone, Samsung, écran, batterie
- Exclure: vente uniquement, accessoires uniquement, opérateurs télécom, magasins généralistes
`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-small',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in Mistral AI response');
      }

      // Parser la réponse JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON format in Mistral AI response');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        isRepairer: result.isRepairer || false,
        confidence: Math.min(Math.max(result.confidence || 0, 0), 1),
        services: Array.isArray(result.services) ? result.services : [],
        specialties: Array.isArray(result.specialties) ? result.specialties : [],
        priceRange: ['low', 'medium', 'high'].includes(result.priceRange) ? result.priceRange : 'medium',
        reason: result.reason || 'Classification automatique'
      };
    } catch (error) {
      console.error('Erreur Mistral AI:', error);
      
      // Fallback: classification basique par mots-clés
      const nameAndDesc = (name + ' ' + (description || '')).toLowerCase();
      const repairKeywords = ['réparation', 'répare', 'téléphone', 'smartphone', 'mobile', 'iphone', 'samsung', 'écran', 'batterie'];
      const hasRepairKeywords = repairKeywords.some(keyword => nameAndDesc.includes(keyword));
      
      return {
        isRepairer: hasRepairKeywords,
        confidence: hasRepairKeywords ? 0.7 : 0.3,
        services: hasRepairKeywords ? ['Réparation générale'] : [],
        specialties: hasRepairKeywords ? ['Tout mobile'] : [],
        priceRange: 'medium',
        reason: 'Classification par mots-clés (erreur IA)'
      };
    }
  }

  async batchClassify(repairers: Array<{name: string, address: string, description?: string}>): Promise<RepairerClassification[]> {
    const results: RepairerClassification[] = [];
    
    for (const repairer of repairers) {
      try {
        const classification = await this.classifyRepairer(repairer.name, repairer.address, repairer.description);
        results.push(classification);
        
        // Délai pour respecter les limites de l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erreur classification ${repairer.name}:`, error);
        results.push({
          isRepairer: false,
          confidence: 0,
          services: [],
          specialties: [],
          priceRange: 'medium',
          reason: 'Erreur de classification'
        });
      }
    }
    
    return results;
  }
}
