import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, Download, Trash2, MapPin, Phone, Star, Globe, 
  Loader2, Settings2, Building2, CheckCircle, Database,
  Sparkles, Filter, Map, Globe2, Zap, Save
} from 'lucide-react';
import { REGIONS } from '@/components/scraping/controls/scrapingConstants';
import { useScrapedRegionsStats } from '@/hooks/useScrapedRegionsStats';
import { useScrapingPersistence } from '@/hooks/scraping/useScrapingPersistence';
import ScrapingExportPanel from './ScrapingExportPanel';
import PendingSessionsPanel from './PendingSessionsPanel';

// Liste des principales villes par département pour le scraping exhaustif
const DEPARTMENT_CITIES: Record<string, string[]> = {
  '75': ['Paris 1er', 'Paris 2e', 'Paris 3e', 'Paris 4e', 'Paris 5e', 'Paris 6e', 'Paris 7e', 'Paris 8e', 'Paris 9e', 'Paris 10e', 'Paris 11e', 'Paris 12e', 'Paris 13e', 'Paris 14e', 'Paris 15e', 'Paris 16e', 'Paris 17e', 'Paris 18e', 'Paris 19e', 'Paris 20e'],
  '92': ['Boulogne-Billancourt', 'Nanterre', 'Courbevoie', 'Colombes', 'Asnières-sur-Seine', 'Rueil-Malmaison', 'Levallois-Perret', 'Issy-les-Moulineaux', 'Neuilly-sur-Seine', 'Antony', 'Clichy', 'Clamart', 'Montrouge', 'Meudon', 'Suresnes', 'Puteaux', 'Gennevilliers', 'Bagneux', 'Malakoff', 'Châtillon'],
  '93': ['Saint-Denis', 'Montreuil', 'Aubervilliers', 'Aulnay-sous-Bois', 'Drancy', 'Noisy-le-Grand', 'Pantin', 'Bondy', 'Épinay-sur-Seine', 'Sevran', 'Bobigny', 'Saint-Ouen', 'Rosny-sous-Bois', 'Livry-Gargan', 'Stains', 'Gagny', 'La Courneuve', 'Blanc-Mesnil', 'Villepinte', 'Tremblay-en-France'],
  '94': ['Créteil', 'Vitry-sur-Seine', 'Saint-Maur-des-Fossés', 'Champigny-sur-Marne', 'Ivry-sur-Seine', 'Villejuif', 'Maisons-Alfort', 'Vincennes', 'Fontenay-sous-Bois', 'Alfortville', 'Thiais', 'Choisy-le-Roi', 'Le Kremlin-Bicêtre', 'Nogent-sur-Marne', 'Charenton-le-Pont', 'Cachan', 'L\'Haÿ-les-Roses', 'Villeneuve-Saint-Georges', 'Orly', 'Boissy-Saint-Léger'],
  '69': ['Lyon', 'Villeurbanne', 'Vénissieux', 'Caluire-et-Cuire', 'Saint-Priest', 'Bron', 'Vaulx-en-Velin', 'Meyzieu', 'Rillieux-la-Pape', 'Décines-Charpieu', 'Oullins', 'Tassin-la-Demi-Lune', 'Sainte-Foy-lès-Lyon', 'Saint-Genis-Laval', 'Givors', 'Villefranche-sur-Saône', 'Écully', 'Francheville', 'Mions', 'Pierre-Bénite'],
  '13': ['Marseille', 'Aix-en-Provence', 'Martigues', 'Aubagne', 'Istres', 'Salon-de-Provence', 'Vitrolles', 'Arles', 'Marignane', 'La Ciotat', 'Gardanne', 'Miramas', 'Les Pennes-Mirabeau', 'Allauch', 'Port-de-Bouc', 'Fos-sur-Mer', 'Châteauneuf-les-Martigues', 'Septèmes-les-Vallons', 'Berre-l\'Étang', 'Rognac'],
  '31': ['Toulouse', 'Colomiers', 'Tournefeuille', 'Blagnac', 'Muret', 'Plaisance-du-Touch', 'Cugnaux', 'Ramonville-Saint-Agne', 'Saint-Orens-de-Gameville', 'Castanet-Tolosan', 'L\'Union', 'Balma', 'Portet-sur-Garonne', 'Saint-Gaudens', 'Labège', 'Fonsorbes', 'Villeneuve-Tolosane', 'Castelginest', 'Léguevin', 'Seysses'],
  '33': ['Bordeaux', 'Mérignac', 'Pessac', 'Talence', 'Villenave-d\'Ornon', 'Saint-Médard-en-Jalles', 'Bègles', 'Libourne', 'Lormont', 'Le Bouscat', 'Cenon', 'Gradignan', 'Eysines', 'Floirac', 'Blanquefort', 'Bruges', 'Arcachon', 'Gujan-Mestras', 'La Teste-de-Buch', 'Ambarès-et-Lagrave'],
  '44': ['Nantes', 'Saint-Nazaire', 'Rezé', 'Saint-Herblain', 'Orvault', 'Vertou', 'Couëron', 'Carquefou', 'Bouguenais', 'La Chapelle-sur-Erdre', 'Saint-Sébastien-sur-Loire', 'Sainte-Luce-sur-Loire', 'Pornic', 'Guérande', 'Châteaubriant', 'Treillières', 'Sautron', 'Pont-Saint-Martin', 'La Montagne', 'Basse-Goulaine'],
  '59': ['Lille', 'Roubaix', 'Tourcoing', 'Dunkerque', 'Villeneuve-d\'Ascq', 'Valenciennes', 'Wattrelos', 'Douai', 'Marcq-en-Barœul', 'Cambrai', 'Lambersart', 'Maubeuge', 'Armentières', 'Wasquehal', 'Croix', 'Hem', 'Loos', 'Denain', 'La Madeleine', 'Faches-Thumesnil'],
  '06': ['Nice', 'Antibes', 'Cannes', 'Grasse', 'Cagnes-sur-Mer', 'Le Cannet', 'Saint-Laurent-du-Var', 'Mandelieu-la-Napoule', 'Menton', 'Vallauris', 'Mougins', 'Vence', 'Villeneuve-Loubet', 'Carros', 'Roquebrune-Cap-Martin', 'La Trinité', 'Beausoleil', 'Valbonne', 'Biot', 'Mouans-Sartoux'],
  '34': ['Montpellier', 'Béziers', 'Sète', 'Agde', 'Lunel', 'Frontignan', 'Mauguio', 'Lattes', 'Castelnau-le-Lez', 'Saint-Jean-de-Védas', 'La Grande-Motte', 'Pérols', 'Grabels', 'Jacou', 'Le Crès', 'Marsillargues', 'Palavas-les-Flots', 'Villeneuve-lès-Maguelone', 'Pignan', 'Clapiers'],
  '67': ['Strasbourg', 'Haguenau', 'Schiltigheim', 'Illkirch-Graffenstaden', 'Lingolsheim', 'Sélestat', 'Bischwiller', 'Bischheim', 'Ostwald', 'Saverne', 'Obernai', 'Molsheim', 'Hœnheim', 'Erstein', 'Wissembourg', 'La Wantzenau', 'Brumath', 'Geispolsheim', 'Reichshoffen', 'Souffelweyersheim'],
  '76': ['Le Havre', 'Rouen', 'Sotteville-lès-Rouen', 'Dieppe', 'Saint-Étienne-du-Rouvray', 'Le Grand-Quevilly', 'Le Petit-Quevilly', 'Mont-Saint-Aignan', 'Fécamp', 'Elbeuf', 'Bois-Guillaume', 'Canteleu', 'Maromme', 'Montivilliers', 'Barentin', 'Bolbec', 'Déville-lès-Rouen', 'Oissel', 'Sainte-Adresse', 'Bihorel'],
  '38': ['Grenoble', 'Saint-Martin-d\'Hères', 'Échirolles', 'Vienne', 'Fontaine', 'Voiron', 'Bourgoin-Jallieu', 'Meylan', 'Saint-Égrève', 'Le Pont-de-Claix', 'Seyssinet-Pariset', 'Eybens', 'Sassenage', 'Villefontaine', 'L\'Isle-d\'Abeau', 'Claix', 'Saint-Marcellin', 'Moirans', 'Tullins', 'La Tronche'],
  '57': ['Metz', 'Thionville', 'Montigny-lès-Metz', 'Forbach', 'Sarreguemines', 'Saint-Avold', 'Hayange', 'Yutz', 'Creutzwald', 'Freyming-Merlebach', 'Fameck', 'Woippy', 'Florange', 'Sarrebourg', 'Stiring-Wendel', 'Marly', 'Maizières-lès-Metz', 'Hagondange', 'Uckange', 'Talange'],
  // Nouvelle-Aquitaine - Départements manquants
  '16': ['Angoulême', 'Cognac', 'Soyaux', 'La Couronne', 'Champniers', 'L\'Isle-d\'Espagnac', 'Ruelle-sur-Touvre', 'Gond-Pontouvre', 'Saint-Yrieix-sur-Charente', 'Jarnac', 'Barbezieux-Saint-Hilaire', 'Ruffec', 'Châteaubernard', 'La Rochefoucauld-en-Angoumois'],
  '17': ['La Rochelle', 'Saintes', 'Rochefort', 'Royan', 'Cognac', 'Tonnay-Charente', 'Aytré', 'Lagord', 'Saint-Jean-d\'Angély', 'Périgny', 'Surgères', 'Marennes', 'Saint-Pierre-d\'Oléron', 'Saujon', 'Jonzac', 'Châtellaillon-Plage', 'Fouras', 'La Tremblade'],
  '19': ['Brive-la-Gaillarde', 'Tulle', 'Ussel', 'Malemort-sur-Corrèze', 'Égletons', 'Uzerche', 'Objat', 'Allassac', 'Argentat-sur-Dordogne', 'Saint-Pantaléon-de-Larche', 'Ussac', 'Naves', 'Donzenac', 'Varetz'],
  '23': ['Guéret', 'La Souterraine', 'Aubusson', 'Sainte-Feyre', 'Bourganeuf', 'Felletin', 'Évaux-les-Bains', 'Ahun', 'Dun-le-Palestel', 'Bonnat', 'Bénévent-l\'Abbaye', 'Gouzon'],
  '24': ['Périgueux', 'Bergerac', 'Sarlat-la-Canéda', 'Coulounieix-Chamiers', 'Trélissac', 'Boulazac Isle Manoire', 'Terrasson-Lavilledieu', 'Montpon-Ménestérol', 'Ribérac', 'Nontron', 'Saint-Astier', 'Thiviers', 'Le Bugue', 'Mussidan', 'Neuvic'],
  '87': ['Limoges', 'Saint-Junien', 'Panazol', 'Couzeix', 'Isle', 'Aixe-sur-Vienne', 'Feytiat', 'Le Palais-sur-Vienne', 'Saint-Léonard-de-Noblat', 'Bellac', 'Rochechouart', 'Saint-Yrieix-la-Perche', 'Ambazac', 'Condat-sur-Vienne', 'Rilhac-Rancon'],
  
  // Départements manquants - Métropole
  '07': ['Privas', 'Annonay', 'Aubenas', 'Guilherand-Granges', 'Tournon-sur-Rhône', 'Le Teil', 'Bourg-Saint-Andéol', 'Vals-les-Bains', 'La Voulte-sur-Rhône', 'Cruas', 'Davézieux', 'Ruoms', 'Largentière', 'Saint-Péray', 'Villeneuve-de-Berg'],
  '53': ['Laval', 'Mayenne', 'Château-Gontier-sur-Mayenne', 'Évron', 'Ernée', 'Craon', 'Saint-Berthevin', 'Changé', 'Bonchamp-lès-Laval', 'L\'Huisserie', 'Gorron', 'Argentré', 'Louverné', 'Montsûrs'],
  '50': ['Cherbourg-en-Cotentin', 'Saint-Lô', 'Granville', 'Équeurdreville-Hainneville', 'Coutances', 'Avranches', 'Valognes', 'La Glacerie', 'Tourlaville', 'Querqueville', 'Carentan-les-Marais', 'Villedieu-les-Poêles', 'Bréhal', 'Mortain-Bocage'],
  
  // Corse
  '2A': ['Ajaccio', 'Porto-Vecchio', 'Propriano', 'Sartène', 'Bonifacio', 'Grosseto-Prugna', 'Bastelicaccia', 'Alata', 'Coti-Chiavari', 'Sarrola-Carcopino', 'Pietrosella', 'Olmeto', 'Santa-Maria-Siché', 'Lecci'],
  '2B': ['Bastia', 'Biguglia', 'Borgo', 'Corte', 'Furiani', 'Lucciana', 'Calvi', 'L\'Île-Rousse', 'Ghisonaccia', 'Penta-di-Casinca', 'San-Nicolao', 'Vescovato', 'Folelli', 'Moriani-Plage', 'Santa-Maria-di-Lota'],
  
  // Départements avec couverture faible - à améliorer
  '22': ['Saint-Brieuc', 'Lannion', 'Dinan', 'Lamballe-Armor', 'Plérin', 'Loudéac', 'Perros-Guirec', 'Guingamp', 'Trégueux', 'Langueux', 'Ploufragan', 'Pordic', 'Rostrenen', 'Paimpol', 'Plouha', 'Quintin', 'Erquy', 'Plestin-les-Grèves'],
  '26': ['Valence', 'Montélimar', 'Romans-sur-Isère', 'Bourg-lès-Valence', 'Pierrelatte', 'Portes-lès-Valence', 'Guilherand-Granges', 'Crest', 'Livron-sur-Drôme', 'Loriol-sur-Drôme', 'Saint-Péray', 'Bourg-de-Péage', 'Tain-l\'Hermitage', 'Nyons', 'Die', 'Donzère'],
  '72': ['Le Mans', 'La Flèche', 'Sablé-sur-Sarthe', 'Allonnes', 'Coulaines', 'La Ferté-Bernard', 'Mamers', 'Saint-Calais', 'Château-du-Loir', 'Écommoy', 'Le Grand-Lucé', 'Montval-sur-Loir', 'Arnage', 'Mulsanne', 'Yvré-l\'Évêque'],
  '73': ['Chambéry', 'Aix-les-Bains', 'Albertville', 'La Motte-Servolex', 'Saint-Jean-de-Maurienne', 'Bourg-Saint-Maurice', 'Moûtiers', 'La Ravoire', 'Cognin', 'Ugine', 'Montmélian', 'Saint-Alban-Leysse', 'Challes-les-Eaux', 'Barby', 'Jacob-Bellecombette'],
  '74': ['Annecy', 'Thonon-les-Bains', 'Annemasse', 'Cluses', 'Sallanches', 'Bonneville', 'Évian-les-Bains', 'Gaillard', 'Rumilly', 'Seynod', 'Cran-Gevrier', 'Meythet', 'Saint-Julien-en-Genevois', 'La Roche-sur-Foron', 'Passy', 'Chamonix-Mont-Blanc', 'Megève'],
  '49': ['Angers', 'Cholet', 'Saumur', 'Avrillé', 'Les Ponts-de-Cé', 'Trélazé', 'Saint-Barthélemy-d\'Anjou', 'Bouchemaine', 'Segré-en-Anjou Bleu', 'Beaupréau-en-Mauges', 'Chemillé-en-Anjou', 'Doué-en-Anjou', 'Montreuil-Juigné', 'Mûrs-Erigné'],
  '46': ['Cahors', 'Figeac', 'Souillac', 'Gourdon', 'Prayssac', 'Biars-sur-Cère', 'Saint-Céré', 'Gramat', 'Puy-l\'Évêque', 'Luzech', 'Castelnau-Montratier-Sainte-Alauzie', 'Salviac', 'Lacapelle-Marival'],
  '68': ['Mulhouse', 'Colmar', 'Saint-Louis', 'Illzach', 'Wittenheim', 'Kingersheim', 'Rixheim', 'Riedisheim', 'Wittelsheim', 'Cernay', 'Guebwiller', 'Thann', 'Pfastatt', 'Lutterbach', 'Ensisheim', 'Brunstatt-Didenheim'],
};

