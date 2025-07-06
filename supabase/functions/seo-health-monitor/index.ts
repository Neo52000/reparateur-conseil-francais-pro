import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheckResult {
  url: string;
  httpStatus: number;
  responseTimeMs: number;
  isIndexable: boolean;
  hasNoindex: boolean;
  hasCanonical: boolean;
  metaTitleLength: number;
  metaDescriptionLength: number;
  h1Count: number;
  errors: string[];
  warnings: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Démarrage du monitoring SEO...');

    // Récupérer la configuration
    const { data: config } = await supabaseClient
      .from('seo_monitoring_config')
      .select('monitoring_enabled, performance_thresholds')
      .single();

    if (!config?.monitoring_enabled) {
      console.log('⚠️ Monitoring désactivé');
      return new Response(JSON.stringify({ message: 'Monitoring disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const thresholds = config.performance_thresholds as any;
    const maxResponseTime = thresholds?.response_time || 1000;

    // Récupérer les URLs à surveiller
    const { data: monitoredUrls } = await supabaseClient
      .from('monitored_urls')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (!monitoredUrls?.length) {
      console.log('⚠️ Aucune URL à surveiller');
      return new Response(JSON.stringify({ message: 'No URLs to monitor' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Vérification de ${monitoredUrls.length} URLs...`);

    const results: HealthCheckResult[] = [];
    const alertsToCreate: any[] = [];

    // Vérifier chaque URL (par batch de 5 pour éviter surcharge)
    for (let i = 0; i < monitoredUrls.length; i += 5) {
      const batch = monitoredUrls.slice(i, i + 5);
      const batchPromises = batch.map(async (urlData) => {
        return await checkUrlHealth(urlData.url, maxResponseTime);
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const urlData = batch[j];

        if (result.status === 'fulfilled' && result.value) {
          const healthCheck = result.value;
          results.push(healthCheck);

          // Sauvegarder le résultat
          await supabaseClient
            .from('url_health_checks')
            .insert({
              monitored_url_id: urlData.id,
              http_status: healthCheck.httpStatus,
              response_time_ms: healthCheck.responseTimeMs,
              is_indexable: healthCheck.isIndexable,
              has_noindex: healthCheck.hasNoindex,
              has_canonical: healthCheck.hasCanonical,
              meta_title_length: healthCheck.metaTitleLength,
              meta_description_length: healthCheck.metaDescriptionLength,
              h1_count: healthCheck.h1Count,
              errors: healthCheck.errors,
              warnings: healthCheck.warnings
            });

          // Mettre à jour last_check
          await supabaseClient
            .from('monitored_urls')
            .update({ last_check: new Date().toISOString() })
            .eq('id', urlData.id);

          // Générer des alertes si nécessaire
          const alerts = generateAlerts(healthCheck, urlData.priority, maxResponseTime);
          alertsToCreate.push(...alerts);

        } else {
          console.error(`❌ Erreur vérification ${urlData.url}:`, result);
          
          // Créer une alerte pour l'URL inaccessible
          alertsToCreate.push({
            alert_type: 'url_unreachable',
            url: urlData.url,
            severity: urlData.priority >= 8 ? 'critical' : 'high',
            message: `URL inaccessible: ${urlData.url}`,
            details: { error: result.status === 'rejected' ? result.reason : 'Unknown error' }
          });
        }
      }

      // Pause entre les batches pour éviter surcharge
      if (i + 5 < monitoredUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Insérer toutes les alertes
    if (alertsToCreate.length > 0) {
      const { error: alertError } = await supabaseClient
        .from('seo_alerts')
        .insert(alertsToCreate);

      if (alertError) {
        console.error('❌ Erreur création alertes:', alertError);
      } else {
        console.log(`🚨 ${alertsToCreate.length} nouvelles alertes créées`);
      }
    }

    const summary = {
      total_urls: monitoredUrls.length,
      successful_checks: results.length,
      failed_checks: monitoredUrls.length - results.length,
      new_alerts: alertsToCreate.length,
      avg_response_time: results.length > 0 ? 
        Math.round(results.reduce((sum, r) => sum + r.responseTimeMs, 0) / results.length) : 0,
      errors_4xx: results.filter(r => r.httpStatus >= 400 && r.httpStatus < 500).length,
      errors_5xx: results.filter(r => r.httpStatus >= 500).length,
      slow_urls: results.filter(r => r.responseTimeMs > maxResponseTime).length
    };

    console.log('✅ Monitoring terminé:', summary);

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur monitoring SEO:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function checkUrlHealth(url: string, maxResponseTime: number): Promise<HealthCheckResult> {
  const startTime = Date.now();
  let response: Response;
  
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'RepairHub-SEO-Monitor/1.0'
      },
      signal: AbortSignal.timeout(10000) // Timeout 10s
    });
  } catch (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }

  const responseTime = Date.now() - startTime;
  const html = response.ok ? await response.text() : '';

  // Analyser le HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const metaTitle = doc.querySelector('title')?.textContent || '';
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const robotsMeta = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  const canonical = doc.querySelector('link[rel="canonical"]');
  const h1Elements = doc.querySelectorAll('h1');

  const hasNoindex = robotsMeta.toLowerCase().includes('noindex');
  const isIndexable = response.ok && !hasNoindex;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifications et alertes
  if (!response.ok) {
    errors.push(`HTTP ${response.status}: ${response.statusText}`);
  }

  if (responseTime > maxResponseTime) {
    warnings.push(`Temps de réponse lent: ${responseTime}ms`);
  }

  if (!metaTitle) {
    errors.push('Titre manquant');
  } else if (metaTitle.length > 60) {
    warnings.push(`Titre trop long: ${metaTitle.length} caractères`);
  }

  if (!metaDescription) {
    warnings.push('Meta description manquante');
  } else if (metaDescription.length > 160) {
    warnings.push(`Meta description trop longue: ${metaDescription.length} caractères`);
  }

  if (h1Elements.length === 0) {
    warnings.push('Aucun H1 trouvé');
  } else if (h1Elements.length > 1) {
    warnings.push(`Multiples H1: ${h1Elements.length}`);
  }

  if (hasNoindex) {
    warnings.push('Balise noindex détectée');
  }

  return {
    url,
    httpStatus: response.status,
    responseTimeMs: responseTime,
    isIndexable,
    hasNoindex,
    hasCanonical: !!canonical,
    metaTitleLength: metaTitle.length,
    metaDescriptionLength: metaDescription.length,
    h1Count: h1Elements.length,
    errors,
    warnings
  };
}

function generateAlerts(healthCheck: HealthCheckResult, priority: number, maxResponseTime: number): any[] {
  const alerts: any[] = [];

  // Erreur 404
  if (healthCheck.httpStatus === 404) {
    alerts.push({
      alert_type: 'error_404',
      url: healthCheck.url,
      severity: priority >= 8 ? 'critical' : 'high',
      message: `Page non trouvée (404): ${healthCheck.url}`,
      details: { http_status: healthCheck.httpStatus }
    });
  }

  // Erreur serveur
  if (healthCheck.httpStatus >= 500) {
    alerts.push({
      alert_type: 'server_error',
      url: healthCheck.url,
      severity: 'critical',
      message: `Erreur serveur (${healthCheck.httpStatus}): ${healthCheck.url}`,
      details: { http_status: healthCheck.httpStatus }
    });
  }

  // Temps de réponse lent
  if (healthCheck.responseTimeMs > maxResponseTime) {
    alerts.push({
      alert_type: 'slow_response',
      url: healthCheck.url,
      severity: healthCheck.responseTimeMs > maxResponseTime * 2 ? 'high' : 'medium',
      message: `Page lente (${healthCheck.responseTimeMs}ms): ${healthCheck.url}`,
      details: { response_time: healthCheck.responseTimeMs, threshold: maxResponseTime }
    });
  }

  // Noindex détecté
  if (healthCheck.hasNoindex && priority >= 7) {
    alerts.push({
      alert_type: 'noindex_detected',
      url: healthCheck.url,
      severity: 'medium',
      message: `Balise noindex détectée: ${healthCheck.url}`,
      details: { priority }
    });
  }

  // Meta manquantes
  if (healthCheck.metaTitleLength === 0) {
    alerts.push({
      alert_type: 'missing_meta',
      url: healthCheck.url,
      severity: 'medium',
      message: `Titre manquant: ${healthCheck.url}`,
      details: { missing: 'title' }
    });
  }

  return alerts;
}