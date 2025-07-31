import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InactiveRepairer {
  id: string;
  user_id: string;
  email: string;
  business_name: string;
  first_name: string;
  last_name: string;
  last_login: string;
  days_inactive: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    console.log('🔍 Recherche des réparateurs inactifs...');

    // Rechercher les réparateurs inactifs (pas de connexion depuis 7+ jours)
    const { data: inactiveRepairers, error: searchError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        last_sign_in_at,
        role
      `)
      .eq('role', 'repairer')
      .lt('last_sign_in_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (searchError) {
      console.error('❌ Erreur lors de la recherche:', searchError);
      throw searchError;
    }

    console.log(`📊 ${inactiveRepairers?.length || 0} réparateurs inactifs trouvés`);

    if (!inactiveRepairers || inactiveRepairers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Aucun réparateur inactif trouvé', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let emailsSent = 0;
    let errors = [];

    // Envoyer des emails de relance
    for (const repairer of inactiveRepairers) {
      try {
        const daysSinceLastLogin = Math.floor(
          (Date.now() - new Date(repairer.last_sign_in_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Personnaliser le message selon la durée d'inactivité
        const getRelaunchMessage = (days: number) => {
          if (days <= 14) {
            return {
              subject: "📱 Vos clients vous attendent !",
              message: `Bonjour ${repairer.first_name || 'cher réparateur'},

Cela fait ${days} jours que vous ne vous êtes pas connecté à votre espace réparateur.

Vos clients potentiels continuent de chercher des services de réparation dans votre secteur. Ne manquez pas ces opportunités !

🔧 Connectez-vous pour :
• Consulter vos nouvelles demandes de devis
• Mettre à jour vos disponibilités
• Gérer vos rendez-vous

Votre activité régulière améliore votre visibilité dans les résultats de recherche.`
            };
          } else if (days <= 30) {
            return {
              subject: "⚠️ Votre profil devient moins visible",
              message: `Bonjour ${repairer.first_name || 'cher réparateur'},

Votre dernière connexion remonte à ${days} jours. Par mesure de qualité de service, votre profil devient progressivement moins visible dans les recherches.

💡 Reconnectez-vous rapidement pour :
• Maintenir votre visibilité
• Accéder aux nouvelles fonctionnalités
• Recevoir vos demandes de devis prioritaires

Quelques minutes suffisent pour réactiver votre compte !`
            };
          } else {
            return {
              subject: "🚨 Compte inactif - Risque de suspension",
              message: `Bonjour ${repairer.first_name || 'cher réparateur'},

Votre compte est inactif depuis ${days} jours. Pour maintenir la qualité de notre plateforme, les comptes inactifs peuvent être suspendus.

🔄 Actions requises :
• Connexion immédiate à votre espace
• Mise à jour de vos informations
• Confirmation de votre activité

Ne perdez pas vos clients ! Reconnectez-vous maintenant.`
            };
          }
        };

        const { subject, message } = getRelaunchMessage(daysSinceLastLogin);

        const { error: emailError } = await resend.emails.send({
          from: 'IRepair Pro <noreply@irepair-pro.fr>',
          to: [repairer.email],
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #007bff, #00d4ff); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 24px;">🔧 IRepair Pro</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre plateforme de réparation</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0; line-height: 1.6;">${message}</pre>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${supabaseUrl.replace('/rest/v1', '')}/repairer" 
                   style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  🚀 Se connecter maintenant
                </a>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
                <p>Vous recevez cet email car vous êtes inscrit sur IRepair Pro</p>
                <p>© 2024 IRepair Pro - Tous droits réservés</p>
              </div>
            </div>
          `
        });

        if (emailError) {
          console.error(`❌ Erreur email pour ${repairer.email}:`, emailError);
          errors.push({ email: repairer.email, error: emailError.message });
        } else {
          console.log(`✅ Email envoyé à ${repairer.email}`);
          emailsSent++;

          // Log de l'action
          await supabase
            .from('admin_analytics')
            .insert({
              metric_type: 'relaunch_email_sent',
              value: 1,
              metric_data: {
                repairer_id: repairer.id,
                days_inactive: daysSinceLastLogin,
                email: repairer.email
              }
            });
        }

        // Délai entre les envois pour éviter le spam
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (emailError) {
        console.error(`❌ Erreur pour le réparateur ${repairer.id}:`, emailError);
        errors.push({ repairerId: repairer.id, error: emailError.message });
      }
    }

    console.log(`📧 Relances terminées: ${emailsSent} emails envoyés, ${errors.length} erreurs`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Relances envoyées avec succès`,
        emailsSent,
        totalInactive: inactiveRepairers.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de l\'envoi des relances',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});