/**
 * FirecrawlService - DEPRECATED
 * Ce service n'est plus utilisé car Firecrawl ne fonctionne pas bien pour le scraping de Pages Jaunes.
 * Utilisez plutôt:
 * - scrape-repairers (Serper API) pour Google Places
 * - ai-scrape-repairers pour la génération IA
 * 
 * @deprecated Utiliser Serper ou AI Generation à la place
 */
export class FirecrawlService {
  /**
   * @deprecated Les clés API sont gérées côté serveur
   */
  static saveApiKey(_apiKey: string): void {
    console.warn('FirecrawlService est déprécié. Utilisez Serper ou AI Generation.');
  }

  /**
   * @deprecated Les clés API ne sont plus accessibles côté client
   */
  static getApiKey(): string | null {
    console.warn('FirecrawlService est déprécié. Utilisez Serper ou AI Generation.');
    return null;
  }

  /**
   * @deprecated Utilisez les Edge Functions appropriées
   */
  static async testApiKey(_apiKey: string): Promise<boolean> {
    console.warn('FirecrawlService est déprécié. Utilisez Serper ou AI Generation.');
    return false;
  }
}