// Types
interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
}

interface RepairerExport {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  services: string[];
  description: string;
}

// Brand categories for combined search
const BRAND_QUERIES = [
  { id: 'apple', label: '🍎 Apple/iPhone', query: 'réparation iPhone Apple' },
  { id: 'samsung', label: '📱 Samsung', query: 'réparation Samsung Galaxy' },
  { id: 'huawei', label: '📲 Huawei', query: 'réparation Huawei' },
  { id: 'xiaomi', label: '🔧 Xiaomi', query: 'réparation Xiaomi Redmi' },
  { id: 'oneplus', label: '⚡ OnePlus', query: 'réparation OnePlus' },
  { id: 'oppo', label: '📱 OPPO/Vivo', query: 'réparation OPPO Vivo' },
  { id: 'google', label: '🔍 Google Pixel', query: 'réparation Google Pixel' },
];

// Service categories for combined search
const SERVICE_QUERIES = [
  { id: 'screen', label: '📱 Écran/Vitre', query: 'réparation écran vitre téléphone' },
  { id: 'battery', label: '🔋 Batterie', query: 'changement batterie smartphone' },
  { id: 'charging', label: '⚡ Connecteur charge', query: 'réparation connecteur charge téléphone' },
  { id: 'camera', label: '📷 Caméra', query: 'réparation caméra téléphone' },
  { id: 'speaker', label: '🔊 Haut-parleur/Micro', query: 'réparation haut-parleur micro téléphone' },
  { id: 'water', label: '💧 Oxydation', query: 'désoxydation réparation téléphone' },
  { id: 'motherboard', label: '🔧 Micro-soudure', query: 'micro soudure carte mère téléphone' },
];

