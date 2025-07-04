// Service centralisé pour les APIs IA avec système de fallback intelligent

interface AIServiceConfig {
  deepseekApiKey?: string;
  mistralApiKey?: string;
  openaiApiKey?: string;
}

interface ClassificationResult {
  success: boolean;
  data: any;
  confidence: number;
  model_used: string;
  error?: string;
}

interface EnhancementResult {
  success: boolean;
  enhanced_description?: string;
  data: any;
  model_used: string;
  error?: string;
}

export class AIService {
  private config: AIServiceConfig;
  private fallbackLogs: string[] = [];

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  // Classification avec fallback intelligent : DeepSeek → OpenAI → Règles basiques
  async classifyRepairer(repairer: any): Promise<ClassificationResult> {
    const startTime = Date.now();
    this.fallbackLogs = [];

    // Tentative 1: DeepSeek
    if (this.config.deepseekApiKey) {
      try {
        console.log('🔄 [AI-Service] Tentative classification DeepSeek...');
        const result = await this.classifyWithDeepSeek(repairer);
        console.log(`✅ [AI-Service] DeepSeek réussi (${Date.now() - startTime}ms)`);
        return { ...result, model_used: 'deepseek-chat' };
      } catch (error) {
        this.fallbackLogs.push(`DeepSeek échoué: ${error.message}`);
        console.warn(`⚠️ [AI-Service] DeepSeek échoué, fallback vers OpenAI: ${error.message}`);
      }
    }

    // Tentative 2: OpenAI (fallback)
    if (this.config.openaiApiKey) {
      try {
        console.log('🔄 [AI-Service] Fallback vers OpenAI pour classification...');
        const result = await this.classifyWithOpenAI(repairer);
        console.log(`✅ [AI-Service] OpenAI réussi (${Date.now() - startTime}ms)`);
        return { ...result, model_used: 'gpt-4o-mini' };
      } catch (error) {
        this.fallbackLogs.push(`OpenAI échoué: ${error.message}`);
        console.warn(`⚠️ [AI-Service] OpenAI échoué, fallback vers règles basiques: ${error.message}`);
      }
    }

    // Tentative 3: Règles basiques (fallback final)
    console.log('🔄 [AI-Service] Fallback vers classification basique...');
    const basicResult = this.classifyWithBasicRules(repairer);
    console.log(`✅ [AI-Service] Classification basique terminée (${Date.now() - startTime}ms)`);
    
    return {
      ...basicResult,
      model_used: 'basic_rules',
      error: `Tous les modèles IA ont échoué: ${this.fallbackLogs.join('; ')}`
    };
  }

  // Amélioration avec fallback : Mistral → OpenAI → Description basique
  async enhanceDescription(repairer: any): Promise<EnhancementResult> {
    const startTime = Date.now();
    this.fallbackLogs = [];

    // Tentative 1: Mistral
    if (this.config.mistralApiKey) {
      try {
        console.log('🔄 [AI-Service] Tentative amélioration Mistral...');
        const result = await this.enhanceWithMistral(repairer);
        console.log(`✅ [AI-Service] Mistral réussi (${Date.now() - startTime}ms)`);
        return { ...result, model_used: 'mistral-large-latest' };
      } catch (error) {
        this.fallbackLogs.push(`Mistral échoué: ${error.message}`);
        console.warn(`⚠️ [AI-Service] Mistral échoué, fallback vers OpenAI: ${error.message}`);
      }
    }

    // Tentative 2: OpenAI (fallback)
    if (this.config.openaiApiKey) {
      try {
        console.log('🔄 [AI-Service] Fallback vers OpenAI pour amélioration...');
        const result = await this.enhanceWithOpenAI(repairer);
        console.log(`✅ [AI-Service] OpenAI réussi (${Date.now() - startTime}ms)`);
        return { ...result, model_used: 'gpt-4o-mini' };
      } catch (error) {
        this.fallbackLogs.push(`OpenAI échoué: ${error.message}`);
        console.warn(`⚠️ [AI-Service] OpenAI échoué, fallback vers amélioration basique: ${error.message}`);
      }
    }

    // Tentative 3: Amélioration basique (fallback final)
    console.log('🔄 [AI-Service] Fallback vers amélioration basique...');
    const basicResult = this.enhanceWithBasicRules(repairer);
    console.log(`✅ [AI-Service] Amélioration basique terminée (${Date.now() - startTime}ms)`);
    
    return {
      ...basicResult,
      model_used: 'basic_rules',
      error: `Tous les modèles IA ont échoué: ${this.fallbackLogs.join('; ')}`
    };
  }

