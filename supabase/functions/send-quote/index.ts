import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendQuoteRequest {
  repairOrderId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  pdfBase64: string;
  sendMethod: 'email' | 'sms' | 'both';
  quoteName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      repairOrderId, 
      recipientEmail, 
      recipientPhone, 
      pdfBase64, 
      sendMethod,
      quoteName 
    }: SendQuoteRequest = await req.json();

    console.log(`Processing quote send request for order ${repairOrderId} via ${sendMethod}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get repair order details
    const { data: repairOrder, error: orderError } = await supabase
      .from('repair_orders')
      .select(`
        *,
        device:repair_devices(*)
      `)
      .eq('id', repairOrderId)
      .single();

    if (orderError || !repairOrder) {
      throw new Error('Commande de réparation introuvable');
    }

    const results = {
      email: null as any,
      sms: null as any,
      success: false,
      message: ''
    };

    // Send by email if requested
    if (sendMethod === 'email' || sendMethod === 'both') {
      if (!recipientEmail) {
        throw new Error('Email destinataire requis');
      }

      // Check if Resend API key is available
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        throw new Error('Service email non configuré');
      }

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Réparation <noreply@repairservice.com>',
            to: [recipientEmail],
            subject: `Devis de réparation - ${repairOrder.order_number}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3B82F6; margin-bottom: 20px;">Votre devis de réparation est prêt</h2>
                
                <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p><strong>Numéro de commande:</strong> ${repairOrder.order_number}</p>
                  <p><strong>Appareil:</strong> ${repairOrder.device?.device_type_id || 'N/A'}</p>
                  <p><strong>Client:</strong> ${repairOrder.device?.customer_name || 'N/A'}</p>
                </div>
                
                <p>Vous trouverez en pièce jointe votre devis détaillé pour la réparation de votre appareil.</p>
                
                <p>Pour toute question, n'hésitez pas à nous contacter.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
                  <p>Cordialement,<br>L'équipe de réparation</p>
                </div>
              </div>
            `,
            attachments: [
              {
                filename: `${quoteName}.pdf`,
                content: pdfBase64,
                type: 'application/pdf',
              }
            ]
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(`Erreur envoi email: ${errorData.message || 'Erreur inconnue'}`);
        }

        results.email = await emailResponse.json();
        console.log('Email sent successfully:', results.email.id);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        results.email = { error: emailError.message };
      }
    }

    // Send by SMS if requested (placeholder implementation)
    if (sendMethod === 'sms' || sendMethod === 'both') {
      if (!recipientPhone) {
        throw new Error('Numéro de téléphone destinataire requis');
      }

      // Note: This is a placeholder. To implement SMS, you would need to integrate
      // with a service like Twilio, AWS SNS, or similar
      results.sms = {
        placeholder: true,
        message: 'SMS non implémenté - nécessite intégration avec service SMS',
        recipientPhone
      };
      
      console.log('SMS sending not implemented yet for:', recipientPhone);
    }

    // Log the communication in the database
    const { error: logError } = await supabase
      .from('repair_communications')
      .insert({
        repair_order_id: repairOrderId,
        communication_type: sendMethod,
        recipient_email: recipientEmail,
        recipient_phone: recipientPhone,
        status: results.email?.error || results.sms?.error ? 'failed' : 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          email_result: results.email,
          sms_result: results.sms,
          quote_name: quoteName
        }
      });

    if (logError) {
      console.error('Failed to log communication:', logError);
    }

    // Determine overall success
    results.success = (
      sendMethod === 'email' && results.email && !results.email.error
    ) || (
      sendMethod === 'sms' && results.sms && !results.sms.error
    ) || (
      sendMethod === 'both' && 
      results.email && !results.email.error &&
      results.sms && !results.sms.error
    );

    if (results.success) {
      results.message = `Devis envoyé avec succès par ${sendMethod}`;
    } else {
      results.message = `Erreur lors de l'envoi du devis par ${sendMethod}`;
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: results.success ? 200 : 400,
    });

  } catch (error: any) {
    console.error('Error in send-quote function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false,
        message: 'Erreur lors de l\'envoi du devis'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);