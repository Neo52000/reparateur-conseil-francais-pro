/**
 * Service central d'optimisation de performance
 * Restriction: Plans Premium/Enterprise uniquement
 */

import { supabase } from '@/integrations/supabase/client';
import { WebVitalsTracker } from './WebVitalsTracker';
import { ImageOptimizer } from './ImageOptimizer';
import { FontPreloader } from './FontPreloader';
import { PageSpeedService } from './PageSpeedService';
import { CacheManager } from './CacheManager';

export interface PerformanceConfig {
  enableImageOptimization: boolean;
  enableFontPreloading: boolean;
  enableWebVitalsTracking: boolean;
  enablePageSpeedMonitoring: boolean;
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
}

export interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  pageSpeedMobile: number;
  pageSpeedDesktop: number;
  timestamp: string;
}

class PerformanceOptimizerService {
  private webVitals: WebVitalsTracker;
  private imageOptimizer: ImageOptimizer;
  private fontPreloader: FontPreloader;
  private pageSpeed: PageSpeedService;
  private cacheManager: CacheManager;
  private isInitialized = false;

  constructor() {
    this.webVitals = new WebVitalsTracker();
    this.imageOptimizer = new ImageOptimizer();
    this.fontPreloader = new FontPreloader();
    this.pageSpeed = new PageSpeedService();
    this.cacheManager = new CacheManager();
  }

  /**
   * Vérifier l'accès aux fonctionnalités premium
   */
  async hasPerformanceAccess(userId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('repairer_subscriptions')
        .select('subscription_tier')
        .eq('user_id', userId)
        .eq('subscribed', true)
        .single();

      return data?.subscription_tier === 'premium' || data?.subscription_tier === 'enterprise';
    } catch (error) {
      console.error('Erreur vérification accès performance:', error);
      return false;
    }
  }

  /**
   * Initialiser le module d'optimisation
   */
  async initialize(userId: string, config?: Partial<PerformanceConfig>): Promise<boolean> {
    if (this.isInitialized) return true;

    // Vérifier l'accès premium
    const hasAccess = await this.hasPerformanceAccess(userId);
    if (!hasAccess) {
      console.warn('Accès Performance réservé aux plans Premium/Enterprise');
      return false;
    }

    const defaultConfig: PerformanceConfig = {
      enableImageOptimization: true,
      enableFontPreloading: true,
      enableWebVitalsTracking: true,
      enablePageSpeedMonitoring: true,
      cacheStrategy: 'balanced'
    };

    const finalConfig = { ...defaultConfig, ...config };

    try {
      // Initialiser les services
      if (finalConfig.enableWebVitalsTracking) {
        await this.webVitals.initialize();
      }

      if (finalConfig.enableImageOptimization) {
        await this.imageOptimizer.initialize();
      }

      if (finalConfig.enableFontPreloading) {
        await this.fontPreloader.initialize();
      }

      if (finalConfig.enablePageSpeedMonitoring) {
        await this.pageSpeed.initialize();
      }

      await this.cacheManager.initialize(finalConfig.cacheStrategy);

      this.isInitialized = true;
      
      // Enregistrer l'activation
      await this.logPerformanceEvent(userId, 'module_activated', { config: finalConfig });
      
      return true;
    } catch (error) {
      console.error('Erreur initialisation PerformanceOptimizer:', error);
      return false;
    }
  }

  /**
   * Obtenir les métriques de performance
   */
  async getPerformanceMetrics(userId: string): Promise<PerformanceMetrics | null> {
    const hasAccess = await this.hasPerformanceAccess(userId);
    if (!hasAccess) return null;

    try {
      const [webVitals, pageSpeedScores] = await Promise.all([
        this.webVitals.getCurrentMetrics(),
        this.pageSpeed.getLatestScores()
      ]);

      return {
        lcp: webVitals.lcp,
        fid: webVitals.fid,
        cls: webVitals.cls,
        pageSpeedMobile: pageSpeedScores.mobile,
        pageSpeedDesktop: pageSpeedScores.desktop,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur récupération métriques:', error);
      return null;
    }
  }

  /**
   * Optimiser une image
   */
  async optimizeImage(imageFile: File, userId: string): Promise<File | null> {
    const hasAccess = await this.hasPerformanceAccess(userId);
    if (!hasAccess) return null;

    return await this.imageOptimizer.optimizeImage(imageFile);
  }

  /**
   * Précharger les polices critiques
   */
  async preloadCriticalFonts(userId: string): Promise<void> {
    const hasAccess = await this.hasPerformanceAccess(userId);
    if (!hasAccess) return;

    await this.fontPreloader.preloadCriticalFonts();
  }

  /**
   * Lancer une analyse PageSpeed
   */
  async runPageSpeedAnalysis(url: string, userId: string): Promise<any> {
    const hasAccess = await this.hasPerformanceAccess(userId);
    if (!hasAccess) throw new Error('Accès PageSpeed réservé aux plans Premium/Enterprise');

    return await this.pageSpeed.analyzeUrl(url);
  }

  /**
   * Obtenir les recommandations d'optimisation
   */
  async getOptimizationRecommendations(userId: string): Promise<string[]> {
    const hasAccess = await this.hasPerformanceAccess(userId);
    if (!hasAccess) return [];

    const metrics = await this.getPerformanceMetrics(userId);
    if (!metrics) return [];

    const recommendations: string[] = [];

    if (metrics.lcp > 2500) {
      recommendations.push('Optimiser le Largest Contentful Paint - précharger les images critiques');
    }

    if (metrics.fid > 100) {
      recommendations.push('Réduire le First Input Delay - utiliser des Web Workers');
    }

    if (metrics.cls > 0.1) {
      recommendations.push('Minimiser le Cumulative Layout Shift - réserver l\'espace des images');
    }

    if (metrics.pageSpeedMobile < 90) {
      recommendations.push('Améliorer le score PageSpeed mobile - compresser les images');
    }

    if (metrics.pageSpeedDesktop < 90) {
      recommendations.push('Améliorer le score PageSpeed desktop - minifier le CSS/JS');
    }

    return recommendations;
  }

  /**
   * Enregistrer un événement de performance
   */
  private async logPerformanceEvent(userId: string, eventType: string, data: any): Promise<void> {
    try {
      await supabase.from('performance_metrics').insert({
        user_id: userId,
        event_type: eventType,
        event_data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur enregistrement événement performance:', error);
    }
  }

  /**
   * Nettoyer les ressources
   */
  destroy(): void {
    this.webVitals.destroy();
    this.imageOptimizer.destroy();
    this.fontPreloader.destroy();
    this.pageSpeed.destroy();
    this.cacheManager.destroy();
    this.isInitialized = false;
  }
}

export const performanceOptimizer = new PerformanceOptimizerService();