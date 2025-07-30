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

    const { dossierId, documentType, fileName } = await req.json();

    if (!dossierId || !documentType || !fileName) {
      return new Response(
        JSON.stringify({ error: 'dossierId, documentType, and fileName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Valider le type de document
    const validTypes = ['FACTURE', 'BON_DEPOT', 'SERIALTAG', 'PHOTO_PRODUIT', 'JUSTIFICATIF_COMPLEMENTAIRE'];
    if (!validTypes.includes(documentType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid document type' }),
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
        JSON.stringify({ error: 'Dossier not initialized. Call qualirepar-init first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simuler l'appel API pour obtenir l'URL de upload
    // En production: const response = await fetch('https://api.fondsreparation.fr/upload-file', { ... });
    const uploadUrl = `https://upload.fondsreparation.fr/claims/${dossier.temporary_claim_id}/${documentType}/${Date.now()}_${fileName}`;
    
    console.log('Generated upload URL for document:', documentType, 'URL:', uploadUrl);

    const apiResponse = {
      success: true,
      uploadUrl,
      documentType,
      expires: new Date(Date.now() + 3600000).toISOString(), // 1 heure
      instructions: 'Upload the file using PUT method to this URL'
    };

    // Créer ou mettre à jour l'enregistrement de document
    const { data: document, error: docError } = await supabase
      .from('qualirepar_documents')
      .upsert({
        dossier_id: dossierId,
        document_type: documentType,
        official_document_type: documentType,
        file_name: fileName,
        upload_url: uploadUrl,
        upload_status: 'url_generated',
        file_path: `qualirepar/${dossierId}/${documentType}/${fileName}`,
        mime_type: 'application/octet-stream',
        file_size: 0,
        is_validated: false
      })
      .select()
      .single();

    if (docError) {
      console.error('Error creating/updating document:', docError);
      return new Response(
        JSON.stringify({ error: 'Failed to create document record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour les URLs d'upload dans le dossier
    const currentUrls = dossier.api_upload_urls || {};
    currentUrls[documentType] = uploadUrl;

    const { error: updateError } = await supabase
      .from('qualirepar_dossiers')
      .update({
        api_upload_urls: currentUrls,
        updated_at: new Date().toISOString()
      })
      .eq('id', dossierId);

    if (updateError) {
      console.error('Error updating dossier URLs:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update upload URLs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Upload URL generated successfully for dossier:', dossierId, 'Document:', documentType);

    return new Response(
      JSON.stringify({
        success: true,
        uploadUrl,
        documentType,
        documentId: document.id,
        expires: apiResponse.expires,
        message: 'URL d\'upload générée avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('QualiRépar upload URL generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});