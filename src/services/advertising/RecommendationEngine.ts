
import { supabase } from '@/integrations/supabase/client';
import { Recommendation, ActionableTask } from './types/RecommendationTypes';
import { DemoRecommendationsService } from './recommendations/DemoRecommendationsService';
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

  // Vérifie si le mode démo est activé
  private async isDemoModeEnabled(): Promise<boolean> {
    try {
      const { data: flags } = await supabase
        .from('feature_flags_by_plan')
        .select('enabled')
        .eq('feature_key', 'demo_mode_enabled')
        .eq('plan_name', 'Enterprise')
        .single();

      const enabled = flags?.enabled || false;
      console.log('🎯 RecommendationEngine - Mode démo vérifié:', enabled);
      return enabled;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du mode démo:', error);
      return false;
    }
  }

  async generateSmartRecommendations(): Promise<Recommendation[]> {
    const demoModeEnabled = await this.isDemoModeEnabled();
    console.log('🔄 RecommendationEngine - Génération recommandations, mode démo:', demoModeEnabled);

    if (demoModeEnabled) {
      const demoRecommendations = DemoRecommendationsService.generateDemoRecommendations();
      return PriorityUtils.sortByPriority(demoRecommendations);
    } else {
      const realRecommendations = await RealRecommendationsService.generateRealRecommendations();
      return PriorityUtils.sortByPriority(realRecommendations);
    }
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
