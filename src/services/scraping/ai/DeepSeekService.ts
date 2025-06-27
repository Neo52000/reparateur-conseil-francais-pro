
interface DeepSeekConfig {
  model: string;
  apiKey: string;
  baseUrl: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekService {
  private static config: DeepSeekConfig = {
    model: 'deepseek-chat',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/chat/completions'
  };

  static setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
  }

  static async classifyRepairers(repairersData: any[]): Promise<any[]> {
    if (!this.config.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const prompt = `
Tu es un expert en classification de données d'entreprises de réparation de téléphones et smartphones.

Voici les données à analyser et nettoyer:
${JSON.stringify(repairersData.slice(0, 10), null, 2)}

Pour chaque entreprise, tu dois:
1. Vérifier si c'est vraiment un réparateur de téléphones/smartphones
2. Nettoyer le nom (supprimer les caractères spéciaux, corriger l'encodage)
3. Standardiser les services (ex: "Réparation écran", "Réparation batterie", etc.)
4. Déterminer la gamme de prix (low, medium, high)
5. Extraire les spécialités (marques, types d'appareils)

Réponds UNIQUEMENT avec un JSON valide contenant les données nettoyées et classifiées.
Format de réponse:
[
  {
    "id": "original_id",
    "name": "nom_nettoyé",
    "is_valid_repairer": true/false,
    "services": ["service1", "service2"],
    "specialties": ["marque1", "marque2"],
    "price_range": "low|medium|high",
    "confidence_score": 0.95
  }
]
`;

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en classification de données d\'entreprises. Tu réponds UNIQUEMENT avec du JSON valide.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Pas de réponse de DeepSeek');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Erreur parsing JSON DeepSeek:', parseError);
        console.log('Contenu reçu:', content);
        throw new Error('Réponse DeepSeek invalide');
      }

    } catch (error) {
      console.error('Erreur DeepSeek:', error);
      throw error;
    }
  }

  static async enhanceRepairerData(repairer: any): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const prompt = `
Analyse ce réparateur et améliore ses données:
${JSON.stringify(repairer, null, 2)}

Améliore:
1. Description basée sur le nom et l'adresse
2. Services probables
3. Horaires d'ouverture standards
4. Temps de réponse estimé
5. Informations manquantes

Réponds UNIQUEMENT avec un JSON valide contenant les données améliorées.
`;

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en données d\'entreprises de réparation. Tu réponds UNIQUEMENT avec du JSON valide.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Pas de réponse de DeepSeek');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Erreur DeepSeek enhancement:', error);
      return repairer; // Retourner les données originales en cas d'erreur
    }
  }
}
