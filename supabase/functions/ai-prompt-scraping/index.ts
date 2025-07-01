
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PromptAnalysis {
  business_types: string[];
  services: string[];
  location: string;
  department?: string;
  output_format: string;
  strategy: string;
  keywords: string[];
  max_results?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 AI Prompt Scraping function called');
    
    // Vérifier les clés API disponibles
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
    const mistralKey = Deno.env.get('MISTRAL_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    console.log('🔑 API Keys status:', { 
      deepseek: deepseekKey ? 'Present' : 'Missing',
      mistral: mistralKey ? 'Present' : 'Missing', 
      openai: openaiKey ? 'Present' : 'Missing'
    });

    const { action, prompt, ai_model, output_format, analysis } = await req.json();

    console.log(`📝 Request details: action=${action}, model=${ai_model}, prompt="${prompt?.substring(0, 100)}..."`);

    if (action === 'analyze') {
      return await analyzePrompt(prompt, ai_model, output_format);
    } else if (action === 'execute') {
      return await executeScraping(prompt, ai_model, output_format, analysis);
    }

    throw new Error('Action non supportée');

  } catch (error) {
    console.error('❌ Erreur AI Prompt Scraping:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Vérifiez les logs pour plus d\'informations'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

async function analyzePrompt(prompt: string, aiModel: string, outputFormat: string) {
  console.log('🧠 Début analyse du prompt avec', aiModel);

  // Vérifier que la clé API existe
  const apiKey = getAPIKey(aiModel);
  if (!apiKey) {
    console.error(`❌ Clé API manquante pour ${aiModel}`);
    throw new Error(`Clé API ${aiModel.toUpperCase()}_API_KEY non configurée. Veuillez l'ajouter dans les secrets Supabase.`);
  }

  console.log(`✅ Clé API trouvée pour ${aiModel}`);

  const analysisPrompt = `
Analyse ce prompt de scraping et extrais les informations au format JSON :

PROMPT: "${prompt}"

Réponds UNIQUEMENT avec un JSON valide contenant :
{
  "business_types": ["types d'entreprises recherchées"],
  "services": ["services spécifiques mentionnés"],
  "location": "zone géographique",
  "department": "numéro de département si mentionné",
  "output_format": "format de sortie souhaité",
  "strategy": "stratégie de recherche recommandée",
  "keywords": ["mots-clés importants pour la recherche"],
  "max_results": nombre_max_de_résultats_estimé
}
`;

  try {
    console.log(`🚀 Appel API ${aiModel}...`);
    const analysis = await callAI(aiModel, analysisPrompt);
    console.log(`📥 Réponse IA reçue (${analysis.length} chars)`);
    
    // Parser le JSON de réponse
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Aucun JSON dans la réponse IA');
      throw new Error('L\'IA n\'a pas retourné un format JSON valide');
    }

    const parsedAnalysis: PromptAnalysis = JSON.parse(jsonMatch[0]);
    console.log('✅ JSON parsé:', parsedAnalysis);
    
    // Enrichir l'analyse
    parsedAnalysis.output_format = parsedAnalysis.output_format || outputFormat;
    parsedAnalysis.max_results = parsedAnalysis.max_results || 50;

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: parsedAnalysis,
        original_prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    throw new Error(`Erreur d'analyse avec ${aiModel}: ${error.message}`);
  }
}

async function executeScraping(prompt: string, aiModel: string, outputFormat: string, analysis: PromptAnalysis) {
  console.log('🚀 Exécution du scraping simulé');

  // Génération de données de test basées sur l'analyse
  const mockResults = generateMockResults(analysis);
  const formattedResults = formatResults(mockResults, analysis.output_format);

  console.log(`✅ Scraping simulé terminé: ${formattedResults.length} résultats`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      results: formattedResults,
      analysis: analysis,
      total_count: formattedResults.length,
      note: "Résultats simulés - intégration du vrai scraping en cours"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function callAI(model: string, prompt: string): Promise<string> {
  const apiKey = getAPIKey(model);
  
  if (!apiKey) {
    throw new Error(`Clé API manquante pour ${model}`);
  }

  console.log(`🔑 Utilisation de la clé API pour ${model}`);

  switch (model) {
    case 'deepseek':
      return await callDeepSeek(apiKey, prompt);
    case 'mistral':
      return await callMistral(apiKey, prompt);
    case 'openai':
      return await callOpenAI(apiKey, prompt);
    default:
      throw new Error(`Modèle IA non supporté: ${model}`);
  }
}

function getAPIKey(model: string): string | undefined {
  const keyMap = {
    'deepseek': 'DEEPSEEK_API_KEY',
    'mistral': 'MISTRAL_API_KEY',
    'openai': 'OPENAI_API_KEY'
  };
  
  const keyName = keyMap[model as keyof typeof keyMap];
  if (!keyName) return undefined;
  
  const key = Deno.env.get(keyName);
  console.log(`🔍 Clé API ${model}: ${key ? 'Trouvée' : 'Manquante'}`);
  return key;
}

async function callDeepSeek(apiKey: string, prompt: string): Promise<string> {
  console.log('📡 Appel DeepSeek API...');
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1000
    })
  });

  console.log(`📊 DeepSeek response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ DeepSeek API error:`, errorText);
    throw new Error(`DeepSeek API error: ${response.status} - Vérifiez votre clé API`);
  }

  const data = await response.json();
  const result = data.choices[0]?.message?.content || '';
  console.log('✅ DeepSeek API réponse reçue');
  return result;
}

