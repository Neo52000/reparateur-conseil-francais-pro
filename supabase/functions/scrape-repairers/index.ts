import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapingRequest {
  department_code: string;
  test_mode?: boolean;
  source?: string;
}

interface ScrapedRepairer {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  services?: string[];
  source: string;
}

// Villes principales par département
const CITIES_BY_DEPARTMENT: Record<string, string[]> = {
  '75': ['Paris'],
  '69': ['Lyon', 'Villeurbanne', 'Vénissieux'],
  '13': ['Marseille', 'Aix-en-Provence', 'Aubagne'],
  '31': ['Toulouse', 'Colomiers', 'Blagnac'],
  '06': ['Nice', 'Cannes', 'Antibes', 'Grasse'],
  '33': ['Bordeaux', 'Mérignac', 'Pessac'],
  '59': ['Lille', 'Roubaix', 'Tourcoing', 'Dunkerque'],
  '67': ['Strasbourg', 'Haguenau', 'Schiltigheim'],
  '44': ['Nantes', 'Saint-Nazaire', 'Saint-Herblain'],
  '35': ['Rennes', 'Saint-Malo', 'Fougères'],
  '34': ['Montpellier', 'Béziers', 'Sète'],
  '38': ['Grenoble', 'Saint-Martin-d\'Hères', 'Échirolles'],
  '76': ['Rouen', 'Le Havre', 'Dieppe'],
  '54': ['Nancy', 'Vandœuvre-lès-Nancy', 'Lunéville'],
  '57': ['Metz', 'Thionville', 'Montigny-lès-Metz'],
  '45': ['Orléans', 'Fleury-les-Aubrais', 'Olivet'],
  '37': ['Tours', 'Joué-lès-Tours', 'Saint-Cyr-sur-Loire'],
  '49': ['Angers', 'Cholet', 'Saumur'],
  '21': ['Dijon', 'Chenôve', 'Talant'],
  '63': ['Clermont-Ferrand', 'Chamalières', 'Cournon-d\'Auvergne'],
  '42': ['Saint-Étienne', 'Roanne', 'Saint-Chamond'],
  '83': ['Toulon', 'Fréjus', 'Hyères'],
  '30': ['Nîmes', 'Alès', 'Bagnols-sur-Cèze'],
  '84': ['Avignon', 'Orange', 'Carpentras'],
  '14': ['Caen', 'Hérouville-Saint-Clair', 'Lisieux'],
  '29': ['Brest', 'Quimper', 'Concarneau'],
  '56': ['Lorient', 'Vannes', 'Lanester'],
  '22': ['Saint-Brieuc', 'Lannion', 'Dinan'],
  '17': ['La Rochelle', 'Rochefort', 'Saintes'],
  '86': ['Poitiers', 'Châtellerault', 'Buxerolles'],
  '87': ['Limoges', 'Saint-Junien', 'Panazol'],
  '64': ['Pau', 'Bayonne', 'Anglet', 'Biarritz'],
  '65': ['Tarbes', 'Lourdes', 'Bagnères-de-Bigorre'],
  '66': ['Perpignan', 'Canet-en-Roussillon', 'Saint-Estève'],
  '11': ['Carcassonne', 'Narbonne', 'Castelnaudary'],
  '81': ['Albi', 'Castres', 'Gaillac'],
  '82': ['Montauban', 'Castelsarrasin', 'Moissac'],
  '12': ['Rodez', 'Millau', 'Villefranche-de-Rouergue'],
  '46': ['Cahors', 'Figeac', 'Gourdon'],
  '47': ['Agen', 'Villeneuve-sur-Lot', 'Marmande'],
  '40': ['Mont-de-Marsan', 'Dax', 'Biscarrosse'],
  '24': ['Périgueux', 'Bergerac', 'Sarlat-la-Canéda'],
  '19': ['Brive-la-Gaillarde', 'Tulle', 'Ussel'],
  '23': ['Guéret', 'La Souterraine', 'Aubusson'],
  '36': ['Châteauroux', 'Issoudun', 'Déols'],
  '18': ['Bourges', 'Vierzon', 'Saint-Amand-Montrond'],
  '03': ['Montluçon', 'Vichy', 'Moulins'],
  '58': ['Nevers', 'Cosne-Cours-sur-Loire', 'Decize'],
  '71': ['Chalon-sur-Saône', 'Mâcon', 'Le Creusot'],
  '89': ['Auxerre', 'Sens', 'Joigny'],
  '10': ['Troyes', 'Romilly-sur-Seine', 'La Chapelle-Saint-Luc'],
  '52': ['Chaumont', 'Saint-Dizier', 'Langres'],
  '51': ['Reims', 'Châlons-en-Champagne', 'Épernay'],
  '08': ['Charleville-Mézières', 'Sedan', 'Rethel'],
  '55': ['Bar-le-Duc', 'Verdun', 'Commercy'],
  '88': ['Épinal', 'Saint-Dié-des-Vosges', 'Gérardmer'],
  '70': ['Vesoul', 'Héricourt', 'Lure'],
  '90': ['Belfort', 'Delle', 'Valdoie'],
  '25': ['Besançon', 'Montbéliard', 'Pontarlier'],
  '39': ['Lons-le-Saunier', 'Dole', 'Saint-Claude'],
  '01': ['Bourg-en-Bresse', 'Oyonnax', 'Ambérieu-en-Bugey'],
  '74': ['Annecy', 'Thonon-les-Bains', 'Annemasse'],
  '73': ['Chambéry', 'Aix-les-Bains', 'Albertville'],
  '26': ['Valence', 'Montélimar', 'Romans-sur-Isère'],
  '07': ['Annonay', 'Aubenas', 'Privas'],
  '43': ['Le Puy-en-Velay', 'Monistrol-sur-Loire', 'Yssingeaux'],
  '15': ['Aurillac', 'Saint-Flour', 'Mauriac'],
  '48': ['Mende', 'Marvejols', 'Saint-Chély-d\'Apcher'],
  '04': ['Digne-les-Bains', 'Manosque', 'Sisteron'],
  '05': ['Gap', 'Briançon', 'Embrun'],
  '77': ['Meaux', 'Melun', 'Chelles', 'Pontault-Combault'],
  '78': ['Versailles', 'Sartrouville', 'Mantes-la-Jolie'],
  '91': ['Évry', 'Corbeil-Essonnes', 'Massy'],
  '92': ['Boulogne-Billancourt', 'Nanterre', 'Colombes', 'Asnières-sur-Seine'],
  '93': ['Montreuil', 'Saint-Denis', 'Aulnay-sous-Bois', 'Aubervilliers'],
  '94': ['Créteil', 'Vitry-sur-Seine', 'Champigny-sur-Marne'],
  '95': ['Cergy', 'Argenteuil', 'Sarcelles'],
  '27': ['Évreux', 'Vernon', 'Louviers'],
  '28': ['Chartres', 'Dreux', 'Lucé'],
  '41': ['Blois', 'Vendôme', 'Romorantin-Lanthenay'],
  '72': ['Le Mans', 'La Flèche', 'Sablé-sur-Sarthe'],
  '53': ['Laval', 'Mayenne', 'Château-Gontier'],
  '85': ['La Roche-sur-Yon', 'Les Sables-d\'Olonne', 'Challans'],
  '79': ['Niort', 'Bressuire', 'Parthenay'],
  '16': ['Angoulême', 'Cognac', 'Soyaux'],
  '50': ['Cherbourg-en-Cotentin', 'Saint-Lô', 'Granville'],
  '61': ['Alençon', 'Flers', 'Argentan'],
  '62': ['Calais', 'Boulogne-sur-Mer', 'Arras', 'Lens'],
  '80': ['Amiens', 'Abbeville', 'Albert'],
  '60': ['Beauvais', 'Compiègne', 'Creil'],
  '02': ['Saint-Quentin', 'Laon', 'Soissons'],
  '68': ['Mulhouse', 'Colmar', 'Saint-Louis'],
  '09': ['Foix', 'Pamiers', 'Saint-Girons'],
  '32': ['Auch', 'Condom', 'L\'Isle-Jourdain'],
  '2A': ['Ajaccio', 'Porto-Vecchio', 'Propriano'],
  '2B': ['Bastia', 'Calvi', 'Corte'],
  '971': ['Pointe-à-Pitre', 'Les Abymes', 'Baie-Mahault'],
  '972': ['Fort-de-France', 'Le Lamentin', 'Schoelcher'],
  '973': ['Cayenne', 'Saint-Laurent-du-Maroni', 'Kourou'],
  '974': ['Saint-Denis', 'Saint-Pierre', 'Le Tampon'],
  '976': ['Mamoudzou', 'Koungou', 'Dzaoudzi'],
};

