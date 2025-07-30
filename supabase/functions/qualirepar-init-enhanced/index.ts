import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiLogData {
  dossier_id: string;
  api_endpoint: string;
  request_method: string;
  request_payload: any;
  response_status?: number;
  response_data?: any;
  response_time_ms?: number;
  error_details?: string;
}

// Fonction pour valider le format SIRET
function validateSiret(siret: string): boolean {
  if (!siret || siret.length !== 14) return false;
  
  // Algorithme de validation SIRET
  const digits = siret.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 14; i++) {
    let digit = digits[i];
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
    }
    sum += digit;
  }
  
  return sum % 10 === 0;
}

// Fonction pour logger les appels API
async function logApiCall(supabase: any, logData: ApiLogData) {
  try {
    await supabase.from('qualirepar_api_logs').insert(logData);
  } catch (error) {
    console.error('Failed to log API call:', error);
  }
}

// Fonction pour récupérer le SIRET du réparateur
async function getRepairerSiret(supabase: any, repairerId: string): Promise<string | null> {
  try {
    const { data: profile } = await supabase
      .from('repairer_profiles')
      .select('siret_number')
      .eq('user_id', repairerId)
      .single();
    
    return profile?.siret_number || null;
  } catch (error) {
    console.error('Error fetching repairer SIRET:', error);
    return null;
  }
}

// Fonction de validation des données de dossier
function validateDossierData(dossier: any): string[] {
  const errors: string[] = [];
  
  if (!dossier.client_name?.trim()) {
    errors.push('Nom du client requis');
  }
  
  if (!dossier.client_email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Email client invalide');
  }
  
  if (!dossier.product_category?.trim()) {
    errors.push('Catégorie de produit requise');
  }
  
  if (!dossier.product_brand?.trim()) {
    errors.push('Marque de produit requise');
  }
  
  if (!dossier.repair_cost || dossier.repair_cost <= 0) {
    errors.push('Coût de réparation invalide');
  }
  
  if (!dossier.repair_date) {
    errors.push('Date de réparation requise');
  }
  
  return errors;
}

