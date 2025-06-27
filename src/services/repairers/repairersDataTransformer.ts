
import type { Database } from '@/integrations/supabase/types';
import type { Repairer } from '@/types/repairer';

type SupabaseRepairer = Database['public']['Tables']['repairers']['Row'];

// Coordonnées de fallback par ville française
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'paris': { lat: 48.8566, lng: 2.3522 },
  'lyon': { lat: 45.7640, lng: 4.8357 },
  'marseille': { lat: 43.2965, lng: 5.3698 },
  'toulouse': { lat: 43.6047, lng: 1.4442 },
  'nice': { lat: 43.7102, lng: 7.2620 },
  'bordeaux': { lat: 44.8378, lng: -0.5792 },
  'lille': { lat: 50.6292, lng: 3.0573 },
  'strasbourg': { lat: 48.5734, lng: 7.7521 },
  'nantes': { lat: 47.2184, lng: -1.5536 },
  'rennes': { lat: 48.1173, lng: -1.6778 },
  'montpellier': { lat: 43.6108, lng: 3.8767 },
  'grenoble': { lat: 45.1885, lng: 5.7245 },
  'dijon': { lat: 47.3220, lng: 5.0415 },
  'angers': { lat: 47.4784, lng: -0.5632 },
  'reims': { lat: 49.2628, lng: 4.0347 },
  'nancy': { lat: 48.6921, lng: 6.1844 },
  'metz': { lat: 49.1193, lng: 6.1757 },
  'clermont-ferrand': { lat: 45.7797, lng: 3.0863 },
  'tours': { lat: 47.3941, lng: 0.6848 },
  'orleans': { lat: 47.9029, lng: 1.9093 }
};

export class RepairersDataTransformer {
  static transformSupabaseData(data: SupabaseRepairer[]): Repairer[] {
    return data.map((repairer: SupabaseRepairer): Repairer => {
      // Nettoyer les coordonnées
      const cleanedCoordinates = this.getValidCoordinates(repairer);
      
      return {
        id: repairer.id,
        name: this.cleanText(repairer.name),
        business_name: this.cleanText(repairer.name),
        address: this.cleanText(repairer.address),
        city: this.cleanText(repairer.city),
        postal_code: repairer.postal_code,
        department: repairer.department || '',
        region: repairer.region || '',
        phone: repairer.phone || undefined,
        website: repairer.website || undefined,
        email: repairer.email || undefined,
        lat: cleanedCoordinates.lat,
        lng: cleanedCoordinates.lng,
        rating: repairer.rating || undefined,
        review_count: repairer.review_count || undefined,
        services: repairer.services || [],
        specialties: repairer.specialties || [],
        price_range: (repairer.price_range === 'low' || repairer.price_range === 'medium' || repairer.price_range === 'high') 
          ? repairer.price_range 
          : 'medium',
        response_time: repairer.response_time || undefined,
        opening_hours: repairer.opening_hours ? 
          (typeof repairer.opening_hours === 'object' ? repairer.opening_hours as Record<string, string> : null) : 
          null,
        is_verified: repairer.is_verified || false,
        is_open: repairer.is_open || undefined,
        has_qualirepar_label: false,
        source: repairer.source as 'pages_jaunes' | 'google_places' | 'manual',
        scraped_at: repairer.scraped_at,
        updated_at: repairer.updated_at,
        created_at: repairer.created_at
      };
    });
  }

  /**
   * Obtenir des coordonnées valides avec fallback
   */
  private static getValidCoordinates(repairer: SupabaseRepairer): { lat: number; lng: number } {
    // Vérifier si les coordonnées existent et sont valides
    const hasValidCoords = repairer.lat && 
                          repairer.lng && 
                          typeof repairer.lat === 'number' && 
                          typeof repairer.lng === 'number' &&
                          !isNaN(Number(repairer.lat)) && 
                          !isNaN(Number(repairer.lng)) &&
                          Math.abs(Number(repairer.lat)) <= 90 && 
                          Math.abs(Number(repairer.lng)) <= 180 &&
                          Number(repairer.lat) !== 0 &&
                          Number(repairer.lng) !== 0;

    if (hasValidCoords) {
      return {
        lat: Number(repairer.lat),
        lng: Number(repairer.lng)
      };
    }

    // Fallback basé sur la ville
    const cityKey = this.cleanText(repairer.city).toLowerCase();
    const cityCoords = CITY_COORDINATES[cityKey];
    
    if (cityCoords) {
      // Ajouter un petit décalage aléatoire pour éviter la superposition
      return {
        lat: cityCoords.lat + (Math.random() - 0.5) * 0.01,
        lng: cityCoords.lng + (Math.random() - 0.5) * 0.01
      };
    }

    // Fallback départemental
    const departmentCoords = this.getDepartmentCoordinates(repairer.postal_code);
    return {
      lat: departmentCoords.lat + (Math.random() - 0.5) * 0.05,
      lng: departmentCoords.lng + (Math.random() - 0.5) * 0.05
    };
  }

