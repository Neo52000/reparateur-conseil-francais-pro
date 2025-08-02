import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { insightId, action } = await req.json();
    
    console.log('Executing AI insight action:', { insightId, action });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Execute the insight action based on type
    let result;
    
    switch (action.type) {
      case 'optimize_campaign':
        result = await optimizeCampaign(action.campaignId, action.optimizations);
        break;
        
      case 'adjust_pricing':
        result = await adjustPricing(action.productIds, action.adjustments);
        break;
        
      case 'update_inventory':
        result = await updateInventory(action.items);
        break;
        
      case 'send_notification':
        result = await sendNotification(user.id, action.notification);
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    // Log the execution for audit trail
    const { error: logError } = await supabase
      .from('ai_enhancements')
      .insert({
        repairer_id: user.id,
        enhancement_type: 'insight_execution',
        ai_model: 'mistral',
        input_data: { insightId, action },
        output_data: result,
        success: true,
        confidence_score: 0.9
      });

    if (logError) {
      console.error('Failed to log AI execution:', logError);
    }

    console.log('AI insight executed successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('AI insight execution error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

async function optimizeCampaign(campaignId: string, optimizations: any) {
  console.log('Optimizing campaign:', campaignId, optimizations);
  
  // Simulate campaign optimization
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    campaignId,
    optimizations: optimizations,
    estimatedImprovement: '15% increase in CTR',
    status: 'applied'
  };
}

async function adjustPricing(productIds: string[], adjustments: any) {
  console.log('Adjusting pricing for products:', productIds, adjustments);
  
  // Simulate pricing adjustments
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    adjustedProducts: productIds.length,
    averageAdjustment: '+5%',
    status: 'applied'
  };
}

async function updateInventory(items: any[]) {
  console.log('Updating inventory for items:', items);
  
  // Simulate inventory updates
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    updatedItems: items.length,
    status: 'applied'
  };
}

async function sendNotification(userId: string, notification: any) {
  console.log('Sending notification to user:', userId, notification);
  
  // Simulate notification sending
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return {
    userId,
    notificationType: notification.type,
    status: 'sent'
  };
}