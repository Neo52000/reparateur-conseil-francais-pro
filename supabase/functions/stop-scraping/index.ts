
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('🛑 Demande d\'arrêt du scraping reçue')

    // Récupérer les logs de scraping en cours
    const { data: runningLogs, error: fetchError } = await supabase
      .from('scraping_logs')
      .select('*')
      .eq('status', 'running')
      .order('started_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des logs:', fetchError)
      throw fetchError
    }

    if (!runningLogs || runningLogs.length === 0) {
      console.log('ℹ️ Aucun scraping en cours trouvé')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Aucun scraping en cours à arrêter',
          stopped_count: 0
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log(`🔄 ${runningLogs.length} scraping(s) en cours trouvé(s)`)

    // Marquer tous les scraping en cours comme arrêtés
    const { data: updatedLogs, error: updateError } = await supabase
      .from('scraping_logs')
      .update({
        status: 'failed',
        error_message: 'Arrêt manuel demandé par l\'utilisateur',
        completed_at: new Date().toISOString()
      })
      .eq('status', 'running')
      .select()

    if (updateError) {
      console.error('❌ Erreur lors de l\'arrêt des scraping:', updateError)
      throw updateError
    }

    console.log(`✅ ${updatedLogs?.length || 0} scraping(s) arrêté(s) avec succès`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${updatedLogs?.length || 0} scraping(s) arrêté(s) avec succès`,
        stopped_count: updatedLogs?.length || 0,
        stopped_logs: updatedLogs
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('💥 Erreur dans stop-scraping:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Impossible d\'arrêter le scraping'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})
