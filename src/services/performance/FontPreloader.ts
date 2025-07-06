/**
 * Service de préchargement des polices
 * Optimisation du chargement des fonts critiques
 */

export class FontPreloader {
  private preloadedFonts: Set<string> = new Set();

  async initialize(): Promise<void> {
    this.detectUsedFonts();
    this.preloadCriticalFonts();
    this.optimizeFontDisplay();
  }

  private detectUsedFonts(): void {
    // Analyser les polices utilisées dans le CSS
    const stylesheets = Array.from(document.styleSheets);
    const usedFonts: string[] = [];

    stylesheets.forEach((stylesheet) => {
      try {
        const rules = Array.from(stylesheet.cssRules || []);
        rules.forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            const fontFamily = rule.style.fontFamily;
            if (fontFamily && !usedFonts.includes(fontFamily)) {
              usedFonts.push(fontFamily);
            }
          }
        });
      } catch (e) {
        // Ignorer les erreurs CORS
      }
    });

    console.log('Polices détectées:', usedFonts);
  }

  async preloadCriticalFonts(): Promise<void> {
    // Polices critiques à précharger
    const criticalFonts = [
      {
        family: 'Inter',
        weight: '400',
        style: 'normal',
        url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
      },
      {
        family: 'Inter',
        weight: '500',
        style: 'normal', 
        url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2'
      },
      {
        family: 'Inter',
        weight: '600',
        style: 'normal',
        url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2'
      }
    ];

    for (const font of criticalFonts) {
      await this.preloadFont(font);
    }
  }

  private async preloadFont(font: { family: string; weight: string; style: string; url: string }): Promise<void> {
    const fontKey = `${font.family}-${font.weight}-${font.style}`;
    
    if (this.preloadedFonts.has(fontKey)) {
      return;
    }

    // Créer le lien de préchargement
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font.url;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    
    // Ajouter au head
    document.head.appendChild(link);

    // Créer la règle CSS @font-face
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: '${font.family}';
        font-style: ${font.style};
        font-weight: ${font.weight};
        font-display: swap;
        src: url('${font.url}') format('woff2');
      }
    `;
    document.head.appendChild(style);

    this.preloadedFonts.add(fontKey);

    console.log(`Police préchargée: ${fontKey}`);
  }

  private optimizeFontDisplay(): void {
    // Injecter font-display: swap pour toutes les polices Google Fonts
    const googleFontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    
    googleFontLinks.forEach((link) => {
      const href = (link as HTMLLinkElement).href;
      if (href && !href.includes('display=swap')) {
        const separator = href.includes('?') ? '&' : '?';
        (link as HTMLLinkElement).href = `${href}${separator}display=swap`;
      }
    });

    // Ajouter CSS pour font-display global
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap;
      }
      
      /* Optimisation police système par défaut */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Précharger une police personnalisée
   */
  async preloadCustomFont(fontFamily: string, fontUrl: string, weight = '400', style = 'normal'): Promise<void> {
    await this.preloadFont({
      family: fontFamily,
      weight,
      style,
      url: fontUrl
    });
  }

  /**
   * Obtenir les polices préchargées
   */
  getPreloadedFonts(): string[] {
    return Array.from(this.preloadedFonts);
  }

  destroy(): void {
    // Nettoyer les préchargements si nécessaire
    this.preloadedFonts.clear();
  }
}