
import { supabase } from '@/integrations/supabase/client';
import { AIInsight } from './AIInsightsService';

export interface Recommendation {
  id: string;
  type: 'budget' | 'targeting' | 'creative' | 'timing' | 'bidding';
  title: string;
  description: string;
  impact: {
    metric: string;
    expectedChange: number;
    confidence: number;
  };
  actionSteps: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImplementationTime: number; // en minutes
  resources: string[];
}

class RecommendationEngine {
  private static instance: RecommendationEngine;

  static getInstance(): RecommendationEngine {
    if (!this.instance) {
      this.instance = new RecommendationEngine();
    }
    return this.instance;
  }

  async generateSmartRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Analyser les données actuelles pour générer des recommandations
    const budgetRecs = await this.generateBudgetRecommendations();
    const targetingRecs = await this.generateTargetingRecommendations();
    const creativeRecs = await this.generateCreativeRecommendations();
    const timingRecs = await this.generateTimingRecommendations();

    recommendations.push(...budgetRecs, ...targetingRecs, ...creativeRecs, ...timingRecs);

    return recommendations.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
  }

  private async generateBudgetRecommendations(): Promise<Recommendation[]> {
    return [
      {
        id: 'budget_reallocation_001',
        type: 'budget',
        title: 'Réallocation budgétaire intelligente',
        description: 'Déplacer 20% du budget des campagnes à faible ROI vers les campagnes performantes',
        impact: {
          metric: 'ROI global',
          expectedChange: 35,
          confidence: 89
        },
        actionSteps: [
          'Identifier les 3 campagnes les moins performantes',
          'Réduire leur budget de 20%',
          'Redistribuer vers les campagnes avec ROI > 250%',
          'Surveiller les performances pendant 7 jours'
        ],
        priority: 'high',
        estimatedImplementationTime: 15,
        resources: ['Dashboard Analytics', 'Historique des performances']
      },
      {
        id: 'budget_scaling_002',
        type: 'budget',
        title: 'Opportunité de scale-up',
        description: 'La campagne "Réparateurs Premium Lyon" peut supporter +50% de budget',
        impact: {
          metric: 'Revenus mensuels',
          expectedChange: 1200,
          confidence: 92
        },
        actionSteps: [
          'Augmenter progressivement le budget de 10% par semaine',
          'Surveiller le CPA et ajuster si nécessaire',
          'Étendre à d\'autres villes similaires',
          'Optimiser les heures de diffusion'
        ],
        priority: 'high',
        estimatedImplementationTime: 10,
        resources: ['Données de performance Lyon', 'Comparaison villes similaires']
      }
    ];
  }

  private async generateTargetingRecommendations(): Promise<Recommendation[]> {
    return [
      {
        id: 'targeting_segment_001',
        type: 'targeting',
        title: 'Nouveau segment à fort potentiel',
        description: 'Les utilisateurs iOS 25-34 ans montrent un taux de conversion 3x supérieur',
        impact: {
          metric: 'Taux de conversion',
          expectedChange: 180,
          confidence: 87
        },
        actionSteps: [
          'Créer un segment dédié iOS 25-34 ans',
          'Adapter les créatifs au design iOS',
          'Ajuster les enchères pour ce segment',
          'Tester différents messages personnalisés'
        ],
        priority: 'high',
        estimatedImplementationTime: 25,
        resources: ['Données démographiques', 'Analytics iOS', 'Templates créatifs']
      },
      {
        id: 'targeting_lookalike_002',
        type: 'targeting',
        title: 'Audience lookalike haute qualité',
        description: 'Créer une audience similaire basée sur vos meilleurs clients',
        impact: {
          metric: 'Portée qualifiée',
          expectedChange: 45000,
          confidence: 83
        },
        actionSteps: [
          'Exporter la liste des clients avec LTV > 150€',
          'Créer une audience lookalike 2%',
          'Tester avec un budget réduit',
          'Analyser les performances et ajuster'
        ],
        priority: 'medium',
        estimatedImplementationTime: 30,
        resources: ['Base clients', 'Données LTV', 'Outil lookalike']
      }
    ];
  }

  private async generateCreativeRecommendations(): Promise<Recommendation[]> {
    return [
      {
        id: 'creative_refresh_001',
        type: 'creative',
        title: 'Rafraîchissement créatifs nécessaire',
        description: 'Les créatifs actuels montrent des signes de fatigue (-12% CTR)',
        impact: {
          metric: 'CTR',
          expectedChange: 25,
          confidence: 91
        },
        actionSteps: [
          'Designer 3 nouvelles variantes créatives',
          'Tester des formats vidéo courts',
          'Utiliser des témoignages clients récents',
          'A/B tester les nouveaux créatifs'
        ],
        priority: 'medium',
        estimatedImplementationTime: 60,
        resources: ['Designer', 'Témoignages clients', 'Templates vidéo']
      },
      {
        id: 'creative_personalization_002',
        type: 'creative',
        title: 'Personnalisation géographique',
        description: 'Adapter les créatifs aux spécificités locales pour +30% d\'engagement',
        impact: {
          metric: 'Engagement',
          expectedChange: 30,
          confidence: 78
        },
        actionSteps: [
          'Identifier les 5 villes principales',
          'Créer des variations avec références locales',
          'Adapter les visuels aux préférences régionales',
          'Tester et optimiser par zone'
        ],
        priority: 'medium',
        estimatedImplementationTime: 45,
        resources: ['Données géographiques', 'Insights locaux', 'Assets créatifs']
      }
    ];
  }

  private async generateTimingRecommendations(): Promise<Recommendation[]> {
    return [
      {
        id: 'timing_optimization_001',
        type: 'timing',
        title: 'Optimisation des heures de diffusion',
        description: 'Les mardis 14h-16h montrent un CPA 40% plus bas',
        impact: {
          metric: 'CPA',
          expectedChange: -40,
          confidence: 95
        },
        actionSteps: [
          'Augmenter les enchères mardis 14h-16h',
          'Réduire le budget en soirée weekends',
          'Tester les jeudis matin comme alternative',
          'Automatiser les ajustements horaires'
        ],
        priority: 'high',
        estimatedImplementationTime: 20,
        resources: ['Analytics temporelles', 'Outils d\'automatisation']
      }
    ];
  }

  async generateActionableTasks(recommendation: Recommendation): Promise<Array<{
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    deadline: string;
    assignee?: string;
  }>> {
    return recommendation.actionSteps.map((step, index) => ({
      id: `${recommendation.id}_task_${index}`,
      title: step,
      description: `Étape ${index + 1} de l'implémentation: ${recommendation.title}`,
      status: 'pending' as const,
      deadline: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      assignee: 'system'
    }));
  }

  private getPriorityScore(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
}

export default RecommendationEngine;
