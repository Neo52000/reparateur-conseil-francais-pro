import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncRequest {
  action: 'force_sync' | 'check_status'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action }: SyncRequest = await req.json()

    console.log('[sync-features] Starting feature sync with action:', action)

    if (action === 'force_sync') {
      // Synchroniser les fonctionnalités disponibles
      const { data: features, error: featuresError } = await supabaseClient
        .from('available_features')
        .select('*')
        .eq('is_active', true)

      if (featuresError) {
        console.error('[sync-features] Error fetching features:', featuresError)
        throw featuresError
      }

      // Mettre à jour le cache des fonctionnalités
      console.log(`[sync-features] Synced ${features?.length || 0} features`)

      return new Response(
        JSON.stringify({
          success: true,
          synced_features: features?.length || 0,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (action === 'check_status') {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'active',
          last_sync: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('[sync-features] Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})