// Pre-built combined queries for maximum coverage
const COMBINED_QUERIES_PRESET = [
  'réparation smartphone mobile',
  'réparation écran téléphone portable',
  'réparation iPhone Apple',
  'réparation Samsung Galaxy',
  'réparateur téléphone agréé',
];

// Keywords to exclude from results (computer repair, etc.)
const EXCLUSION_KEYWORDS = [
  "informatique", "ordinateur", "pc", "imprimante", "computer",
  "electroménager", "électroménager", "automobile", "auto", "voiture",
  "dépannage informatique", "assistance informatique", "réparation pc",
  "laptop", "macbook pro", "réparation ordinateur",
  "tablette", "ipad", "vente occasion", "reconditionné", "accessoires",
  "coque", "protection écran", "chargeur", "câble"
];

// Build departments map from centralized REGIONS constant
const getDepartmentInfo = (code: string) => {
  for (const region of REGIONS) {
    const dept = region.departments.find(d => d.code === code);
    if (dept) {
      return { name: dept.name, region: region.name };
    }
  }
  return null;
};

// Get cities for a department (default cities based on department name)
const getDepartmentCities = (code: string): string[] => {
  const dept = getDepartmentInfo(code);
  if (!dept) return [];
  // For now, just use the department name as main city
  // This can be enhanced later with a proper cities database
  return [dept.name];
};

