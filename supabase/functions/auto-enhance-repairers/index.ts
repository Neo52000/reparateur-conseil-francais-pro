import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { AIService } from '../_shared/ai-service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    errors: [] as string[],
    fallback_logs: [] as string[]
  };

  // Initialiser le service IA avec toutes les clés disponibles
  const aiService = new AIService({
    deepseekApiKey: Deno.env.get('DEEPSEEK_API_KEY'),
    mistralApiKey: Deno.env.get('MISTRAL_API_KEY'),
    openaiApiKey: Deno.env.get('OPENAI_API_KEY')
  });

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

    // 2. Classification IA avec fallback intelligent
    if (enhancementType === 'all' || enhancementType === 'deepseek' || enhancementType === 'classification') {
      try {
        console.log(`🔄 [Auto-Enhance] Classification IA pour ${repairer.name}...`);
        const classification = await aiService.classifyRepairer(repairer);
        
        await supabase
          .from('repairers')
          .update({
            deepseek_classification: classification.data,
            deepseek_confidence: classification.confidence
          })
          .eq('id', repairer.id);

        // Enregistrer l'historique avec le modèle utilisé
        await supabase.from('ai_enhancements').insert({
          repairer_id: repairer.id,
          enhancement_type: 'ai_classification',
          ai_model: classification.model_used,
          input_data: { name: repairer.name, address: repairer.address, description: repairer.description },
          output_data: classification.data,
          confidence_score: classification.confidence,
          processing_time_ms: Date.now() - startTime,
          success: classification.success,
          error_message: classification.error || null
        });

        result.enhancements.push(`ai_classification_${classification.model_used}`);
        
        if (classification.error) {
          result.errors.push(`classification: ${classification.error}`);
        }
        
      } catch (error) {
        console.error('❌ [Auto-Enhance] Erreur classification:', error);
        result.errors.push(`classification: ${error.message}`);
      }
    }

    // 3. Amélioration description avec fallback intelligent
    if (enhancementType === 'all' || enhancementType === 'mistral' || enhancementType === 'enhancement') {
      try {
        console.log(`🔄 [Auto-Enhance] Amélioration description pour ${repairer.name}...`);
        const enhancement = await aiService.enhanceDescription(repairer);
        
        await supabase
          .from('repairers')
          .update({
            description: enhancement.enhanced_description || repairer.description,
            mistral_enhanced: true,
            mistral_enhancement_data: enhancement.data
          })
          .eq('id', repairer.id);

        // Enregistrer l'historique avec le modèle utilisé
        await supabase.from('ai_enhancements').insert({
          repairer_id: repairer.id,
          enhancement_type: 'description_enhancement',
          ai_model: enhancement.model_used,
          input_data: { description: repairer.description },
          output_data: enhancement.data,
          processing_time_ms: Date.now() - startTime,
          success: enhancement.success,
          error_message: enhancement.error || null
        });

        result.enhancements.push(`description_enhancement_${enhancement.model_used}`);
        
        if (enhancement.error) {
          result.errors.push(`enhancement: ${enhancement.error}`);
        }
        
      } catch (error) {
        console.error('❌ [Auto-Enhance] Erreur amélioration:', error);
        result.errors.push(`enhancement: ${error.message}`);
      }
    }

    // Collecter les logs de fallback
    const fallbackLogs = aiService.getFallbackLogs();
    if (fallbackLogs.length > 0) {
      result.fallback_logs = fallbackLogs;
      console.log(`🔄 [Auto-Enhance] Fallbacks utilisés pour ${repairer.name}:`, fallbackLogs);
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

// Les fonctions classifyWithDeepSeek et enhanceWithMistral sont maintenant remplacées 
// par le service AIService qui gère automatiquement les fallbacks

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