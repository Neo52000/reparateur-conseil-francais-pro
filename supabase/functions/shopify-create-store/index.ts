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

    const { storeName, storeEmail } = await req.json();

    console.log(`Creating Shopify sandbox store for repairer: ${user.id}`);

    // Check if repairer already has a store
    const { data: existingStore } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('repairer_id', user.id)
      .single();

    if (existingStore) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          store: existingStore,
          message: 'Store already exists'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique shop domain
    const shopDomain = `${user.id.substring(0, 8)}-repair-${Date.now()}.myshopify.com`;

    // In production, this would call Shopify Partner API to create a dev store
    // For now, we create a sandbox entry
    const { data: newStore, error: storeError } = await supabase
      .from('shopify_stores')
      .insert({
        repairer_id: user.id,
        shop_domain: shopDomain,
        store_name: storeName || `Boutique ${user.email}`,
        store_email: storeEmail || user.email,
        store_status: 'sandbox',
        is_development_store: true,
        setup_completed: false,
        onboarding_step: 0,
        commission_rate: 3.00, // 3% platform commission
      })
      .select()
      .single();

    if (storeError) {
      console.error('Error creating store:', storeError);
      throw storeError;
    }

    console.log(`Shopify store created: ${shopDomain}`);

    // Create initial sync log
    await supabase
      .from('shopify_sync_logs')
      .insert({
        store_id: newStore.id,
        sync_type: 'full',
        sync_direction: 'platform_to_shopify',
        sync_status: 'completed',
        items_processed: 0,
        items_synced: 0,
        completed_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        store: newStore,
        message: 'Sandbox store created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in shopify-create-store:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
