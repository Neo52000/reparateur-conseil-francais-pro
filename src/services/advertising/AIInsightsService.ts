import { supabase } from '@/integrations/supabase/client';

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'optimization' | 'alert' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  actionable: boolean;
  action?: {
    type: string;
    label: string;
    data: any;
  };
  metadata?: any;
  created_at: string;
}

export interface PerformanceMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  roi: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface CampaignInsight {
  campaign_id: string;
  campaign_name: string;
  performance: PerformanceMetrics;
  insights: AIInsight[];
  predictions: {
    nextWeekPerformance: PerformanceMetrics;
    budgetRecommendation: number;
    optimalBidding: number;
  };
}

class AIInsightsService {
  private static instance: AIInsightsService;

  static getInstance(): AIInsightsService {
    if (!this.instance) {
      this.instance = new AIInsightsService();
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
      console.log('🎯 AIInsightsService - Mode démo vérifié:', enabled);
      return enabled;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du mode démo:', error);
      return false;
    }
  }

  // Génère des insights IA basés sur les données réelles OU de démo
  async generateInsights(): Promise<AIInsight[]> {
    const demoModeEnabled = await this.isDemoModeEnabled();
    console.log('🔄 AIInsightsService - Génération insights, mode démo:', demoModeEnabled);

    if (demoModeEnabled) {
      return this.generateDemoInsights();
    } else {
      return this.generateRealInsights();
    }
  }

  // Génère des insights basés sur de vraies données
  private async generateRealInsights(): Promise<AIInsight[]> {
    try {
      console.log('📊 AIInsightsService - Génération insights réels');
      
      // Récupérer les données de performance récentes depuis la base
      const { data: campaigns } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('status', 'active');

      const insights: AIInsight[] = [];

      // Si pas de campagnes actives, retourner des suggestions de base
      if (!campaigns || campaigns.length === 0) {
        insights.push({
          id: `no_campaigns_${Date.now()}`,
          type: 'recommendation',
          priority: 'medium',
          title: 'Aucune campagne active détectée',
          description: 'Créez votre première campagne publicitaire pour commencer à générer des leads',
          impact: 'Commencer à attirer des clients potentiels',
          confidence: 100,
          actionable: true,
          action: {
            type: 'create_campaign',
            label: 'Créer une campagne',
            data: { action: 'redirect_to_campaigns' }
          },
          created_at: new Date().toISOString()
        });
        return insights;
      }

      // Analyser chaque campagne pour générer des insights réels
      for (const campaign of campaigns) {
        const campaignInsights = await this.analyzeRealCampaignPerformance(campaign);
        insights.push(...campaignInsights);
      }

      // Ajouter des insights généraux basés sur les vraies données
      const generalInsights = await this.generateRealGeneralInsights();
      insights.push(...generalInsights);

      return insights.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
    } catch (error) {
      console.error('❌ Erreur lors de la génération d\'insights réels:', error);
      return [];
    }
  }

  // Génère des insights de démonstration
  private generateDemoInsights(): AIInsight[] {
    console.log('🎭 AIInsightsService - Génération insights de démonstration');
    
    return [
      {
        id: `demo_opportunity_${Date.now()}`,
        type: 'opportunity',
        priority: 'high',
        title: 'Campagne Lyon surperforme (Démo)',
        description: 'ROI de 285% avec une tendance positive de +15% cette semaine',
        impact: 'Augmenter le budget pourrait générer +1,200€ de revenus supplémentaires',
        confidence: 94,
        actionable: true,
        action: {
          type: 'increase_budget',
          label: 'Augmenter le budget de 25%',
          data: { campaign: 'lyon_demo', increase_percent: 25 }
        },
        created_at: new Date().toISOString()
      },
      {
        id: `demo_alert_${Date.now()}`,
        type: 'alert',
        priority: 'medium',
        title: 'CTR en baisse sur mobiles (Démo)',
        description: 'CTR mobile de 2.1% contre 3.8% sur desktop',
        impact: 'Optimiser pour mobile pourrait récupérer 300 clics/semaine',
        confidence: 87,
        actionable: true,
        action: {
          type: 'optimize_mobile',
          label: 'Optimiser créatifs mobiles',
          data: { focus: 'mobile_optimization' }
        },
        created_at: new Date().toISOString()
      },
      {
        id: `demo_recommendation_${Date.now()}`,
        type: 'recommendation',
        priority: 'high',
        title: 'Nouveau segment haute performance (Démo)',
        description: 'iOS Premium 25-35 ans Paris : taux de conversion 8.2%',
        impact: 'Potentiel de +2,400€/mois en ciblant ce segment',
        confidence: 91,
        actionable: true,
        action: {
          type: 'create_lookalike',
          label: 'Créer audience similaire',
          data: { segment: 'ios_premium_paris_25_35' }
        },
        created_at: new Date().toISOString()
      },
      {
        id: `demo_optimization_${Date.now()}`,
        type: 'optimization',
        priority: 'medium',
        title: 'Heures optimales détectées (Démo)',
        description: 'Mardis 14h-16h : CPA 40% plus bas que la moyenne',
        impact: 'Réallocation horaire pourrait réduire les coûts de 18%',
        confidence: 89,
        actionable: true,
        action: {
          type: 'schedule_optimization',
          label: 'Ajuster la programmation',
          data: { optimal_hours: 'tuesday_14_16' }
        },
        created_at: new Date().toISOString()
      },
      {
        id: `demo_seasonal_${Date.now()}`,
        type: 'recommendation',
        priority: 'critical',
        title: 'Pic saisonnier imminent (Démo)',
        description: 'Historiquement +67% de demandes la semaine prochaine',
        impact: 'Préparation nécessaire pour capturer 40% de trafic supplémentaire',
        confidence: 96,
        actionable: true,
        action: {
          type: 'prepare_seasonal',
          label: 'Préparer campagne saisonnière',
          data: { season: 'peak_week', traffic_increase: 67 }
        },
        created_at: new Date().toISOString()
      }
    ];
  }

