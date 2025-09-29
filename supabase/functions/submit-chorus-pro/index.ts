import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id } = await req.json();
    
    if (!invoice_id) {
      throw new Error('ID de facture requis');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Submitting to Chorus Pro:', invoice_id);

    // Récupérer la facture avec les détails
    const { data: invoice, error: invoiceError } = await supabase
      .from('electronic_invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Facture introuvable');
    }

    // Vérifier que c'est une facture B2B (SIRET client requis)
    if (!invoice.siret_client) {
      throw new Error('Facture B2C - Chorus Pro non requis');
    }

    // Créer l'enregistrement de soumission
    const { data: submission, error: submissionError } = await supabase
      .from('chorus_pro_submissions')
      .insert({
        invoice_id: invoice_id,
        status: 'pending'
      })
      .select()
      .single();

    if (submissionError) {
      throw submissionError;
    }

    // Simulation de l'API Chorus Pro (remplacer par vraie intégration)
    const chorusProResult = await simulateChorusProSubmission(invoice);

    // Mettre à jour la soumission avec le résultat
    const { error: updateError } = await supabase
      .from('chorus_pro_submissions')
      .update({
        submission_id: chorusProResult.submission_id,
        status: chorusProResult.success ? 'submitted' : 'error',
        submitted_at: new Date().toISOString(),
        response_data: chorusProResult.response,
        error_message: chorusProResult.error_message
      })
      .eq('id', submission.id);

    if (updateError) {
      throw updateError;
    }

    // Mettre à jour le statut de la facture
    const { error: invoiceUpdateError } = await supabase
      .from('electronic_invoices')
      .update({
        chorus_pro_status: chorusProResult.success ? 'submitted' : 'rejected',
        chorus_pro_id: chorusProResult.submission_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice_id);
      
    if (invoiceUpdateError) {
      console.warn('Erreur mise à jour facture:', invoiceUpdateError);
    }

    return new Response(
      JSON.stringify({ 
        success: chorusProResult.success,
        submission_id: chorusProResult.submission_id,
        message: chorusProResult.success 
          ? 'Facture soumise à Chorus Pro avec succès' 
          : chorusProResult.error_message
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erreur soumission Chorus Pro:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function simulateChorusProSubmission(invoice: any): Promise<{
  success: boolean;
  submission_id?: string;
  response: any;
  error_message?: string;
}> {
  // Simulation de l'API Chorus Pro
  // En production, remplacer par l'intégration réelle avec Chorus Pro
  
  console.log('Simulating Chorus Pro submission for invoice:', invoice.invoice_number);
  
  // Validation basique
  const requiredFields = ['siret_repairer', 'siret_client', 'amount_ttc'];
  for (const field of requiredFields) {
    if (!invoice[field]) {
      return {
        success: false,
        response: { error: `Champ requis manquant: ${field}` },
        error_message: `Champ requis manquant: ${field}`
      };
    }
  }

  // Simulation d'une réponse réussie (85% de succès)
  const isSuccess = Math.random() > 0.15;
  
  if (isSuccess) {
    const submissionId = `CPO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      success: true,
      submission_id: submissionId,
      response: {
        status: 'SUBMITTED',
        submission_id: submissionId,
        validation_status: 'PASSED',
        estimated_processing_days: 3
      }
    };
  } else {
    // Simulation d'erreurs possibles
    const errors = [
      'SIRET destinataire non reconnu dans Chorus Pro',
      'Format XML invalide',
      'Montant TVA incorrect',
      'Numéro de facture déjà utilisé'
    ];
    
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    
    return {
      success: false,
      response: {
        status: 'REJECTED',
        error_code: 'VALIDATION_ERROR',
        error_details: randomError
      },
      error_message: randomError
    };
  }
}

/*
 * Intégration réelle Chorus Pro (à implémenter)
 * 
async function realChorusProSubmission(invoice: any): Promise<any> {
  const chorusProEndpoint = 'https://chorus-pro.gouv.fr/api/v1/invoices';
  
  const payload = {
    invoice_number: invoice.invoice_number,
    supplier_siret: invoice.siret_repairer,
    customer_siret: invoice.siret_client,
    amount: invoice.amount_ttc,
    currency: 'EUR',
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    xml_content: invoice.xml_content
  };

  const response = await fetch(chorusProEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('CHORUS_PRO_TOKEN')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}
*/