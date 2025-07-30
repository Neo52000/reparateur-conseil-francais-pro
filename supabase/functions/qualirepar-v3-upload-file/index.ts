import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadFileRequest {
  FileName: string;
  FileType: 'serial_tag' | 'invoice' | 'device_picture' | 'claim_request';
  FileSizeInMB: number;
}

interface UploadFileResponse {
  url: string;
}

const VALID_FILE_TYPES = ['serial_tag', 'invoice', 'device_picture', 'claim_request'];
const MAX_DEVICE_PICTURES = 5;

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

function validateFileType(fileType: string): boolean {
  return VALID_FILE_TYPES.includes(fileType);
}

function getAcceptedFormats(fileType: string): string[] {
  switch (fileType) {
    case 'invoice':
      return ['PDF', 'JPG', 'JPEG', 'PNG'];
    case 'serial_tag':
      return ['JPG', 'JPEG', 'PNG'];
    case 'device_picture':
      return ['JPG', 'JPEG', 'PNG'];
    case 'claim_request':
      return ['PDF', 'JPG', 'JPEG', 'PNG'];
    default:
      return [];
  }
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
    const reimbursementClaimId = pathParts[pathParts.length - 2]; // Assuming /reimbursement-claims/{id}/upload-file

    if (!reimbursementClaimId) {
      return new Response(
        JSON.stringify({ error: 'ReimbursementClaimID is required in path' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uploadRequest: UploadFileRequest = await req.json();
    console.log('📎 Upload file request for claim:', reimbursementClaimId, 'Type:', uploadRequest.FileType);

    // ============= VALIDATIONS v3 =============
    
    // 1. Validate file type
    if (!validateFileType(uploadRequest.FileType)) {
      return new Response(
        JSON.stringify({ 
          error: `"${uploadRequest.FileType}" is not one of ['device_picture', 'serial_tag', 'claim_request', 'invoice']` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Find the dossier
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

    // 3. Check if file type already exists (except device_picture)
    if (uploadRequest.FileType !== 'device_picture') {
      const { data: existingDoc, error: docError } = await supabase
        .from('qualirepar_documents')
        .select('id')
        .eq('dossier_id', dossier.id)
        .eq('document_type', uploadRequest.FileType)
        .limit(1);

      if (!docError && existingDoc && existingDoc.length > 0) {
        return new Response(
          JSON.stringify({ error: '400 : TYPE_DE_FICHIER_EXISTANT' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Check device picture limit
    if (uploadRequest.FileType === 'device_picture') {
      const { data: devicePics, error: picsError } = await supabase
        .from('qualirepar_documents')
        .select('id')
        .eq('dossier_id', dossier.id)
        .eq('document_type', 'device_picture');

      if (!picsError && devicePics && devicePics.length >= MAX_DEVICE_PICTURES) {
        return new Response(
          JSON.stringify({ error: `Maximum ${MAX_DEVICE_PICTURES} device pictures allowed` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 5. Validate file extension
    const fileName = uploadRequest.FileName;
    const fileExtension = fileName.split('.').pop()?.toUpperCase();
    const acceptedFormats = getAcceptedFormats(uploadRequest.FileType);
    
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid file format', 
          message: `File type ${uploadRequest.FileType} accepts: ${acceptedFormats.join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate upload URL (simulated - in production this would call the real API)
    const timestamp = Date.now();
    const uploadUrl = `https://prd-s3-ecosystem-fonds-reparation.s3.amazonaws.com/claims/${reimbursementClaimId}/${uploadRequest.FileType}/${timestamp}_${fileName}`;

    // Create document record
    const { data: document, error: createDocError } = await supabase
      .from('qualirepar_documents')
      .insert({
        dossier_id: dossier.id,
        document_type: uploadRequest.FileType,
        file_name: uploadRequest.FileName,
        file_size_mb: uploadRequest.FileSizeInMB,
        file_size: Math.round(uploadRequest.FileSizeInMB * 1024 * 1024),
        upload_url: uploadUrl,
        upload_status: 'url_generated',
        file_path: `qualirepar/${dossier.id}/${uploadRequest.FileType}/${fileName}`,
        mime_type: getContentType(fileExtension),
        is_validated: false
      })
      .select()
      .single();

    if (createDocError) {
      console.error('❌ Error creating document:', createDocError);
      return new Response(
        JSON.stringify({ error: 'Failed to create document record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log API call
    await supabase
      .from('qualirepar_api_logs')
      .insert({
        endpoint: `/reimbursement-claims/${reimbursementClaimId}/upload-file`,
        method: 'POST',
        user_id: tokenData.userId,
        request_data: uploadRequest,
        response_data: { uploadUrl },
        status_code: 200,
        execution_time_ms: 0
      });

    const response: UploadFileResponse = {
      url: uploadUrl
    };

    console.log('✅ Upload URL generated for:', uploadRequest.FileType, 'Claim:', reimbursementClaimId);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Upload file error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getContentType(extension: string): string {
  switch (extension.toLowerCase()) {
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    default: return 'application/octet-stream';
  }
}