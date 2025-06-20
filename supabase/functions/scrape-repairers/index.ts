
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './constants.ts'
import { EnhancedClassifier } from './enhanced-classifier.ts'
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

    // L'API Gouvernement est gratuite et toujours disponible
    console.log('✅ Vérification API Recherche d\'Entreprises (Gouvernement) activée');

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
    let itemsGouvernementVerified = 0
    let itemsGouvernementRejected = 0
    let gouvernementApiCalls = 0

    // Initialiser le classifier amélioré avec l'API Gouvernement
    const enhancedClassifier = new EnhancedClassifier(supabase)

    console.log(`📊 Traitement de ${scrapedData.length} entreprises${departmentCode ? ` pour le département ${departmentCode}` : ''}...`)

    for (const [index, data] of scrapedData.entries()) {
      // Anti-blocage : délai aléatoire entre chaque traitement
      if (index > 0) {
        await sleep(randomDelay())
      }

      console.log(`🔄 Analyse ${index + 1}/${scrapedData.length}: ${data.name}`)
      
      // Classification avec l'API Gouvernement
      const analysis = await enhancedClassifier.classifyRepairerWithGouvernement(data)
      
      if (analysis.verification_method !== 'not_needed' && analysis.verification_method !== 'error') {
        gouvernementApiCalls++
      }
      if (analysis.gouvernement_verified) {
        itemsGouvernementVerified++
      }
      if (analysis.gouvernement_verified && !analysis.is_repairer) {
        itemsGouvernementRejected++
      }
      
      console.log(`📊 Résultat ${data.name}:`, {
        is_repairer: analysis.is_repairer,
        confidence: analysis.confidence,
        gouvernement_verified: analysis.gouvernement_verified || false,
        business_status: analysis.business_status || 'unknown'
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

        // Utiliser les coordonnées GPS précises si disponibles, sinon fallback sur département
        let finalLat = data.lat;
        let finalLng = data.lng;
        
        if (!finalLat || !finalLng) {
          const departmentFromPostal = data.postal_code.substring(0, 2)
          const coords = getDepartmentCoordinates(departmentFromPostal)
          finalLat = coords.lat + (Math.random() - 0.5) * 0.01
          finalLng = coords.lng + (Math.random() - 0.5) * 0.01
        }

        const now = new Date().toISOString()

        const repairerData = {
          name: data.name,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          department: data.postal_code.substring(0, 2) === '75' ? 'Paris' : getDepartmentCoordinates(data.postal_code.substring(0, 2)).name,
          region: getDepartmentCoordinates(data.postal_code.substring(0, 2)).region,
          phone: data.phone,
          email: data.email,
          website: data.website,
          lat: finalLat,
          lng: finalLng,
          services: analysis.services,
          specialties: analysis.specialties,
          price_range: analysis.price_range,
          source,
          is_open: analysis.is_open,
          scraped_at: now,
          updated_at: now,
          // Données de vérification gouvernementale
          siret: analysis.siret || null,
          siren: analysis.siren || null,
          pappers_verified: analysis.gouvernement_verified || false,
          pappers_last_check: analysis.gouvernement_verified ? now : null,
          business_status: analysis.business_status || 'unknown'
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
        const reason = !analysis.is_repairer 
          ? `Non-réparateur (confiance: ${analysis.confidence})`
          : analysis.gouvernement_verified && analysis.business_status === 'closed'
          ? 'Entreprise fermée (API Gouvernement)'
          : `Confiance insuffisante: ${analysis.confidence}`
        
        console.log(`❌ ${reason}: ${data.name}`)
      }
    }

    // Mettre à jour le log de succès avec les statistiques
    await supabase
      .from('scraping_logs')
      .update({
        status: 'completed',
        items_scraped: scrapedData.length,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        items_pappers_verified: itemsGouvernementVerified,
        items_pappers_rejected: itemsGouvernementRejected,
        pappers_api_calls: gouvernementApiCalls,
        completed_at: new Date().toISOString()
      })
      .eq('id', logData.id)

    console.log(`🎉 Scraping ${testMode ? 'TEST' : 'MASSIF'} terminé:`)
    console.log(`   - ${itemsAdded} ajoutés, ${itemsUpdated} mis à jour sur ${scrapedData.length} traités`)
    console.log(`   - ${itemsGouvernementVerified} vérifiés par l'API Gouvernement, ${itemsGouvernementRejected} rejetés`)
    console.log(`   - ${gouvernementApiCalls} appels API Gouvernement effectués`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Scraping ${testMode ? 'TEST' : 'MASSIF'} ${source} terminé avec succès`,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        items_scraped: scrapedData.length,
        items_gouvernement_verified: itemsGouvernementVerified,
        items_gouvernement_rejected: itemsGouvernementRejected,
        gouvernement_api_calls: gouvernementApiCalls,
        department: departmentCode,
        classification_method: 'Mots-clés + Vérification API Recherche d\'Entreprises (Gouvernement) + Géolocalisation Précise'
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