// Default hardcoded services
const DEFAULT_SERVICES = ["Réparation écran", "Changement batterie", "Diagnostic"];

type SearchMode = 'city' | 'department' | 'region';

const GooglePlacesScraper: React.FC = () => {
  // State
  const [apiKey, setApiKey] = useState('AIzaSyCC_6zU1EIPQ31oZnhLGD4MzU-Ms6axxC0');
  const [searchMode, setSearchMode] = useState<SearchMode>('city');
  const [city, setCity] = useState('Paris');
  const [postalCode, setPostalCode] = useState('75001');
  const [selectedDepartment, setSelectedDepartment] = useState('75');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [query, setQuery] = useState('Réparation téléphone');
  const [enableExclusionFilter, setEnableExclusionFilter] = useState(true);
  const [enableExhaustiveScraping, setEnableExhaustiveScraping] = useState(false);
  const [results, setResults] = useState<GooglePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [excludedCount, setExcludedCount] = useState(0);
  const [exhaustiveStats, setExhaustiveStats] = useState({ cities: 0, totalCities: 0, departments: 0, totalDepartments: 0 });
  
  // New: Combined search state
  const [enableCombinedSearch, setEnableCombinedSearch] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showQueryPreview, setShowQueryPreview] = useState(false);
  const { toast } = useToast();
  const { regionStats, departmentStats } = useScrapedRegionsStats();
  
  // Persistence hook
  const {
    pendingSessions,
    currentSessionId,
    loading: loadingPending,
    createSession,
    saveResults,
    loadPendingSessions,
    resumeSession,
    markAsImported,
    deleteSession,
  } = useScrapingPersistence();
  
  // Get current location label for saving
  const getLocationLabel = () => {
    if (searchMode === 'region') return selectedRegion || 'Région';
    if (searchMode === 'department') return getDepartmentInfo(selectedDepartment)?.name || selectedDepartment;
    return city || postalCode || 'Ville';
  };
  
  // Get cities for exhaustive scraping
  const getCitiesForDepartment = (deptCode: string): string[] => {
    if (DEPARTMENT_CITIES[deptCode]) {
      return DEPARTMENT_CITIES[deptCode];
    }
    // Fallback: use department name
    const deptInfo = getDepartmentInfo(deptCode);
    return deptInfo ? [deptInfo.name] : [];
  };
  
  // Get selected region data
  const selectedRegionData = REGIONS.find(r => r.name === selectedRegion);

  // Check if result matches exclusion keywords
  const shouldExclude = (place: GooglePlace): boolean => {
    if (!enableExclusionFilter) return false;
    const searchText = `${place.name} ${place.formatted_address}`.toLowerCase();
    return EXCLUSION_KEYWORDS.some(keyword => searchText.includes(keyword.toLowerCase()));
  };

  // Clean shop name
  const cleanName = (name: string): string => {
    return name
      .replace(/\s*-\s*.*$/, '')
      .replace(/\s*\|.*$/, '')
      .replace(/\([^)]*\)/g, '')
      .trim();
  };

  // Format phone number
  const formatPhone = (phone?: string): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '').replace(/^33/, '0').replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  };

  // Fetch place details via Edge Function
  const fetchPlaceDetails = async (placeId: string): Promise<GooglePlace | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: { action: 'placeDetails', placeId, apiKey }
      });
      
      if (error) throw error;
      
      if (data.result) {
        return {
          place_id: placeId,
          name: data.result.name,
          formatted_address: data.result.formatted_address,
          formatted_phone_number: data.result.formatted_phone_number,
          rating: data.result.rating,
          user_ratings_total: data.result.user_ratings_total,
          website: data.result.website
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };

  // Get all queries to execute based on current configuration
  const getQueriesToExecute = (): string[] => {
    if (!enableCombinedSearch) {
      return [query];
    }
    
    const queries: string[] = [];
    
    // Add preset combined queries if no specific selections
    if (selectedBrands.length === 0 && selectedServices.length === 0) {
      return COMBINED_QUERIES_PRESET;
    }
    
    // Add brand queries
    selectedBrands.forEach(brandId => {
      const brand = BRAND_QUERIES.find(b => b.id === brandId);
      if (brand) queries.push(brand.query);
    });
    
    // Add service queries
    selectedServices.forEach(serviceId => {
      const service = SERVICE_QUERIES.find(s => s.id === serviceId);
      if (service) queries.push(service.query);
    });
    
    return queries.length > 0 ? queries : [query];
  };
  
  // Toggle brand selection
  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };
  
  // Toggle service selection
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Search for a single location with a specific query
  const searchLocationWithQuery = async (location: string, searchQuery: string): Promise<GooglePlace[]> => {
    const fullQuery = `${searchQuery} ${location}`.trim();
    
    const { data: searchData, error: searchError } = await supabase.functions.invoke('google-places-proxy', {
      body: { action: 'textSearch', query: fullQuery, apiKey }
    });
    
    if (searchError) {
      console.error('Search error for', location, searchError);
      return [];
    }
    
    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      console.error('Google Places error:', searchData.status);
      return [];
    }

    const places = searchData.results || [];
    const detailedPlaces: GooglePlace[] = [];
    
    for (const place of places) {
      const details = await fetchPlaceDetails(place.place_id);
      if (details && details.formatted_phone_number) {
        detailedPlaces.push(details);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return detailedPlaces;
  };

  // Search for a single location with all configured queries
  const searchLocation = async (location: string): Promise<GooglePlace[]> => {
    const queries = getQueriesToExecute();
    const allPlaces: GooglePlace[] = [];
    
    for (const q of queries) {
      const results = await searchLocationWithQuery(location, q);
      allPlaces.push(...results);
      if (queries.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    // Deduplicate by place_id
    return allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.place_id === place.place_id)
    );
  };

  // Start scraping
  const startScraping = async () => {
    if (searchMode === 'city' && !city && !postalCode) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une ville ou un code postal",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setProgress(0);
    setExcludedCount(0);
    setProgressMessage('Recherche en cours...');
    
    // Create a new session for persistence
    const sessionId = createSession();

    try {
      let allPlaces: GooglePlace[] = [];
      
      if (searchMode === 'region' && selectedRegionData) {
        // Region mode: scrape all departments in the region
        const departments = selectedRegionData.departments;
        setExhaustiveStats({ cities: 0, totalCities: 0, departments: 0, totalDepartments: departments.length });
        
        for (let deptIdx = 0; deptIdx < departments.length; deptIdx++) {
          const dept = departments[deptIdx];
          const cities = enableExhaustiveScraping ? getCitiesForDepartment(dept.code) : [dept.name];
          
          setExhaustiveStats(prev => ({ ...prev, totalCities: prev.totalCities + cities.length }));
          
          for (let cityIdx = 0; cityIdx < cities.length; cityIdx++) {
            const cityName = cities[cityIdx];
            setProgress(Math.round(((deptIdx * cities.length + cityIdx) / (departments.length * cities.length)) * 100));
            setProgressMessage(`${dept.name}: ${cityName} (${deptIdx + 1}/${departments.length})`);
            
            const cityResults = await searchLocation(cityName);
            allPlaces = [...allPlaces, ...cityResults];
            
            // Save progressively every 5 cities
            if ((cityIdx + 1) % 5 === 0 || cityIdx === cities.length - 1) {
              await saveResults(sessionId, allPlaces, {
                city: getLocationLabel(),
                source: 'google_places',
                searchMode,
                region: selectedRegion,
              });
            }
            
            setExhaustiveStats(prev => ({ ...prev, cities: prev.cities + 1 }));
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          setExhaustiveStats(prev => ({ ...prev, departments: prev.departments + 1 }));
        }
      } else if (searchMode === 'department') {
        const deptInfo = getDepartmentInfo(selectedDepartment);
        if (!deptInfo) throw new Error('Département non trouvé');
        
        if (enableExhaustiveScraping) {
          const cities = getCitiesForDepartment(selectedDepartment);
          setExhaustiveStats({ cities: 0, totalCities: cities.length, departments: 0, totalDepartments: 1 });
          
          for (let i = 0; i < cities.length; i++) {
            setProgress(Math.round(((i + 1) / cities.length) * 100));
            setProgressMessage(`${cities[i]} (${i + 1}/${cities.length})`);
            
            const cityResults = await searchLocation(cities[i]);
            allPlaces = [...allPlaces, ...cityResults];
            
            // Save progressively every 3 cities
            if ((i + 1) % 3 === 0 || i === cities.length - 1) {
              await saveResults(sessionId, allPlaces, {
                city: getLocationLabel(),
                source: 'google_places',
                searchMode,
                department: selectedDepartment,
              });
            }
            
            setExhaustiveStats(prev => ({ ...prev, cities: prev.cities + 1 }));
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } else {
          setProgress(50);
          setProgressMessage(`Recherche dans ${deptInfo.name}...`);
          const cityResults = await searchLocation(deptInfo.name);
          allPlaces = [...allPlaces, ...cityResults];
          
          // Save results
          await saveResults(sessionId, allPlaces, {
            city: getLocationLabel(),
            source: 'google_places',
            searchMode,
            department: selectedDepartment,
          });
        }
      } else {
        // City mode
        const searchQuery = `${query} ${city} ${postalCode}`.trim();
        
        const { data: searchData, error: searchError } = await supabase.functions.invoke('google-places-proxy', {
          body: { action: 'textSearch', query: searchQuery, apiKey }
        });
        
        if (searchError) throw new Error(`Erreur API: ${searchError.message}`);
        if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
          throw new Error(`Erreur Google Places: ${searchData.status}`);
        }

        const places = searchData.results || [];
        for (let i = 0; i < places.length; i++) {
          setProgress(Math.round(((i + 1) / places.length) * 100));
          setProgressMessage(`Récupération ${i + 1}/${places.length}: ${places[i].name}`);
          
          const details = await fetchPlaceDetails(places[i].place_id);
          if (details && details.formatted_phone_number) allPlaces.push(details);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Save results for city mode
        await saveResults(sessionId, allPlaces, {
          city: getLocationLabel(),
          source: 'google_places',
          searchMode,
        });
      }

      // Deduplicate and filter
      const uniquePlaces = allPlaces.filter((place, index, self) => 
        index === self.findIndex(p => p.place_id === place.place_id)
      );

      let filteredPlaces = uniquePlaces;
      let excluded = 0;
      
      if (enableExclusionFilter) {
        filteredPlaces = uniquePlaces.filter(place => {
          if (shouldExclude(place)) { excluded++; return false; }
          return true;
        });
        setExcludedCount(excluded);
      }

      setResults(filteredPlaces);
      setProgress(100);
      setProgressMessage('Terminé!');
      
      // Final save with filtered results
      await saveResults(sessionId, filteredPlaces, {
        city: getLocationLabel(),
        source: 'google_places',
        searchMode,
        department: searchMode === 'department' ? selectedDepartment : undefined,
        region: searchMode === 'region' ? selectedRegion : undefined,
      });
      
      toast({
        title: "Scraping terminé",
        description: `${filteredPlaces.length} boutiques trouvées${excluded > 0 ? ` (${excluded} exclues)` : ''}. Résultats sauvegardés.`,
      });
    } catch (error: any) {
      console.error('Scraping error:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resume a pending session
  const handleResumeSession = async (sessionId: string) => {
    const sessionResults = await resumeSession(sessionId);
    if (sessionResults.length > 0) {
      setResults(sessionResults);
      toast({
        title: "Session reprise",
        description: `${sessionResults.length} résultats chargés`,
      });
    }
  };

  // Import directly to database
  const importToDatabase = async () => {
    if (results.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucun résultat à importer",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    let imported = 0;
    let errors = 0;

    try {
      for (const place of results) {
        // Extract city from address
        const addressParts = place.formatted_address.split(',');
        const cityFromAddress = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : city || 'France';
        const postalMatch = cityFromAddress.match(/\d{5}/);
        const extractedPostal = postalMatch ? postalMatch[0] : postalCode || '00000';
        
        const repairerData = {
          name: cleanName(place.name),
          address: place.formatted_address,
          city: cityFromAddress.replace(/\d{5}/, '').trim() || city || 'France',
          postal_code: extractedPostal,
          phone: formatPhone(place.formatted_phone_number),
          services: DEFAULT_SERVICES,
          description: `Expert en réparation mobile. Note: ${place.rating || 'N/A'}/5 (${place.user_ratings_total || 0} avis).`,
          website: place.website || null,
          is_verified: false,
          source: 'google_places'
        };

        const { error } = await supabase
          .from('repairers')
          .upsert(repairerData, { onConflict: 'phone' });

        if (error) {
          console.error('Insert error:', error);
          errors++;
        } else {
          imported++;
        }
      }

      toast({
        title: "Import terminé",
        description: `${imported} réparateurs importés. ${errors > 0 ? `${errors} erreurs.` : ''}`,
        variant: errors > 0 ? "default" : "default"
      });

      if (imported > 0) {
        // Mark session as imported
        if (currentSessionId) {
          await markAsImported(currentSessionId);
        }
        
        toast({
          title: "Géocodage",
          description: "Lancement du géocodage automatique...",
        });
        
        await supabase.functions.invoke('geocode-repairers');
      }

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'import",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Remove a result
  const removeResult = (placeId: string) => {
    setResults(prev => prev.filter(r => r.place_id !== placeId));
  };

  // Export to JSON
  const exportToJSON = () => {
    if (results.length === 0) return;

    const exportData: RepairerExport[] = results.map(place => ({
      name: cleanName(place.name),
      address: place.formatted_address,
      postal_code: postalCode || '00000',
      city: city || 'France',
      phone: formatPhone(place.formatted_phone_number),
      services: DEFAULT_SERVICES,
      description: `Expert en réparation mobile. Note: ${place.rating || 'N/A'}/5 (${place.user_ratings_total || 0} avis).`
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reparateurs-${searchMode === 'department' ? getDepartmentInfo(selectedDepartment)?.name : city}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${exportData.length} réparateurs exportés`,
    });
  };

  // Render stars
  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground">N/A</span>;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} 
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Google Places Scraper
          </h1>
          <p className="text-muted-foreground">
            Recherche par ville ou département avec filtres intelligents
          </p>
        </div>
        
        {results.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={exportToJSON} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Télécharger JSON
            </Button>
            <Button onClick={importToDatabase} disabled={isImporting} className="gap-2">
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Importer en base
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Configuration */}
        <div className="lg:col-span-1 space-y-4">
          {/* Pending Sessions */}
          <PendingSessionsPanel
            sessions={pendingSessions}
            loading={loadingPending}
            onResume={handleResumeSession}
            onDelete={deleteSession}
            onRefresh={loadPendingSessions}
          />
          
          {/* Export Panel */}
          <ScrapingExportPanel results={results} locationLabel={getLocationLabel()} />
          
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="h-5 w-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">Clé API Google</Label>
              <Input 
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="font-mono text-xs"
              />
            </div>

            {/* Search Mode Toggle */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Mode de recherche
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={searchMode === 'city' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('city')}
                  className="flex-1"
                >
                  Ville
                </Button>
                <Button
                  variant={searchMode === 'department' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('department')}
                  className="flex-1"
                >
                  Département
                </Button>
                <Button
                  variant={searchMode === 'region' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('region')}
                  className="flex-1"
                >
                  Région
                </Button>
              </div>
            </div>

            {searchMode === 'city' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="ex: Paris" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code Postal</Label>
                  <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="ex: 75001" />
                </div>
              </>
            ) : searchMode === 'region' ? (
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Globe2 className="h-4 w-4" />Région</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une région" /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    {REGIONS.map((region) => {
                      const stats = regionStats.get(region.name);
                      const hasData = stats && stats.totalRepairers > 0;
                      return (
                        <SelectItem key={region.name} value={region.name}>
                          <div className="flex items-center gap-2 w-full">
                            {hasData && <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                            <span>{region.name}</span>
                            {hasData ? (
                              <Badge variant="default" className="ml-auto text-xs bg-green-500/20 text-green-700 border-green-500/30">
                                {stats.totalRepairers}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="ml-auto text-xs text-muted-foreground">
                                {region.departments.length} dép.
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedRegionData && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    {(() => {
                      const stats = regionStats.get(selectedRegionData.name);
                      if (stats && stats.totalRepairers > 0) {
                        return (
                          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>{stats.totalRepairers} réparateurs • {stats.scrapedDepartments}/{stats.totalDepartments} dép. scrapés</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <p className="text-xs text-muted-foreground">Départements ({selectedRegionData.departments.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedRegionData.departments.map((dept) => {
                        const deptStats = departmentStats.get(dept.code);
                        const hasDeptData = deptStats && deptStats.repairerCount > 0;
                        return (
                          <Badge 
                            key={dept.code} 
                            variant={hasDeptData ? "default" : "outline"} 
                            className={`text-xs ${hasDeptData ? 'bg-green-500/20 text-green-700 border-green-500/30' : ''}`}
                            title={hasDeptData ? `${deptStats.repairerCount} réparateurs` : 'Non scrapé'}
                          >
                            {dept.code}
                            {hasDeptData && <span className="ml-1 opacity-70">({deptStats.repairerCount})</span>}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Département</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    {REGIONS.map((region) => (
                      <div key={region.name}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">{region.name}</div>
                        {region.departments.map((dept) => {
                          const deptStats = departmentStats.get(dept.code);
                          const hasDeptData = deptStats && deptStats.repairerCount > 0;
                          return (
                            <SelectItem key={dept.code} value={dept.code}>
                              <div className="flex items-center gap-2 w-full">
                                {hasDeptData && <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                                <span>{dept.code} - {dept.name}</span>
                                {hasDeptData && (
                                  <Badge variant="default" className="ml-auto text-xs bg-green-500/20 text-green-700 border-green-500/30">
                                    {deptStats.repairerCount}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                {(() => {
                  const deptStats = departmentStats.get(selectedDepartment);
                  if (deptStats && deptStats.repairerCount > 0) {
                    return (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1.5 rounded">
                        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{deptStats.repairerCount} réparateurs dans {deptStats.cityCount} villes</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Exhaustive scraping toggle */}
            {(searchMode === 'department' || searchMode === 'region') && (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <Label htmlFor="exhaustive" className="text-sm cursor-pointer">Scraping exhaustif</Label>
                </div>
                <Switch id="exhaustive" checked={enableExhaustiveScraping} onCheckedChange={setEnableExhaustiveScraping} />
              </div>
            )}

            {/* Combined Search Toggle */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <Label htmlFor="combinedSearch" className="text-sm cursor-pointer font-medium">
                  Recherche combinée
                </Label>
              </div>
              <Switch id="combinedSearch" checked={enableCombinedSearch} onCheckedChange={setEnableCombinedSearch} />
            </div>

            {enableCombinedSearch ? (
              <div className="space-y-4">
                {/* Brand Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    📱 Marques à rechercher
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {BRAND_QUERIES.map((brand) => (
                      <Button
                        key={brand.id}
                        variant={selectedBrands.includes(brand.id) ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => toggleBrand(brand.id)}
                      >
                        {brand.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    🔧 Types de réparation
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {SERVICE_QUERIES.map((service) => (
                      <Button
                        key={service.id}
                        variant={selectedServices.includes(service.id) ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => toggleService(service.id)}
                      >
                        {service.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Query Preview */}
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-muted-foreground">Requêtes qui seront lancées:</Label>
                    <Badge variant="secondary" className="text-xs">
                      {getQueriesToExecute().length} requête(s)
                    </Badge>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {getQueriesToExecute().map((q, idx) => (
                      <div key={idx} className="text-xs text-foreground bg-background/50 px-2 py-1 rounded flex items-center gap-1">
                        <Search className="h-3 w-3 text-muted-foreground" />
                        "{q}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Query Input (simple mode) */}
                <div className="space-y-2">
                  <Label htmlFor="query">Requête de recherche</Label>
                  <Input 
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Réparation téléphone"
                  />
                </div>

                {/* Quick Suggestions */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    Suggestions rapides
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {COMBINED_QUERIES_PRESET.slice(0, 3).map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => setQuery(suggestion)}
                      >
                        {suggestion.slice(0, 25)}...
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Exclusion Filter Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="exclusionFilter" className="text-sm cursor-pointer">
                  Exclure informatique
                </Label>
              </div>
              <Switch
                id="exclusionFilter"
                checked={enableExclusionFilter}
                onCheckedChange={setEnableExclusionFilter}
              />
            </div>

            {/* Final Query Preview */}
            {!enableCombinedSearch && (
              <div className="p-2 bg-muted/30 rounded border border-border/50">
                <p className="text-xs text-muted-foreground">
                  🔍 Requête finale: <span className="text-foreground font-mono">"{query} {searchMode === 'city' ? `${city} ${postalCode}` : searchMode === 'department' ? getDepartmentInfo(selectedDepartment)?.name : selectedRegion}"</span>
                </p>
              </div>
            )}

            <Button 
              onClick={startScraping} 
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  {enableCombinedSearch ? `Lancer ${getQueriesToExecute().length} requêtes` : 'Lancer le Scraping'}
                </>
              )}
            </Button>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {progressMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Results Table */}
        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Résultats ({results.length})
              </CardTitle>
              <div className="flex gap-2">
                {excludedCount > 0 && (
                  <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
                    <Filter className="h-3 w-3" />
                    {excludedCount} exclues
                  </Badge>
                )}
                {results.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {results.length} avec téléphone
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>
              Prévisualisez et nettoyez les résultats avant import
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun résultat. Lancez une recherche pour commencer.</p>
                <p className="text-xs mt-2">
                  💡 Conseil: Utilisez les suggestions pour des résultats plus précis
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {results.map((place) => (
                    <div 
                      key={place.place_id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {cleanName(place.name)}
                          </span>
                          {renderStars(place.rating)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {place.formatted_address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {formatPhone(place.formatted_phone_number)}
                          </span>
                          {place.website && (
                            <a 
                              href={place.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Globe className="h-3 w-3" />
                              Site web
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeResult(place.place_id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GooglePlacesScraper;
