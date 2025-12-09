import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  console.log('🚀 ai-scrape-repairers function called');
  console.log('📥 Request method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('👋 Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body));
    
    const { department_code, test_mode = false } = body;
    
    if (!department_code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Code département requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const departmentName = DEPARTMENT_NAMES[department_code] || department_code;
    const count = test_mode ? 5 : 15;

    console.log(`🚀 Génération IA pour ${departmentName} (${department_code}), mode test: ${test_mode}`);

    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Créer un log de scraping (sans department_code pour compatibilité)
    const { data: logData, error: logError } = await supabase
      .from('scraping_logs')
      .insert({
        source: `lovable-ai-${department_code}`,
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
    console.log(`📝 Log créé: ${logId}`);

    // Prompt optimisé pour générer des réparateurs
    const prompt = `Tu es un expert en réparation de smartphones en France. Génère une liste de ${count} boutiques de réparation de téléphones réalistes pour le département ${departmentName} (${department_code}).

IMPORTANT: Génère des données réalistes avec des noms d'entreprises crédibles, des adresses complètes avec numéros de rue, et des numéros de téléphone valides au format français.

Pour chaque réparateur, fournis EXACTEMENT ce format JSON:
{
  "name": "Nom de la boutique (ex: Phone Repair Express, iDoctor Paris, MobileFix)",
  "address": "Adresse complète avec numéro de rue (ex: 15 rue du Commerce)",
  "postal_code": "Code postal 5 chiffres commençant par ${department_code.substring(0, 2)}",
  "city": "Ville du département ${departmentName}",
  "phone": "Numéro au format 01 23 45 67 89 ou 06 12 34 56 78",
  "services": ["Réparation écran", "Changement batterie", "Réparation connecteur"],
  "description": "Description courte de la boutique (30 mots max)"
}

RETOURNE UNIQUEMENT un tableau JSON valide avec ${count} éléments, sans texte avant ou après, sans balises markdown.`;

    // Appel à Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    console.log('🤖 Appel à Lovable AI...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un assistant qui génère uniquement du JSON valide sans aucun texte supplémentaire. Ne mets jamais de balises markdown comme ```json. Retourne directement le tableau JSON.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Erreur Lovable AI:', aiResponse.status, errorText);
      
      // Mettre à jour le log en échec
      await supabase
        .from('scraping_logs')
        .update({ status: 'failed', error_message: `AI Error: ${aiResponse.status}`, completed_at: new Date().toISOString() })
        .eq('id', logId);
      
      throw new Error(`Lovable AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Réponse IA vide');
    }

    console.log('📥 Réponse IA reçue, parsing...');

    // Parser le JSON (nettoyer si nécessaire)
    let repairers = [];
    try {
      // Nettoyer la réponse des balises markdown potentielles
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      repairers = JSON.parse(cleanContent);
      
      if (!Array.isArray(repairers)) {
        throw new Error('La réponse n\'est pas un tableau');
      }
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError, 'Content:', content.substring(0, 500));
      
      await supabase
        .from('scraping_logs')
        .update({ status: 'failed', error_message: 'Erreur parsing JSON', completed_at: new Date().toISOString() })
        .eq('id', logId);
      
      throw new Error('Impossible de parser la réponse IA');
    }

    // Enrichir les résultats avec les métadonnées
    const enrichedResults = repairers.map((r: any, index: number) => ({
      name: r.name || `Réparateur ${index + 1}`,
      address: r.address || '',
      city: r.city || departmentName,
      postal_code: r.postal_code || `${department_code}000`,
      phone: r.phone || '',
      email: r.email || '',
      website: r.website || '',
      services: r.services || ['Réparation smartphone'],
      description: r.description || '',
      source: 'lovable-ai',
      logo_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || 'R')}`,
    }));

    console.log(`✅ ${enrichedResults.length} réparateurs générés`);

    // Mettre à jour le log
    await supabase
      .from('scraping_logs')
      .update({ 
        status: 'preview', 
        items_scraped: enrichedResults.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', logId);

    return new Response(
      JSON.stringify({
        success: true,
        results: enrichedResults,
        total_found: enrichedResults.length,
        log_id: logId,
        provider: 'lovable-ai'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
