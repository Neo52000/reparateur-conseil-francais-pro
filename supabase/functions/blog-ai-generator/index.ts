import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

async function checkAdminRole(supabase: any, authHeader: string | null): Promise<string | null> {
  try {
    if (!authHeader?.startsWith("Bearer ")) return null;
    
    const token = authHeader.slice(7);
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const userId = payload?.sub;
    
    if (!userId) return null;
    
    // SECURITY: Use server-side has_role() function instead of trusting JWT metadata
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });
    
    if (error) {
      console.error("❌ has_role RPC error:", error);
      return null;
    }
    
    return data ? userId : null;
  } catch (e) {
    console.error("❌ Admin check error:", e);
    return null;
  }
}

interface GenerateArticleRequest {
  action?: 'generate' | 'check-status';
  topic?: string;
  category_id?: string;
  keywords?: string[];
  target_audience?: 'public' | 'repairers' | 'both';
  tone?: 'professional' | 'casual' | 'technical' | 'educational';
  auto_publish?: boolean;
  scheduled_at?: string;
}

interface ProviderStatus {
  name: string;
  key: string;
  status: 'active' | 'error' | 'warning' | 'unknown';
  message: string;
  lastCheck?: string;
  credits?: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  docsUrl?: string;
}

async function checkLovableAI(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'Lovable AI',
    key: 'LOVABLE_API_KEY',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://docs.lovable.dev/features/ai'
  };

  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
    });

    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
    } else if (response.status === 402) {
      result.status = 'warning';
      result.message = 'Crédits épuisés - Rechargez votre compte';
      result.credits = { used: 100, limit: 100, unlimited: false };
    } else if (response.status === 429) {
      result.status = 'warning';
      result.message = 'Rate limit atteint - Réessayez plus tard';
    } else if (response.status === 401) {
      result.status = 'error';
      result.message = 'Clé API invalide';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${error.message}`;
  }

  result.lastCheck = new Date().toISOString();
  return result;
}

async function checkOpenAI(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'OpenAI',
    key: 'OPENAI_API_KEY',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://platform.openai.com/api-keys'
  };

  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
      result.credits = { used: 0, limit: 0, unlimited: true };
    } else if (response.status === 401) {
      result.status = 'error';
      result.message = 'Clé API invalide ou expirée';
    } else if (response.status === 429) {
      result.status = 'warning';
      result.message = 'Rate limit ou quota dépassé';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${error.message}`;
  }

  result.lastCheck = new Date().toISOString();
  return result;
}