// Fonction pour créer une notification de statut
async function createStatusNotification(
  supabase: any, 
  dossierId: string, 
  userId: string, 
  oldStatus: string, 
  newStatus: string, 
  message: string
) {
  try {
    await supabase.from('qualirepar_status_notifications').insert({
      dossier_id: dossierId,
      old_status: oldStatus,
      new_status: newStatus,
      notification_type: 'status_change',
      recipient_user_id: userId,
      message: message,
      delivery_status: 'pending'
    });
  } catch (error) {
    console.error('Failed to create status notification:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let logData: ApiLogData;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { dossierId } = await req.json();

    logData = {
      dossier_id: dossierId,
      api_endpoint: '/qualirepar-init-enhanced',
      request_method: 'POST',
      request_payload: { dossierId }
    };

    if (!dossierId) {
      const error = 'dossierId is required';
      logData.response_status = 400;
      logData.error_details = error;
      await logApiCall(supabase, logData);
      
      return new Response(
        JSON.stringify({ error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les données du dossier avec retry
    let dossier;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('qualirepar_dossiers')
          .select('*')
          .eq('id', dossierId)
          .single();

        if (error) throw error;
        dossier = data;
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!dossier) {
      const error = 'Dossier not found';
      logData.response_status = 404;
      logData.error_details = error;
      await logApiCall(supabase, logData);
      
      return new Response(
        JSON.stringify({ error }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation des données
    const validationErrors = validateDossierData(dossier);
    if (validationErrors.length > 0) {
      logData.response_status = 400;
      logData.error_details = validationErrors.join(', ');
      await logApiCall(supabase, logData);
      
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          validationErrors,
          message: 'Veuillez corriger les erreurs de validation'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer et valider le SIRET du réparateur
    const repairerSiret = await getRepairerSiret(supabase, dossier.repairer_id);
    if (!repairerSiret || !validateSiret(repairerSiret)) {
      const error = 'SIRET réparateur manquant ou invalide';
      logData.response_status = 400;
      logData.error_details = error;
      await logApiCall(supabase, logData);
      
      return new Response(
        JSON.stringify({ 
          error,
          message: 'Veuillez configurer un SIRET valide dans votre profil réparateur'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Préparer le payload pour l'API officielle
    const apiPayload = {
      productType: dossier.product_category,
      productBrand: dossier.product_brand,
      productModel: dossier.product_model,
      productSerial: dossier.product_serial_number,
      clientName: dossier.client_name,
      clientEmail: dossier.client_email,
      clientPhone: dossier.client_phone,
      clientAddress: {
        street: dossier.client_address,
        postalCode: dossier.client_postal_code,
        city: dossier.client_city
      },
      repairDetails: {
        description: dossier.repair_description,
        cost: dossier.repair_cost,
        date: dossier.repair_date
      },
      repairerInfo: {
        siret: repairerSiret
      },
      requestedAmount: dossier.requested_bonus_amount,
      ecoOrganism: dossier.eco_organism
    };

    console.log('Calling QualiRépar API with enhanced payload:', apiPayload);

    // TODO: Remplacer par l'appel API réel en production
    // const apiResponse = await fetch('https://api.ecosystem.eco/qualirepar/v1/claims/init', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${Deno.env.get('QUALIREPAR_API_KEY')}`
    //   },
    //   body: JSON.stringify(apiPayload)
    // });

    // Simulation de la réponse API officielle
    const temporaryClaimId = `ECO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const apiResponse = {
      success: true,
      temporaryClaimId,
      nextStep: 'document_upload',
      requiredDocuments: ['FACTURE', 'BON_DEPOT', 'SERIALTAG'],
      estimatedProcessingDays: 15,
      message: 'Demande initialisée avec succès',
      apiVersion: 'v1',
      validUntil: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() // 7 jours
    };

    // Mettre à jour le dossier avec les nouvelles données
    const updateData = {
      temporary_claim_id: temporaryClaimId,
      api_status: 'initialized',
      wizard_step: 2,
      status: 'metadata_complete',
      api_response_data: apiResponse,
      is_api_compliant: true,
      repairer_siret: repairerSiret,
      api_endpoint: 'https://api.ecosystem.eco/qualirepar/v1/claims/init',
      api_version: 'v1',
      last_api_call: new Date().toISOString(),
      retry_count: 0,
      validation_errors: [],
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('qualirepar_dossiers')
      .update(updateData)
      .eq('id', dossierId);

    if (updateError) {
      throw updateError;
    }

    // Créer une notification de changement de statut
    await createStatusNotification(
      supabase,
      dossierId,
      dossier.repairer_id,
      dossier.status,
      'metadata_complete',
      'Métadonnées validées, vous pouvez maintenant uploader les documents'
    );

    const responseTime = Date.now() - startTime;
    logData.response_status = 200;
    logData.response_data = { temporaryClaimId, success: true };
    logData.response_time_ms = responseTime;
    
    // Log en arrière-plan
    EdgeRuntime.waitUntil(logApiCall(supabase, logData));

    console.log('QualiRépar enhanced init successful:', {
      dossierId,
      temporaryClaimId,
      responseTime: `${responseTime}ms`
    });

    return new Response(
      JSON.stringify({
        success: true,
        temporaryClaimId,
        dossierId,
        nextStep: 'document_upload',
        requiredDocuments: apiResponse.requiredDocuments,
        estimatedProcessingDays: apiResponse.estimatedProcessingDays,
        validUntil: apiResponse.validUntil,
        message: 'Demande QualiRépar initialisée avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('QualiRépar enhanced init error:', error);
    
    if (logData) {
      logData.response_status = 500;
      logData.error_details = error.message;
      logData.response_time_ms = responseTime;
      
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        await logApiCall(supabase, logData);
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});