async function callMistral(apiKey: string, prompt: string): Promise<string> {
  console.log('📡 Appel Mistral API...');
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1000
    })
  });

  console.log(`📊 Mistral response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Mistral API error:`, errorText);
    throw new Error(`Mistral API error: ${response.status} - Vérifiez votre clé API`);
  }

  const data = await response.json();
  const result = data.choices[0]?.message?.content || '';
  console.log('✅ Mistral API réponse reçue');  
  return result;
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  console.log('📡 Appel OpenAI API...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1000
    })
  });

  console.log(`📊 OpenAI response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ OpenAI API error:`, errorText);    
    throw new Error(`OpenAI API error: ${response.status} - Vérifiez votre clé API`);
  }

  const data = await response.json();
  const result = data.choices[0]?.message?.content || '';
  console.log('✅ OpenAI API réponse reçue');
  return result;
}

function generateMockResults(analysis: PromptAnalysis): any[] {
  const mockData = [];
  const businessTypes = analysis.business_types || ['réparateur'];
  const location = analysis.location || 'France';
  const department = analysis.department || '01';

  for (let i = 0; i < Math.min(analysis.max_results || 20, 30); i++) {
    mockData.push({
      nom: `${businessTypes[0]} ${i + 1}`,
      adresse: `${10 + i} rue de la Réparation, ${location}`,
      telephone: `0${Math.floor(Math.random() * 9) + 1}${Math.random().toString().slice(2, 10)}`,
      services: analysis.services?.slice(0, 2).join(', ') || 'Réparation générale',
      department: department,
      verified: Math.random() > 0.3,
      email: `contact@reparateur${i + 1}.fr`,
      website: Math.random() > 0.5 ? `www.reparateur${i + 1}.fr` : null,
      specialites: analysis.keywords?.slice(0, 3).join(', ') || 'Smartphone, Tablette'
    });
  }

  return mockData;
}

function formatResults(results: any[], format: string): any[] {
  switch (format) {
    case 'tableau':
      return results;
    case 'liste':
      return results.map(r => ({ nom: r.nom, adresse: r.adresse, telephone: r.telephone }));
    case 'json':
      return results;
    case 'csv':
      return results;
    default:
      return results;
  }
}
