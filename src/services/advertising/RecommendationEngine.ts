
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
      return this.generateDemoRecommendations();
    } else {
      return this.generateRealRecommendations();
    }
  }

  // Génère des recommandations basées sur de vraies données
  private async generateRealRecommendations(): Promise<Recommendation[]> {
    console.log('📊 RecommendationEngine - Génération recommandations réelles');
    const recommendations: Recommendation[] = [];

    try {
      // Analyser les données réelles pour générer des recommandations pertinentes
      const { data: campaigns } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('status', 'active');

      const { data: recentImpressions } = await supabase
        .from('ad_impressions')
        .select('banner_id, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: recentClicks } = await supabase
        .from('ad_clicks')
        .select('banner_id, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Recommandations basées sur l'activité réelle
      if (!campaigns || campaigns.length === 0) {
        recommendations.push({
          id: 'real_no_campaigns',
          type: 'budget',
          title: 'Démarrez votre première campagne publicitaire',
          description: 'Aucune campagne active détectée. Créez votre première campagne pour commencer à attirer des clients.',
          impact: {
            metric: 'Génération de leads',
            expectedChange: 100,
            confidence: 95
          },
          actionSteps: [
            'Définir votre audience cible',
            'Créer des visuels attractifs',
            'Fixer un budget initial de test',
            'Lancer la campagne et suivre les performances'
          ],
          priority: 'high',
          estimatedImplementationTime: 45,
          resources: ['Guide de démarrage', 'Templates de campagne', 'Calculateur de budget']
        });
      }

      if (recentImpressions && recentClicks) {
        const totalImpressions = recentImpressions.length;
        const totalClicks = recentClicks.length;
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        if (ctr < 2.0 && totalImpressions > 100) {
          recommendations.push({
            id: 'real_low_ctr_optimization',
            type: 'creative',
            title: 'Optimisation nécessaire - CTR faible',
            description: `Votre CTR actuel de ${ctr.toFixed(2)}% est en dessous de la moyenne du secteur (2.5%)`,
            impact: {
              metric: 'Taux de clic (CTR)',
              expectedChange: 45,
              confidence: 82
            },
            actionSteps: [
              'Analyser les créatifs les moins performants',
              'Tester de nouveaux formats visuels',
              'Améliorer les accroches et call-to-action',
              'A/B tester les nouvelles versions'
            ],
            priority: 'high',
            estimatedImplementationTime: 90,
            resources: ['Bibliothèque de créatifs', 'Guide A/B testing', 'Exemples d\'accroches']
          });
        }

        if (totalImpressions > 500 && ctr > 3.0) {
          recommendations.push({
            id: 'real_scale_success',
            type: 'budget',
            title: 'Opportunité de scaling - Performance excellente',
            description: `Votre CTR de ${ctr.toFixed(2)}% est excellent. Considérez augmenter le budget.`,
            impact: {
              metric: 'Revenus mensuels',
              expectedChange: 300,
              confidence: 89
            },
            actionSteps: [
              'Analyser la capacité d\'absorption du marché',
              'Augmenter progressivement le budget (+20%)',
              'Surveiller les métriques de performance',
              'Ajuster si le CPA augmente trop'
            ],
            priority: 'medium',
            estimatedImplementationTime: 20,
            resources: ['Calculateur de scaling', 'Guide budgétaire', 'Tableaux de suivi']
          });
        }
      }

      // Recommandation générale si peu de données
      if (recommendations.length === 0) {
        recommendations.push({
          id: 'real_general_optimization',
          type: 'targeting',
          title: 'Analyse et optimisation générale',
          description: 'Optimisez votre stratégie publicitaire avec une analyse complète de vos performances',
          impact: {
            metric: 'Performance globale',
            expectedChange: 25,
            confidence: 75
          },
          actionSteps: [
            'Examiner les données de performance actuelles',
            'Identifier les segments d\'audience les plus engagés',
            'Optimiser le ciblage géographique et démographique',
            'Ajuster les budgets selon les performances'
          ],
          priority: 'medium',
          estimatedImplementationTime: 60,
          resources: ['Analytics avancés', 'Rapport de performance', 'Guide d\'optimisation']
        });
      }

    } catch (error) {
      console.error('❌ Erreur génération recommandations réelles:', error);
    }

    return recommendations.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
  }

  // Génère des recommandations de démonstration
  private generateDemoRecommendations(): Recommendation[] {
    console.log('🎭 RecommendationEngine - Génération recommandations de démonstration');
    
    return [
      {
        id: 'demo_budget_reallocation_001',
        type: 'budget',
        title: 'Réallocation budgétaire intelligente (Démo)',
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
        id: 'demo_budget_scaling_002',
        type: 'budget',
        title: 'Opportunité de scale-up (Démo)',
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
      },
      {
        id: 'demo_targeting_segment_001',
        type: 'targeting',
        title: 'Nouveau segment à fort potentiel (Démo)',
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
        id: 'demo_creative_refresh_001',
        type: 'creative',
        title: 'Rafraîchissement créatifs nécessaire (Démo)',
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
        id: 'demo_timing_optimization_001',
        type: 'timing',
        title: 'Optimisation des heures de diffusion (Démo)',
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
    ].sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
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