  // Méthodes privées pour chaque API
  private async classifyWithDeepSeek(repairer: any): Promise<ClassificationResult> {
    const prompt = `Analyse ce commerce pour déterminer s'il s'agit d'un réparateur de téléphones/smartphones:

Nom: ${repairer.name}
Adresse: ${repairer.address}
Description: ${repairer.description || 'Non renseignée'}

Réponds en JSON avec:
{
  "is_repairer": boolean,
  "confidence": number (0-1),
  "specialties": string[],
  "services": string[],
  "reasoning": string
}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Tu es un expert en classification de commerces. Réponds uniquement en JSON valide.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Réponse vide de DeepSeek');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        success: true,
        data: parsed,
        confidence: parsed.confidence || 0
      };
    } catch (error) {
      throw new Error(`Erreur parsing JSON DeepSeek: ${error.message}`);
    }
  }

  private async classifyWithOpenAI(repairer: any): Promise<ClassificationResult> {
    const prompt = `Analyze this business to determine if it's a phone/smartphone repair shop:

Name: ${repairer.name}
Address: ${repairer.address}
Description: ${repairer.description || 'No description'}

Respond in JSON format:
{
  "is_repairer": boolean,
  "confidence": number (0-1),
  "specialties": string[],
  "services": string[],
  "reasoning": string
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert in business classification. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Réponse vide d\'OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        success: true,
        data: parsed,
        confidence: parsed.confidence || 0
      };
    } catch (error) {
      throw new Error(`Erreur parsing JSON OpenAI: ${error.message}`);
    }
  }

  private classifyWithBasicRules(repairer: any): ClassificationResult {
    const name = repairer.name?.toLowerCase() || '';
    const description = repairer.description?.toLowerCase() || '';
    const combined = `${name} ${description}`;

    // Mots-clés positifs pour réparateurs de téléphones
    const repairKeywords = [
      'réparation', 'repair', 'téléphone', 'smartphone', 'mobile', 'iphone', 'samsung',
      'écran', 'batterie', 'vitre', 'phone', 'gsm', 'portable', 'tablette', 'tablet'
    ];

    // Mots-clés négatifs
    const excludeKeywords = [
      'vente', 'magasin', 'boutique', 'accessoire', 'coiffure', 'restaurant', 'boulangerie'
    ];

    let score = 0;
    let matchedKeywords: string[] = [];

    // Points positifs
    for (const keyword of repairKeywords) {
      if (combined.includes(keyword)) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }

    // Points négatifs
    for (const keyword of excludeKeywords) {
      if (combined.includes(keyword)) {
        score -= 2;
      }
    }

    const confidence = Math.max(0, Math.min(1, score / 3));
    const isRepairer = confidence > 0.3;

    return {
      success: true,
      data: {
        is_repairer: isRepairer,
        confidence: confidence,
        specialties: matchedKeywords,
        services: isRepairer ? ['Réparation smartphone', 'Réparation téléphone'] : [],
        reasoning: `Classification basique basée sur ${matchedKeywords.length} mots-clés détectés`
      },
      confidence: confidence
    };
  }

  private async enhanceWithMistral(repairer: any): Promise<EnhancementResult> {
    const prompt = `Améliore la description de ce réparateur de téléphones en français:

Nom: ${repairer.name}
Description actuelle: ${repairer.description || 'Aucune description'}

Crée une description professionnelle, attrayante et SEO-optimisée d'environ 100-150 mots.
Mentionne les services de réparation de smartphones, tablettes, etc.

Réponds en JSON:
{
  "enhanced_description": string,
  "keywords": string[],
  "services_suggested": string[]
}`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: 'Tu es un expert en rédaction commerciale pour les réparateurs de téléphones. Réponds uniquement en JSON valide.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Réponse vide de Mistral');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        success: true,
        data: parsed,
        enhanced_description: parsed.enhanced_description
      };
    } catch (error) {
      throw new Error(`Erreur parsing JSON Mistral: ${error.message}`);
    }
  }

  private async enhanceWithOpenAI(repairer: any): Promise<EnhancementResult> {
    const prompt = `Enhance the description for this phone repair shop in French:

Name: ${repairer.name}
Current description: ${repairer.description || 'No description'}

Create a professional, attractive, and SEO-optimized description of about 100-150 words.
Mention smartphone, tablet repair services, etc.

Respond in JSON:
{
  "enhanced_description": string,
  "keywords": string[],
  "services_suggested": string[]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert in commercial writing for phone repair shops. Respond only with valid JSON in French.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Réponse vide d\'OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        success: true,
        data: parsed,
        enhanced_description: parsed.enhanced_description
      };
    } catch (error) {  
      throw new Error(`Erreur parsing JSON OpenAI: ${error.message}`);
    }
  }

  private enhanceWithBasicRules(repairer: any): EnhancementResult {
    const name = repairer.name || 'Ce réparateur';
    const baseDescription = `${name} est un professionnel de la réparation de smartphones et téléphones mobiles. Spécialisé dans la réparation d'écrans, remplacement de batteries, et dépannage technique pour toutes marques. Service rapide et qualité garantie pour vos appareils mobiles.`;

    return {
      success: true,
      data: {
        enhanced_description: baseDescription,
        keywords: ['réparation smartphone', 'réparation téléphone', 'écran cassé', 'batterie'],
        services_suggested: ['Réparation écran', 'Changement batterie', 'Dépannage mobile']
      },
      enhanced_description: baseDescription
    };
  }

  // Getter pour récupérer les logs de fallback
  getFallbackLogs(): string[] {
    return [...this.fallbackLogs];
  }
}