import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      throw new Error("Invalid token");
    }

    const { integrationId, eventData, eventType } = await req.json();

    // Récupérer l'intégration Zapier
    const { data: integration, error: integrationError } = await supabase
      .from("zapier_integrations")
      .select("*")
      .eq("id", integrationId)
      .eq("repairer_id", userData.user.id)
      .single();

    if (integrationError || !integration) {
      throw new Error("Integration not found");
    }

    if (!integration.is_active) {
      throw new Error("Integration is not active");
    }

    // Préparer les données à envoyer
    const payload = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      repairer_id: userData.user.id,
      data: eventData,
      source: "TopReparateurs.fr"
    };

    // Envoyer le webhook à Zapier
    const webhookResponse = await fetch(integration.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const success = webhookResponse.ok;

    // Mettre à jour les statistiques de l'intégration
    await supabase
      .from("zapier_integrations")
      .update({
        last_triggered_at: new Date().toISOString(),
        success_count: success ? integration.success_count + 1 : integration.success_count,
        error_count: success ? integration.error_count : integration.error_count + 1,
      })
      .eq("id", integrationId);

    return new Response(JSON.stringify({ 
      success,
      webhook_status: webhookResponse.status,
      integration_name: integration.integration_name
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: success ? 200 : 400,
    });

  } catch (error) {
    console.error("Error triggering Zapier webhook:", error);
    return new Response(JSON.stringify({ 
      error: "Erreur lors du déclenchement du webhook",
      details: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});