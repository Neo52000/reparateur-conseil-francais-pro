
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("🚀 Starting demo repairer creation...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("❌ Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const demoEmail = "demo@demo.fr";
    const demoPassword = "demo@demo";

    // 1. Créer l'utilisateur
    console.log("👤 Creating demo user...");
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        first_name: "Demo",
        last_name: "Réparateur",
        role: "repairer"
      }
    });
    
    if (userError) {
      console.error("❌ Error creating user:", userError);
      return new Response(
        JSON.stringify({ error: "Error creating user: " + userError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user?.id;
    console.log("✅ User created with ID:", userId);

    // 2. Créer le profil réparateur
    console.log("📝 Creating repairer profile...");
    const { error: profileError } = await supabaseAdmin
      .from('repairer_profiles')
      .insert({
        user_id: userId,
        business_name: "TechFix Demo",
        siret_number: "12345678901234",
        description: "Réparateur de démonstration avec tous les services disponibles. Spécialisé dans la réparation de smartphones, tablettes et ordinateurs portables.",
        address: "123 Rue de la Réparation",
        city: "Paris",
        postal_code: "75001",
        phone: "01 23 45 67 89",
        email: demoEmail,
        website: "https://techfix-demo.fr",
        facebook_url: "https://facebook.com/techfixdemo",
        instagram_url: "https://instagram.com/techfixdemo",
        linkedin_url: "https://linkedin.com/company/techfixdemo",
        has_qualirepar_label: true,
        repair_types: ["smartphone", "tablette", "ordinateur", "montre", "console"],
        years_experience: 10,
        emergency_service: true,
        home_service: true,
        pickup_service: true,
        opening_hours: {
          "lundi": { "open": "09:00", "close": "18:00" },
          "mardi": { "open": "09:00", "close": "18:00" },
          "mercredi": { "open": "09:00", "close": "18:00" },
          "jeudi": { "open": "09:00", "close": "18:00" },
          "vendredi": { "open": "09:00", "close": "18:00" },
          "samedi": { "open": "10:00", "close": "16:00" },
          "dimanche": { "open": null, "close": null }
        },
        languages_spoken: ["Français", "Anglais", "Espagnol"],
        payment_methods: ["CB", "Espèces", "Chèque", "Virement"],
        certifications: ["Apple Certified", "Samsung Certified", "QualiRepar"],
        services_offered: ["Réparation", "Diagnostic", "Conseil", "Formation"],
        response_time: "2h",
        warranty_duration: "6 mois"
      });

    if (profileError) {
      console.error("❌ Error creating profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Error creating profile: " + profileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Repairer profile created");

    // 3. Récupérer le plan Enterprise
    console.log("🏢 Getting Enterprise plan...");
    const { data: enterprisePlan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('id')
      .eq('name', 'Enterprise')
      .single();

    if (planError || !enterprisePlan) {
      console.error("❌ Enterprise plan not found:", planError);
      return new Response(
        JSON.stringify({ error: "Enterprise plan not found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Créer l'abonnement Enterprise
    console.log("💎 Creating Enterprise subscription...");
    const { error: subscriptionError } = await supabaseAdmin
      .from('repairer_subscriptions')
      .insert({
        repairer_id: userId,
        user_id: userId,
        email: demoEmail,
        subscription_plan_id: enterprisePlan.id,
        subscribed: true,
        subscription_tier: 'enterprise',
        billing_cycle: 'yearly',
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an
      });

    if (subscriptionError) {
      console.error("❌ Error creating subscription:", subscriptionError);
      return new Response(
        JSON.stringify({ error: "Error creating subscription: " + subscriptionError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Enterprise subscription created");

    // 5. Activer toutes les fonctionnalités Enterprise
    console.log("🔧 Activating all Enterprise features...");
    
    const enterpriseFeatures = [
      'basic_listing', 'contact_info_visible', 'reviews_system', 'quote_requests',
      'seo_optimization', 'facebook_ads', 'social_media_integration', 'priority_support',
      'advanced_analytics', 'bulk_operations', 'api_access', 'white_label',
      'custom_domain', 'advanced_reporting', 'multi_location', 'team_management',
      'inventory_management', 'appointment_booking', 'payment_processing',
      'parts_marketplace', 'ai_prediag', 'customer_portal', 'loyalty_program'
    ];

    const featureFlagsToInsert = enterpriseFeatures.map(featureKey => ({
      plan_name: 'Enterprise',
      feature_key: featureKey,
      enabled: true
    }));

    // Insérer ou mettre à jour les feature flags
    for (const flag of featureFlagsToInsert) {
      const { error: flagError } = await supabaseAdmin
        .from('feature_flags_by_plan')
        .upsert(flag, { onConflict: 'plan_name,feature_key' });
      
      if (flagError) {
        console.warn(`⚠️ Warning: Could not set feature ${flag.feature_key}:`, flagError);
      }
    }

    console.log("✅ Enterprise features activated");

    // 6. Créer une entrée dans la table repairers pour la visibilité publique
    console.log("🗺️ Creating public repairer entry...");
    const { error: repairerError } = await supabaseAdmin
      .from('repairers')
      .insert({
        name: "TechFix Demo",
        email: demoEmail,
        phone: "01 23 45 67 89",
        address: "123 Rue de la Réparation",
        city: "Paris",
        postal_code: "75001",
        department: "75",
        region: "Île-de-France",
        lat: 48.8566,
        lng: 2.3522,
        website: "https://techfix-demo.fr",
        specialties: ["smartphone", "tablette", "ordinateur", "montre", "console"],
        services: ["Réparation", "Diagnostic", "Conseil", "Formation"],
        rating: 4.8,
        review_count: 127,
        is_verified: true,
        is_open: true,
        source: "demo_creation",
        opening_hours: {
          "lundi": { "open": "09:00", "close": "18:00" },
          "mardi": { "open": "09:00", "close": "18:00" },
          "mercredi": { "open": "09:00", "close": "18:00" },
          "jeudi": { "open": "09:00", "close": "18:00" },
          "vendredi": { "open": "09:00", "close": "18:00" },
          "samedi": { "open": "10:00", "close": "16:00" },
          "dimanche": { "open": null, "close": null }
        }
      });

    if (repairerError) {
      console.error("❌ Error creating public repairer entry:", repairerError);
      return new Response(
        JSON.stringify({ error: "Error creating public entry: " + repairerError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Public repairer entry created");

    console.log("🎉 Demo repairer creation completed successfully!");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Réparateur de démonstration créé avec succès",
        user_id: userId,
        email: demoEmail,
        subscription: "Enterprise",
        features: "Toutes les fonctionnalités activées"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur: " + String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
