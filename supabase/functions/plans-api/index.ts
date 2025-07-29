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

    // Create mock plans focused on directory and local SEO
    const mockPlans = [
      {
        id: '2', 
        name: 'Visibilité',
        price_monthly: 19.90,
        price_yearly: 199,
        features: [
          'Présence dans l\'annuaire TopRéparateurs',
          'Profil de base avec coordonnées',
          'Affichage des spécialités',
          'Réception de demandes clients',
          'Référencement local optimisé',
          'Profil enrichi avec photos',
          'Avis clients et notation',
          'Gestion des horaires d\'ouverture',
          'Contact direct par téléphone/email'
        ],
        promo: false
      },
      {
        id: '3',
        name: 'Pro', 
        price_monthly: 39.90,
        price_yearly: 399,
        features: [
          'Tout du plan Visibilité',
          'Page dédiée avec URL personnalisée',
          'Galerie photos avant/après',
          'Gestion des devis en ligne',
          'Calendrier de prise de rendez-vous',
          'Analytics détaillées'
        ],
        promo: true
      },
      {
        id: '4',
        name: 'Premium',
        price_monthly: 99.90, 
        price_yearly: 999,
        features: [
          'Tout du plan Pro',
          'Boutique en ligne intégrée',
          'POS certifié NF525',
          'Gestion QualiRépar automatisée',
          'Campagnes publicitaires locales',
          'Support prioritaire 7j/7'
        ],
        promo: false
      }
    ];

    const plans = mockPlans;
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
      recommended: plan.name === 'Pro' // Mark Pro as recommended
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