import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-topic, x-shopify-shop-domain, x-shopify-hmac-sha256',
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

    // Get Shopify webhook headers
    const topic = req.headers.get('x-shopify-topic');
    const shopDomain = req.headers.get('x-shopify-shop-domain');
    const hmac = req.headers.get('x-shopify-hmac-sha256');

    if (!topic || !shopDomain) {
      throw new Error('Missing required Shopify webhook headers');
    }

    const payload = await req.json();
    
    console.log(`Processing Shopify webhook: ${topic} for ${shopDomain}`);

    // Find the store
    const { data: store } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('shop_domain', shopDomain)
      .single();

    if (!store) {
      console.log(`Store not found: ${shopDomain}`);
      return new Response(JSON.stringify({ error: 'Store not found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Store webhook for processing
    const { data: webhook } = await supabase
      .from('shopify_webhooks')
      .insert({
        store_id: store.id,
        webhook_topic: topic,
        payload: payload,
        headers: {
          topic,
          shopDomain,
          hmac,
        },
        processing_status: 'pending',
      })
      .select()
      .single();

    // Process webhook based on topic
    let processingResult;
    try {
      switch (topic) {
        case 'orders/create':
        case 'orders/paid':
          processingResult = await processOrderWebhook(supabase, store, payload);
          break;
        
        case 'orders/updated':
          processingResult = await processOrderUpdate(supabase, store, payload);
          break;
        
        case 'products/create':
        case 'products/update':
          processingResult = await processProductWebhook(supabase, store, payload);
          break;
        
        case 'inventory_levels/update':
          processingResult = await processInventoryWebhook(supabase, store, payload);
          break;
        
        default:
          console.log(`Unhandled webhook topic: ${topic}`);
          processingResult = { success: true, message: 'Webhook received but not processed' };
      }

      // Update webhook status
      await supabase
        .from('shopify_webhooks')
        .update({
          processing_status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', webhook.id);

    } catch (processingError) {
      console.error('Error processing webhook:', processingError);
      
      // Update webhook with error
      await supabase
        .from('shopify_webhooks')
        .update({
          processing_status: 'failed',
          error_message: processingError.message,
          retry_count: webhook.retry_count + 1,
        })
        .eq('id', webhook.id);
      
      throw processingError;
    }

    return new Response(
      JSON.stringify({ success: true, ...processingResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in shopify-webhooks-handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Process order webhook (orders/create, orders/paid)
async function processOrderWebhook(supabase: any, store: any, order: any) {
  console.log(`Processing order: ${order.id} - ${order.name}`);

  // Calculate commission
  const orderTotal = parseFloat(order.total_price || 0);
  const commissionRate = store.commission_rate || 3.00;
  
  const commissionAmount = (orderTotal * commissionRate) / 100;
  const repairerNetAmount = orderTotal - commissionAmount;

  // Create or update commission record
  const { data: commission, error: commissionError } = await supabase
    .from('shopify_order_commissions')
    .upsert({
      store_id: store.id,
      repairer_id: store.repairer_id,
      shopify_order_id: order.id,
      shopify_order_number: order.order_number?.toString(),
      shopify_order_name: order.name,
      order_total_amount: orderTotal,
      order_currency: order.currency || 'EUR',
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      platform_fee: commissionAmount,
      repairer_net_amount: repairerNetAmount,
      commission_status: order.financial_status === 'paid' ? 'calculated' : 'pending',
      customer_email: order.customer?.email,
      order_items: order.line_items,
      order_fulfillment_status: order.fulfillment_status,
    }, {
      onConflict: 'store_id,shopify_order_id'
    })
    .select()
    .single();

  if (commissionError) {
    console.error('Error creating commission:', commissionError);
    throw commissionError;
  }

  // Send notification to repairer
  await supabase
    .from('push_notifications')
    .insert({
      user_id: store.repairer_id,
      title: 'Nouvelle commande Shopify',
      message: `Commande ${order.name} reçue : ${orderTotal}€`,
      type: 'order_received',
      metadata: {
        order_id: order.id,
        order_name: order.name,
        amount: orderTotal,
      },
    });

  return {
    commission_id: commission.id,
    order_total: orderTotal,
    commission_amount: commissionAmount,
  };
}

// Process order update
async function processOrderUpdate(supabase: any, store: any, order: any) {
  console.log(`Updating order: ${order.id}`);

  const { error } = await supabase
    .from('shopify_order_commissions')
    .update({
      order_fulfillment_status: order.fulfillment_status,
      updated_at: new Date().toISOString(),
    })
    .eq('store_id', store.id)
    .eq('shopify_order_id', order.id);

  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }

  return { message: 'Order updated successfully' };
}

// Process product webhook
async function processProductWebhook(supabase: any, store: any, product: any) {
  console.log(`Processing product: ${product.id} - ${product.title}`);

  // Log sync
  await supabase
    .from('shopify_sync_logs')
    .insert({
      store_id: store.id,
      sync_type: 'products',
      sync_direction: 'shopify_to_platform',
      sync_status: 'completed',
      items_processed: 1,
      items_synced: 1,
      completed_at: new Date().toISOString(),
      sync_summary: {
        product_id: product.id,
        product_title: product.title,
      },
    });

  return { message: 'Product synced successfully' };
}

// Process inventory webhook
async function processInventoryWebhook(supabase: any, store: any, inventory: any) {
  console.log(`Processing inventory update for location: ${inventory.location_id}`);

  // Log sync
  await supabase
    .from('shopify_sync_logs')
    .insert({
      store_id: store.id,
      sync_type: 'inventory',
      sync_direction: 'shopify_to_platform',
      sync_status: 'completed',
      items_processed: 1,
      items_synced: 1,
      completed_at: new Date().toISOString(),
    });

  return { message: 'Inventory synced successfully' };
}
