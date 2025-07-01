
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { action, prompt, ai_model, output_format, analysis } = await req.json();

    console.log(`🤖 AI Prompt Scraping - Action: ${action}, Model: ${ai_model}`);

    if (action === 'analyze') {
      return await analyzePrompt(prompt, ai_model, output_format);
    } else if (action === 'execute') {
      return await executeScraping(prompt, ai_model, output_format, analysis);
    }

    throw new Error('Action non supportée');

  } catch (error) {
    console.error('❌ Erreur AI Prompt Scraping:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function analyzePrompt(prompt: string, aiModel: string, outputFormat: string) {
  console.log('🧠 Analyse du prompt avec', aiModel);

  const analysisPrompt = `
Analyse ce prompt de scraping et extrais les informations structurées au format JSON :

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

Exemples de business_types: "réparateur smartphone", "magasin informatique", "boutique téléphonie", "service après-vente"
Exemples de services: "réparation écran", "micro soudure", "vente", "dépannage", "maintenance"
`;

  try {
    const analysis = await callAI(aiModel, analysisPrompt);
    
    // Parser le JSON de réponse
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse IA invalide');
    }

    const parsedAnalysis: PromptAnalysis = JSON.parse(jsonMatch[0]);
    
    // Enrichir l'analyse avec des données par défaut
    parsedAnalysis.output_format = parsedAnalysis.output_format || outputFormat;
    parsedAnalysis.max_results = parsedAnalysis.max_results || 100;

    console.log('✅ Analyse terminée:', parsedAnalysis);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: parsedAnalysis,
        original_prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur analyse:', error);
    throw new Error(`Erreur d'analyse: ${error.message}`);
  }
}

async function executeScraping(prompt: string, aiModel: string, outputFormat: string, analysis: PromptAnalysis) {
  console.log('🚀 Exécution du scraping basé sur l\'analyse:', analysis);

  // Simuler le scraping pour l'instant - à remplacer par le vrai scraping
  const mockResults = generateMockResults(analysis);

  // Formater les résultats selon le format demandé
  const formattedResults = formatResults(mockResults, analysis.output_format);

  console.log(`✅ Scraping terminé: ${formattedResults.length} résultats`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      results: formattedResults,
      analysis: analysis,
      total_count: formattedResults.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function callAI(model: string, prompt: string): Promise<string> {
  const apiKey = getAPIKey(model);
  
  if (!apiKey) {
    throw new Error(`Clé API manquante pour ${model}`);
  }

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
  switch (model) {
    case 'deepseek':
      return Deno.env.get('DEEPSEEK_API_KEY');
    case 'mistral':
      return Deno.env.get('MISTRAL_API_KEY');
    case 'openai':
      return Deno.env.get('OPENAI_API_KEY');
    default:
      return undefined;
  }
}

async function callDeepSeek(apiKey: string, prompt: string): Promise<string> {
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

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callMistral(apiKey: string, prompt: string): Promise<string> {
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

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
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

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function generateMockResults(analysis: PromptAnalysis): any[] {
  // Génération de données de test basées sur l'analyse
  const mockData = [];
  const businessTypes = analysis.business_types || ['réparateur'];
  const location = analysis.location || 'France';
  const department = analysis.department || '01';

  for (let i = 0; i < Math.min(analysis.max_results || 20, 50); i++) {
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
