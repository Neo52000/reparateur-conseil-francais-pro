
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      device_model, 
      device_brand, 
      repair_type, 
      repair_difficulty, 
      device_release_date, 
      screen_size 
    } = await req.json();

    console.log('AI Price Suggestion Request:', {
      device_model,
      device_brand,
      repair_type,
      repair_difficulty
    });

    const prompt = `Tu es un expert en réparation de smartphones et mobiles. 
    
Analyse ces informations et suggère un prix de réparation réaliste pour le marché français en 2025:

Appareil: ${device_brand} ${device_model}
Type de réparation: ${repair_type}
Niveau de difficulté: ${repair_difficulty}
Date de sortie: ${device_release_date || 'Non spécifiée'}
Taille d'écran: ${screen_size || 'Non spécifiée'}"

Considère ces facteurs:
- Valeur marchande actuelle de l'appareil
- Complexité de la réparation
- Prix des pièces détachées
- Temps de main d'œuvre estimé
- Marché concurrentiel français
- Marge raisonnable pour le réparateur

Réponds UNIQUEMENT au format JSON suivant:
{
  "price_eur": nombre (prix total),
  "part_price_eur": nombre (prix pièce, peut être null),
  "labor_price_eur": nombre (coût main d'œuvre, peut être null),
  "confidence": nombre entre 0 et 1,
  "reasoning": "explication courte du calcul"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert en tarification de réparations mobiles. Réponds uniquement en JSON valide.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    console.log('OpenAI Response:', content);

    // Parser la réponse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON format in OpenAI response');
    }

    const suggestion = JSON.parse(jsonMatch[0]);
    
    // Validation et nettoyage des données
    const priceSuggestion = {
      price_eur: Math.max(0, parseFloat(suggestion.price_eur) || 0),
      part_price_eur: suggestion.part_price_eur ? Math.max(0, parseFloat(suggestion.part_price_eur)) : null,
      labor_price_eur: suggestion.labor_price_eur ? Math.max(0, parseFloat(suggestion.labor_price_eur)) : null,
      confidence: Math.min(Math.max(parseFloat(suggestion.confidence) || 0.5, 0), 1),
      reasoning: suggestion.reasoning || 'Estimation basée sur l\'analyse IA'
    };

    console.log('Final Price Suggestion:', priceSuggestion);

    return new Response(JSON.stringify(priceSuggestion), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-price-suggestion function:', error);
    
    // Fallback avec estimation basique
    const fallbackSuggestion = {
      price_eur: 80,
      part_price_eur: 50,
      labor_price_eur: 30,
      confidence: 0.3,
      reasoning: 'Estimation par défaut (erreur IA)'
    };

    return new Response(JSON.stringify(fallbackSuggestion), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
