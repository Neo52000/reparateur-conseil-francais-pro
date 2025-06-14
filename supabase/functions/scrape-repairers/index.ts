
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')
    if (!mistralApiKey) {
      throw new Error('MISTRAL_API_KEY not configured')
    }

    const { source } = await req.json()
    
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

    if (logError) throw logError

    console.log(`Starting scraping for source: ${source}`)

    // Analyser avec Mistral AI pour classifier les données
    const analyzeWithMistral = async (businessData: any) => {
      try {
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

        if (!response.ok) {
          console.error('Mistral API error:', response.status, await response.text())
          return null
        }

        const data = await response.json()
        const aiAnalysis = JSON.parse(data.choices[0].message.content)
        console.log('Mistral AI analysis:', aiAnalysis)
        return aiAnalysis
      } catch (error) {
        console.error('Error with Mistral AI analysis:', error)
        return null
      }
    }

    // Simuler le scraping avec des données de test enrichies par IA
    const mockScrapedData = [
      {
        name: 'Tech Repair Pro ' + source,
        address: '123 Rue de la République',
        city: 'Paris',
        postal_code: '75001',
        phone: '+33 1 23 45 67 89',
        email: 'contact@techrepair.fr',
        website: 'https://techrepair.fr',
        description: 'Spécialiste réparation iPhone, Samsung, écrans cassés, batteries'
      },
      {
        name: 'Mobile Fix Express',
        address: '456 Avenue des Champs',
        city: 'Lyon',
        postal_code: '69001',
        phone: '+33 4 78 90 12 34',
        email: 'info@mobilefix.fr',
        description: 'Réparation rapide smartphones, tablettes, ordinateurs portables'
      },
      {
        name: 'Boulangerie du Coin',
        address: '789 Rue de la Paix',
        city: 'Marseille',
        postal_code: '13001',
        phone: '+33 4 91 23 45 67',
        description: 'Boulangerie artisanale, pain frais, viennoiseries'
      }
    ]

    let itemsAdded = 0
    let itemsUpdated = 0

    for (const scrapedData of mockScrapedData) {
      console.log(`Analyzing: ${scrapedData.name}`)
      
      // Analyser avec Mistral AI
      const aiAnalysis = await analyzeWithMistral(scrapedData)
      
      // Ne traiter que si c'est identifié comme un réparateur
      if (aiAnalysis && aiAnalysis.is_repairer && aiAnalysis.confidence > 0.7) {
        console.log(`Identified as repairer: ${scrapedData.name}`)
        
        // Vérifier si le réparateur existe déjà
        const { data: existingRepairer } = await supabase
          .from('repairers')
          .select('id, is_open')
          .eq('name', scrapedData.name)
          .eq('address', scrapedData.address)
          .eq('city', scrapedData.city)
          .single()

        const repairerData = {
          name: scrapedData.name,
          address: scrapedData.address,
          city: scrapedData.city,
          postal_code: scrapedData.postal_code,
          department: scrapedData.city === 'Paris' ? 'Paris' : scrapedData.city === 'Lyon' ? 'Rhône' : 'Bouches-du-Rhône',
          region: scrapedData.city === 'Paris' ? 'Île-de-France' : scrapedData.city === 'Lyon' ? 'Auvergne-Rhône-Alpes' : 'Provence-Alpes-Côte d\'Azur',
          phone: scrapedData.phone,
          email: scrapedData.email,
          website: scrapedData.website,
          lat: scrapedData.city === 'Paris' ? 48.8566 : scrapedData.city === 'Lyon' ? 45.7640 : 43.2965,
          lng: scrapedData.city === 'Paris' ? 2.3522 : scrapedData.city === 'Lyon' ? 4.8357 : 5.3698,
          services: aiAnalysis.services || ['Réparation smartphone'],
          specialties: aiAnalysis.specialties || ['iPhone', 'Samsung'],
          price_range: aiAnalysis.price_range || 'medium',
          source,
          is_open: aiAnalysis.is_open,
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
            console.log(`Updated repairer: ${scrapedData.name}`)
          } else {
            console.error('Error updating repairer:', updateError)
          }
        } else {
          // Créer un nouveau réparateur
          const { error: insertError } = await supabase
            .from('repairers')
            .insert(repairerData)

          if (!insertError) {
            itemsAdded++
            console.log(`Added new repairer: ${scrapedData.name}`)
          } else {
            console.error('Error inserting repairer:', insertError)
          }
        }
      } else {
        console.log(`Not a repairer or low confidence: ${scrapedData.name}`)
      }
    }

    // Mettre à jour le log
    await supabase
      .from('scraping_logs')
      .update({
        status: 'completed',
        items_scraped: mockScrapedData.length,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        completed_at: new Date().toISOString()
      })
      .eq('id', logData.id)

    console.log(`Scraping completed: ${itemsAdded} added, ${itemsUpdated} updated`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Scraping ${source} terminé avec succès`,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        items_scraped: mockScrapedData.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in scrape-repairers function:', error)
    
    // Mettre à jour le log en cas d'erreur
    const { source } = await req.json().catch(() => ({ source: 'unknown' }))
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        source 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    )
  }
})
