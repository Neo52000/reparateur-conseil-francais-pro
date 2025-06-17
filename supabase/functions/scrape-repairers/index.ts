
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, userAgents } from './constants.ts'
import { classifyRepairer } from './classifier.ts'
import { getDepartmentCoordinates } from './geography.ts'
import { getMassiveRepairersData } from './data-sources.ts'
import { randomDelay, sleep } from './utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { source, testMode = false, departmentCode = null } = await req.json()
    
    console.log(`🚀 Démarrage du scraping ${testMode ? 'TEST' : 'MASSIF'} pour source: ${source}${departmentCode ? ` - Département: ${departmentCode}` : ''}`)

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

    const scrapedData = getMassiveRepairersData(source, testMode, departmentCode)
    let itemsAdded = 0
    let itemsUpdated = 0

    console.log(`📊 Traitement de ${scrapedData.length} entreprises${departmentCode ? ` pour le département ${departmentCode}` : ''}...`)

    for (const [index, data] of scrapedData.entries()) {
      // Anti-blocage : délai aléatoire entre chaque traitement
      if (index > 0) {
        await sleep(randomDelay())
      }

      console.log(`🔄 Analyse ${index + 1}/${scrapedData.length}: ${data.name}`)
      
      // Classification par mots-clés
      const analysis = classifyRepairer(data)
      
      console.log(`📊 Résultat ${data.name}:`, {
        is_repairer: analysis.is_repairer,
        confidence: analysis.confidence
      })
      
      if (analysis.is_repairer && analysis.confidence > 0.5) {
        console.log(`✅ Réparateur identifié: ${data.name}`)
        
        // Vérifier si le réparateur existe déjà (par nom + ville pour éviter doublons)
        const { data: existingRepairer } = await supabase
          .from('repairers')
          .select('id')
          .eq('name', data.name)
          .eq('city', data.city)
          .maybeSingle()

        // Coordonnées GPS basées sur le département ou la ville
        const departmentFromPostal = data.postal_code.substring(0, 2)
        const coords = getDepartmentCoordinates(departmentFromPostal)
        const now = new Date().toISOString()

        const repairerData = {
          name: data.name,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          department: coords.name,
          region: coords.region,
          phone: data.phone,
          email: data.email,
          website: data.website,
          lat: coords.lat + (Math.random() - 0.5) * 0.01, // Petite variation
          lng: coords.lng + (Math.random() - 0.5) * 0.01,
          services: analysis.services,
          specialties: analysis.specialties,
          price_range: analysis.price_range,
          source,
          is_open: analysis.is_open,
          scraped_at: now,
          updated_at: now
        }

        if (existingRepairer) {
          // Mettre à jour
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
          // Créer nouveau
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
        console.log(`❌ Non-réparateur: ${data.name} (confiance: ${analysis.confidence})`)
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

    console.log(`🎉 Scraping ${testMode ? 'TEST' : 'MASSIF'} terminé: ${itemsAdded} ajoutés, ${itemsUpdated} mis à jour sur ${scrapedData.length} traités`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Scraping ${testMode ? 'TEST' : 'MASSIF'} ${source} terminé avec succès`,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        items_scraped: scrapedData.length,
        department: departmentCode,
        classification_method: 'Mots-clés + Géolocalisation automatique'
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
