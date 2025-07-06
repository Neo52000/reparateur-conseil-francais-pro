/**
 * Service de suivi des Core Web Vitals
 * Mesure LCP, FID, CLS en temps réel
 */

import { getCLS, getFID, getLCP } from 'web-vitals';

export interface WebVitalsMetrics {
  lcp: number;
  fid: number;
  cls: number;
  timestamp: string;
}

export class WebVitalsTracker {
  private metrics: WebVitalsMetrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    timestamp: new Date().toISOString()
  };

  private callbacks: Array<(metrics: WebVitalsMetrics) => void> = [];
  private worker: Worker | null = null;

  async initialize(): Promise<void> {
    // Initialiser le Web Worker pour les calculs non-bloquants
    this.initializeWebWorker();

    // Écouter les Core Web Vitals
    getLCP((metric) => {
      this.metrics.lcp = metric.value;
      this.metrics.timestamp = new Date().toISOString();
      this.notifyCallbacks();
      this.optimizeLCP(metric);
    });

    getFID((metric) => {
      this.metrics.fid = metric.value;
      this.metrics.timestamp = new Date().toISOString();
      this.notifyCallbacks();
    });

    getCLS((metric) => {
      this.metrics.cls = metric.value;
      this.metrics.timestamp = new Date().toISOString();
      this.notifyCallbacks();
    });
  }

  private initializeWebWorker(): void {
    if (typeof Worker !== 'undefined') {
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch(type) {
            case 'CALCULATE_LCP_OPTIMIZATION':
              const optimization = calculateLCPOptimization(data);
              self.postMessage({ type: 'LCP_OPTIMIZATION_RESULT', result: optimization });
              break;
          }
        };
        
        function calculateLCPOptimization(lcpData) {
          // Calculs d'optimisation LCP non-bloquants
          const recommendations = [];
          
          if (lcpData.value > 2500) {
            recommendations.push('preload-images');
            recommendations.push('optimize-fonts');
          }
          
          if (lcpData.value > 4000) {
            recommendations.push('reduce-server-response');
            recommendations.push('minify-css');
          }
          
          return {
            priority: lcpData.value > 4000 ? 'high' : 'medium',
            recommendations,
            estimatedImprovement: Math.min(lcpData.value * 0.3, 1000)
          };
        }
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (e) => {
        const { type, result } = e.data;
        if (type === 'LCP_OPTIMIZATION_RESULT') {
          this.handleLCPOptimization(result);
        }
      };
    }
  }

  private optimizeLCP(metric: any): void {
    // Envoyer au Web Worker pour optimisation non-bloquante
    if (this.worker) {
      this.worker.postMessage({
        type: 'CALCULATE_LCP_OPTIMIZATION',
        data: metric
      });
    }

    // Optimisations immédiates si LCP critique
    if (metric.value > 4000) {
      this.applyCriticalLCPOptimizations();
    }
  }

  private applyCriticalLCPOptimizations(): void {
    // Précharger les images visibles
    const images = document.querySelectorAll('img[data-critical="true"]');
    images.forEach((img) => {
      if (img instanceof HTMLImageElement && !img.src) {
        const src = img.dataset.src;
        if (src) {
          img.src = src;
        }
      }
    });

    // Précharger les polices critiques
    const criticalFonts = document.querySelectorAll('link[rel="preload"][as="font"]');
    if (criticalFonts.length === 0) {
      this.addCriticalFontPreloads();
    }
  }

  private addCriticalFontPreloads(): void {
    const criticalFonts = [
      '/fonts/inter-regular.woff2',
      '/fonts/inter-medium.woff2',
      '/fonts/inter-semibold.woff2'
    ];

    criticalFonts.forEach((fontUrl) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  private handleLCPOptimization(optimization: any): void {
    console.log('Optimisation LCP calculée:', optimization);
    
    if (optimization.priority === 'high') {
      // Appliquer les optimisations critiques
      optimization.recommendations.forEach((rec: string) => {
        switch (rec) {
          case 'preload-images':
            this.preloadCriticalImages();
            break;
          case 'optimize-fonts':
            this.optimizeFontLoading();
            break;
          case 'minify-css':
            this.optimizeCSSLoading();
            break;
        }
      });
    }
  }

  private preloadCriticalImages(): void {
    // Identifier et précharger les images above-the-fold
    const aboveFoldImages = document.querySelectorAll('img');
    aboveFoldImages.forEach((img, index) => {
      if (index < 3) { // Les 3 premières images
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          img.loading = 'eager';
          img.fetchPriority = 'high';
        }
      }
    });
  }

  private optimizeFontLoading(): void {
    // Appliquer font-display: swap à toutes les polices
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap;
      }
      * {
        font-display: swap !important;
      }
    `;
    document.head.appendChild(style);
  }

  private optimizeCSSLoading(): void {
    // Différer le CSS non-critique
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach((link, index) => {
      if (index > 0) { // Garder le premier CSS comme critique
        link.setAttribute('media', 'print');
        link.addEventListener('load', () => {
          link.setAttribute('media', 'all');
        });
      }
    });
  }

  getCurrentMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  onMetricsUpdate(callback: (metrics: WebVitalsMetrics) => void): void {
    this.callbacks.push(callback);
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.metrics));
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.callbacks = [];
  }
}