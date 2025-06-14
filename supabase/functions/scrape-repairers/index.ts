
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

    // Simuler le scraping (en production, ici vous feriez le vrai scraping)
    // Pour l'instant, on simule en ajoutant quelques réparateurs de test
    const mockRepairers = [
      {
        name: 'Tech Repair ' + source,
        address: '123 Rue de la République',
        city: 'Paris',
        postal_code: '75001',
        department: 'Paris',
        region: 'Île-de-France',
        phone: '+33 1 23 45 67 89',
        email: 'contact@techrepair.fr',
        lat: 48.8566,
        lng: 2.3522,
        services: ['Réparation smartphone', 'Réparation tablette'],
        specialties: ['iPhone', 'Samsung'],
        price_range: 'medium' as const,
        source,
        is_open: true
      }
    ]

    let itemsAdded = 0
    for (const repairer of mockRepairers) {
      const { error: repairerError } = await supabase
        .from('repairers')
        .insert(repairer)

      if (!repairerError) {
        itemsAdded++
      }
    }

    // Mettre à jour le log
    await supabase
      .from('scraping_logs')
      .update({
        status: 'completed',
        items_scraped: mockRepairers.length,
        items_added: itemsAdded,
        completed_at: new Date().toISOString()
      })
      .eq('id', logData.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Scraping ${source} terminé avec succès`,
        items_added: itemsAdded 
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
    return new Response(
      JSON.stringify({ error: error.message }),
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
