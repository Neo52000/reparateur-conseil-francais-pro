import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
  required: boolean;
}

interface CSVRow {
  [key: string]: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 CSV Intelligent Import - Début du traitement');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    
    // Mode 1: Import rapide avec données fournies
    if (body.providedData) {
      console.log('🚀 Mode import rapide avec données pré-formatées');
      
      const { providedData, categoryId, enableAI = true, enableGeocoding = true } = body;
      
      const transformedData = await transformProvidedData(
        providedData, 
        { enableAI, enableGeocoding, categoryId }
      );
      
      const insertedCount = await insertToDatabase(supabase, transformedData, categoryId);
      
      return new Response(JSON.stringify({
        success: true,
        imported: insertedCount,
        processed: providedData.length,
        geocoded: transformedData.filter(d => d.lat && d.lng).length,
        aiEnhanced: transformedData.filter(d => d.ai_enhanced).length,
        stats: {
          provided: providedData.length,
          transformed: transformedData.length,
          inserted: insertedCount
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mode 2: Import classique avec fichier CSV
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const mappingsStr = formData.get('mappings') as string;
    const categoryId = formData.get('categoryId') as string;
    const enableAI = formData.get('enableAI') === 'true';
    const enableGeocoding = formData.get('enableGeocoding') === 'true';
    const separator = formData.get('separator') as string || 'auto';
    const encoding = formData.get('encoding') as string || 'utf-8';

    if (!file || !mappingsStr) {
      throw new Error('Fichier CSV et mappings requis');
    }

    const mappings: ColumnMapping[] = JSON.parse(mappingsStr);
    console.log('🗺️ Mappings reçus:', mappings);

    // Lire et parser le CSV avec détection intelligente
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder(encoding);
    const csvText = decoder.decode(arrayBuffer);
    
    const csvRows = parseCSVIntelligent(csvText, separator);
    console.log(`📊 ${csvRows.length} lignes CSV trouvées`);

    // Transformation intelligente des données
    const transformedData = await transformDataIntelligently(csvRows, mappings, {
      enableAI,
      enableGeocoding,
      categoryId
    });

    // Insertion en base avec gestion des doublons
    const insertedCount = await insertToDatabase(supabase, transformedData, categoryId);

    console.log(`✅ Import terminé: ${insertedCount} éléments ajoutés`);

    return new Response(JSON.stringify({
      success: true,
      imported: insertedCount,
      processed: transformedData.length,
      stats: {
        csvRows: csvRows.length,
        transformed: transformedData.length,
        inserted: insertedCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur CSV Import:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fonction de détection intelligente des séparateurs
function detectSeparator(text: string): string {
  const firstLine = text.split('\n')[0];
  const separators = ['\t', ';', ','];
  
  let bestSeparator = ',';
  let maxColumns = 0;
  
  for (const sep of separators) {
    const columns = firstLine.split(sep).length;
    if (columns > maxColumns) {
      maxColumns = columns;
      bestSeparator = sep;
    }
  }
  
  return bestSeparator;
}

function parseCSVIntelligent(csvText: string, separatorHint?: string): CSVRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Détecter le séparateur si pas spécifié ou en mode auto
  const separator = (separatorHint === 'auto' || !separatorHint) ? 
    detectSeparator(csvText) : separatorHint;
  
  console.log('🔍 Séparateur détecté/utilisé:', separator);

  const headers = lines[0].split(separator).map(h => h.trim().replace(/['"]/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/['"]/g, ''));
    const row: CSVRow = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }

  return rows;
}

function parseCSV(csvText: string): CSVRow[] {
  return parseCSVIntelligent(csvText);
}

// Nouvelle fonction pour traiter les données fournies directement
async function transformProvidedData(
  providedData: any[],
  options: { enableAI: boolean; enableGeocoding: boolean; categoryId: string }
): Promise<any[]> {
  console.log('🔄 Transformation des données fournies...');
  
  const transformed: any[] = [];
  
  for (const item of providedData) {
    let dbRow: any = {
      ...item,
      business_category_id: options.categoryId,
      source: 'quick_import',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: true,
      rating: 4.5,
      review_count: 0
    };

    // Amélioration IA si activée
    if (options.enableAI) {
      dbRow = await enhanceWithAI(dbRow);
    }

    // Géocodage si activé et pas de coordonnées
    if (options.enableGeocoding && (!dbRow.lat || !dbRow.lng)) {
      const geoData = await geocodeAddress(dbRow);
      if (geoData.lat && geoData.lng) {
        dbRow.lat = geoData.lat;
        dbRow.lng = geoData.lng;
        dbRow.geocoded = true;
      }
    }

    // Génération d'un ID unique et calcul qualité
    dbRow.unique_id = generateUniqueId(dbRow.name);
    dbRow.data_quality_score = calculateQualityScore(dbRow);
    
    transformed.push(dbRow);
  }

  console.log(`✨ ${transformed.length} données transformées avec succès`);
  return transformed;
}

async function transformDataIntelligently(
  csvRows: CSVRow[], 
  mappings: ColumnMapping[], 
  options: { enableAI: boolean; enableGeocoding: boolean; categoryId: string }
): Promise<any[]> {
  console.log('🔄 Transformation intelligente des données...');
  
  const transformed: any[] = [];
  
  for (const csvRow of csvRows) {
    const dbRow: any = {
      business_category_id: options.categoryId,
      source: 'csv_import',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Mapper les colonnes selon la configuration
    for (const mapping of mappings) {
      if (mapping.csvColumn && csvRow[mapping.csvColumn]) {
        const value = csvRow[mapping.csvColumn];
        
        // Gestion des transformations spéciales
        if (mapping.transform === 'split_postal_city' && value) {
          const postalMatch = value.match(/^(\d{5})\s*(.+)$/);
          if (postalMatch) {
            dbRow.postal_code = postalMatch[1];
            dbRow.city = postalMatch[2].trim();
          } else {
            dbRow[mapping.dbColumn] = cleanValue(value, mapping.dbColumn);
          }
        } else {
          dbRow[mapping.dbColumn] = cleanValue(value, mapping.dbColumn);
        }
      }
    }

    // Validation des champs obligatoires
    if (!dbRow.name || dbRow.name.length < 2) {
      console.warn('⚠️ Ligne ignorée: nom manquant ou invalide');
      continue;
    }

    // Amélioration IA des données si activée
    if (options.enableAI) {
      dbRow = await enhanceWithAI(dbRow);
    }

    // Géocodage si activé et pas de coordonnées
    if (options.enableGeocoding && (!dbRow.lat || !dbRow.lng)) {
      const geoData = await geocodeAddress(dbRow);
      if (geoData.lat && geoData.lng) {
        dbRow.lat = geoData.lat;
        dbRow.lng = geoData.lng;
        dbRow.geocoded = true;
      }
    }

    // Génération d'un ID unique
    dbRow.unique_id = generateUniqueId(dbRow.name);
    
    // Score de qualité
    dbRow.data_quality_score = calculateQualityScore(dbRow);
    
    transformed.push(dbRow);
  }

  console.log(`✨ ${transformed.length} lignes transformées avec succès`);
  return transformed;
}

function cleanValue(value: string, columnType: string): any {
  if (!value || value.trim() === '') return null;
  
  const cleaned = value.trim();
  
  switch (columnType) {
    case 'phone':
      const phoneClean = cleaned.replace(/[^\d\+]/g, '');
      return phoneClean.match(/^(\+33|0)[1-9]\d{8}$/) ? phoneClean : null;
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(cleaned.toLowerCase()) ? cleaned.toLowerCase() : null;
      
    case 'website':
      try {
        new URL(cleaned);
        return cleaned;
      } catch {
        if (cleaned.includes('.') && !cleaned.includes(' ')) {
          return `https://${cleaned}`;
        }
        return null;
      }
      
    case 'postal_code':
      const postalMatch = cleaned.match(/\d{5}/);
      return postalMatch ? postalMatch[0] : null;
      
    case 'lat':
    case 'lng':
      const coord = parseFloat(cleaned);
      return !isNaN(coord) ? coord : null;
      
    default:
      return cleaned.substring(0, columnType === 'description' ? 1000 : 200);
  }
}

async function enhanceWithAI(item: any): Promise<any> {
  try {
    console.log('🧠 Amélioration IA pour:', item.name);
    
    // Utiliser DeepSeek pour améliorer la description et détecter les services
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) return item;

    const prompt = `Analyse ce réparateur et améliore les données:
Nom: ${item.name}
Adresse: ${item.address || ''}
Description: ${item.description || ''}

Retourne UNIQUEMENT un JSON avec:
{
  "enhanced_description": "description améliorée professionnelle",
  "services": ["service1", "service2"],
  "specialties": ["spécialité1"],
  "confidence": 0.8
}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        try {
          const aiEnhancement = JSON.parse(content);
          return {
            ...item,
            description: aiEnhancement.enhanced_description || item.description,
            services: aiEnhancement.services || [],
            specialties: aiEnhancement.specialties || [],
            ai_enhanced: true,
            ai_confidence: aiEnhancement.confidence || 0.5
          };
        } catch (parseError) {
          console.warn('Erreur parsing réponse IA:', parseError);
        }
      }
    }
  } catch (error) {
    console.warn('Erreur amélioration IA:', error);
  }
  
  return item;
}

async function geocodeAddress(item: any): Promise<{ lat?: number; lng?: number }> {
  if (!item.address) return {};
  
  try {
    const fullAddress = `${item.address}, ${item.city || ''}, ${item.postal_code || ''}, France`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
    );
    
    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.warn('Erreur géocodage:', error);
  }
  
  return {};
}

function generateUniqueId(name: string): string {
  const timestamp = Date.now();
  const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  const random = Math.random().toString(36).substring(2, 6);
  return `CSV_${nameSlug}_${timestamp}_${random}`;
}

function calculateQualityScore(item: any): number {
  let score = 0;
  
  if (item.name && item.name.length > 3) score += 20;
  if (item.address && item.address.length > 10) score += 20;
  if (item.phone) score += 15;
  if (item.email) score += 15;
  if (item.website) score += 10;
  if (item.lat && item.lng) score += 15;
  if (item.description && item.description.length > 20) score += 5;
  
  return Math.min(100, score);
}

async function insertToDatabase(supabase: any, data: any[], categoryId: string): Promise<number> {
  let insertedCount = 0;
  
  // Insertion par lots pour éviter les timeouts
  const batchSize = 50;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      const { data: inserted, error } = await supabase
        .from('repairers')
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error(`Erreur insertion lot ${i}-${i + batchSize}:`, error);
        continue;
      }
      
      insertedCount += inserted?.length || 0;
      console.log(`📥 Lot ${i + 1}-${i + batchSize} inséré: ${inserted?.length || 0} éléments`);
      
    } catch (error) {
      console.error(`Erreur lot ${i}:`, error);
    }
    
    // Petite pause entre les lots
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return insertedCount;
}