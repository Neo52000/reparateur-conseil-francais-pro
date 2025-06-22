
import { FirecrawlService } from './firecrawl-service.ts';
import { GeocodingService } from './geocoding-service.ts';
import { BusinessData } from './types.ts';

export class RealScrapingService {
  static async scrapeRealData(source: string, departmentCode?: string): Promise<BusinessData[]> {
    console.log(`🚀 Démarrage du vrai scraping pour ${source}${departmentCode ? ` - Département: ${departmentCode}` : ''}`);
    
    const locations = this.getTargetLocations(departmentCode);
    const allRepairers: BusinessData[] = [];
    
    for (const location of locations) {
      console.log(`🔍 Scraping ${location.name}...`);
      
      try {
        let scrapedData: any[] = [];
        
        if (source === 'pages_jaunes') {
          const result = await FirecrawlService.crawlPagesJaunes('réparation téléphone smartphone', location.name);
          if (result.success && result.data) {
            scrapedData = result.data;
          }
        } else if (source === 'google_places') {
          const result = await FirecrawlService.crawlGooglePlaces('réparation smartphone', location.name);
          if (result.success && result.data) {
            scrapedData = result.data;
          }
        }
        
        // Géocodage des adresses
        for (const repairer of scrapedData) {
          const geocoded = await GeocodingService.geocodeAddress(
            repairer.address,
            repairer.city,
            repairer.postal_code
          );
          
          if (geocoded) {
            repairer.lat = geocoded.lat;
            repairer.lng = geocoded.lng;
            console.log(`✅ Géocodé: ${repairer.name} -> ${geocoded.lat}, ${geocoded.lng}`);
          } else {
            // Fallback vers coordonnées départementales
            const fallback = GeocodingService.getFallbackCoordinates(repairer.postal_code || location.postal_code);
            repairer.lat = fallback.lat + (Math.random() - 0.5) * 0.01; // Légère randomisation
            repairer.lng = fallback.lng + (Math.random() - 0.5) * 0.01;
            console.log(`⚠️ Fallback géocodage pour: ${repairer.name}`);
          }
          
          allRepairers.push(repairer as BusinessData);
        }
        
        // Délai entre les locations pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Erreur scraping ${location.name}:`, error);
      }
    }
    
    console.log(`✅ Scraping terminé: ${allRepairers.length} réparateurs trouvés`);
    return allRepairers;
  }
  
  private static getTargetLocations(departmentCode?: string) {
    const allLocations = [
      { name: 'Paris', postal_code: '75000' },
      { name: 'Lyon', postal_code: '69000' },
      { name: 'Marseille', postal_code: '13000' },
      { name: 'Toulouse', postal_code: '31000' },
      { name: 'Nice', postal_code: '06000' },
      { name: 'Bordeaux', postal_code: '33000' },
      { name: 'Lille', postal_code: '59000' },
      { name: 'Strasbourg', postal_code: '67000' },
      { name: 'Nantes', postal_code: '44000' },
      { name: 'Rennes', postal_code: '35000' },
      { name: 'Montpellier', postal_code: '34000' },
      { name: 'Grenoble', postal_code: '38000' }
    ];
    
    if (departmentCode) {
      return allLocations.filter(loc => loc.postal_code.startsWith(departmentCode));
    }
    
    return allLocations;
  }
}
