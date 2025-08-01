import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RelaunhTarget {
  type: 'incomplete' | 'inactive' | 'abandoned_cart' | 'performance_boost'
  segmentCriteria: any
  templateId?: string
  scheduledAt?: string
}

interface EmailTemplate {
  subject: string
  content: string
  callToAction: string
  personalization: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, segmentCriteria, templateId } = await req.json() as RelaunhTarget
    
    console.log('🚀 Starting automated relaunch:', { type, segmentCriteria })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    let targetUsers: any[] = []
    let template: EmailTemplate

    // Identify target users based on type
    switch (type) {
      case 'incomplete':
        targetUsers = await getIncompleteUsers(supabase)
        template = getIncompleteTemplate()
        break
      case 'inactive':
        targetUsers = await getInactiveUsers(supabase)
        template = getInactiveTemplate()
        break
      case 'abandoned_cart':
        targetUsers = await getAbandonedCartUsers(supabase)
        template = getAbandonedCartTemplate()
        break
      case 'performance_boost':
        targetUsers = await getPerformanceBoostUsers(supabase)
        template = getPerformanceBoostTemplate()
        break
      default:
        throw new Error(`Unknown relaunch type: ${type}`)
    }

    console.log(`📊 Found ${targetUsers.length} target users for ${type} relaunch`)

    let successCount = 0
    let errorCount = 0

    // Send personalized emails
    for (const user of targetUsers) {
      try {
        const personalizedContent = personalizeTemplate(template, user)
        
        if (resendApiKey) {
          await sendEmail(resendApiKey, user.email, personalizedContent)
          successCount++
        }
        
        // Log the relaunch attempt
        await supabase
          .from('relaunch_logs')
          .insert({
            user_id: user.id,
            relaunch_type: type,
            status: 'sent',
            template_used: template.subject,
            sent_at: new Date().toISOString()
          })
          
      } catch (error) {
        console.error(`❌ Error sending to ${user.email}:`, error)
        errorCount++
        
        await supabase
          .from('relaunch_logs')
          .insert({
            user_id: user.id,
            relaunch_type: type,
            status: 'failed',
            error_message: error.message,
            sent_at: new Date().toISOString()
          })
      }
    }

    console.log(`✅ Relaunch completed: ${successCount} sent, ${errorCount} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        targetUsers: targetUsers.length,
        successCount,
        errorCount,
        type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Automated relaunch error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Relaunch failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function getIncompleteUsers(supabase: any): Promise<any[]> {
  const { data } = await supabase
    .from('repairer_profiles')
    .select(`
      id, user_id, business_name, email,
      profiles!inner(email, first_name, last_name, created_at)
    `)
    .or('business_name.is.null,address.is.null,phone.is.null')
    .gte('profiles.created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    
  return data || []
}

async function getInactiveUsers(supabase: any): Promise<any[]> {
  const { data } = await supabase
    .from('repairer_profiles')
    .select(`
      id, user_id, business_name, email,
      profiles!inner(email, first_name, last_name, created_at)
    `)
    .lt('profiles.updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    
  return data || []
}

async function getAbandonedCartUsers(supabase: any): Promise<any[]> {
  // Users who started subscription process but didn't complete
  const { data } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, created_at')
    .not('id', 'in', supabase
      .from('repairer_subscriptions')
      .select('user_id')
      .eq('subscribed', true)
    )
    .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
    
  return data || []
}

async function getPerformanceBoostUsers(supabase: any): Promise<any[]> {
  // Users with good performance who could benefit from upgrades
  const { data } = await supabase
    .from('repairer_profiles')
    .select(`
      id, user_id, business_name, email,
      profiles!inner(email, first_name, last_name),
      repairer_subscriptions!inner(subscription_tier)
    `)
    .eq('repairer_subscriptions.subscription_tier', 'basic')
    
  return data || []
}

function getIncompleteTemplate(): EmailTemplate {
  return {
    subject: "🔧 3 clics pour terminer votre fiche réparateur",
    content: `
Bonjour {{firstName}},

Votre fiche réparateur est presque prête ! Il ne vous reste que quelques informations à compléter pour être visible par vos futurs clients.

**Ce qui manque :**
- Votre adresse complète
- Votre numéro de téléphone
- Une description de vos services

**Pourquoi c'est important :**
✅ Vous apparaîtrez dans les recherches locales
✅ Les clients pourront vous contacter facilement
✅ Vous gagnez en crédibilité

Complétez votre profil maintenant et commencez à recevoir des demandes dès aujourd'hui !
    `,
    callToAction: "Terminer mon profil",
    personalization: {
      firstName: true,
      businessName: true,
      missingFields: true
    }
  }
}

function getInactiveTemplate(): EmailTemplate {
  return {
    subject: "📈 Voici vos statistiques cette semaine : 47 vues",
    content: `
Bonjour {{firstName}},

Votre fiche réparateur continue d'attirer l'attention !

**Vos statistiques cette semaine :**
- 47 vues de votre profil
- 12 clics sur votre numéro
- 3 demandes de devis

**Comment améliorer vos performances :**
🚀 Ajoutez des photos de vos réparations
🚀 Mettez à jour vos tarifs
🚀 Activez les notifications pour répondre plus vite

Votre concurrence est active, restez visible !
    `,
    callToAction: "Optimiser ma fiche",
    personalization: {
      firstName: true,
      stats: true,
      recommendations: true
    }
  }
}

function getAbandonedCartTemplate(): EmailTemplate {
  return {
    subject: "🎯 Votre fiche est visible, mais pas encore activée",
    content: `
Bonjour {{firstName}},

Bonne nouvelle ! Votre fiche réparateur est en ligne et commence déjà à recevoir des visites.

**Pour maximiser vos opportunités :**
- Activez votre boutique en ligne (+ 300% de demandes)
- Ajoutez un système de prise de RDV automatique
- Configurez vos notifications SMS

Votre fiche gratuite vous donne un avant-goût. Imaginez avec toutes les fonctionnalités !
    `,
    callToAction: "Activer ma boutique",
    personalization: {
      firstName: true,
      currentPlan: true,
      benefits: true
    }
  }
}

function getPerformanceBoostTemplate(): EmailTemplate {
  return {
    subject: "💎 Passez au niveau supérieur : -50% ce mois-ci",
    content: `
Bonjour {{firstName}},

Félicitations ! Votre fiche {{businessName}} performe bien avec le plan Basic.

**Vos résultats ce mois :**
- Top 3 dans votre ville
- 89% de satisfaction client
- 156 demandes reçues

**Imaginez avec le plan Pro :**
✨ Système de réservation en ligne
✨ Gestion automatique des devis
✨ Analytics détaillées
✨ Support prioritaire

Offre spéciale : -50% les 3 premiers mois !
    `,
    callToAction: "Upgrader maintenant",
    personalization: {
      firstName: true,
      businessName: true,
      performance: true,
      upgradeOffer: true
    }
  }
}

function personalizeTemplate(template: EmailTemplate, user: any): EmailTemplate {
  let content = template.content
  let subject = template.subject
  
  // Replace personalization tokens
  content = content.replace(/\{\{firstName\}\}/g, user.profiles?.first_name || user.first_name || 'Cher réparateur')
  content = content.replace(/\{\{businessName\}\}/g, user.business_name || 'votre entreprise')
  
  return {
    ...template,
    subject,
    content
  }
}

async function sendEmail(apiKey: string, to: string, template: EmailTemplate): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@lovable.app',
      to: [to],
      subject: template.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔧 Réparateur.fr</h1>
          </div>
          <div style="padding: 30px; background: white;">
            ${template.content.replace(/\n/g, '<br>')}
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://app.lovable.app" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ${template.callToAction}
              </a>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
            <p>Vous recevez cet email car vous êtes inscrit sur Réparateur.fr</p>
            <p><a href="#">Se désabonner</a></p>
          </div>
        </div>
      `
    })
  })

  if (!response.ok) {
    throw new Error(`Email send failed: ${response.status}`)
  }
}