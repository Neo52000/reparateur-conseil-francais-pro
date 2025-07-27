import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendQuoteRequest {
  repairOrderId: string;
  recipientEmail: string;
  recipientPhone?: string;
  pdfBase64: string;
  sendMethod: 'email' | 'sms' | 'both';
  quoteName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Send quote function called');

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

    console.log('Processing send quote request:', { 
      repairOrderId, 
      recipientEmail: recipientEmail ? '[EMAIL_PRESENT]' : '[NO_EMAIL]',
      recipientPhone: recipientPhone ? '[PHONE_PRESENT]' : '[NO_PHONE]',
      sendMethod,
      quoteName 
    });

    let emailResult = null;
    let smsResult = null;

    // Envoi par email
    if ((sendMethod === 'email' || sendMethod === 'both') && recipientEmail) {
      console.log('Sending quote by email...');
      
      try {
        // Convertir le base64 en buffer
        const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

        emailResult = await resend.emails.send({
          from: "Réparation Mobile <devis@resend.dev>",
          to: [recipientEmail],
          subject: `📱 Votre devis de réparation - ${quoteName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
              <!-- En-tête -->
              <div style="background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #3B82F6; font-size: 28px; margin: 0; font-weight: bold;">📱 Votre Devis de Réparation</h1>
                <p style="color: #6B7280; margin: 10px 0 0 0; font-size: 16px;">Document professionnel joint</p>
              </div>

              <!-- Contenu principal -->
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #374151; font-size: 20px; margin: 0 0 20px 0;">Bonjour,</h2>
                
                <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                  Nous avons le plaisir de vous transmettre votre devis de réparation en pièce jointe.
                </p>

                <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6; margin: 20px 0;">
                  <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: bold;">📄 Devis joint :</h3>
                  <p style="color: #6B7280; margin: 0; font-size: 14px;">${quoteName}.pdf</p>
                </div>

                <div style="background: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #3730A3; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">ℹ️ Informations importantes :</h3>
                  <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>Ce devis est valable 30 jours</li>
                    <li>Aucun paiement n'est requis à ce stade</li>
                    <li>La réparation ne commencera qu'après validation</li>
                    <li>Garantie de 3 mois sur toutes nos réparations</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #4B5563; margin: 0 0 15px 0; font-size: 16px;">
                    Pour accepter ce devis ou poser une question :
                  </p>
                  <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px 30px; border-radius: 25px;">
                    <a href="tel:+33123456789" style="color: white; text-decoration: none; font-weight: bold; font-size: 16px;">
                      📞 Appelez-nous : 01 23 45 67 89
                    </a>
                  </div>
                </div>

                <p style="color: #6B7280; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px; text-align: center;">
                  Merci pour votre confiance,<br>
                  <strong>L'équipe de réparation mobile</strong>
                </p>
              </div>

              <!-- Pied de page -->
              <div style="text-align: center; margin-top: 20px; color: white; font-size: 12px;">
                <p style="margin: 0;">© 2024 Réparation Mobile - Service professionnel de réparation</p>
              </div>
            </div>
          `,
          attachments: [{
            filename: `${quoteName}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }]
        });

        console.log('Email sent successfully:', emailResult);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        throw new Error(`Erreur envoi email: ${emailError.message}`);
      }
    }

    // Envoi par SMS (simulation pour l'instant)
    if ((sendMethod === 'sms' || sendMethod === 'both') && recipientPhone) {
      console.log('SMS sending simulated...');
      
      // TODO: Intégrer un service SMS réel (Twilio, etc.)
      smsResult = {
        success: true,
        message: `SMS envoyé au ${recipientPhone}: "📱 Votre devis de réparation est prêt! Consultez votre email ou appelez-nous au 01 23 45 67 89 pour plus d'infos."`
      };
      
      console.log('SMS simulation result:', smsResult);
    }

    const response = {
      success: true,
      message: 'Devis envoyé avec succès',
      details: {
        email: emailResult ? 'Envoyé' : 'Non demandé',
        sms: smsResult ? 'Envoyé' : 'Non demandé'
      }
    };

    console.log('Send quote response:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-quote function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erreur inconnue'
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);