
import { Recommendation } from '../types/RecommendationTypes';

export class DemoRecommendationsService {
  static generateDemoRecommendations(): Recommendation[] {
    console.log('🎭 DemoRecommendationsService - Génération recommandations de démonstration');
    
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
    ];
  }
}
