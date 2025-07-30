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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { dossierId } = await req.json();

    if (!dossierId) {
      return new Response(
        JSON.stringify({ error: 'dossierId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les données du dossier
    const { data: dossier, error: dossierError } = await supabase
      .from('qualirepar_dossiers')
      .select('*')
      .eq('id', dossierId)
      .single();

    if (dossierError || !dossier) {
      console.error('Error fetching dossier:', dossierError);
      return new Response(
        JSON.stringify({ error: 'Dossier not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simuler l'appel API au Fonds Réparation
    // En production, remplacer par le vrai endpoint API
    const apiPayload = {
      productType: dossier.product_category,
      clientName: dossier.client_name,
      invoiceDate: dossier.repair_date,
      invoiceTotal: dossier.repair_cost,
      requestedAmount: dossier.requested_bonus_amount,
      repairerSiret: '12345678901234', // À récupérer du profil réparateur
      metadata: {
        productBrand: dossier.product_brand,
        productModel: dossier.product_model,
        repairDescription: dossier.repair_description
      }
    };

    console.log('Calling QualiRépar API with payload:', apiPayload);

    // Simuler la réponse de l'API officielle
    // En production: const response = await fetch('https://api.fondsreparation.fr/new-claim', { ... });
    const temporaryClaimId = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const apiResponse = {
      success: true,
      temporaryClaimId,
      nextStep: 'document_upload',
      message: 'Demande initialisée avec succès'
    };

    // Mettre à jour le dossier avec le temporaryClaimId
    const { error: updateError } = await supabase
      .from('qualirepar_dossiers')
      .update({
        temporary_claim_id: temporaryClaimId,
        api_status: 'initialized',
        wizard_step: 2,
        status: 'metadata_complete',
        api_response_data: apiResponse,
        is_api_compliant: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', dossierId);

    if (updateError) {
      console.error('Error updating dossier:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update dossier' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('QualiRépar init successful for dossier:', dossierId, 'TemporaryClaimID:', temporaryClaimId);

    return new Response(
      JSON.stringify({
        success: true,
        temporaryClaimId,
        dossierId,
        nextStep: 'document_upload',
        message: 'Demande QualiRépar initialisée avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('QualiRépar init error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});