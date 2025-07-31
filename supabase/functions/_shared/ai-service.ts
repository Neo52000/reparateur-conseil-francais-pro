// Service IA unifié pour classification et enrichissement
export class AIService {
  private deepseekApiKey?: string;
  private openaiApiKey?: string;
  private mistralApiKey?: string;
  private fallbackLogs: string[] = [];

  constructor(config: {
    deepseekApiKey?: string;
    openaiApiKey?: string;
    mistralApiKey?: string;
  }) {
    this.deepseekApiKey = config.deepseekApiKey;
    this.openaiApiKey = config.openaiApiKey;
    this.mistralApiKey = config.mistralApiKey;
  }

  async classifyRepairer(repairer: any): Promise<{
    success: boolean;
    data: any;
    confidence: number;
    model_used: string;
    error?: string;
  }> {
    // Essayer DeepSeek en premier
    if (this.deepseekApiKey) {
      try {
        const result = await this.classifyWithDeepSeek(repairer);
        return {
          success: true,
          data: result.classification,
          confidence: result.confidence,
          model_used: 'deepseek'
        };
      } catch (error) {
        console.warn('🔄 DeepSeek failed, trying fallback:', error.message);
        this.fallbackLogs.push(`DeepSeek: ${error.message}`);
      }
    }

    // Fallback vers OpenAI
    if (this.openaiApiKey) {
      try {
        const result = await this.classifyWithOpenAI(repairer);
        return {
          success: true,
          data: result.classification,
          confidence: result.confidence,
          model_used: 'openai'
        };
      } catch (error) {
        console.warn('🔄 OpenAI failed, trying Mistral:', error.message);
        this.fallbackLogs.push(`OpenAI: ${error.message}`);
      }
    }

    // Fallback vers Mistral
    if (this.mistralApiKey) {
      try {
        const result = await this.classifyWithMistral(repairer);
        return {
          success: true,
          data: result.classification,
          confidence: result.confidence,
          model_used: 'mistral'
        };
      } catch (error) {
        console.warn('🔄 Mistral failed:', error.message);
        this.fallbackLogs.push(`Mistral: ${error.message}`);
      }
    }

    // Classification basique en cas d'échec total
    return {
      success: false,
      data: {
        is_repairer: true,
        confidence: 0.3,
        specialties: ['Réparation mobile'],
        services: ['Réparation smartphone'],
        reasoning: 'Classification basique - pas d\'API IA disponible'
      },
      confidence: 0.3,
      model_used: 'fallback',
      error: 'Aucune API IA disponible'
    };
  }

  private async classifyWithDeepSeek(repairer: any) {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.deepseekApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en classification de réparateurs. Analyse les données et retourne un JSON avec: is_repairer (boolean), confidence (0-1), specialties (array), services (array), reasoning (string).'
          },
          {
            role: 'user',
            content: `Analyse ce réparateur: ${JSON.stringify(repairer)}`
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    try {
      const classification = JSON.parse(content);
      return { classification, confidence: classification.confidence || 0.8 };
    } catch {
      throw new Error('Invalid JSON response from DeepSeek');
    }
  }

  private async classifyWithOpenAI(repairer: any) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en classification de réparateurs. Analyse les données et retourne un JSON avec: is_repairer (boolean), confidence (0-1), specialties (array), services (array), reasoning (string).'
          },
          {
            role: 'user',
            content: `Analyse ce réparateur: ${JSON.stringify(repairer)}`
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    try {
      const classification = JSON.parse(content);
      return { classification, confidence: classification.confidence || 0.9 };
    } catch {
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  private async classifyWithMistral(repairer: any) {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.mistralApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en classification de réparateurs. Analyse les données et retourne un JSON avec: is_repairer (boolean), confidence (0-1), specialties (array), services (array), reasoning (string).'
          },
          {
            role: 'user',
            content: `Analyse ce réparateur: ${JSON.stringify(repairer)}`
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    try {
      const classification = JSON.parse(content);
      return { classification, confidence: classification.confidence || 0.7 };
    } catch {
      throw new Error('Invalid JSON response from Mistral');
    }
  }

  getFallbackLogs(): string[] {
    return [...this.fallbackLogs];
  }
}