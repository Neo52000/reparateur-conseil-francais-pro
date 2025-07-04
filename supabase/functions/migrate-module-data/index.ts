import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationRequest {
  repairer_id: string;
  module_type: 'pos' | 'ecommerce';
  migration_types?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Créer client Supabase avec service role pour contourner RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { repairer_id, module_type, migration_types }: MigrationRequest = await req.json();

    console.log(`🔄 [Migration] Démarrage pour ${repairer_id}, module: ${module_type}`);

    const results = {
      repairer_id,
      module_type,
      migrations: {} as Record<string, any>,
      total_migrated: 0,
      errors: [] as string[]
    };

    // Types de migration selon le module
    const defaultMigrationTypes = {
      pos: ['appointments', 'inventory', 'customers'],
      ecommerce: ['products', 'customers']
    };

    const typesToMigrate = migration_types || defaultMigrationTypes[module_type];

    for (const migrationType of typesToMigrate) {
      try {
        console.log(`📦 [Migration] Traitement: ${migrationType}`);
        
        // Marquer la migration comme en cours
        await supabaseAdmin
          .from('module_data_migrations')
          .update({ 
            migration_status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('repairer_id', repairer_id)
          .eq('module_type', module_type)
          .eq('migration_type', migrationType);

        let migrationResult = { migrated: 0, errors: [] as string[] };

        switch (migrationType) {
          case 'appointments':
            migrationResult = await migrateAppointments(supabaseAdmin, repairer_id);
            break;
          
          case 'inventory':
            migrationResult = await migrateInventory(supabaseAdmin, repairer_id);
            break;
          
          case 'customers':
            migrationResult = await migrateCustomers(supabaseAdmin, repairer_id);
            break;
          
          case 'products':
            migrationResult = await migrateProducts(supabaseAdmin, repairer_id);
            break;
        }

        results.migrations[migrationType] = migrationResult;
        results.total_migrated += migrationResult.migrated;
        
        if (migrationResult.errors.length > 0) {
          results.errors.push(...migrationResult.errors);
        }

        // Marquer la migration comme terminée
        await supabaseAdmin
          .from('module_data_migrations')
          .update({ 
            migration_status: migrationResult.errors.length > 0 ? 'failed' : 'completed',
            records_migrated: migrationResult.migrated,
            total_records: migrationResult.migrated,
            completed_at: new Date().toISOString(),
            error_message: migrationResult.errors.join('; ') || null
          })
          .eq('repairer_id', repairer_id)
          .eq('module_type', module_type)
          .eq('migration_type', migrationType);

      } catch (error) {
        console.error(`❌ [Migration] Erreur ${migrationType}:`, error);
        results.errors.push(`${migrationType}: ${error.message}`);
        
        // Marquer comme échoué
        await supabaseAdmin
          .from('module_data_migrations')
          .update({ 
            migration_status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('repairer_id', repairer_id)
          .eq('module_type', module_type)
          .eq('migration_type', migrationType);
      }
    }

    console.log(`✅ [Migration] Terminé: ${results.total_migrated} éléments migrés`);

    return new Response(JSON.stringify({
      success: true,
      ...results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [Migration] Erreur critique:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Migrer les rendez-vous vers le système POS
 */
async function migrateAppointments(supabase: any, repairer_id: string) {
  const result = { migrated: 0, errors: [] as string[] };

  try {
    // Récupérer les rendez-vous du réparateur
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('repairer_id', repairer_id);

    if (error) throw error;

    console.log(`📅 [Migration] ${appointments?.length || 0} rendez-vous trouvés`);

    // Les rendez-vous restent dans leur table d'origine
    // On crée juste les liens de synchronisation
    for (const appointment of appointments || []) {
      await supabase
        .from('sync_logs')
        .insert({
          repairer_id,
          sync_type: 'dashboard_to_pos',
          entity_type: 'appointment',
          entity_id: appointment.id,
          operation: 'create',
          after_data: appointment,
          sync_status: 'success'
        });
      
      result.migrated++;
    }

  } catch (error) {
    result.errors.push(`Appointments: ${error.message}`);
  }

  return result;
}

/**
 * Migrer l'inventaire vers le système POS
 */
async function migrateInventory(supabase: any, repairer_id: string) {
  const result = { migrated: 0, errors: [] as string[] };

  try {
    // Dans un vrai scénario, on récupérerait les données d'inventaire existantes
    // Pour la démo, on crée des données d'exemple
    const sampleInventory = [
      {
        sku: 'SCR-IP13-001',
        name: 'Écran iPhone 13',
        description: 'Écran LCD de remplacement pour iPhone 13',
        category: 'Écrans',
        brand: 'Apple',
        cost_price: 89.90,
        selling_price: 149.90,
        retail_price: 179.90,
        current_stock: 5,
        minimum_stock: 2,
        location: 'Étagère A1',
        is_active: true,
        is_trackable: true
      },
      {
        sku: 'BAT-SS21-001',
        name: 'Batterie Samsung S21',
        description: 'Batterie de remplacement Samsung Galaxy S21',
        category: 'Batteries',
        brand: 'Samsung',
        cost_price: 49.90,
        selling_price: 89.90,
        retail_price: 119.90,
        current_stock: 8,
        minimum_stock: 3,
        location: 'Étagère B2',
        is_active: true,
        is_trackable: true
      }
    ];

    for (const item of sampleInventory) {
      // Vérifier si l'item existe déjà
      const { data: existing } = await supabase
        .from('pos_inventory_items')
        .select('id')
        .eq('repairer_id', repairer_id)
        .eq('sku', item.sku)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('pos_inventory_items')
          .insert({
            repairer_id,
            ...item,
            sync_source: 'dashboard'
          });

        if (error) {
          result.errors.push(`Inventaire ${item.sku}: ${error.message}`);
        } else {
          result.migrated++;
        }
      }
    }

  } catch (error) {
    result.errors.push(`Inventory: ${error.message}`);
  }

  return result;
}

/**
 * Migrer les clients
 */
async function migrateCustomers(supabase: any, repairer_id: string) {
  const result = { migrated: 0, errors: [] as string[] };

  try {
    // Récupérer les demandes d'intérêt client
    const { data: interests, error } = await supabase
      .from('client_interest_requests')
      .select('*')
      .eq('repairer_profile_id', repairer_id); // Note: adapter selon votre schéma

    if (error) throw error;

    console.log(`👥 [Migration] ${interests?.length || 0} clients trouvés`);

    // Pour chaque client, créer un enregistrement dans la base POS si besoin
    for (const interest of interests || []) {
      if (interest.client_email) {
        const { error: customerError } = await supabase
          .from('ecommerce_customers')
          .upsert({
            repairer_id,
            email: interest.client_email,
            first_name: interest.client_name?.split(' ')[0] || '',
            last_name: interest.client_name?.split(' ').slice(1).join(' ') || '',
            phone: interest.client_phone
          }, {
            onConflict: 'repairer_id,email'
          });

        if (customerError) {
          result.errors.push(`Customer ${interest.client_email}: ${customerError.message}`);
        } else {
          result.migrated++;
        }
      }
    }

  } catch (error) {
    result.errors.push(`Customers: ${error.message}`);
  }

  return result;
}

/**
 * Migrer les produits pour l'e-commerce
 */
async function migrateProducts(supabase: any, repairer_id: string) {
  const result = { migrated: 0, errors: [] as string[] };

  try {
    // Récupérer l'inventaire POS s'il existe
    const { data: inventory, error } = await supabase
      .from('pos_inventory_items')
      .select('*')
      .eq('repairer_id', repairer_id);

    if (error) throw error;

    console.log(`🛍️ [Migration] ${inventory?.length || 0} produits trouvés`);

    // Convertir l'inventaire en produits e-commerce
    for (const item of inventory || []) {
      // Créer le slug à partir du nom
      const slug = item.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const { error: productError } = await supabase
        .from('ecommerce_products')
        .upsert({
          repairer_id,
          sku: item.sku,
          name: item.name,
          slug: `${slug}-${item.sku.toLowerCase()}`,
          description: item.description,
          short_description: `${item.name} - Pièce de qualité`,
          price: item.selling_price,
          compare_at_price: item.retail_price,
          cost_price: item.cost_price,
          stock_quantity: item.current_stock,
          category: item.category,
          status: item.is_active ? 'published' : 'draft',
          weight: item.weight,
          dimensions: item.dimensions,
          inventory_sync_enabled: true
        }, {
          onConflict: 'repairer_id,sku'
        });

      if (productError) {
        result.errors.push(`Product ${item.sku}: ${productError.message}`);
      } else {
        result.migrated++;
      }
    }

  } catch (error) {
    result.errors.push(`Products: ${error.message}`);
  }

  return result;
}