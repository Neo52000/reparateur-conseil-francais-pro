import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RepairerRecord {
  id: string;
  name: string;
  address: string;
  description?: string;
  phone?: string;
  email?: string;
  lat?: number;
  lng?: number;
  unique_id?: string;
  enhancement_status: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { enhancement_type } = await req.json();
    console.log(`🚀 Démarrage amélioration: ${enhancement_type}`);

    // Récupérer les réparateurs qui ont besoin d'amélioration
    const { data: repairers, error: fetchError } = await supabase
      .from('repairers')
      .select('*')
      .or('enhancement_status.eq.pending,enhancement_status.is.null')
      .limit(50); // Traiter par batch pour éviter les timeouts

    if (fetchError) {
      throw new Error(`Erreur fetch: ${fetchError.message}`);
    }

    if (!repairers || repairers.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'Aucun réparateur à améliorer',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📊 ${repairers.length} réparateurs à traiter`);

    let processedCount = 0;
    let results = [];

    for (const repairer of repairers) {
      try {
        // Marquer comme en cours de traitement
        await supabase
          .from('repairers')
          .update({ enhancement_status: 'processing' })
          .eq('id', repairer.id);

        const enhancementResult = await processRepairer(repairer, enhancement_type);
        
        if (enhancementResult.success) {
          processedCount++;
          results.push(enhancementResult);
          
          // Marquer comme complété
          await supabase
            .from('repairers')
            .update({ 
              enhancement_status: 'completed',
              enhanced_at: new Date().toISOString()
            })
            .eq('id', repairer.id);
        } else {
          // Marquer comme échoué
          await supabase
            .from('repairers')
            .update({ enhancement_status: 'failed' })
            .eq('id', repairer.id);
        }

      } catch (error) {
        console.error(`❌ Erreur traitement réparateur ${repairer.id}:`, error);
        await supabase
          .from('repairers')
          .update({ enhancement_status: 'failed' })
          .eq('id', repairer.id);
      }
    }

    console.log(`✅ Traitement terminé: ${processedCount} réparateurs améliorés`);

    return new Response(JSON.stringify({
      message: `Amélioration terminée: ${processedCount}/${repairers.length} réparateurs traités`,
      processed: processedCount,
      total: repairers.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Erreur fonction auto-enhance:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erreur lors de l\'amélioration automatique'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processRepairer(repairer: RepairerRecord, enhancementType: string) {
  const startTime = Date.now();
  const result = {
    repairer_id: repairer.id,
    success: true,
    enhancements: [] as string[],
    errors: [] as string[]
  };

  try {
    // 1. Générer ID unique si manquant
    if (!repairer.unique_id && (enhancementType === 'all' || enhancementType === 'unique_ids')) {
      const uniqueId = await generateUniqueId();
      await supabase
        .from('repairers')
        .update({ unique_id: uniqueId })
        .eq('id', repairer.id);
      result.enhancements.push('unique_id_generated');
    }

    // 2. Classification DeepSeek
    if (deepseekApiKey && (enhancementType === 'all' || enhancementType === 'deepseek')) {
      try {
        const classification = await classifyWithDeepSeek(repairer);
        if (classification.success) {
          await supabase
            .from('repairers')
            .update({
              deepseek_classification: classification.data,
              deepseek_confidence: classification.confidence
            })
            .eq('id', repairer.id);

          // Enregistrer l'historique
          await supabase.from('ai_enhancements').insert({
            repairer_id: repairer.id,
            enhancement_type: 'deepseek_classification',
            ai_model: 'deepseek-chat',
            input_data: { name: repairer.name, address: repairer.address, description: repairer.description },
            output_data: classification.data,
            confidence_score: classification.confidence,
            processing_time_ms: Date.now() - startTime,
            success: true
          });

          result.enhancements.push('deepseek_classification');
        }
      } catch (error) {
        console.error('Erreur DeepSeek:', error);
        result.errors.push(`deepseek: ${error.message}`);
      }
    }

    // 3. Amélioration Mistral
    if (mistralApiKey && (enhancementType === 'all' || enhancementType === 'mistral')) {
      try {
        const enhancement = await enhanceWithMistral(repairer);
        if (enhancement.success) {
          await supabase
            .from('repairers')
            .update({
              description: enhancement.enhanced_description || repairer.description,
              mistral_enhanced: true,
              mistral_enhancement_data: enhancement.data
            })
            .eq('id', repairer.id);

          // Enregistrer l'historique
          await supabase.from('ai_enhancements').insert({
            repairer_id: repairer.id,
            enhancement_type: 'mistral_enhancement',
            ai_model: 'mistral-large',
            input_data: { description: repairer.description },
            output_data: enhancement.data,
            processing_time_ms: Date.now() - startTime,
            success: true
          });

          result.enhancements.push('mistral_enhancement');
        }
      } catch (error) {
        console.error('Erreur Mistral:', error);
        result.errors.push(`mistral: ${error.message}`);
      }
    }

    // 4. Géocodage Nominatim
    if (!repairer.lat || !repairer.lng) {
      if (enhancementType === 'all' || enhancementType === 'geocoding') {
        try {
          const geocoding = await geocodeWithNominatim(repairer.address);
          if (geocoding.success) {
            await supabase
              .from('repairers')
              .update({
                lat: geocoding.lat,
                lng: geocoding.lng,
                geocoding_accuracy: geocoding.accuracy,
                geocoding_source: 'nominatim'
              })
              .eq('id', repairer.id);

            // Enregistrer l'historique de géocodage
            await supabase.from('geocoding_history').insert({
              repairer_id: repairer.id,
              original_address: repairer.address,
              normalized_address: geocoding.normalized_address,
              latitude: geocoding.lat,
              longitude: geocoding.lng,
              accuracy: geocoding.accuracy,
              geocoding_service: 'nominatim',
              response_data: geocoding.raw_data,
              success: true
            });

            result.enhancements.push('geocoding');
          }
        } catch (error) {
          console.error('Erreur géocodage:', error);
          result.errors.push(`geocoding: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error(`Erreur traitement ${repairer.id}:`, error);
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

async function generateUniqueId(): Promise<string> {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `REP_${random}_${timestamp}`;
}

async function classifyWithDeepSeek(repairer: RepairerRecord) {
  const prompt = `Analyse ce commerce pour déterminer s'il s'agit d'un réparateur de téléphones/smartphones:

Nom: ${repairer.name}
Adresse: ${repairer.address}
Description: ${repairer.description || 'Non renseignée'}

Réponds en JSON avec:
{
  "is_repairer": boolean,
  "confidence": number (0-1),
  "specialties": string[],
  "services": string[],
  "reasoning": string
}`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${deepseekApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Tu es un expert en classification de commerces. Réponds uniquement en JSON valide.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 500
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    return {
      success: true,
      data: parsed,
      confidence: parsed.confidence || 0
    };
  } catch (error) {
    throw new Error('Erreur parsing réponse DeepSeek');
  }
}

async function enhanceWithMistral(repairer: RepairerRecord) {
  const prompt = `Améliore la description de ce réparateur de téléphones en français:

Nom: ${repairer.name}
Description actuelle: ${repairer.description || 'Aucune description'}

Crée une description professionnelle, attrayante et SEO-optimisée d'environ 100-150 mots.
Mentionne les services de réparation de smartphones, tablettes, etc.

Réponds en JSON:
{
  "enhanced_description": string,
  "keywords": string[],
  "services_suggested": string[]
}`;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mistralApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: 'Tu es un expert en rédaction commerciale pour les réparateurs de téléphones. Réponds uniquement en JSON valide.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 400
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    return {
      success: true,
      data: parsed,
      enhanced_description: parsed.enhanced_description
    };
  } catch (error) {
    throw new Error('Erreur parsing réponse Mistral');
  }
}

async function geocodeWithNominatim(address: string) {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting

  const encodedAddress = encodeURIComponent(`${address}, France`);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'RepairHub-AutoEnhancer/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data || data.length === 0) {
    throw new Error('Aucun résultat géocodage');
  }

  const result = data[0];
  
  return {
    success: true,
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    accuracy: result.importance > 0.5 ? 'high' : 'medium',
    normalized_address: result.display_name,
    raw_data: result
  };
}