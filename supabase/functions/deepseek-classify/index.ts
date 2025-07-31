
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIService } from '../_shared/ai-service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repairersData, prompt } = await req.json();
    
    // Initialiser le service IA avec les clés disponibles
    const aiService = new AIService({
      deepseekApiKey: Deno.env.get('DEEPSEEK_API_KEY'),
      openaiApiKey: Deno.env.get('OPENAI_API_KEY'),
      mistralApiKey: Deno.env.get('CLE_API_MISTRAL')
    });

    console.log(`🤖 [DeepSeek-Classify] Classification de ${repairersData.length} réparateurs`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Traiter chaque réparateur individuellement avec fallback
    for (const repairer of repairersData) {
      try {
        const classificationResult = await aiService.classifyRepairer(repairer);
        
        if (classificationResult.success) {
          results.push({
            ...repairer,
            classification: classificationResult.data,
            confidence: classificationResult.confidence,
            model_used: classificationResult.model_used
          });
          successCount++;
        } else {
          // Même en cas d'échec partiel, on garde le réparateur avec classification basique
          results.push({
            ...repairer,
            classification: classificationResult.data,
            confidence: classificationResult.confidence,
            model_used: classificationResult.model_used,
            fallback_used: true,
            error: classificationResult.error
          });
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ [DeepSeek-Classify] Erreur pour ${repairer.name}:`, error);
        
        // Classification d'urgence basique
        results.push({
          ...repairer,
          classification: {
            is_repairer: true,
            confidence: 0.1,
            specialties: [],
            services: ['Réparation mobile'],
            reasoning: 'Classification d\'urgence - toutes les APIs ont échoué'
          },
          confidence: 0.1,
          model_used: 'emergency_fallback',
          error: error.message
        });
        errorCount++;
      }
    }

    // Logs de fallback
    const fallbackLogs = aiService.getFallbackLogs();
    if (fallbackLogs.length > 0) {
      console.warn('🔄 [DeepSeek-Classify] Fallbacks utilisés:', fallbackLogs);
    }

    console.log(`✅ [DeepSeek-Classify] Terminé: ${successCount} succès, ${errorCount} avec fallback/erreur`);

    return new Response(JSON.stringify({ 
      classifiedData: results,
      stats: {
        total: repairersData.length,
        success: successCount,
        with_fallback: errorCount,
        fallback_logs: fallbackLogs
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [DeepSeek-Classify] Erreur critique:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      classifiedData: [],
      critical_failure: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
