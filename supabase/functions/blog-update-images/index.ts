import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function checkAdminRole(authHeader: string): Promise<boolean> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.error('Auth error:', error);
    return false;
  }

  const { data: roleData } = await supabase.rpc('has_role', {
    user_id: user.id,
    role_name: 'admin'
  });

  return roleData === true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = await checkAdminRole(authHeader);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required', success: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer tous les articles sans image à la une
    const { data: articles, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, content, slug')
      .is('featured_image_url', null)
      .eq('status', 'published')
      .limit(20); // Limiter pour éviter les timeouts

    if (fetchError) {
      console.error('Error fetching articles:', fetchError);
      throw new Error('Failed to fetch articles');
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No articles to update',
          updated_count: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${articles.length} articles without images`);

    let updatedCount = 0;
    const errors = [];

    // Traiter chaque article
    for (const article of articles) {
      try {
        console.log(`Processing article: ${article.title}`);

        // Générer l'image à la une via blog-image-generator
        const imagePrompt = `Create a professional blog header image for an article titled: "${article.title}". 
The image should be suitable for a smartphone repair industry blog, 
horizontal format 16:9, modern design, professional, attention-grabbing.`;

        const imageResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/blog-image-generator`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: imagePrompt,
              style: 'modern'
            })
          }
        );

        if (!imageResponse.ok) {
          console.error(`Failed to generate image for article ${article.id}`);
          errors.push({ article_id: article.id, error: 'Image generation failed' });
          continue;
        }

        const imageData = await imageResponse.json();
        const imageUrl = imageData.image_url;

        if (!imageUrl) {
          console.error(`No image URL returned for article ${article.id}`);
          errors.push({ article_id: article.id, error: 'No image URL' });
          continue;
        }

        // Mettre à jour l'article avec l'image
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ 
            featured_image_url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`Failed to update article ${article.id}:`, updateError);
          errors.push({ article_id: article.id, error: updateError.message });
          continue;
        }

        updatedCount++;
        console.log(`✅ Updated article ${article.id} with featured image`);

        // Délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
        errors.push({ 
          article_id: article.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated_count: updatedCount,
        total_articles: articles.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully updated ${updatedCount}/${articles.length} articles`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blog-update-images:', error);
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
