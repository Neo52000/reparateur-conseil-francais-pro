import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { callAIWithFallback, parseJsonFromContent, type AIProvider } from "../_shared/ai-text.ts";

// Départements avec noms pour le prompt
const DEPARTMENT_NAMES: Record<string, string> = {
  '75': 'Paris', '77': 'Seine-et-Marne', '78': 'Yvelines', '91': 'Essonne',
  '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': 'Val-d\'Oise',
  '01': 'Ain', '03': 'Allier', '07': 'Ardèche', '15': 'Cantal', '26': 'Drôme',
  '38': 'Isère', '42': 'Loire', '43': 'Haute-Loire', '63': 'Puy-de-Dôme', '69': 'Rhône',
  '73': 'Savoie', '74': 'Haute-Savoie', '04': 'Alpes-de-Haute-Provence', '05': 'Hautes-Alpes',
  '06': 'Alpes-Maritimes', '13': 'Bouches-du-Rhône', '83': 'Var', '84': 'Vaucluse',
  '16': 'Charente', '17': 'Charente-Maritime', '19': 'Corrèze', '23': 'Creuse',
  '24': 'Dordogne', '33': 'Gironde', '40': 'Landes', '47': 'Lot-et-Garonne',
  '64': 'Pyrénées-Atlantiques', '79': 'Deux-Sèvres', '86': 'Vienne', '87': 'Haute-Vienne',
  '09': 'Ariège', '11': 'Aude', '12': 'Aveyron', '30': 'Gard', '31': 'Haute-Garonne',
  '32': 'Gers', '34': 'Hérault', '46': 'Lot', '48': 'Lozère', '65': 'Hautes-Pyrénées',
  '66': 'Pyrénées-Orientales', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '22': 'Côtes-d\'Armor', '29': 'Finistère', '35': 'Ille-et-Vilaine', '56': 'Morbihan',
  '44': 'Loire-Atlantique', '49': 'Maine-et-Loire', '53': 'Mayenne', '72': 'Sarthe', '85': 'Vendée',
  '08': 'Ardennes', '10': 'Aube', '51': 'Marne', '52': 'Haute-Marne', '54': 'Meurthe-et-Moselle',
  '55': 'Meuse', '57': 'Moselle', '67': 'Bas-Rhin', '68': 'Haut-Rhin', '88': 'Vosges',
  '02': 'Aisne', '59': 'Nord', '60': 'Oise', '62': 'Pas-de-Calais', '80': 'Somme',
  '14': 'Calvados', '27': 'Eure', '50': 'Manche', '61': 'Orne', '76': 'Seine-Maritime',
  '18': 'Cher', '28': 'Eure-et-Loir', '36': 'Indre', '37': 'Indre-et-Loire',
  '41': 'Loir-et-Cher', '45': 'Loiret', '21': 'Côte-d\'Or', '25': 'Doubs', '39': 'Jura',
  '58': 'Nièvre', '70': 'Haute-Saône', '71': 'Saône-et-Loire', '89': 'Yonne',
  '90': 'Territoire de Belfort', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse',
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane', '974': 'La Réunion', '976': 'Mayotte',
};

// Arrondissements de Paris
const PARIS_ARRONDISSEMENTS = [
  { code: '75001', name: 'Paris 1er', zone: 'centre' },
  { code: '75002', name: 'Paris 2e', zone: 'centre' },
  { code: '75003', name: 'Paris 3e', zone: 'centre' },
  { code: '75004', name: 'Paris 4e', zone: 'centre' },
  { code: '75005', name: 'Paris 5e', zone: 'rive gauche' },
  { code: '75006', name: 'Paris 6e', zone: 'rive gauche' },
  { code: '75007', name: 'Paris 7e', zone: 'rive gauche' },
  { code: '75008', name: 'Paris 8e', zone: 'ouest' },
  { code: '75009', name: 'Paris 9e', zone: 'nord' },
  { code: '75010', name: 'Paris 10e', zone: 'nord-est' },
  { code: '75011', name: 'Paris 11e', zone: 'est' },
  { code: '75012', name: 'Paris 12e', zone: 'sud-est' },
  { code: '75013', name: 'Paris 13e', zone: 'sud' },
  { code: '75014', name: 'Paris 14e', zone: 'sud' },
  { code: '75015', name: 'Paris 15e', zone: 'sud-ouest' },
  { code: '75016', name: 'Paris 16e', zone: 'ouest' },
  { code: '75017', name: 'Paris 17e', zone: 'nord-ouest' },
  { code: '75018', name: 'Paris 18e', zone: 'nord' },
  { code: '75019', name: 'Paris 19e', zone: 'nord-est' },
  { code: '75020', name: 'Paris 20e', zone: 'est' },
];

