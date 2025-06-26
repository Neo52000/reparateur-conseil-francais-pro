
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting demo repairer creation...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Générer un ID personnalisé pour le réparateur démo
    const generateCustomId = (businessName: string, postalCode: string) => {
      const shopName = businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
      return `${shopName}-${postalCode}`;
    };

    const businessName = "TechRepair Demo";
    const postalCode = "75001";
    const customRepairerId = generateCustomId(businessName, postalCode);

    // 1. Créer l'utilisateur démo
    console.log('👤 Creating demo user...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'demo@demo.fr',
      password: 'demo@demo',
      email_confirm: true,
      user_metadata: {
        role: 'repairer',
        first_name: 'Demo',
        last_name: 'Repairer'
      }
    });

    if (userError) {
      console.error('❌ User creation error:', userError);
      throw userError;
    }

    console.log('✅ User created with ID:', userData.user.id);

    // 2. Créer le profil réparateur avec l'ID personnalisé
    console.log('📝 Creating repairer profile...');
    const { error: profileError } = await supabase
      .from('repairer_profiles')
      .insert({
        user_id: userData.user.id,
        business_name: businessName,
        siret_number: '12345678901234',
        description: 'Réparateur de démonstration avec toutes les fonctionnalités Enterprise activées',
        address: '123 Rue de la Paix',
        city: 'Paris',
        postal_code: postalCode,
        phone: '+33123456789',
        email: 'demo@demo.fr',
        website: 'https://demo-repair.fr',
        facebook_url: 'https://facebook.com/demorepair',
        instagram_url: 'https://instagram.com/demorepair',
        linkedin_url: 'https://linkedin.com/company/demorepair',
        has_qualirepar_label: true,
        repair_types: ['telephone', 'montre', 'console', 'ordinateur'],
        services_offered: ['Réparation express', 'Diagnostic gratuit', 'Service à domicile'],
        certifications: ['Qualirepar', 'ISO 9001'],
        years_experience: 10,
        emergency_service: true,
        home_service: true,
        pickup_service: true,
        languages_spoken: ['Français', 'Anglais'],
        payment_methods: ['Carte bancaire', 'Espèces', 'Chèque'],
        opening_hours: {
          monday: '09:00-18:00',
          tuesday: '09:00-18:00',
          wednesday: '09:00-18:00',
          thursday: '09:00-18:00',
          friday: '09:00-18:00',
          saturday: '10:00-16:00',
          sunday: 'Fermé'
        },
        response_time: '< 2h',
        warranty_duration: '6 mois'
      });

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      throw profileError;
    }

    console.log('✅ Repairer profile created');

    // 3. Récupérer le plan Enterprise
    console.log('🏢 Getting Enterprise plan...');
    const { data: enterprisePlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', 'Enterprise')
      .single();

    if (planError) {
      console.error('❌ Plan fetch error:', planError);
      throw planError;
    }

    // 4. Créer l'abonnement Enterprise
    console.log('💎 Creating Enterprise subscription...');
    const { error: subscriptionError } = await supabase
      .from('repairer_subscriptions')
      .insert({
        repairer_id: customRepairerId, // Utiliser l'ID personnalisé
        email: 'demo@demo.fr',
        user_id: userData.user.id,
        subscription_tier: 'enterprise',
        billing_cycle: 'yearly',
        subscribed: true,
        subscription_plan_id: enterprisePlan.id,
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an
      });

    if (subscriptionError) {
      console.error('❌ Subscription creation error:', subscriptionError);
      throw subscriptionError;
    }

    console.log('✅ Enterprise subscription created');

    // 5. Activer toutes les fonctionnalités Enterprise
    console.log('🔧 Activating all Enterprise features...');
    const enterpriseFeatures = [
      'advanced_analytics',
      'priority_support',
      'custom_branding',
      'api_access',
      'white_label',
      'bulk_operations',
      'advanced_search',
      'custom_integrations'
    ];

    for (const feature of enterpriseFeatures) {
      await supabase
        .from('feature_flags_by_plan')
        .upsert({
          plan_name: 'enterprise',
          feature_key: feature,
          enabled: true
        });
    }

    console.log('✅ Enterprise features activated');

    // 6. Créer l'entrée dans la table repairers publique avec l'ID personnalisé
    console.log('🗺️ Creating public repairer entry...');
    const { error: repairerError } = await supabase
      .from('repairers')
      .insert({
        name: businessName,
        business_name: businessName,
        address: '123 Rue de la Paix',
        city: 'Paris',
        postal_code: postalCode,
        department: '75',
        region: 'Île-de-France',
        phone: '+33123456789',
        website: 'https://demo-repair.fr',
        email: 'demo@demo.fr',
        lat: 48.8566,
        lng: 2.3522,
        rating: 4.8,
        review_count: 127,
        services: ['Réparation express', 'Diagnostic gratuit', 'Service à domicile'],
        specialties: ['iPhone', 'Samsung', 'iPad', 'MacBook'],
        price_range: 'medium',
        response_time: '< 2h',
        opening_hours: {
          monday: '09:00-18:00',
          tuesday: '09:00-18:00',
          wednesday: '09:00-18:00',
          thursday: '09:00-18:00',
          friday: '09:00-18:00',
          saturday: '10:00-16:00',
          sunday: 'Fermé'
        },
        is_verified: true,
        is_open: true,
        has_qualirepar_label: true,
        source: 'manual'
      });

    if (repairerError) {
      console.error('❌ Public repairer creation error:', repairerError);
      throw repairerError;
    }

    console.log('✅ Public repairer entry created');

    console.log('🎉 Demo repairer creation completed successfully!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Réparateur démo créé avec succès',
        customId: customRepairerId,
        credentials: {
          email: 'demo@demo.fr',
          password: 'demo@demo'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error creating demo repairer:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors de la création du réparateur démo' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
