
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiagnosticRequest {
  deviceType: string;
  brand: string;
  model: string;
  symptoms: string[];
  description: string;
  userLocation?: string;
}

interface DiagnosticResponse {
  diagnosis: string;
  probability: number;
  possibleCauses: string[];
  recommendedActions: string[];
  estimatedPrice: { min: number; max: number; };
  urgencyLevel: 'low' | 'medium' | 'high';
  suggestedRepairers?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const diagnosticRequest: DiagnosticRequest = await req.json();

    // Rechercher des diagnostics similaires dans la base de connaissances
    const { data: similarCases } = await supabase
      .from('chatbot_training_data')
      .select('*')
      .eq('device_type', 'smartphone')
      .ilike('training_text', `%${diagnosticRequest.symptoms.join('%')}%`)
      .limit(5);

    // Obtenir les prix moyens pour ce type de réparation
    const { data: priceData } = await supabase
      .from('repair_prices')
      .select(`
        price_eur,
        device_models!inner(model_name, brands!inner(name))
      `)
      .eq('device_models.brands.name', diagnosticRequest.brand)
      .limit(10);

    // Générer le diagnostic avec l'IA
    const systemPrompt = `Tu es un expert en diagnostic de smartphones et appareils électroniques.

Données de l'appareil:
- Type: ${diagnosticRequest.deviceType}
- Marque: ${diagnosticRequest.brand}
- Modèle: ${diagnosticRequest.model}
- Symptômes: ${diagnosticRequest.symptoms.join(', ')}
- Description: ${diagnosticRequest.description}

Cas similaires dans la base: ${JSON.stringify(similarCases)}
Données de prix: ${JSON.stringify(priceData)}

Fournis un diagnostic complet au format JSON avec:
{
  "diagnosis": "diagnostic principal",
  "probability": 0.85,
  "possibleCauses": ["cause1", "cause2"],
  "recommendedActions": ["action1", "action2"],
  "estimatedPrice": {"min": 50, "max": 150},
  "urgencyLevel": "medium",
  "repairComplexity": "facile|moyen|difficile",
  "repairTime": "durée estimée en heures",
  "preventionTips": ["conseil1", "conseil2"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Diagnostique ce problème: ${diagnosticRequest.description}` }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    const aiResult = await response.json();
    let diagnosticResponse: DiagnosticResponse;

    try {
      diagnosticResponse = JSON.parse(aiResult.choices[0].message.content);
    } catch {
      // Fallback si le JSON n'est pas valide
      diagnosticResponse = {
        diagnosis: "Problème nécessitant un diagnostic approfondi",
        probability: 0.5,
        possibleCauses: ["Défaillance matérielle", "Problème logiciel"],
        recommendedActions: ["Consultation chez un réparateur qualifié"],
        estimatedPrice: { min: 50, max: 200 },
        urgencyLevel: 'medium'
      };
    }

    // Rechercher des réparateurs à proximité si une localisation est fournie
    if (diagnosticRequest.userLocation) {
      const { data: nearbyRepairers } = await supabase
        .from('repairers')
        .select('*')
        .ilike('city', `%${diagnosticRequest.userLocation}%`)
        .eq('is_verified', true)
        .limit(5);

      diagnosticResponse.suggestedRepairers = nearbyRepairers;
    }

    // Enregistrer le diagnostic pour l'apprentissage
    await supabase
      .from('chatbot_analytics')
      .insert({
        date: new Date().toISOString().split('T')[0],
        metric_type: 'diagnostic_performed',
        metric_value: 1,
        metadata: {
          device: `${diagnosticRequest.brand} ${diagnosticRequest.model}`,
          diagnosis: diagnosticResponse.diagnosis,
          probability: diagnosticResponse.probability
        }
      });

    return new Response(JSON.stringify(diagnosticResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Diagnostic error:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors du diagnostic',
      fallback: {
        diagnosis: "Diagnostic temporairement indisponible",
        probability: 0.5,
        possibleCauses: ["Problème technique du système de diagnostic"],
        recommendedActions: ["Veuillez contacter directement un réparateur"],
        estimatedPrice: { min: 30, max: 300 },
        urgencyLevel: 'medium'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