interface RawRepairer {
  name?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  description?: string;
}

function parseAIResponse(content: string): RawRepairer[] {
  const parsed = parseJsonFromContent(content);
  if (!Array.isArray(parsed)) {
    throw new Error("La réponse n'est pas un tableau");
  }
  return parsed as RawRepairer[];
}

function normalizeProvider(value?: string): AIProvider | undefined {
  if (value === 'gemini' || value === 'openai' || value === 'mistral') return value;
  return undefined;
}

// Générer le prompt pour une zone spécifique
function generatePrompt(zoneName: string, zoneCode: string, count: number, specificArea?: string): string {
  const areaInfo = specificArea ? ` dans le quartier ${specificArea}` : '';
  
  return `Tu es un expert en réparation de smartphones en France. Génère une liste de ${count} boutiques de réparation de téléphones RÉELLES et UNIQUES pour ${zoneName}${areaInfo}.

IMPORTANT: 
- Génère des données réalistes avec des noms d'entreprises crédibles et variés
- Utilise des adresses complètes avec numéros de rue DIFFÉRENTS
- Les numéros de téléphone doivent être valides au format français
- Évite les doublons de noms

Pour chaque réparateur, fournis EXACTEMENT ce format JSON:
{
  "name": "Nom de la boutique (ex: Phone Repair Express, iDoctor, MobileFix, Dr Phone, etc.)",
  "address": "Adresse complète avec numéro de rue (ex: 15 rue du Commerce)",
  "postal_code": "${zoneCode}",
  "city": "${zoneName}",
  "phone": "Numéro au format 01 23 45 67 89 ou 06 12 34 56 78",
  "services": ["Réparation écran", "Changement batterie", "Réparation connecteur"],
  "description": "Description courte de la boutique (30 mots max)"
}

RETOURNE UNIQUEMENT un tableau JSON valide avec ${count} éléments UNIQUES, sans texte avant ou après, sans balises markdown.`;
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  try {
    const body = await req.json();
    const { 
      department_code, 
      test_mode = false,
      count: requestedCount,
      scrape_by_arrondissement = false,
      ai_provider // Nouveau: provider IA spécifique
    } = body;
    
    if (!department_code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Code département requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const departmentName = DEPARTMENT_NAMES[department_code] || department_code;
    const isParis = department_code === '75';
    
    const count = requestedCount || (test_mode ? 5 : 30);

    console.log(`🚀 Génération IA pour ${departmentName} (${department_code}), mode test: ${test_mode}, count: ${count}`);

    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Créer un log de scraping
    const { data: logData, error: logError } = await supabase
      .from('scraping_logs')
      .insert({
        source: `ai-generation-${department_code}`,
        status: 'running',
        items_scraped: 0,
        items_added: 0,
        items_updated: 0,
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Erreur création log:', logError);
      throw logError;
    }

    const logId = logData.id;
    const systemPrompt = 'Tu es un assistant qui génère uniquement du JSON valide sans aucun texte supplémentaire. Ne mets jamais de balises markdown comme ```json. Retourne directement le tableau JSON.';
    
    interface EnrichedRepairer {
      name: string;
      address: string;
      city: string;
      postal_code: string;
      phone: string;
      email: string;
      website: string;
      services: string[];
      description: string;
      source: string;
      arrondissement?: string;
      logo_url: string;
    }
    let allRepairers: EnrichedRepairer[] = [];

    // Pour Paris avec scraping par arrondissement
    if (isParis && scrape_by_arrondissement) {
      console.log('🗼 Mode Paris par arrondissements activé');
      
      const countPerArrondissement = Math.ceil(count / 10); // On divise par 10 arrondissements sélectionnés
      const selectedArrondissements = PARIS_ARRONDISSEMENTS.filter((_, i) => i % 2 === 0); // 10 arrondissements
      
      for (const arr of selectedArrondissements) {
        const prompt = generatePrompt(arr.name, arr.code, countPerArrondissement, arr.zone);
        const aiResult = await callAIWithFallback({
          systemPrompt,
          userPrompt: prompt,
          maxTokens: 8000,
          preferredProvider: normalizeProvider(ai_provider),
        });

        if (aiResult.success && aiResult.content) {
          try {
            const repairers = parseAIResponse(aiResult.content!);
            console.log(`✅ ${repairers.length} réparateurs générés pour ${arr.name} via ${aiResult.provider}`);
            
            // Enrichir avec les infos de l'arrondissement
            const enriched = repairers.map((r: RawRepairer, index: number) => ({
              name: r.name || `Réparateur ${arr.name} ${index + 1}`,
              address: r.address || '',
              city: arr.name,
              postal_code: r.postal_code || arr.code,
              phone: r.phone || '',
              email: r.email || '',
              website: r.website || '',
              services: r.services || ['Réparation smartphone'],
              description: r.description || '',
              source: aiResult.provider,
              arrondissement: arr.name,
              logo_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || 'R')}`,
            }));
            
            allRepairers.push(...enriched);
          } catch (parseError) {
            console.error(`❌ Erreur parsing pour ${arr.name}:`, parseError);
          }
        } else {
          console.error(`❌ Échec génération pour ${arr.name}`);
        }
        
        // Pause entre les appels pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      const prompt = generatePrompt(departmentName, `${department_code}000`, count);
      const aiResult = await callAIWithFallback({
        systemPrompt,
        userPrompt: prompt,
        maxTokens: 8000,
        preferredProvider: normalizeProvider(ai_provider),
      });

      if (!aiResult.success || !aiResult.content) {
        await supabase
          .from('scraping_logs')
          .update({ status: 'failed', error_message: aiResult.error, completed_at: new Date().toISOString() })
          .eq('id', logId);
        
        throw new Error(aiResult.error);
      }

      console.log(`✅ Réponse reçue de ${aiResult.provider}`);

      try {
        const repairers = parseAIResponse(aiResult.content!);
        
        allRepairers = repairers.map((r: RawRepairer, index: number) => ({
          name: r.name || `Réparateur ${index + 1}`,
          address: r.address || '',
          city: r.city || departmentName,
          postal_code: r.postal_code || `${department_code}000`,
          phone: r.phone || '',
          email: r.email || '',
          website: r.website || '',
          services: r.services || ['Réparation smartphone'],
          description: r.description || '',
          source: aiResult.provider,
          logo_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || 'R')}`,
        }));
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        
        await supabase
          .from('scraping_logs')
          .update({ status: 'failed', error_message: 'Erreur parsing JSON', completed_at: new Date().toISOString() })
          .eq('id', logId);
        
        throw new Error('Impossible de parser la réponse IA');
      }
    }

    // Dédupliquer par nom
    const uniqueNames = new Set<string>();
    const deduplicatedRepairers = allRepairers.filter(r => {
      const nameLower = r.name.toLowerCase();
      if (uniqueNames.has(nameLower)) {
        return false;
      }
      uniqueNames.add(nameLower);
      return true;
    });

    console.log(`✅ ${deduplicatedRepairers.length} réparateurs uniques générés (${allRepairers.length} avant déduplication)`);

    // Mettre à jour le log
    await supabase
      .from('scraping_logs')
      .update({ 
        status: 'preview', 
        items_scraped: deduplicatedRepairers.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', logId);

    return new Response(
      JSON.stringify({
        success: true,
        results: deduplicatedRepairers,
        total_found: deduplicatedRepairers.length,
        log_id: logId,
        provider: isParis && scrape_by_arrondissement ? 'multi-arrondissement' : 'single-call'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
