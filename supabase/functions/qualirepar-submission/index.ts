import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { dossierId, submissionMethod = 'email' } = await req.json();

    if (!dossierId) {
      return new Response(
        JSON.stringify({ error: 'Dossier ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get dossier details
    const { data: dossier, error: dossierError } = await supabase
      .from('qualirepar_dossiers')
      .select('*')
      .eq('id', dossierId)
      .single();

    if (dossierError || !dossier) {
      return new Response(
        JSON.stringify({ error: 'Dossier not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get documents
    const { data: documents, error: documentsError } = await supabase
      .from('qualirepar_documents')
      .select('*')
      .eq('dossier_id', dossierId);

    if (documentsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to load documents' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required documents
    const requiredDocuments = ['invoice', 'proof_of_eligibility'];
    const missingDocuments = requiredDocuments.filter(type => 
      !documents?.some(doc => doc.document_type === type)
    );

    if (missingDocuments.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required documents', 
          missingDocuments 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine eco-organism email based on product category
    const getEcoOrganismEmail = (ecoOrganism: string) => {
      switch (ecoOrganism.toLowerCase()) {
        case 'ecosystem':
          return 'qualirepar@ecosystem.eco';
        case 'ecologic':
          return 'qualirepar@ecologic-france.com';
        case 'recycleurs':
          return 'qualirepar@recycleurs.org';
        default:
          return 'qualirepar@ecosystem.eco'; // Default fallback
      }
    };

    const recipientEmail = getEcoOrganismEmail(dossier.eco_organism);

    // Prepare submission data
    const submissionData = {
      dossier_number: dossier.dossier_number,
      client_name: dossier.client_name,
      client_email: dossier.client_email,
      client_address: `${dossier.client_address}, ${dossier.client_postal_code} ${dossier.client_city}`,
      product_info: `${dossier.product_brand} ${dossier.product_model}`,
      product_category: dossier.product_category,
      repair_description: dossier.repair_description,
      repair_cost: dossier.repair_cost,
      repair_date: dossier.repair_date,
      requested_bonus_amount: dossier.requested_bonus_amount,
      eco_organism: dossier.eco_organism,
      documents_count: documents?.length || 0,
      submission_date: new Date().toISOString()
    };

    // Generate tracking reference
    const trackingReference = `QR-${dossier.dossier_number}-${Date.now()}`;

    // Create submission record
    const { data: submission, error: submissionError } = await supabase
      .from('qualirepar_submissions')
      .insert({
        dossier_id: dossierId,
        submission_method: submissionMethod,
        recipient_email: recipientEmail,
        submission_data: submissionData,
        status: 'pending',
        tracking_reference: trackingReference
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission creation error:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create submission record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare email content
    const emailSubject = `Demande de bonus QualiRépar - Dossier ${dossier.dossier_number}`;
    const emailBody = `
Bonjour,

Veuillez trouver ci-joint une demande de bonus QualiRépar pour les informations suivantes :

INFORMATIONS CLIENT :
- Nom : ${dossier.client_name}
- Email : ${dossier.client_email}
- Adresse : ${dossier.client_address}, ${dossier.client_postal_code} ${dossier.client_city}

INFORMATIONS PRODUIT :
- Catégorie : ${dossier.product_category}
- Marque : ${dossier.product_brand}
- Modèle : ${dossier.product_model}
${dossier.product_serial_number ? `- Numéro de série : ${dossier.product_serial_number}` : ''}

INFORMATIONS RÉPARATION :
- Description : ${dossier.repair_description}
- Coût de la réparation : ${dossier.repair_cost}€
- Date de réparation : ${new Date(dossier.repair_date).toLocaleDateString('fr-FR')}
- Montant du bonus demandé : ${dossier.requested_bonus_amount}€

NUMÉRO DE SUIVI : ${trackingReference}

Documents joints : ${documents?.length || 0} fichier(s)

Cordialement,
L'équipe TopRéparateurs.fr
`;

    try {
      // Send email (using Resend API)
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@topreparateurs.fr',
          to: [recipientEmail],
          subject: emailSubject,
          text: emailBody,
          attachments: [], // TODO: Add document attachments
        }),
      });

      if (!resendResponse.ok) {
        throw new Error(`Email service error: ${resendResponse.statusText}`);
      }

      const emailResult = await resendResponse.json();

      // Update submission status
      await supabase
        .from('qualirepar_submissions')
        .update({
          status: 'sent',
          response_data: emailResult,
          external_reference: emailResult.id || null
        })
        .eq('id', submission.id);

      // Update dossier status
      await supabase
        .from('qualirepar_dossiers')
        .update({
          status: 'submitted',
          submission_date: new Date().toISOString()
        })
        .eq('id', dossierId);

      return new Response(
        JSON.stringify({
          success: true,
          tracking_reference: trackingReference,
          submission_id: submission.id,
          email_id: emailResult.id
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Update submission with error
      await supabase
        .from('qualirepar_submissions')
        .update({
          status: 'failed',
          error_message: emailError.message
        })
        .eq('id', submission.id);

      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: emailError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});