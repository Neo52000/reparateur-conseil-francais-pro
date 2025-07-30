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

    if (!dossier.temporary_claim_id) {
      return new Response(
        JSON.stringify({ error: 'Dossier not initialized' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que tous les documents requis sont uploadés
    const { data: documents, error: docError } = await supabase
      .from('qualirepar_documents')
      .select('*')
      .eq('dossier_id', dossierId);

    if (docError) {
      console.error('Error fetching documents:', docError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch documents' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier les documents requis
    const requiredDocs = ['FACTURE', 'BON_DEPOT', 'SERIALTAG'];
    const uploadedTypes = documents?.map(doc => doc.official_document_type) || [];
    const missingDocs = requiredDocs.filter(type => !uploadedTypes.includes(type));

    if (missingDocs.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required documents',
          missingDocuments: missingDocs,
          message: `Documents manquants: ${missingDocs.join(', ')}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simuler l'appel API de confirmation au Fonds Réparation
    // En production: const response = await fetch('https://api.fondsreparation.fr/confirm-claim', { ... });
    const officialClaimId = `OFFICIAL_${dossier.temporary_claim_id}_${Date.now()}`;
    
    const confirmationPayload = {
      temporaryClaimId: dossier.temporary_claim_id,
      documentsUploaded: uploadedTypes,
      confirmSubmission: true
    };

    console.log('Confirming QualiRépar claim with payload:', confirmationPayload);

    const apiResponse = {
      success: true,
      officialClaimId,
      status: 'submitted',
      submissionDate: new Date().toISOString(),
      trackingReference: `QR-${officialClaimId.slice(-8)}`,
      estimatedProcessingDays: 15,
      message: 'Demande confirmée et soumise avec succès'
    };

    // Mettre à jour le dossier avec la confirmation
    const { error: updateError } = await supabase
      .from('qualirepar_dossiers')
      .update({
        official_claim_id: officialClaimId,
        status: 'submitted',
        api_status: 'confirmed',
        wizard_step: 3,
        submission_date: new Date().toISOString(),
        document_types_uploaded: uploadedTypes,
        api_response_data: apiResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', dossierId);

    if (updateError) {
      console.error('Error updating dossier confirmation:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update dossier confirmation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Marquer tous les documents comme validés
    const { error: docUpdateError } = await supabase
      .from('qualirepar_documents')
      .update({
        upload_status: 'confirmed',
        is_validated: true,
        updated_at: new Date().toISOString()
      })
      .eq('dossier_id', dossierId);

    if (docUpdateError) {
      console.error('Error updating documents status:', docUpdateError);
    }

    console.log('QualiRépar claim confirmed successfully:', {
      dossierId,
      officialClaimId,
      trackingReference: apiResponse.trackingReference
    });

    return new Response(
      JSON.stringify({
        success: true,
        officialClaimId,
        trackingReference: apiResponse.trackingReference,
        submissionDate: apiResponse.submissionDate,
        estimatedProcessingDays: apiResponse.estimatedProcessingDays,
        message: 'Demande QualiRépar confirmée et soumise avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('QualiRépar confirmation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});