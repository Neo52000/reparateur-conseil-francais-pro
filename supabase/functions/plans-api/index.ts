import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  promo?: boolean;
  badge?: string;
  recommended?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch plans from database
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly');

    if (planError) {
      console.error('Error fetching plans:', planError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch plans' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch features for each plan
    const plans = [];
    for (const plan of planData || []) {
      const { data: featuresData, error: featuresError } = await supabase
        .from('plan_features')
        .select(`
          feature_key,
          enabled,
          available_features!inner(feature_name, description)
        `)
        .eq('plan_name', plan.name)
        .eq('enabled', true);

      if (featuresError) {
        console.error('Error fetching features for plan:', plan.name, featuresError);
        continue;
      }

      const features = featuresData?.map(f => f.available_features.feature_name) || [];
      
      plans.push({
        id: plan.id,
        name: plan.name,
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        features: features,
        promo: plan.has_promo || false,
        recommended: plan.is_recommended || false
      });
    }

    const error = null;

    if (error) {
      console.error('Error fetching plans:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch plans' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Format plans for frontend
    const formattedPlans: Plan[] = (plans || []).map(plan => ({
      id: plan.id,
      name: plan.name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      features: plan.features || [],
      promo: plan.promo || false,
      badge: plan.promo ? 'Promo en cours' : undefined,
      recommended: plan.recommended || false
    }));

    console.log(`Successfully fetched ${formattedPlans.length} plans`);

    return new Response(
      JSON.stringify({ 
        success: true,
        plans: formattedPlans,
        count: formattedPlans.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});