// Requêtes de recherche pour trouver des réparateurs
const SEARCH_QUERIES = [
  'réparation smartphone',
  'réparateur téléphone portable',
  'réparation tablette iPad',
  'réparation iPhone',
  'micro soudure téléphone',
  'réparation montre connectée Apple Watch',
  'réparation écran cassé téléphone',
];

// Fonction pour rechercher via Serper API
async function searchWithSerper(query: string, location: string, apiKey: string): Promise<any[]> {
  console.log(`🔍 Recherche Serper: "${query}" à ${location}`);
  
  try {
    const response = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `${query} ${location}`,
        gl: 'fr',
        hl: 'fr',
        num: 20,
      }),
    });

    if (!response.ok) {
      console.error(`❌ Erreur Serper: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`✅ ${data.places?.length || 0} résultats trouvés`);
    return data.places || [];
  } catch (error) {
    console.error('❌ Erreur lors de la recherche Serper:', error);
    return [];
  }
}

// Fonction pour géocoder une adresse avec Nominatim
async function geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const fullAddress = `${address}, ${city}, France`;
    const encodedAddress = encodeURIComponent(fullAddress);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=fr&limit=1`,
      {
        headers: {
          'User-Agent': 'TopReparateurs/1.0 (contact@topreparateurs.fr)',
        },
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    if (results.length > 0) {
      return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon),
      };
    }
  } catch (error) {
    console.error('❌ Erreur géocodage:', error);
  }
  return null;
}

