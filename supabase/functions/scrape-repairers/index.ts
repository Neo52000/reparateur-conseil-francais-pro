
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Utiliser la clé service_role pour éviter les problèmes RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!mistralApiKey && !openaiApiKey) {
      throw new Error('Aucune clé API configurée (MISTRAL_API_KEY ou OPENAI_API_KEY)')
    }

    const { source } = await req.json()
    
    console.log(`🚀 Démarrage du scraping pour source: ${source}`)

    // Créer un log de scraping
    const { data: logData, error: logError } = await supabase
      .from('scraping_logs')
      .insert({
        source,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (logError) {
      console.error('❌ Erreur création log:', logError)
      throw logError
    }

    console.log(`✅ Log créé avec succès: ${logData.id}`)

    // Analyser avec IA (Mistral en priorité, OpenAI en fallback)
    const analyzeWithAI = async (businessData: any) => {
      const prompt = `Analyse ces données d'entreprise et détermine s'il s'agit d'un réparateur de téléphones/électronique. 
      Données: ${JSON.stringify(businessData)}
      
      Réponds UNIQUEMENT par un JSON avec cette structure:
      {
        "is_repairer": boolean,
        "services": ["service1", "service2"],
        "specialties": ["specialty1", "specialty2"],
        "price_range": "low|medium|high",
        "confidence": 0.0-1.0,
        "is_open": boolean
      }`

      // Essayer d'abord Mistral AI
      if (mistralApiKey) {
        try {
          console.log('🤖 Tentative d\'analyse avec Mistral AI...')
          const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${mistralApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'mistral-small-latest',
              messages: [
                {
                  role: 'system',
                  content: 'Tu es un expert en classification d\'entreprises spécialisé dans l\'identification des réparateurs de téléphones et d\'électronique. Réponds uniquement en JSON valide.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.1,
              max_tokens: 500
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const aiAnalysis = JSON.parse(data.choices[0].message.content)
            console.log('✅ Analyse Mistral AI réussie:', aiAnalysis)
            return aiAnalysis
          } else {
            console.error('❌ Erreur Mistral API:', response.status, await response.text())
          }
        } catch (error) {
          console.error('❌ Erreur Mistral AI:', error)
        }
      }

      // Fallback vers OpenAI
      if (openaiApiKey) {
        try {
          console.log('🤖 Fallback vers OpenAI...')
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'Tu es un expert en classification d\'entreprises spécialisé dans l\'identification des réparateurs de téléphones et d\'électronique. Réponds uniquement en JSON valide.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.1,
              max_tokens: 500
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const aiAnalysis = JSON.parse(data.choices[0].message.content)
            console.log('✅ Analyse OpenAI réussie:', aiAnalysis)
            return aiAnalysis
          } else {
            console.error('❌ Erreur OpenAI API:', response.status, await response.text())
          }
        } catch (error) {
          console.error('❌ Erreur OpenAI:', error)
        }
      }

      return null
    }

    // Scraper spécialisé pour Pages Jaunes
    const scrapePagesJaunes = async () => {
      console.log('🔍 Scraping Pages Jaunes...')
      
      // Simulation réaliste de scraping Pages Jaunes avec des données plus variées
      return [
        {
          name: 'iPhone Repair Paris',
          address: '15 Rue de Rivoli',
          city: 'Paris',
          postal_code: '75001',
          phone: '+33 1 42 60 30 88',
          email: 'contact@iphonerepairparis.fr',
          website: 'https://iphonerepairparis.fr',
          description: 'Réparation iPhone, iPad, MacBook. Écrans, batteries, carte mère. Diagnostic gratuit.',
          category: 'Réparation téléphone'
        },
        {
          name: 'Mobile Doctor Lyon',
          address: '28 Cours Franklin Roosevelt',
          city: 'Lyon',
          postal_code: '69006',
          phone: '+33 4 78 52 41 63',
          email: 'info@mobiledoctor-lyon.fr',
          description: 'Spécialiste réparation smartphones toutes marques. Samsung, Huawei, Xiaomi.',
          category: 'Réparation mobile'
        },
        {
          name: 'TechFix Marseille',
          address: '5 La Canebière',
          city: 'Marseille',
          postal_code: '13001',
          phone: '+33 4 91 54 02 17',
          website: 'https://techfix-marseille.com',
          description: 'Réparation express téléphones, tablettes, ordinateurs portables.',
          category: 'Service informatique'
        },
        {
          name: 'Boulangerie du Soleil',
          address: '12 Avenue de la République',
          city: 'Nice',
          postal_code: '06000',
          phone: '+33 4 93 85 16 42',
          description: 'Boulangerie artisanale, pain bio, pâtisseries maison.',
          category: 'Boulangerie'
        },
        {
          name: 'Smart Repair Toulouse',
          address: '33 Rue Alsace Lorraine',
          city: 'Toulouse',
          postal_code: '31000',
          phone: '+33 5 61 23 45 67',
          email: 'contact@smartrepair.toulouse',
          description: 'Réparation smartphones, déblocage, récupération données.',
          category: 'Réparation électronique'
        }
      ]
    }

    // Obtenir les données selon la source
    let scrapedData = []
    
    if (source === 'pages_jaunes') {
      scrapedData = await scrapePagesJaunes()
    } else {
      // Pour les autres sources, utiliser des données de test
      scrapedData = [
        {
          name: `Test Repair ${source}`,
          address: '123 Rue de Test',
          city: 'Paris',
          postal_code: '75001',
          phone: '+33 1 23 45 67 89',
          description: `Réparateur test pour source ${source}`
        }
      ]
    }

    let itemsAdded = 0
    let itemsUpdated = 0
    let itemsProcessed = 0

    console.log(`📊 Traitement de ${scrapedData.length} entreprises...`)

    for (const data of scrapedData) {
      itemsProcessed++
      console.log(`🔄 Analyse ${itemsProcessed}/${scrapedData.length}: ${data.name}`)
      
      // Analyser avec IA
      const aiAnalysis = await analyzeWithAI(data)
      
      // Ne traiter que si c'est identifié comme un réparateur avec une bonne confiance
      if (aiAnalysis && aiAnalysis.is_repairer && aiAnalysis.confidence > 0.6) {
        console.log(`✅ Réparateur identifié: ${data.name} (confiance: ${aiAnalysis.confidence})`)
        
        // Vérifier si le réparateur existe déjà
        const { data: existingRepairer } = await supabase
          .from('repairers')
          .select('id')
          .eq('name', data.name)
          .eq('address', data.address)
          .eq('city', data.city)
          .single()

        const repairerData = {
          name: data.name,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          department: data.city === 'Paris' ? 'Paris' : 
                     data.city === 'Lyon' ? 'Rhône' : 
                     data.city === 'Marseille' ? 'Bouches-du-Rhône' :
                     data.city === 'Nice' ? 'Alpes-Maritimes' :
                     data.city === 'Toulouse' ? 'Haute-Garonne' : 'France',
          region: data.city === 'Paris' ? 'Île-de-France' : 
                  data.city === 'Lyon' ? 'Auvergne-Rhône-Alpes' : 
                  data.city === 'Marseille' ? 'Provence-Alpes-Côte d\'Azur' :
                  data.city === 'Nice' ? 'Provence-Alpes-Côte d\'Azur' :
                  data.city === 'Toulouse' ? 'Occitanie' : 'France',
          phone: data.phone,
          email: data.email,
          website: data.website,
          lat: data.city === 'Paris' ? 48.8566 : 
               data.city === 'Lyon' ? 45.7640 : 
               data.city === 'Marseille' ? 43.2965 :
               data.city === 'Nice' ? 43.7102 :
               data.city === 'Toulouse' ? 43.6047 : 46.2276,
          lng: data.city === 'Paris' ? 2.3522 : 
               data.city === 'Lyon' ? 4.8357 : 
               data.city === 'Marseille' ? 5.3698 :
               data.city === 'Nice' ? 7.2620 :
               data.city === 'Toulouse' ? 1.4442 : 2.2137,
          services: aiAnalysis.services || ['Réparation smartphone'],
          specialties: aiAnalysis.specialties || ['iPhone', 'Samsung'],
          price_range: aiAnalysis.price_range || 'medium',
          source,
          is_open: aiAnalysis.is_open !== undefined ? aiAnalysis.is_open : true,
          updated_at: new Date().toISOString()
        }

        if (existingRepairer) {
          // Mettre à jour le réparateur existant
          const { error: updateError } = await supabase
            .from('repairers')
            .update(repairerData)
            .eq('id', existingRepairer.id)

          if (!updateError) {
            itemsUpdated++
            console.log(`🔄 Réparateur mis à jour: ${data.name}`)
          } else {
            console.error('❌ Erreur mise à jour:', updateError)
          }
        } else {
          // Créer un nouveau réparateur
          const { error: insertError } = await supabase
            .from('repairers')
            .insert(repairerData)

          if (!insertError) {
            itemsAdded++
            console.log(`➕ Nouveau réparateur ajouté: ${data.name}`)
          } else {
            console.error('❌ Erreur insertion:', insertError)
          }
        }
      } else {
        const confidence = aiAnalysis?.confidence || 0
        console.log(`❌ Non-réparateur ou confiance faible: ${data.name} (confiance: ${confidence})`)
      }
    }

    // Mettre à jour le log de succès
    await supabase
      .from('scraping_logs')
      .update({
        status: 'completed',
        items_scraped: scrapedData.length,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        completed_at: new Date().toISOString()
      })
      .eq('id', logData.id)

    console.log(`🎉 Scraping terminé: ${itemsAdded} ajoutés, ${itemsUpdated} mis à jour sur ${scrapedData.length} traités`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Scraping ${source} terminé avec succès`,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        items_scraped: scrapedData.length,
        ai_provider: mistralApiKey ? 'Mistral AI' : 'OpenAI'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('💥 Erreur dans scrape-repairers:', error)
    
    // Mettre à jour le log en cas d'erreur
    try {
      const { source } = await req.json().catch(() => ({ source: 'unknown' }))
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      )
      
      await supabase
        .from('scraping_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('source', source)
        .eq('status', 'running')
    } catch (logError) {
      console.error('❌ Erreur mise à jour log:', logError)
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Consultez les logs pour plus de détails'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})
