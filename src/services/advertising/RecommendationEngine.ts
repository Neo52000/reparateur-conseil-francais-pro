
import { supabase } from '@/integrations/supabase/client';
import { Recommendation, ActionableTask } from './types/RecommendationTypes';
import { RealRecommendationsService } from './recommendations/RealRecommendationsService';
import { PriorityUtils } from './utils/PriorityUtils';

class RecommendationEngine {
  private static instance: RecommendationEngine;

  static getInstance(): RecommendationEngine {
    if (!this.instance) {
      this.instance = new RecommendationEngine();
    }
    return this.instance;
  }


  async generateSmartRecommendations(): Promise<Recommendation[]> {
    console.log('🔄 RecommendationEngine - Génération recommandations via IA');

    try {
      // Utiliser la nouvelle edge function ai-suggestions pour les recommandations
      const { data, error } = await supabase.functions.invoke('ai-suggestions', {
        body: {
          repairerId: (await supabase.auth.getUser()).data.user?.id,
          suggestionType: 'all',
          context: {
            includeOptimization: true,
            includeContent: true,
            includePricing: true,
            includeMarketing: true
          }
        }
      });

      if (error) {
        console.error('❌ Erreur lors de la génération des suggestions IA:', error);
        return this.getFallbackRecommendations();
      }

      if (!data?.success || !data?.suggestions) {
        console.warn('⚠️ Aucune suggestion IA retournée');
        return this.getFallbackRecommendations();
      }

      // Convertir les suggestions IA en format Recommendation
      const recommendations: Recommendation[] = data.suggestions.map((suggestion: any) => ({
        id: suggestion.id || `ai_${Date.now()}_${Math.random()}`,
        type: this.mapSuggestionTypeToRecommendationType(suggestion.suggestion_type),
        title: suggestion.title,
        description: suggestion.description,
        impact: {
          metric: suggestion.impact_metric || 'Performance générale',
          expectedChange: suggestion.expected_change || 25,
          confidence: suggestion.confidence ? Math.round(suggestion.confidence * 100) : 75
        },
        actionSteps: suggestion.action_steps || ['Analyser la situation', 'Planifier l\'amélioration', 'Mettre en œuvre', 'Mesurer les résultats'],
        priority: suggestion.priority || 'medium',
        estimatedImplementationTime: suggestion.estimated_time || 60,
        resources: suggestion.resources || ['Guide d\'optimisation', 'Outils d\'analyse']
      }));

      return PriorityUtils.sortByPriority(recommendations);
    } catch (error) {
      console.error('❌ Exception lors de la génération des recommandations IA:', error);
      return this.getFallbackRecommendations();
    }
  }

  private mapSuggestionTypeToRecommendationType(suggestionType: string): string {
    const mapping: Record<string, string> = {
      'optimization': 'targeting',
      'content': 'creative',
      'pricing': 'budget',
      'marketing': 'creative'
    };
    return mapping[suggestionType] || 'targeting';
  }

  private getFallbackRecommendations(): Recommendation[] {
    return [{
      id: 'fallback_general',
      type: 'targeting',
      title: 'Optimisation recommandée',
      description: 'Analysez vos performances actuelles pour identifier des opportunités d\'amélioration.',
      impact: {
        metric: 'Performance globale',
        expectedChange: 20,
        confidence: 70
      },
      actionSteps: [
        'Examiner vos métriques actuelles',
        'Identifier les points d\'amélioration',
        'Planifier les optimisations',
        'Mettre en œuvre les changements'
      ],
      priority: 'medium',
      estimatedImplementationTime: 45,
      resources: ['Guide d\'optimisation', 'Tableaux de bord']
    }];
  }

  async generateActionableTasks(recommendation: Recommendation): Promise<ActionableTask[]> {
    return recommendation.actionSteps.map((step, index) => ({
      id: `${recommendation.id}_task_${index}`,
      title: step,
      description: `Étape ${index + 1} de l'implémentation: ${recommendation.title}`,
      status: 'pending' as const,
      deadline: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      assignee: 'system'
    }));
  }
}

export default RecommendationEngine;
export type { Recommendation, ActionableTask } from './types/RecommendationTypes';
