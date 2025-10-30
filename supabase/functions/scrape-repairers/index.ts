
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './constants.ts'
import { EnhancedClassifier } from './enhanced-classifier.ts'
import { getDepartmentCoordinates } from './geography.ts'
import { RealScrapingService } from './real-scraping-service.ts'
import { randomDelay, sleep } from './utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ✅ SÉCURITÉ: Vérification de l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Tentative d\'accès non authentifiée au scraping');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un client Supabase avec le token utilisateur
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Vérifier que l'utilisateur est authentifié
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('❌ Token invalide:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SÉCURITÉ: Vérification du rôle admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single();

    if (roleError || !roleData) {
      console.error('❌ Accès refusé: utilisateur non-admin', { userId: user.id });
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Accès autorisé pour l'admin: ${user.email}`);

    // Client admin pour les opérations de scraping
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { source, testMode = false, departmentCode = null, useRealScraping = true } = await req.json()
    
    console.log(`🚀 Démarrage du scraping ${testMode ? 'TEST' : 'MASSIF'} pour source: ${source}${departmentCode ? ` - Département: ${departmentCode}` : ''}`)
    console.log(`🔧 Mode scraping réel: ${useRealScraping ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`)

    // Vérifier la clé API Firecrawl si le scraping réel est activé
    if (useRealScraping && !Deno.env.get('FIRECRAWL_API_KEY')) {
      console.warn('⚠️ Clé API Firecrawl manquante - utilisation des données de test');
    }

    // 🔒 Log de sécurité: tracer l'action admin
    await supabase
      .from('admin_audit_logs')
      .insert({
        user_id: user.id,
        action: 'scraping_initiated',
        resource: `scrape-repairers/${source}`,
        details: { source, testMode, departmentCode, useRealScraping }
      })
      .then(() => console.log('🔒 Audit log créé'))
      .catch(err => console.warn('⚠️ Erreur audit log:', err));

    const { data: logData, error: logError } = await supabase
      .from('scraping_logs')
      .insert({
        source,
        status: 'running',
        started_at: new Date().toISOString(),
        initiated_by: user.id
      })
      .select()
      .single()

    if (logError) {
      console.error('❌ Erreur création log:', logError)
      throw logError
    }

    console.log(`✅ Log créé avec succès: ${logData.id}`)

    let scrapedData;
    
    if (useRealScraping && Deno.env.get('FIRECRAWL_API_KEY')) {
      // Utiliser le vrai scraping avec Firecrawl
      console.log('🌐 Utilisation du scraping réel avec Firecrawl');
      scrapedData = await RealScrapingService.scrapeRealData(source, departmentCode);
      
      if (testMode) {
        scrapedData = scrapedData.slice(0, 5);
      }
    } else {
      // Fallback vers les données de test existantes
      console.log('📝 Utilisation des données de test (fallback)');
      const { getMassiveRepairersData } = await import('./data-sources.ts');
      scrapedData = getMassiveRepairersData(source, testMode, departmentCode);
    }

    let itemsAdded = 0
    let itemsUpdated = 0
    let itemsGouvernementVerified = 0
    let itemsGouvernementRejected = 0
    let gouvernementApiCalls = 0

    const enhancedClassifier = new EnhancedClassifier(supabase)

    console.log(`📊 Traitement de ${scrapedData.length} entreprises${departmentCode ? ` pour le département ${departmentCode}` : ''}...`)

    for (const [index, data] of scrapedData.entries()) {
      if (index > 0) {
        await sleep(randomDelay())
      }

      console.log(`🔄 Analyse ${index + 1}/${scrapedData.length}: ${data.name}`)
      
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
        business_status: analysis.business_status || 'unknown',
        coordinates: data.lat && data.lng ? `${data.lat}, ${data.lng}` : 'Calculées'
      })
      
      if (analysis.is_repairer && analysis.confidence > 0.5) {
        console.log(`✅ Réparateur identifié: ${data.name}`)
        
        const { data: existingRepairer } = await supabase
          .from('repairers')
          .select('id')
          .eq('name', data.name)
          .eq('city', data.city)
          .maybeSingle()

        // Utiliser les coordonnées GPS du scraping réel ou fallback
        let finalLat = data.lat;
        let finalLng = data.lng;
        
        if (!finalLat || !finalLng) {
          const departmentFromPostal = data.postal_code.substring(0, 2)
          const coords = getDepartmentCoordinates(departmentFromPostal)
          finalLat = coords.lat + (Math.random() - 0.5) * 0.01
          finalLng = coords.lng + (Math.random() - 0.5) * 0.01
          console.log(`🎯 Coordonnées fallback utilisées pour ${data.name}`)
        } else {
          console.log(`🗺️ Coordonnées précises utilisées pour ${data.name}: ${finalLat}, ${finalLng}`)
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
          siret: analysis.siret || null,
          siren: analysis.siren || null,
          pappers_verified: analysis.gouvernement_verified || false,
          pappers_last_check: analysis.gouvernement_verified ? now : null,
          business_status: analysis.business_status || 'unknown'
        }

        if (existingRepairer) {
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

    const scrapingMethod = useRealScraping && Deno.env.get('FIRECRAWL_API_KEY') 
      ? 'Scraping Réel (Firecrawl + Géocodage)' 
      : 'Données de Test';

    console.log(`🎉 Scraping ${testMode ? 'TEST' : 'MASSIF'} terminé:`)
    console.log(`   - ${itemsAdded} ajoutés, ${itemsUpdated} mis à jour sur ${scrapedData.length} traités`)
    console.log(`   - ${itemsGouvernementVerified} vérifiés par l'API Gouvernement, ${itemsGouvernementRejected} rejetés`)
    console.log(`   - ${gouvernementApiCalls} appels API Gouvernement effectués`)
    console.log(`   - Méthode: ${scrapingMethod}`)

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
        classification_method: `${scrapingMethod} + Vérification API Recherche d'Entreprises + Géolocalisation Précise`,
        real_scraping_used: useRealScraping && Deno.env.get('FIRECRAWL_API_KEY')
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
