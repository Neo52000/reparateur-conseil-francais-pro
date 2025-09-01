import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RepairerData {
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  email: string;
  telephone: string;
}

// Configuration Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const geocodeAddress = async (address: string, city: string, postalCode: string): Promise<{lat: number, lng: number} | null> => {
  try {
    const fullAddress = `${address}, ${postalCode} ${city}, France`;
    console.log(`🌍 Géocodage: ${fullAddress}`);
    
    // Utiliser l'API Nominatim (OpenStreetMap) gratuite
    const encodedAddress = encodeURIComponent(fullAddress);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=fr`,
      {
        headers: {
          'User-Agent': 'RepairSmartphone-App/1.0'  // Nominatim requiert un User-Agent
        }
      }
    );
    
    if (!response.ok) {
      console.log(`❌ Erreur géocodage: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      console.log(`✅ Géocodage réussi: ${lat}, ${lng}`);
      return { lat, lng };
    }
    
    console.log(`⚠️ Aucun résultat pour: ${fullAddress}`);
    return null;
  } catch (error) {
    console.error(`❌ Erreur géocodage pour ${address}:`, error);
    return null;
  }
};

const cleanPhone = (phone: string): string | null => {
  if (!phone || phone === 'N/A') return null;
  // Nettoyer le numéro : garder seulement les chiffres et espaces
  return phone.replace(/[^\d\s\-\.]/g, '').trim() || null;
};

const cleanEmail = (email: string): string | null => {
  if (!email || email === 'N/A') return null;
  // Vérification basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) ? email.trim() : null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repairersData } = await req.json();
    
    if (!repairersData || !Array.isArray(repairersData)) {
      return new Response(
        JSON.stringify({ error: 'Invalid repairersData format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Début import de ${repairersData.length} réparateurs...`);
    
    let imported = 0;
    const errors: string[] = [];
    const results = [];

    for (const repairer of repairersData as RepairerData[]) {
      try {
        // Nettoyer et valider les données
        const name = repairer.nom?.trim();
        const address = repairer.adresse && repairer.adresse !== 'N/A' ? repairer.adresse.trim() : null;
        const city = repairer.ville && repairer.ville !== 'N/A' ? repairer.ville.trim() : null;
        const postalCode = repairer.codePostal && repairer.codePostal !== 'N/A' ? repairer.codePostal.trim() : null;
        
        if (!name) {
          errors.push(`Nom manquant pour le réparateur`);
          continue;
        }

        // Vérifier si le réparateur existe déjà
        const { data: existing } = await supabase
          .from('repairers')
          .select('id, name, city')
          .eq('name', name)
          .maybeSingle();

        if (existing) {
          console.log(`⚠️ Réparateur existant ignoré: ${name}`);
          continue;
        }

        // Géocodage si on a une adresse
        let coordinates = null;
        if (address && city && postalCode) {
          coordinates = await geocodeAddress(address, city, postalCode);
          // Attendre un peu pour respecter les limites de taux de Nominatim
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Préparer les données pour l'insertion
        const repairerData = {
          name,
          address: address || 'Adresse non renseignée',
          city: city || 'Ville non renseignée',
          postal_code: postalCode || '00000',
          phone: cleanPhone(repairer.telephone),
          email: cleanEmail(repairer.email),
          lat: coordinates?.lat || null,
          lng: coordinates?.lng || null,
          source: 'import_batch_2025',
          scraped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          is_verified: false,
          is_open: true,
          rating: 4.5,
          review_count: 0,
          geocoding_source: coordinates ? 'nominatim' : null,
          geocoding_accuracy: coordinates ? 'high' : null,
          data_quality_score: 75,
          enhancement_status: 'pending'
        };

        // Insérer dans la base de données
        const { data: insertedRepairer, error: insertError } = await supabase
          .from('repairers')
          .insert([repairerData])
          .select('id, name, city')
          .single();

        if (insertError) {
          const errorMsg = `Erreur insertion ${name}: ${insertError.message}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
        } else {
          imported++;
          console.log(`✅ Importé: ${name} à ${city} (ID: ${insertedRepairer?.id})`);
          results.push({
            id: insertedRepairer?.id,
            name,
            city,
            coordinates: coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'Non géocodé'
          });
        }

      } catch (error) {
        const errorMsg = `Erreur traitement ${repairer.nom}: ${error.message}`;
        console.error('❌', errorMsg);
        errors.push(errorMsg);
      }
    }

    const response = {
      success: true,
      message: `Import terminé: ${imported} réparateurs importés${errors.length > 0 ? `, ${errors.length} erreurs` : ''}`,
      imported,
      total: repairersData.length,
      errors,
      results: results.slice(0, 10) // Limiter les résultats retournés
    };

    console.log('🎉 Import terminé:', response.message);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Erreur fatale lors de l\'import'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});