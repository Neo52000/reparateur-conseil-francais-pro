import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfirmClaimResponse {
  RequestStatus: string;
  SapServiceOrder: string;
}

const REQUIRED_DOCUMENTS = {
  always: ['invoice'],
  conditional: {
    'serial_tag': 'required for certain products', // TODO: check product requirements
    'claim_request': 'required when PIEC parts are used'
  }
};

function validateToken(authHeader: string | null): any {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(atob(token));
    
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

function generateSapServiceOrder(): string {
  // Generate a SAP-style service order (6 chars alphanumeric)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    const tokenData = validateToken(authHeader);
    
    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract reimbursementClaimId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const reimbursementClaimId = pathParts[pathParts.length - 2]; // Assuming /reimbursement-claims/{id}/confirm-claim

    if (!reimbursementClaimId) {
      return new Response(
        JSON.stringify({ error: 'ReimbursementClaimID is required in path' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Confirming claim:', reimbursementClaimId);

    // ============= VALIDATIONS v3 =============
    
    // 1. Find the dossier
    const { data: dossier, error: dossierError } = await supabase
      .from('qualirepar_dossiers')
      .select('*')
      .eq('reimbursement_claim_id', reimbursementClaimId)
      .single();

    if (dossierError || !dossier) {
      console.error('❌ Error fetching dossier:', dossierError);
      return new Response(
        JSON.stringify({ error: 'Claim not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Get uploaded documents
    const { data: documents, error: docError } = await supabase
      .from('qualirepar_documents')
      .select('*')
      .eq('dossier_id', dossier.id);

    if (docError) {
      console.error('❌ Error fetching documents:', docError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch documents' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uploadedTypes = documents?.map(doc => doc.document_type) || [];

    // 3. Check required documents
    const missingDocs: string[] = [];
    
    // Always required: invoice
    if (!uploadedTypes.includes('invoice')) {
      missingDocs.push('invoice');
    }

    // Check conditional requirements
    // TODO: Implement product-specific serial_tag requirements
    // For now, we'll check based on product type
    const isSerialTagRequired = true; // This should be based on product lookup
    if (isSerialTagRequired && !uploadedTypes.includes('serial_tag')) {
      missingDocs.push('serial_tag');
    }

    // Check if PIEC parts were used
    const usesPiecParts = (dossier.piec_spare_parts_amount || 0) > 0;
    if (usesPiecParts && !uploadedTypes.includes('claim_request')) {
      missingDocs.push('claim_request');
    }

    if (missingDocs.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: '400 : PIECE_JOINTE_MANQUANTE',
          missingDocuments: missingDocs,
          message: `Pièces jointes manquantes: ${missingDocs.join(', ')}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate SAP Service Order
    const sapServiceOrder = generateSapServiceOrder();

    // Update dossier status
    const { error: updateError } = await supabase
      .from('qualirepar_dossiers')
      .update({
        sap_service_order: sapServiceOrder,
        v3_request_status: 'Envoyé, en cours de vérification',
        status: 'submitted',
        api_status: 'confirmed',
        submission_date: new Date().toISOString(),
        wizard_step: 3,
        updated_at: new Date().toISOString()
      })
      .eq('id', dossier.id);

    if (updateError) {
      console.error('❌ Error updating dossier:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to confirm claim' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark all documents as confirmed
    const { error: docUpdateError } = await supabase
      .from('qualirepar_documents')
      .update({
        upload_status: 'confirmed',
        is_validated: true,
        updated_at: new Date().toISOString()
      })
      .eq('dossier_id', dossier.id);

    if (docUpdateError) {
      console.error('⚠️ Error updating documents status:', docUpdateError);
    }

    // Create status notification
    await supabase
      .from('qualirepar_status_notifications')
      .insert({
        dossier_id: dossier.id,
        repairer_id: dossier.repairer_id,
        old_status: dossier.status,
        new_status: 'submitted',
        notification_type: 'status_change',
        message: `Demande ${reimbursementClaimId} confirmée et soumise`,
        metadata: {
          sapServiceOrder,
          documentsUploaded: uploadedTypes
        }
      });

    // Log API call
    await supabase
      .from('qualirepar_api_logs')
      .insert({
        endpoint: `/reimbursement-claims/${reimbursementClaimId}/confirm-claim`,
        method: 'POST',
        user_id: tokenData.userId,
        request_data: { reimbursementClaimId },
        response_data: { sapServiceOrder },
        status_code: 200,
        execution_time_ms: 0
      });

    const response: ConfirmClaimResponse = {
      RequestStatus: 'Envoyé, en cours de vérification',
      SapServiceOrder: sapServiceOrder
    };

    console.log('✅ Claim confirmed successfully:', reimbursementClaimId, 'SAP Order:', sapServiceOrder);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Confirm claim error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});