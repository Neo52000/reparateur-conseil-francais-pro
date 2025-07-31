import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    console.log('🔍 Recherche des dossiers QualiRépar incomplets...');

    // Rechercher les dossiers QualiRépar incomplets (créés il y a plus de 3 jours)
    const { data: incompleteDossiers, error: searchError } = await supabase
      .from('qualirepar_dossiers')
      .select(`
        id,
        dossier_number,
        repairer_id,
        status,
        created_at,
        repairer_profiles!inner(
          user_id,
          business_name,
          profiles!inner(
            email,
            first_name,
            last_name
          )
        )
      `)
      .in('status', ['draft', 'incomplete', 'pending_documents'])
      .lt('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

    if (searchError) {
      console.error('❌ Erreur lors de la recherche:', searchError);
      throw searchError;
    }

    console.log(`📊 ${incompleteDossiers?.length || 0} dossiers incomplets trouvés`);

    if (!incompleteDossiers || incompleteDossiers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Aucun dossier incomplet trouvé', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let emailsSent = 0;
    let errors = [];

    for (const dossier of incompleteDossiers) {
      try {
        const repairer = dossier.repairer_profiles;
        const profile = repairer.profiles;
        
        const daysOld = Math.floor(
          (Date.now() - new Date(dossier.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        const getStatusMessage = (status: string) => {
          switch (status) {
            case 'draft':
              return {
                title: "📝 Finalisez votre dossier QualiRépar",
                priority: "Dossier en brouillon",
                action: "Complétez les informations manquantes"
              };
            case 'incomplete':
              return {
                title: "⚠️ Dossier QualiRépar incomplet",
                priority: "Informations manquantes",
                action: "Ajoutez les documents requis"
              };
            case 'pending_documents':
              return {
                title: "📎 Documents manquants - QualiRépar",
                priority: "Justificatifs requis",
                action: "Uploadez vos certificats et attestations"
              };
            default:
              return {
                title: "🔄 Finalisez votre certification QualiRépar",
                priority: "Action requise",
                action: "Complétez votre dossier"
              };
          }
        };

        const { title, priority, action } = getStatusMessage(dossier.status);

        const { error: emailError } = await resend.emails.send({
          from: 'QualiRépar Certification <qualirepar@irepair-pro.fr>',
          to: [profile.email],
          subject: title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 24px;">🏆 QualiRépar</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Certification de qualité</p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                <h2 style="color: #856404; margin: 0 0 10px 0;">⏰ ${priority}</h2>
                <p style="color: #856404; margin: 0;">Votre dossier n°${dossier.dossier_number} attend votre attention depuis ${daysOld} jours.</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                <h3 style="color: #333; margin: 0 0 15px 0;">Bonjour ${profile.first_name || 'cher réparateur'},</h3>
                
                <p style="line-height: 1.6; margin-bottom: 15px;">
                  Votre demande de certification QualiRépar est en cours mais nécessite votre intervention pour être finalisée.
                </p>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #1976d2; margin: 0 0 10px 0;">📋 Action requise :</h4>
                  <p style="color: #1976d2; margin: 0; font-weight: bold;">${action}</p>
                </div>
                
                <h4 style="color: #333; margin: 20px 0 10px 0;">🎯 Avantages de la certification QualiRépar :</h4>
                <ul style="line-height: 1.8; color: #555;">
                  <li>✅ Badge de confiance visible sur votre profil</li>
                  <li>📈 Amélioration de votre visibilité</li>
                  <li>🏆 Reconnaissance officielle de votre expertise</li>
                  <li>💰 Accès aux aides financières gouvernementales</li>
                  <li>🔝 Positionnement prioritaire dans les résultats</li>
                </ul>
                
                <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #f57c00; margin: 0; font-weight: bold;">
                    ⚡ Finalisez maintenant pour ne pas perdre votre avancement !
                  </p>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${supabaseUrl.replace('/rest/v1', '')}/repairer/qualirepar?dossier=${dossier.id}" 
                   style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
                  🚀 Finaliser mon dossier
                </a>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; color: #666; font-size: 14px;">
                <p style="margin: 0 0 10px 0;">💡 Besoin d'aide ? Notre équipe est là pour vous accompagner</p>
                <p style="margin: 0;">📧 support@irepair-pro.fr | 📞 01 23 45 67 89</p>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                <p>Dossier n°${dossier.dossier_number} - ${repairer.business_name || 'Votre entreprise'}</p>
                <p>© 2024 QualiRépar - Programme officiel de certification</p>
              </div>
            </div>
          `
        });

        if (emailError) {
          console.error(`❌ Erreur email pour ${profile.email}:`, emailError);
          errors.push({ email: profile.email, error: emailError.message });
        } else {
          console.log(`✅ Email envoyé à ${profile.email} pour le dossier ${dossier.dossier_number}`);
          emailsSent++;

          // Log de l'action
          await supabase
            .from('admin_analytics')
            .insert({
              metric_type: 'qualirepar_relaunch_sent',
              value: 1,
              metric_data: {
                dossier_id: dossier.id,
                dossier_number: dossier.dossier_number,
                status: dossier.status,
                days_old: daysOld,
                repairer_id: dossier.repairer_id
              }
            });
        }

        // Délai entre les envois
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (emailError) {
        console.error(`❌ Erreur pour le dossier ${dossier.id}:`, emailError);
        errors.push({ dossierId: dossier.id, error: emailError.message });
      }
    }

    console.log(`📧 Relances QualiRépar terminées: ${emailsSent} emails envoyés, ${errors.length} erreurs`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Relances QualiRépar envoyées avec succès`,
        emailsSent,
        totalIncomplete: incompleteDossiers.length,
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
        error: 'Erreur lors de l\'envoi des relances QualiRépar',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});