  /**
   * Nettoyer le texte des caractères corrompus
   */
  private static cleanText(text: string): string {
    if (!text) return '';
    
    // Remplacer les caractères corrompus courants
    return text
      .replace(/�/g, 'e') // Remplacer � par e
      .replace(/Ã©/g, 'é')
      .replace(/Ã¨/g, 'è')
      .replace(/Ã /g, 'à')
      .replace(/Ã§/g, 'ç')
      .replace(/Ã´/g, 'ô')
      .replace(/Ã¢/g, 'â')
      .replace(/Ã®/g, 'î')
      .replace(/Ã¯/g, 'ï')
      .replace(/Ã¹/g, 'ù')
      .replace(/Ã»/g, 'û')
      .replace(/Ã«/g, 'ë')
      .replace(/Ã¼/g, 'ü')
      .trim();
  }

  /**
   * Obtenir les coordonnées départementales
   */
  private static getDepartmentCoordinates(postalCode: string): { lat: number; lng: number } {
    if (!postalCode) return { lat: 46.603354, lng: 1.888334 }; // Centre de la France
    
    const departmentCode = postalCode.substring(0, 2);
    
    const departmentCoords: Record<string, { lat: number; lng: number }> = {
      '01': { lat: 46.2044, lng: 5.2263 }, // Ain
      '02': { lat: 49.4214, lng: 3.3936 }, // Aisne
      '03': { lat: 46.3406, lng: 3.4264 }, // Allier
      '04': { lat: 44.0965, lng: 6.2357 }, // Alpes-de-Haute-Provence
      '05': { lat: 44.6560, lng: 6.0799 }, // Hautes-Alpes
      '06': { lat: 43.7102, lng: 7.2620 }, // Alpes-Maritimes
      '07': { lat: 44.7362, lng: 4.4012 }, // Ardèche
      '08': { lat: 49.7372, lng: 4.7186 }, // Ardennes
      '09': { lat: 42.9637, lng: 1.6045 }, // Ariège
      '10': { lat: 48.2973, lng: 4.0744 }, // Aube
      '11': { lat: 43.2130, lng: 2.3491 }, // Aude
      '12': { lat: 44.2951, lng: 2.5424 }, // Aveyron
      '13': { lat: 43.2965, lng: 5.3698 }, // Bouches-du-Rhône
      '14': { lat: 49.1829, lng: -0.3707 }, // Calvados
      '15': { lat: 45.0336, lng: 2.4207 }, // Cantal
      '16': { lat: 45.6500, lng: 0.1592 }, // Charente
      '17': { lat: 45.7485, lng: -0.7573 }, // Charente-Maritime
      '18': { lat: 47.0810, lng: 2.3988 }, // Cher
      '19': { lat: 45.2669, lng: 1.7633 }, // Corrèze
      '21': { lat: 47.3220, lng: 5.0415 }, // Côte-d'Or
      '22': { lat: 48.5109, lng: -2.7603 }, // Côtes-d'Armor
      '23': { lat: 46.1667, lng: 1.8667 }, // Creuse
      '24': { lat: 45.1848, lng: 0.7218 }, // Dordogne
      '25': { lat: 47.2380, lng: 6.0240 }, // Doubs
      '26': { lat: 44.7311, lng: 4.8914 }, // Drôme
      '27': { lat: 49.0246, lng: 1.1708 }, // Eure
      '28': { lat: 48.4469, lng: 1.4884 }, // Eure-et-Loir
      '29': { lat: 48.2020, lng: -4.2012 }, // Finistère
      '30': { lat: 43.8367, lng: 4.3601 }, // Gard
      '31': { lat: 43.6047, lng: 1.4442 }, // Haute-Garonne
      '32': { lat: 43.6450, lng: 0.5863 }, // Gers
      '33': { lat: 44.8378, lng: -0.5792 }, // Gironde
      '34': { lat: 43.6108, lng: 3.8767 }, // Hérault
      '35': { lat: 48.1173, lng: -1.6778 }, // Ille-et-Vilaine
      '36': { lat: 46.8083, lng: 1.6917 }, // Indre
      '37': { lat: 47.3941, lng: 0.6848 }, // Indre-et-Loire
      '38': { lat: 45.1885, lng: 5.7245 }, // Isère
      '39': { lat: 46.6769, lng: 5.5550 }, // Jura
      '40': { lat: 43.8949, lng: -0.5041 }, // Landes
      '41': { lat: 47.5946, lng: 1.3358 }, // Loir-et-Cher
      '42': { lat: 45.4397, lng: 4.3872 }, // Loire
      '43': { lat: 45.0434, lng: 3.8850 }, // Haute-Loire
      '44': { lat: 47.2184, lng: -1.5536 }, // Loire-Atlantique
      '45': { lat: 47.9029, lng: 1.9093 }, // Loiret
      '46': { lat: 44.4478, lng: 1.4442 }, // Lot
      '47': { lat: 44.2026, lng: 0.6168 }, // Lot-et-Garonne
      '48': { lat: 44.5176, lng: 3.5016 }, // Lozère
      '49': { lat: 47.4784, lng: -0.5632 }, // Maine-et-Loire
      '50': { lat: 49.1157, lng: -1.3094 }, // Manche
      '51': { lat: 49.2628, lng: 4.0347 }, // Marne
      '52': { lat: 48.1113, lng: 5.1372 }, // Haute-Marne
      '53': { lat: 48.0711, lng: -0.7669 }, // Mayenne
      '54': { lat: 48.6921, lng: 6.1844 }, // Meurthe-et-Moselle
      '55': { lat: 49.1607, lng: 5.3816 }, // Meuse
      '56': { lat: 47.7483, lng: -2.9623 }, // Morbihan
      '57': { lat: 49.1193, lng: 6.1757 }, // Moselle
      '58': { lat: 47.2590, lng: 3.5254 }, // Nièvre
      '59': { lat: 50.6292, lng: 3.0573 }, // Nord
      '60': { lat: 49.4174, lng: 2.8269 }, // Oise
      '61': { lat: 48.4334, lng: 0.0927 }, // Orne
      '62': { lat: 50.4581, lng: 2.3105 }, // Pas-de-Calais
      '63': { lat: 45.7797, lng: 3.0863 }, // Puy-de-Dôme
      '64': { lat: 43.2951, lng: -0.3708 }, // Pyrénées-Atlantiques
      '65': { lat: 43.2324, lng: 0.0786 }, // Hautes-Pyrénées
      '66': { lat: 42.6886, lng: 2.8956 }, // Pyrénées-Orientales
      '67': { lat: 48.5734, lng: 7.7521 }, // Bas-Rhin
      '68': { lat: 47.7500, lng: 7.3353 }, // Haut-Rhin
      '69': { lat: 45.7640, lng: 4.8357 }, // Rhône
      '70': { lat: 47.6217, lng: 6.1581 }, // Haute-Saône
      '71': { lat: 46.7831, lng: 4.8579 }, // Saône-et-Loire
      '72': { lat: 48.0077, lng: 0.1996 }, // Sarthe
      '73': { lat: 45.5646, lng: 5.9178 }, // Savoie
      '74': { lat: 46.0763, lng: 6.4072 }, // Haute-Savoie
      '75': { lat: 48.8566, lng: 2.3522 }, // Paris
      '76': { lat: 49.4431, lng: 1.0993 }, // Seine-Maritime
      '77': { lat: 48.8499, lng: 2.6370 }, // Seine-et-Marne
      '78': { lat: 48.8014, lng: 2.1301 }, // Yvelines
      '79': { lat: 46.3239, lng: -0.4591 }, // Deux-Sèvres
      '80': { lat: 49.8943, lng: 2.2958 }, // Somme
      '81': { lat: 43.9287, lng: 2.1482 }, // Tarn
      '82': { lat: 44.0151, lng: 1.3510 }, // Tarn-et-Garonne
      '83': { lat: 43.4647, lng: 6.2381 }, // Var
      '84': { lat: 44.0394, lng: 5.0479 }, // Vaucluse
      '85': { lat: 46.6707, lng: -1.4267 }, // Vendée
      '86': { lat: 46.5802, lng: 0.3404 }, // Vienne
      '87': { lat: 45.8354, lng: 1.2644 }, // Haute-Vienne
      '88': { lat: 48.1667, lng: 6.4500 }, // Vosges
      '89': { lat: 47.7981, lng: 3.5656 }, // Yonne
      '90': { lat: 47.6398, lng: 6.8635 }, // Territoire de Belfort
      '91': { lat: 48.6303, lng: 2.4447 }, // Essonne
      '92': { lat: 48.8499, lng: 2.2370 }, // Hauts-de-Seine
      '93': { lat: 48.9157, lng: 2.4422 }, // Seine-Saint-Denis
      '94': { lat: 48.7661, lng: 2.4156 }, // Val-de-Marne
      '95': { lat: 49.0524, lng: 2.2173 }  // Val-d'Oise
    };
    
    return departmentCoords[departmentCode] || { lat: 46.603354, lng: 1.888334 };
  }
}
