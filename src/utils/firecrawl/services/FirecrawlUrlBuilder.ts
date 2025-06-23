
export class FirecrawlUrlBuilder {
  static buildPagesJaunesUrl(searchTerm: string, location: string): string {
    return `https://www.pagesjaunes.fr/pagesblanches/recherche?quoi=${encodeURIComponent(searchTerm)}&ou=${encodeURIComponent(location)}`;
  }

  static buildGooglePlacesUrl(searchTerm: string, location: string): string {
    return `https://www.google.com/maps/search/${encodeURIComponent(searchTerm + ' ' + location)}`;
  }

  static buildCrawlOptions(includes?: string[], limit: number = 50) {
    return {
      crawlOptions: {
        includes: includes || ['**'],
        limit
      },
      pageOptions: {
        formats: ['markdown', 'html']
      }
    };
  }

  static buildScrapeOptions() {
    return {
      formats: ['markdown', 'html']
    };
  }
}
