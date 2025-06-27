
interface DeepSeekConfig {
  model: string;
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
    baseUrl: 'https://api.deepseek.com/chat/completions'
  };

  static async classifyRepairers(repairersData: any[]): Promise<any[]> {
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
      // Utiliser la fonction edge pour accéder à la clé secrète
      const response = await fetch('/api/deepseek-classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repairersData: repairersData.slice(0, 10),
          prompt
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.classifiedData || [];

    } catch (error) {
      console.error('Erreur DeepSeek:', error);
      throw error;
    }
  }

  static async enhanceRepairerData(repairer: any): Promise<any> {
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
      const response = await fetch('/api/deepseek-enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repairer,
          prompt
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.enhancedData || repairer;

    } catch (error) {
      console.error('Erreur DeepSeek enhancement:', error);
      return repairer; // Retourner les données originales en cas d'erreur
    }
  }
}
