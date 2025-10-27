import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();

    // Récupérer tous les articles programmés dont l'heure est passée
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, scheduled_at')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (fetchError) {
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('No posts to publish');
      return new Response(
        JSON.stringify({ 
          success: true, 
          published_count: 0,
          message: 'No posts to publish'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${scheduledPosts.length} posts to publish`);

    // Publier tous les articles
    const { data: updatedPosts, error: updateError } = await supabase
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: now
      })
      .in('id', scheduledPosts.map(p => p.id))
      .select();

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully published ${updatedPosts?.length || 0} posts`);

    // TODO: Envoyer notifications/emails aux abonnés newsletter
    // TODO: Partager automatiquement sur réseaux sociaux si configuré

    return new Response(
      JSON.stringify({
        success: true,
        published_count: updatedPosts?.length || 0,
        published_posts: updatedPosts?.map(p => ({
          id: p.id,
          title: p.title,
          published_at: p.published_at
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blog-auto-publish:', error);
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