// Fonction pour générer un avatar unique basé sur le nom
function generateAvatarUrl(businessName: string): string {
  const seed = encodeURIComponent(businessName);
  // Utiliser DiceBear avec différents styles pour varier les avatars
  const styles = ['initials', 'shapes', 'identicon', 'bottts', 'rings'];
  const style = styles[Math.abs(hashCode(businessName)) % styles.length];
  const colors = ['10b981', '3b82f6', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
  const bgColor = colors[Math.abs(hashCode(businessName + 'bg')) % colors.length];
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${bgColor}`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Fonction pour extraire le code postal d'une adresse
function extractPostalCode(address: string): string {
  const match = address.match(/\b(\d{5})\b/);
  return match ? match[1] : '';
}

// Fonction pour extraire la ville d'une adresse
function extractCity(address: string, defaultCity: string): string {
  // Essayer d'extraire la ville après le code postal
  const match = address.match(/\b\d{5}\s+([A-Za-zÀ-ÿ\-\s]+)/);
  if (match) return match[1].trim();
  return defaultCity;
}

// Transformer les résultats Serper en format ScrapedRepairer
function transformSerperResult(place: any, searchCity: string, departmentCode: string): ScrapedRepairer | null {
  if (!place.title || !place.address) return null;

  const postalCode = extractPostalCode(place.address) || departmentCode.padStart(5, '0').substring(0, 2) + '000';
  const city = extractCity(place.address, searchCity);

  return {
    name: place.title,
    address: place.address,
    city: city,
    postal_code: postalCode,
    phone: place.phone || undefined,
    website: place.website || undefined,
    logo_url: place.thumbnailUrl || generateAvatarUrl(place.title),
    latitude: place.latitude,
    longitude: place.longitude,
    description: place.snippet || `Réparateur de téléphones et appareils électroniques à ${city}`,
    services: ['Réparation smartphone', 'Réparation tablette'],
    source: 'serper_places',
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serperApiKey = Deno.env.get('SERPER_API_KEY');

    if (!serperApiKey) {
      throw new Error('SERPER_API_KEY non configurée');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { department_code, test_mode = false, source = 'serper' }: ScrapingRequest = await req.json();

    console.log(`🚀 Démarrage du scraping pour le département ${department_code} (test_mode: ${test_mode})`);

    // Créer un log de scraping
    const { data: logData, error: logError } = await supabase
      .from('scraping_logs')
      .insert({
        source: source,
        status: 'running',
        items_scraped: 0,
        items_added: 0,
        items_updated: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Erreur création log:', logError);
      throw logError;
    }

    const logId = logData.id;
    const cities = CITIES_BY_DEPARTMENT[department_code] || [];
    
    if (cities.length === 0) {
      throw new Error(`Aucune ville trouvée pour le département ${department_code}`);
    }

    const allResults: ScrapedRepairer[] = [];
    const seenNames = new Set<string>();

    // Limiter en mode test
    const citiesToProcess = test_mode ? cities.slice(0, 1) : cities;
    const queriesToProcess = test_mode ? SEARCH_QUERIES.slice(0, 2) : SEARCH_QUERIES;

    for (const city of citiesToProcess) {
      for (const query of queriesToProcess) {
        // Pause pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

        const places = await searchWithSerper(query, city, serperApiKey);

        for (const place of places) {
          const repairer = transformSerperResult(place, city, department_code);
          
          if (repairer && !seenNames.has(repairer.name.toLowerCase())) {
            seenNames.add(repairer.name.toLowerCase());

            // Si pas de coordonnées, géocoder l'adresse
            if (!repairer.latitude || !repairer.longitude) {
              const coords = await geocodeAddress(repairer.address, repairer.city);
              if (coords) {
                repairer.latitude = coords.lat;
                repairer.longitude = coords.lng;
              }
              // Pause pour Nominatim rate limiting
              await new Promise(resolve => setTimeout(resolve, 1100));
            }

            allResults.push(repairer);
          }
        }
      }
    }

    console.log(`📊 Total de ${allResults.length} réparateurs uniques trouvés`);

    // Mettre à jour le log avec les résultats (sans insérer en base - preview mode)
    await supabase
      .from('scraping_logs')
      .update({
        status: 'preview',
        items_scraped: allResults.length,
        completed_at: new Date().toISOString(),
      })
      .eq('id', logId);

    return new Response(
      JSON.stringify({
        success: true,
        log_id: logId,
        department_code,
        results: allResults,
        total_found: allResults.length,
        message: `${allResults.length} réparateurs trouvés. En attente de validation pour insertion.`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erreur scraping:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
