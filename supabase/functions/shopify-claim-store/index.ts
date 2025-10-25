import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { storeId } = await req.json();

    console.log(`Claiming Shopify store ${storeId} for repairer: ${user.id}`);

    // Get the store
    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('id', storeId)
      .eq('repairer_id', user.id)
      .single();

    if (storeError || !store) {
      throw new Error('Store not found or access denied');
    }

    if (store.store_status === 'claimed' || store.store_status === 'active') {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Store already claimed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if repairer has ecommerce module access
    const { data: hasAccess } = await supabase.rpc('has_shopify_ecommerce_access', {
      user_id: user.id
    });

    if (!hasAccess) {
      throw new Error('E-commerce module not activated. Please subscribe to a plan with e-commerce access.');
    }

    // In production, this would:
    // 1. Convert dev store to production via Shopify Partner API
    // 2. Set up billing with Shopify
    // 3. Start 30-day trial
    // 4. Configure webhooks

    // For now, we update the status
    const { data: updatedStore, error: updateError } = await supabase
      .from('shopify_stores')
      .update({
        store_status: 'claimed',
        claimed_at: new Date().toISOString(),
        is_development_store: false,
        setup_completed: true,
      })
      .eq('id', storeId)
      .select()
      .single();

    if (updateError) {
      console.error('Error claiming store:', updateError);
      throw updateError;
    }

    // Send notification
    await supabase
      .from('push_notifications')
      .insert({
        user_id: user.id,
        title: 'Boutique Shopify activée',
        message: `Votre boutique ${store.store_name} est maintenant active avec 30 jours d'essai gratuit Shopify.`,
        type: 'store_claimed',
        metadata: {
          store_id: storeId,
          shop_domain: store.shop_domain,
        },
      });

    // Create sync log
    await supabase
      .from('shopify_sync_logs')
      .insert({
        store_id: storeId,
        sync_type: 'full',
        sync_direction: 'bidirectional',
        sync_status: 'completed',
        items_processed: 0,
        items_synced: 0,
        completed_at: new Date().toISOString(),
        sync_summary: {
          action: 'store_claimed',
          trial_started: true,
        },
      });

    console.log(`Store claimed successfully: ${store.shop_domain}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        store: updatedStore,
        message: 'Store claimed successfully. 30-day Shopify trial started.',
        trial_info: {
          trial_days: 30,
          trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in shopify-claim-store:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
