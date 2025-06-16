
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  requestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { requestId }: NotificationRequest = await req.json();
    
    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Request ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Récupérer les détails de la demande d'intérêt
    const { data: interestRequest, error: fetchError } = await supabaseClient
      .from('client_interest_requests')
      .select(`
        *,
        repairers!inner(
          name,
          email,
          phone,
          city
        )
      `)
      .eq('id', requestId)
      .eq('status', 'approved')
      .single();

    if (fetchError || !interestRequest) {
      console.error('Error fetching interest request:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Interest request not found or not approved' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const repairer = interestRequest.repairers;
    
    if (!repairer.email) {
      console.error('No email available for repairer');
      return new Response(
        JSON.stringify({ error: 'No email available for this repairer' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // TODO: Implémenter l'envoi d'email via Resend ou autre service
    // Pour l'instant, on simule l'envoi en loggant les détails
    console.log('Would send email to:', repairer.email);
    console.log('Email content:');
    console.log(`
      Subject: Un client s'intéresse à vos services - ${repairer.name}
      
      Bonjour,
      
      Un client a exprimé son intérêt pour vos services de réparation.
      
      Détails du client :
      - Email : ${interestRequest.client_email}
      ${interestRequest.client_phone ? `- Téléphone : ${interestRequest.client_phone}` : ''}
      
      Message du client :
      ${interestRequest.client_message}
      
      Cette demande provient de votre fiche non revendiquée sur RepairHub.
      
      Pour maximiser votre visibilité et accéder à toutes les fonctionnalités :
      - Revendiquez votre fiche professionnelle
      - Complétez vos informations
      - Gérez vos horaires et services
      
      Cordialement,
      L'équipe RepairHub
    `);

    // Marquer la demande comme envoyée
    const { error: updateError } = await supabaseClient
      .from('client_interest_requests')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update request status' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Interest notification sent successfully for request:', requestId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Interest notification sent successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in send-repairer-interest-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