  // Analyse les performances réelles d'une campagne
  private async analyzeRealCampaignPerformance(campaign: any): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Récupérer les métriques réelles de performance
    const { data: impressions } = await supabase
      .from('ad_impressions')
      .select('id')
      .eq('banner_id', campaign.id);

    const { data: clicks } = await supabase
      .from('ad_clicks')
      .select('id')
      .eq('banner_id', campaign.id);

    const impressionCount = impressions?.length || 0;
    const clickCount = clicks?.length || 0;
    const ctr = impressionCount > 0 ? (clickCount / impressionCount) * 100 : 0;

    // Générer des insights basés sur les vraies métriques
    if (ctr < 1.0 && impressionCount > 100) {
      insights.push({
        id: `real_low_ctr_${campaign.id}`,
        type: 'alert',
        priority: 'medium',
        title: `CTR faible pour ${campaign.name}`,
        description: `CTR de ${ctr.toFixed(2)}% sur ${impressionCount} impressions`,
        impact: 'Optimiser les créatifs pour améliorer l\'engagement',
        confidence: 85,
        actionable: true,
        action: {
          type: 'optimize_creative',
          label: 'Revoir les créatifs',
          data: { campaign_id: campaign.id }
        },
        created_at: new Date().toISOString()
      });
    }

