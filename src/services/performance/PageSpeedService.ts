/**
 * Service PageSpeed Insights
 * Analyse de performance et monitoring
 */

export interface PageSpeedResult {
  mobile: number;
  desktop: number;
  opportunities: string[];
  diagnostics: string[];
  timestamp: string;
}

export class PageSpeedService {
  private baseUrl = 'https://www.googleapis.com/pagespeed/v5/runPagespeed';
  private apiKey: string | null = null;

  async initialize(): Promise<void> {
    // L'API key sera configurée via les edge functions
    console.log('PageSpeed Service initialisé');
  }

  async analyzeUrl(url: string): Promise<PageSpeedResult> {
    try {
      // Appel via edge function Supabase
      const response = await fetch('/functions/v1/pagespeed-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Erreur analyse PageSpeed');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur PageSpeed:', error);
      
      // Retourner des données de fallback
      return {
        mobile: 0,
        desktop: 0,
        opportunities: ['Impossible d\'analyser l\'URL'],
        diagnostics: ['Service PageSpeed temporairement indisponible'],
        timestamp: new Date().toISOString()
      };
    }
  }

  async getLatestScores(): Promise<{ mobile: number; desktop: number }> {
    try {
      // Récupérer les derniers scores depuis le cache local ou API
      const cachedScores = localStorage.getItem('pagespeed_scores');
      
      if (cachedScores) {
        const parsed = JSON.parse(cachedScores);
        const age = Date.now() - new Date(parsed.timestamp).getTime();
        
        // Utiliser le cache si moins de 6 heures
        if (age < 6 * 60 * 60 * 1000) {
          return {
            mobile: parsed.mobile,
            desktop: parsed.desktop
          };
        }
      }

      // Analyser l'URL courante
      const currentUrl = window.location.href;
      const result = await this.analyzeUrl(currentUrl);
      
      // Mettre en cache
      localStorage.setItem('pagespeed_scores', JSON.stringify({
        mobile: result.mobile,
        desktop: result.desktop,
        timestamp: new Date().toISOString()
      }));

      return {
        mobile: result.mobile,
        desktop: result.desktop
      };
    } catch (error) {
      console.error('Erreur récupération scores PageSpeed:', error);
      return { mobile: 0, desktop: 0 };
    }
  }

  /**
   * Analyser les opportunities d'optimisation
   */
  parseOpportunities(lighthouseResult: any): string[] {
    const opportunities: string[] = [];
    
    if (lighthouseResult?.audits) {
      const audits = lighthouseResult.audits;
      
      // Vérifier les principales optimisations
      if (audits['unused-css-rules']?.score < 1) {
        opportunities.push('Supprimer le CSS inutilisé');
      }
      
      if (audits['render-blocking-resources']?.score < 1) {
        opportunities.push('Éliminer les ressources qui bloquent le rendu');
      }
      
      if (audits['uses-webp-images']?.score < 1) {
        opportunities.push('Diffuser des images au format WebP');
      }
      
      if (audits['unused-javascript']?.score < 1) {
        opportunities.push('Supprimer le JavaScript inutilisé');
      }
      
      if (audits['largest-contentful-paint']?.numericValue > 2500) {
        opportunities.push('Améliorer le Largest Contentful Paint');
      }
      
      if (audits['first-input-delay']?.numericValue > 100) {
        opportunities.push('Réduire le First Input Delay');
      }
      
      if (audits['cumulative-layout-shift']?.numericValue > 0.1) {
        opportunities.push('Minimiser le Cumulative Layout Shift');
      }
    }
    
    return opportunities;
  }

  /**
   * Générer des recommandations personnalisées
   */
  generateRecommendations(result: PageSpeedResult): string[] {
    const recommendations: string[] = [];
    
    if (result.mobile < 90) {
      recommendations.push('Optimiser les images pour mobile');
      recommendations.push('Minifier le CSS et JavaScript');
      recommendations.push('Activer la compression gzip/brotli');
    }
    
    if (result.desktop < 90) {
      recommendations.push('Optimiser le cache navigateur');
      recommendations.push('Précharger les ressources critiques');
    }
    
    result.opportunities.forEach((opportunity) => {
      switch (true) {
        case opportunity.includes('WebP'):
          recommendations.push('Convertir les images en format WebP/AVIF');
          break;
        case opportunity.includes('CSS'):
          recommendations.push('Optimiser et minifier les feuilles de style');
          break;
        case opportunity.includes('JavaScript'):
          recommendations.push('Réduire et différer le JavaScript non-critique');
          break;
      }
    });
    
    return [...new Set(recommendations)]; // Supprimer les doublons
  }

  destroy(): void {
    // Nettoyer si nécessaire
  }
}