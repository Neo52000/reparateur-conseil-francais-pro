import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { platform, config } = await req.json();

    let testResult = { success: false, message: '' };

    switch (platform) {
      case 'prestashop':
        testResult = await testPrestaShop(config);
        break;
      case 'woocommerce':
        testResult = await testWooCommerce(config);
        break;
      case 'shopify':
        testResult = await testShopify(config);
        break;
      case 'magento':
        testResult = await testMagento(config);
        break;
      default:
        testResult = { success: false, message: 'Plateforme non supportée' };
    }

    return new Response(
      JSON.stringify(testResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur test intégration:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Erreur: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function testPrestaShop(config: any) {
  try {
    const { apiUrl, apiKey } = config;
    
    if (!apiUrl || !apiKey) {
      return { success: false, message: 'URL API et clé API requis' };
    }

    const response = await fetch(`${apiUrl}`, {
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`
      }
    });

    if (response.ok) {
      return { 
        success: true, 
        message: 'Connexion PrestaShop réussie - API accessible' 
      };
    } else {
      return { 
        success: false, 
        message: `Erreur ${response.status}: Vérifiez l'URL et la clé API` 
      };
    }

  } catch (error) {
    return { 
      success: false, 
      message: `Erreur de connexion: ${error.message}` 
    };
  }
}

async function testWooCommerce(config: any) {
  try {
    const { siteUrl, consumerKey, consumerSecret } = config;
    
    if (!siteUrl || !consumerKey || !consumerSecret) {
      return { success: false, message: 'URL site, Consumer Key et Secret requis' };
    }

    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const testUrl = `${siteUrl}/wp-json/wc/v3/system_status`;

    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: `Connexion WooCommerce réussie - Version: ${data.environment?.version || 'N/A'}` 
      };
    } else {
      return { 
        success: false, 
        message: `Erreur ${response.status}: Vérifiez les credentials WooCommerce` 
      };
    }

  } catch (error) {
    return { 
      success: false, 
      message: `Erreur de connexion: ${error.message}` 
    };
  }
}

async function testShopify(config: any) {
  try {
    const { storeUrl, accessToken, apiVersion } = config;
    
    if (!storeUrl || !accessToken) {
      return { success: false, message: 'URL boutique et Access Token requis' };
    }

    const shopDomain = storeUrl.includes('.myshopify.com') ? storeUrl : `${storeUrl}.myshopify.com`;
    const testUrl = `https://${shopDomain}/admin/api/${apiVersion || '2023-10'}/shop.json`;

    const response = await fetch(testUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: `Connexion Shopify réussie - Boutique: ${data.shop?.name || 'N/A'}` 
      };
    } else {
      return { 
        success: false, 
        message: `Erreur ${response.status}: Vérifiez l'Access Token Shopify` 
      };
    }

  } catch (error) {
    return { 
      success: false, 
      message: `Erreur de connexion: ${error.message}` 
    };
  }
}

async function testMagento(config: any) {
  try {
    const { baseUrl, adminToken } = config;
    
    if (!baseUrl || !adminToken) {
      return { success: false, message: 'URL base et Token Admin requis' };
    }

    const testUrl = `${baseUrl}/rest/V1/store/storeConfigs`;

    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: `Connexion Magento réussie - ${data.length || 0} store(s) configuré(s)` 
      };
    } else {
      return { 
        success: false, 
        message: `Erreur ${response.status}: Vérifiez le Token Admin Magento` 
      };
    }

  } catch (error) {
    return { 
      success: false, 
      message: `Erreur de connexion: ${error.message}` 
    };
  }
}