async function checkGemini(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'Google Gemini',
    key: 'GEMINI_API_KEY',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://aistudio.google.com/apikey'
  };

  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
      result.credits = { used: 0, limit: 0, unlimited: true };
    } else if (response.status === 400 || response.status === 403) {
      result.status = 'error';
      result.message = 'Clé API invalide ou restrictions d\'accès';
    } else if (response.status === 404) {
      result.status = 'error';
      result.message = 'Clé API invalide';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${error.message}`;
  }

  result.lastCheck = new Date().toISOString();
  return result;
}

async function checkMistral(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'Mistral AI',
    key: 'CLE_API_MISTRAL',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://console.mistral.ai/api-keys'
  };

  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
      result.credits = { used: 0, limit: 0, unlimited: true };
    } else if (response.status === 401) {
      result.status = 'error';
      result.message = 'Clé API invalide';
    } else if (response.status === 429) {
      result.status = 'warning';
      result.message = 'Rate limit atteint';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${error.message}`;
  }

  result.lastCheck = new Date().toISOString();
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const authHeader = req.headers.get("Authorization");

    // 🔐 HYBRID AUTHENTICATION: Accept SERVICE_ROLE_KEY for internal calls OR verify admin JWT for external calls
    let isInternalCall = false;
    let userId: string | null = null;

    // Check if this is an internal service-to-service call using SERVICE_ROLE_KEY
    if (authHeader === `Bearer ${SERVICE_ROLE}`) {
      console.log("✅ Internal service call detected (SERVICE_ROLE_KEY) - skipping admin check");
      isInternalCall = true;
      userId = "internal-service";
    } else {
      // External call - verify admin role
      userId = await checkAdminRole(supabase, authHeader);
      
      if (!userId) {
        console.log("❌ Access denied: user is not admin");
        return new Response(
          JSON.stringify({ success: false, error: "forbidden", message: "Admin required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`✅ Access authorized: ${isInternalCall ? 'Internal service call' : `Admin user ${userId}`}`);

    const requestData: GenerateArticleRequest = await req.json();
    const { action, topic, category_id, keywords, target_audience, tone, auto_publish, scheduled_at } = requestData;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const MISTRAL_API_KEY = Deno.env.get('CLE_API_MISTRAL');

    // 🔍 ACTION: CHECK STATUS - Return AI provider statuses
    if (action === 'check-status') {
      console.log('🔍 Checking AI provider statuses...');
      
      const [lovable, openai, gemini, mistral] = await Promise.all([
        checkLovableAI(LOVABLE_API_KEY || ''),
        checkOpenAI(OPENAI_API_KEY || ''),
        checkGemini(GEMINI_API_KEY || ''),
        checkMistral(MISTRAL_API_KEY || '')
      ]);

      const providers = [lovable, openai, gemini, mistral];
      const activeCount = providers.filter(p => p.status === 'active').length;
      const errorCount = providers.filter(p => p.status === 'error').length;

      console.log(`✅ Check complete: ${activeCount} active, ${errorCount} errors`);

      return new Response(
        JSON.stringify({
          success: true,
          providers,
          summary: {
            active: activeCount,
            errors: errorCount,
            warnings: providers.filter(p => p.status === 'warning').length,
            hasWorkingProvider: activeCount > 0
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 📝 ACTION: GENERATE ARTICLE (default)
    // Vérifier qu'au moins une clé API est disponible
    if (!LOVABLE_API_KEY && !GEMINI_API_KEY && !OPENAI_API_KEY && !MISTRAL_API_KEY) {
      throw new Error('Aucune clé API IA configurée (LOVABLE_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY ou CLE_API_MISTRAL requis)');
    }

    // Récupérer la catégorie si fournie
    let categoryName = '';
    let customPrompt = '';
    
    if (category_id) {
      const { data: category } = await supabase
        .from('blog_categories')
        .select('name')
        .eq('id', category_id)
        .single();
      categoryName = category?.name || '';

      // Récupérer le prompt personnalisé pour cette catégorie
      const { data: template } = await supabase
        .from('blog_generation_templates')
        .select('prompt_template, ai_model')
        .eq('category_id', category_id)
        .eq('is_active', true)
        .single();

      if (template) {
        customPrompt = template.prompt_template;
        console.log('✅ Prompt personnalisé trouvé pour la catégorie:', categoryName);
      }
    }

    // Remplacer les variables dynamiques dans le prompt
    const currentDate = new Date();
    const season = ['hiver', 'printemps', 'été', 'automne'][Math.floor((currentDate.getMonth() % 12) / 3)];
    
    if (customPrompt) {
      customPrompt = customPrompt
        .replace(/\{categorie\}/g, categoryName)
        .replace(/\{date\}/g, currentDate.toLocaleDateString('fr-FR'))
        .replace(/\{saison\}/g, season)
        .replace(/\{ton\}/g, tone || 'professionnel')
        .replace(/\{longueur\}/g, '600-800');
    }

    // Construire le prompt système
    const systemPrompt = `Tu es un expert en rédaction d'articles de blog pour une plateforme de réparation de smartphones.
Ton objectif est de créer des articles optimisés SEO, informatifs et engageants.
Audience cible: ${target_audience === 'repairers' ? 'professionnels réparateurs' : target_audience === 'public' ? 'grand public' : 'mixte (public et professionnels)'}
Ton: ${tone || 'professionnel'}
${categoryName ? `Catégorie: ${categoryName}` : ''}
Saison actuelle: ${season}`;

    // Utiliser le prompt personnalisé ou le prompt par défaut
    const userPrompt = customPrompt || `Crée un article de blog complet sur le sujet suivant: ${topic || 'Les dernières tendances en réparation de smartphones'}
${keywords?.length ? `Mots-clés à inclure naturellement: ${keywords.join(', ')}` : ''}

L'article doit:
- Avoir un titre accrocheur et optimisé SEO (50-60 caractères)
- Un slug URL-friendly
- Un extrait captivant (150-160 caractères)
- Un contenu structuré en Markdown avec titres H2/H3
- **IMPORTANT: Inclure exactement 2-3 placeholders d'images** dans le contenu:
  * Format: {{IMAGE_1}}, {{IMAGE_2}}, {{IMAGE_3}}
  * Positionner les placeholders entre les sections naturellement
  * Chaque placeholder doit avoir une description détaillée et spécifique
  * Exemple: "{{IMAGE_1}} - Photo d'un technicien réparant l'écran d'un iPhone dans un atelier moderne"
- Des paragraphes courts et faciles à lire (3-4 lignes max par paragraphe)
- Des listes à puces pour les conseils pratiques
- Des conseils actionnables et concrets
- Un meta_title optimisé SEO (50-60 caractères)
- Une meta_description engageante (150-160 caractères)
- 5-7 mots-clés pertinents pour le SEO

STRUCTURE RECOMMANDÉE:
## Introduction (avec {{IMAGE_1}})
Paragraphes d'introduction...

## Section principale 1
Contenu...

{{IMAGE_2}}

## Section principale 2
Contenu...

## Conseils pratiques (avec liste à puces)
- Conseil 1
- Conseil 2

{{IMAGE_3}}

## Conclusion`;

    console.log('📝 Prompt utilisé:', customPrompt ? 'Personnalisé' : 'Par défaut');

    // 🔄 SYSTÈME DE FALLBACK IA: Lovable AI → OpenAI → Mistral
    let aiData: any = null;
    let articleData: any = null;
    let usedProvider = '';

    const toolDefinition = {
      type: 'function',
      function: {
        name: 'create_blog_article',
        description: 'Generate a complete blog article with all required fields',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Article title (50-60 chars)' },
            slug: { type: 'string', description: 'URL-friendly slug (lowercase, hyphens)' },
            excerpt: { type: 'string', description: 'Short excerpt (150-160 chars)' },
            content: { type: 'string', description: 'Full article content in Markdown format with H2/H3 headings' },
            meta_title: { type: 'string', description: 'SEO meta title (50-60 chars)' },
            meta_description: { type: 'string', description: 'SEO meta description (150-160 chars)' },
            keywords: { type: 'array', items: { type: 'string' }, description: 'Array of 5-7 SEO keywords' },
            image_placeholders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  placeholder: { type: 'string', description: 'Placeholder format: {{IMAGE_1}}, {{IMAGE_2}}, etc.' },
                  description: { type: 'string', description: 'Detailed description of the image to generate' }
                },
                required: ['placeholder', 'description']
              },
              description: 'List of 2-3 image placeholders to insert in the content with their descriptions'
            }
          },
          required: ['title', 'slug', 'excerpt', 'content', 'meta_title', 'meta_description', 'keywords', 'image_placeholders'],
          additionalProperties: false
        }
      }
    };

    // 1️⃣ Essayer Lovable AI (Gemini)
    if (LOVABLE_API_KEY) {
      try {
        console.log('🔹 Trying Lovable AI (Gemini)...');
        console.log('   LOVABLE_API_KEY present:', LOVABLE_API_KEY ? 'Yes' : 'No');
        console.log('   LOVABLE_API_KEY length:', LOVABLE_API_KEY?.length || 0);
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            tools: [toolDefinition],
            tool_choice: { type: 'function', function: { name: 'create_blog_article' } }
          })
        });

        if (aiResponse.ok) {
          aiData = await aiResponse.json();
          console.log('   Response status: 200 OK');
          const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            articleData = JSON.parse(toolCall.function.arguments);
            usedProvider = 'Lovable AI (Gemini)';
            console.log('✅ Lovable AI succeeded');
          } else {
            console.log('⚠️ Lovable AI: No tool call in response');
          }
        } else {
          const errorText = await aiResponse.text();
          console.log(`⚠️ Lovable AI failed (${aiResponse.status}): ${errorText.substring(0, 200)}`);
          if (aiResponse.status === 402) {
            console.log('   → No credits available');
          } else if (aiResponse.status === 429) {
            console.log('   → Rate limited');
          }
        }
      } catch (error) {
        console.log('⚠️ Lovable AI exception:', error.message);
      }
    } else {
      console.log('⚠️ LOVABLE_API_KEY not set, skipping Lovable AI...');
    }

    // 2️⃣ Fallback Gemini Pro (direct API)
    if (!articleData && GEMINI_API_KEY) {
      try {
        console.log('🔹 Trying Gemini Pro (direct)...');
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nRéponds UNIQUEMENT avec un JSON valide au format: {"title":"...", "slug":"...", "excerpt":"...", "content":"...", "meta_title":"...", "meta_description":"...", "keywords":["..."], "image_placeholders":[{"placeholder":"{{IMAGE_1}}", "description":"..."}]}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 8000 }
          })
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            // Parse le JSON de la réponse
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
            if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
            if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
            articleData = JSON.parse(cleanContent.trim());
            usedProvider = 'Gemini Pro (Direct)';
            console.log('✅ Gemini Pro succeeded');
          }
        } else {
          console.log(`⚠️ Gemini Pro failed (${geminiResponse.status})`);
        }
      } catch (error) {
        console.log('⚠️ Gemini Pro exception:', error.message);
      }
    }

    // 3️⃣ Fallback OpenAI
    if (!articleData && OPENAI_API_KEY) {
      try {
        console.log('🔹 Trying OpenAI (GPT-4o-mini)...');
        console.log('   OPENAI_API_KEY present:', OPENAI_API_KEY ? 'Yes' : 'No');
        console.log('   OPENAI_API_KEY length:', OPENAI_API_KEY?.length || 0);
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            tools: [toolDefinition],
            tool_choice: { type: 'function', function: { name: 'create_blog_article' } }
          })
        });

        if (aiResponse.ok) {
          aiData = await aiResponse.json();
          console.log('   Response status: 200 OK');
          const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            articleData = JSON.parse(toolCall.function.arguments);
            usedProvider = 'OpenAI (GPT-4o-mini)';
            console.log('✅ OpenAI succeeded');
          } else {
            console.log('⚠️ OpenAI: No tool call in response');
          }
        } else {
          const errorText = await aiResponse.text();
          console.log(`⚠️ OpenAI failed (${aiResponse.status}): ${errorText.substring(0, 200)}`);
        }
      } catch (error) {
        console.log('⚠️ OpenAI exception:', error.message);
      }
    } else if (!articleData && !OPENAI_API_KEY) {
      console.log('⚠️ OPENAI_API_KEY not set, skipping OpenAI...');
    }

    // 4️⃣ Fallback Mistral
    if (!articleData && MISTRAL_API_KEY) {
      try {
        console.log('🔹 Trying Mistral (Large)...');
        console.log('   CLE_API_MISTRAL present:', MISTRAL_API_KEY ? 'Yes' : 'No');
        console.log('   CLE_API_MISTRAL length:', MISTRAL_API_KEY?.length || 0);
        const aiResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            tools: [toolDefinition],
            tool_choice: 'any'
          })
        });

        if (aiResponse.ok) {
          aiData = await aiResponse.json();
          console.log('   Response status: 200 OK');
          const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            articleData = JSON.parse(toolCall.function.arguments);
            usedProvider = 'Mistral (Large)';
            console.log('✅ Mistral succeeded');
          } else {
            console.log('⚠️ Mistral: No tool call in response');
          }
        } else {
          const errorText = await aiResponse.text();
          console.log(`⚠️ Mistral failed (${aiResponse.status}): ${errorText.substring(0, 200)}`);
        }
      } catch (error) {
        console.log('⚠️ Mistral exception:', error.message);
      }
    } else if (!articleData && !MISTRAL_API_KEY) {
      console.log('⚠️ CLE_API_MISTRAL not set, skipping Mistral...');
    }

    if (!articleData) {
      throw new Error('Aucune API IA disponible. Vérifiez vos clés API et crédits.');
    }

    console.log(`✅ Article généré avec: ${usedProvider}`);

    // 🖼️ GÉNÉRATION DES IMAGES INLINE
    if (articleData.image_placeholders && Array.isArray(articleData.image_placeholders) && articleData.image_placeholders.length > 0) {
      console.log(`🖼️ Generating ${articleData.image_placeholders.length} inline images...`);
      
      let updatedContent = articleData.content;
      
      for (const placeholder of articleData.image_placeholders) {
        let inlineImageUrl: string | null = null;
        
        // Retry jusqu'à 2 fois pour chaque image inline
        for (let attempt = 1; attempt <= 2 && !inlineImageUrl; attempt++) {
          try {
            console.log(`  → Generating ${placeholder.placeholder} (attempt ${attempt}/2)`);
            
            const imageResponse = await fetch(`${SUPABASE_URL}/functions/v1/blog-image-generator`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SERVICE_ROLE}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                prompt: placeholder.description,
                style: 'modern'
              })
            });
            
            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              inlineImageUrl = imageData?.image_url || imageData?.imageUrl;
              
              if (inlineImageUrl) {
                console.log(`  ✅ ${placeholder.placeholder} generated`);
              } else {
                console.error(`  ⚠️ No URL in response for ${placeholder.placeholder} (attempt ${attempt})`);
              }
            } else {
              const errorText = await imageResponse.text();
              console.error(`  ⚠️ Failed for ${placeholder.placeholder} (attempt ${attempt}):`, imageResponse.status, errorText);
            }
          } catch (imgError) {
            console.error(`  ⚠️ Error for ${placeholder.placeholder} (attempt ${attempt}):`, imgError);
          }
          
          // Pause entre les tentatives
          if (!inlineImageUrl && attempt < 2) {
            await new Promise(r => setTimeout(r, 1500));
          }
        }
        
        // Si image générée ou utiliser placeholder
        if (inlineImageUrl) {
          updatedContent = updatedContent.replace(
            placeholder.placeholder, 
            `![${placeholder.description}](${inlineImageUrl})`
          );
        } else {
          // Utiliser une image placeholder si échec
          const fallbackImage = 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=800&fit=crop&q=80';
          updatedContent = updatedContent.replace(
            placeholder.placeholder, 
            `![${placeholder.description}](${fallbackImage})`
          );
          console.log(`  ⚠️ Using fallback for ${placeholder.placeholder}`);
        }
      }
      
      articleData.content = updatedContent;
      console.log('✅ All inline images processed');
    }

    // Enregistrer l'analytics
    await supabase.from('ai_analytics').insert({
      function_name: 'blog-ai-generator',
      model_used: usedProvider,
      prompt_tokens: aiData?.usage?.prompt_tokens || 0,
      completion_tokens: aiData?.usage?.completion_tokens || 0,
      total_cost: 0,
      response_time_ms: 0,
      success: true
    });

    // Créer l'article dans la base de données
    const status = auto_publish ? 'published' : (scheduled_at ? 'scheduled' : 'draft');
    
    // Vérifier et générer un slug unique si nécessaire
    let uniqueSlug = articleData.slug;
    let slugCounter = 1;
    
    while (true) {
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', uniqueSlug)
        .maybeSingle();
      
      if (!existingPost) break;
      
      // Slug existe déjà, ajouter un suffixe numérique
      slugCounter++;
      uniqueSlug = `${articleData.slug}-${slugCounter}`;
      console.log(`⚠️ Slug conflict detected, trying: ${uniqueSlug}`);
    }
    
    console.log(`✅ Using unique slug: ${uniqueSlug}`);
    
    const { data: newPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        title: articleData.title,
        slug: uniqueSlug,
        excerpt: articleData.excerpt,
        content: articleData.content,
        meta_title: articleData.meta_title,
        meta_description: articleData.meta_description,
        keywords: articleData.keywords,
        category_id: category_id || null,
        author_id: userId,
        visibility: target_audience || 'public',
        status,
        ai_generated: true,
        ai_model: usedProvider,
        generation_prompt: userPrompt,
        published_at: auto_publish ? new Date().toISOString() : null,
        scheduled_at: scheduled_at || null,
        view_count: 0,
        comment_count: 0,
        share_count: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // Générer automatiquement une image pour l'article avec retry
    console.log('🖼️ Generating featured image for article...');
    let featuredImageUrl: string | null = null;
    
    const imagePrompt = `Professional blog header for article: "${articleData.title}". Modern smartphone repair, technology, professional service. Clean design, realistic style.`;
    
    // Retry jusqu'à 2 fois si l'image échoue
    for (let attempt = 1; attempt <= 2 && !featuredImageUrl; attempt++) {
      try {
        console.log(`  → Attempt ${attempt}/2 for featured image`);
        
        const imageResponse = await fetch(`${SUPABASE_URL}/functions/v1/blog-image-generator`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SERVICE_ROLE}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt: imagePrompt,
            style: 'realistic',
            size: '1792x1024'
          })
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          featuredImageUrl = imageData?.image_url || imageData?.imageUrl;
          
          if (featuredImageUrl) {
            console.log(`  ✅ Featured image generated successfully`);
          } else {
            console.error(`  ⚠️ No image URL in response (attempt ${attempt})`);
          }
        } else {
          const errorText = await imageResponse.text();
          console.error(`  ⚠️ Image generation failed (attempt ${attempt}):`, imageResponse.status, errorText);
        }
      } catch (imgError) {
        console.error(`  ⚠️ Error generating featured image (attempt ${attempt}):`, imgError);
      }
      
      // Pause entre les tentatives
      if (!featuredImageUrl && attempt < 2) {
        console.log('  ⏳ Waiting 2s before retry...');
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    
    // Si échec après retries, utiliser une image placeholder
    if (!featuredImageUrl) {
      featuredImageUrl = 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1792&h=1024&fit=crop&q=80';
      console.log('  ⚠️ Using fallback placeholder image');
    }
    
    // Mettre à jour l'article avec l'image (générée ou placeholder)
    try {
      await supabase
        .from('blog_posts')
        .update({ featured_image_url: featuredImageUrl })
        .eq('id', newPost.id);
      
      newPost.featured_image_url = featuredImageUrl;
      console.log('✅ Featured image attached to article');
    } catch (updateError) {
      console.error('⚠️ Failed to update article with image:', updateError);
    }

    // Modération automatique de l'article généré
    console.log('🔍 Running automatic moderation...');
    let moderationResult = null;
    try {
      const moderationResponse = await fetch(`${SUPABASE_URL}/functions/v1/blog-ai-moderation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: newPost.id })
      });

      if (moderationResponse.ok) {
        const moderationData = await moderationResponse.json();
        moderationResult = moderationData.moderation;
        console.log(`✅ Moderation completed - Score: ${moderationResult?.score}/100, Status: ${moderationResult?.status}`);
        
        // Mettre à jour le statut si la modération a changé le statut
        if (moderationData.new_status !== newPost.status) {
          newPost.status = moderationData.new_status;
          console.log(`  → Article status updated to: ${moderationData.new_status}`);
        }
      } else {
        console.error('⚠️ Moderation failed:', await moderationResponse.text());
      }
    } catch (moderationError) {
      console.error('⚠️ Moderation error:', moderationError);
      // Continue même si la modération échoue
    }

    return new Response(
      JSON.stringify({
        success: true,
        post: newPost,
        ai_model: usedProvider,
        moderation: moderationResult,
        message: auto_publish 
          ? 'Article généré, modéré et publié avec succès' 
          : scheduled_at 
          ? 'Article généré, modéré et programmé avec succès'
          : moderationResult?.status === 'approved'
          ? 'Article généré et approuvé automatiquement'
          : 'Article généré et en attente de validation'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blog-ai-generator:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