    if (ctr > 3.0 && impressionCount > 50) {
      insights.push({
        id: `real_high_performance_${campaign.id}`,
        type: 'opportunity',
        priority: 'high',
        title: `Excellente performance : ${campaign.name}`,
        description: `CTR de ${ctr.toFixed(2)}% - bien au-dessus de la moyenne`,
        impact: 'Considérer augmenter le budget pour cette campagne performante',
        confidence: 92,
        actionable: true,
        action: {
          type: 'scale_budget',
          label: 'Augmenter le budget',
          data: { campaign_id: campaign.id, suggested_increase: 50 }
        },
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  // Génère des insights généraux basés sur les vraies données
  private async generateRealGeneralInsights(): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyser les tendances générales dans la base de données
    const { data: recentClicks } = await supabase
      .from('ad_clicks')
      .select('created_at, placement')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (recentClicks && recentClicks.length > 0) {
      // Analyser les placements les plus performants
      const placementStats: { [key: string]: number } = {};
      recentClicks.forEach(click => {
        placementStats[click.placement] = (placementStats[click.placement] || 0) + 1;
      });

      const topPlacement = Object.entries(placementStats)
        .sort(([,a], [,b]) => b - a)[0];

      if (topPlacement) {
        insights.push({
          id: `real_top_placement_${Date.now()}`,
          type: 'recommendation',
          priority: 'medium',
          title: `Placement performant identifié`,
          description: `${topPlacement[0]} génère ${topPlacement[1]} clics cette semaine`,
          impact: 'Concentrer plus de budget sur ce placement pourrait améliorer les résultats',
          confidence: 78,
          actionable: true,
          action: {
            type: 'optimize_placement',
            label: 'Optimiser ce placement',
            data: { placement: topPlacement[0], clicks: topPlacement[1] }
          },
          created_at: new Date().toISOString()
        });
      }
    }

    // Si peu de données, suggérer des améliorations de base
    if (!recentClicks || recentClicks.length < 10) {
      insights.push({
        id: `real_low_activity_${Date.now()}`,
        type: 'recommendation',
        priority: 'high',
        title: 'Activité publicitaire faible détectée',
        description: 'Moins de 10 interactions cette semaine',
        impact: 'Augmenter la visibilité pour générer plus d\'engagement',
        confidence: 90,
        actionable: true,
        action: {
          type: 'increase_visibility',
          label: 'Booster la visibilité',
          data: { suggestion: 'increase_budget_or_targeting' }
        },
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  async generateRecommendations(userId?: string): Promise<AIInsight[]> {
    const demoModeEnabled = await this.isDemoModeEnabled();
    
    if (demoModeEnabled) {
      return this.generateDemoRecommendations();
    } else {
      return this.generateRealRecommendations(userId);
    }
  }

  private generateDemoRecommendations(): AIInsight[] {
    return [
      {
        id: `demo_rec_budget_${Date.now()}`,
        type: 'recommendation',
        priority: 'medium',
        title: 'Optimisation budgétaire intelligente (Démo)',
        description: 'Redistribuer 15% du budget des campagnes sous-performantes vers les leaders',
        impact: 'ROI global estimé: +47%',
        confidence: 91,
        actionable: true,
        action: {
          type: 'rebalance_budget',
          label: 'Appliquer la redistribution',
          data: { optimization_type: 'performance_based' }
        },
        created_at: new Date().toISOString()
      },
      {
        id: `demo_rec_targeting_${Date.now()}`,
        type: 'optimization',
        priority: 'high',
        title: 'Nouveau segment haute performance identifié (Démo)',
        description: 'Clients Premium 25-35 ans à Lyon montrent un taux de conversion de 8.2%',
        impact: 'Potentiel de revenus additionnels: +2,400€/mois',
        confidence: 94,
        actionable: true,
        action: {
          type: 'create_lookalike_audience',
          label: 'Créer une audience similaire',
          data: { base_segment: 'premium_lyon_25_35', expansion_rate: 5 }
        },
        created_at: new Date().toISOString()
      }
    ];
  }

  private async generateRealRecommendations(userId?: string): Promise<AIInsight[]> {
    const recommendations: AIInsight[] = [];

    // Générer des recommandations basées sur les vraies données utilisateur
    try {
      const { data: userCampaigns } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('created_by', userId);

      if (!userCampaigns || userCampaigns.length === 0) {
        recommendations.push({
          id: `real_first_campaign_${Date.now()}`,
          type: 'recommendation',
          priority: 'high',
          title: 'Créez votre première campagne',
          description: 'Commencez par une campagne ciblée pour tester vos audiences',
          impact: 'Démarrer la génération de leads qualifiés',
          confidence: 100,
          actionable: true,
          action: {
            type: 'create_first_campaign',
            label: 'Créer ma première campagne',
            data: { template: 'beginner_friendly' }
          },
          created_at: new Date().toISOString()
        });
      } else {
        // Recommandations basées sur les campagnes existantes
        recommendations.push({
          id: `real_campaign_optimization_${Date.now()}`,
          type: 'optimization',
          priority: 'medium',
          title: 'Optimisation de vos campagnes existantes',
          description: `Analysez les performances de vos ${userCampaigns.length} campagnes actives`,
          impact: 'Améliorer le ROI de vos campagnes actuelles',
          confidence: 85,
          actionable: true,
          action: {
            type: 'analyze_campaigns',
            label: 'Analyser les performances',
            data: { campaign_count: userCampaigns.length }
          },
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erreur génération recommandations réelles:', error);
    }

    return recommendations;
  }

  async generatePredictions(campaignId: string): Promise<any> {
    const demoModeEnabled = await this.isDemoModeEnabled();
    
    if (demoModeEnabled) {
      return this.generateDemoPredictions();
    } else {
      return this.generateRealPredictions(campaignId);
    }
  }

  private generateDemoPredictions(): any {
    return {
      nextWeekPerformance: {
        impressions: 15000,
        clicks: 450,
        conversions: 38,
        predictedRoi: 275
      },
      budgetOptimization: {
        recommendedBudget: 1200,
        expectedRoi: 280,
        confidenceLevel: 87
      }
    };
  }

  private async generateRealPredictions(campaignId: string): Promise<any> {
    // Récupérer les données historiques de la campagne
    const { data: historicalData } = await supabase
      .from('ad_impressions')
      .select('created_at')
      .eq('banner_id', campaignId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const baseMetrics = historicalData?.length || 0;
    
    return {
      nextWeekPerformance: {
        impressions: Math.max(baseMetrics * 1.1, 100),
        clicks: Math.max(Math.floor(baseMetrics * 0.03), 5),
        conversions: Math.max(Math.floor(baseMetrics * 0.005), 1),
        predictedRoi: baseMetrics > 0 ? 150 + Math.random() * 100 : 120
      },
      budgetOptimization: {
        recommendedBudget: Math.max(baseMetrics * 0.5, 200),
        expectedRoi: 180 + Math.random() * 50,
        confidenceLevel: baseMetrics > 100 ? 85 : 60
      }
    };
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

export default AIInsightsService;
