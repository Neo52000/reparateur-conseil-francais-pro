import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationResult {
  score: number;
  issues: string[];
  recommendations: string[];
  status: 'approved' | 'needs_review' | 'rejected';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { post_id } = await req.json();

    if (!post_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'post_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer l'article
    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', post_id)
      .single();

    if (fetchError || !post) {
      throw new Error('Article not found');
    }

    console.log('🔍 Starting moderation for post:', post.title);

    // Analyse du contenu
    const moderationResult = await analyzeContent(post);

    console.log('📊 Moderation result:', moderationResult);

    // Mettre à jour le statut de l'article selon le score
    let newStatus = post.status;
    if (moderationResult.status === 'approved' && moderationResult.score >= 80) {
      newStatus = 'published';
    } else if (moderationResult.status === 'needs_review' || moderationResult.score < 60) {
      newStatus = 'pending';
    }

    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', post_id);

    if (updateError) {
      console.error('Error updating post status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        moderation: moderationResult,
        new_status: newStatus,
        message: `Article modéré avec succès (score: ${moderationResult.score}/100)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in moderation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Moderation failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeContent(post: any): Promise<ModerationResult> {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 1. Vérification de la longueur du contenu
  const contentLength = post.content?.length || 0;
  if (contentLength < 500) {
    score -= 20;
    issues.push('Contenu trop court (< 500 caractères)');
    recommendations.push('Augmenter la longueur du contenu à au moins 800 caractères');
  } else if (contentLength < 800) {
    score -= 10;
    recommendations.push('Contenu un peu court, viser 1000+ caractères pour un meilleur engagement');
  }

  // 2. Vérification du titre
  const titleLength = post.title?.length || 0;
  if (titleLength < 20 || titleLength > 70) {
    score -= 10;
    issues.push('Titre non optimal (doit être entre 20 et 70 caractères)');
    recommendations.push('Ajuster la longueur du titre pour un meilleur SEO');
  }

  // 3. Vérification des méta-données SEO
  if (!post.meta_title || !post.meta_description) {
    score -= 15;
    issues.push('Méta-données SEO manquantes');
    recommendations.push('Ajouter un meta_title et meta_description pour le SEO');
  }

  // 4. Vérification des mots-clés
  if (!post.keywords || post.keywords.length < 3) {
    score -= 10;
    issues.push('Mots-clés insuffisants');
    recommendations.push('Ajouter au moins 5 mots-clés pertinents');
  }

  // 5. Vérification de l\'excerpt
  if (!post.excerpt || post.excerpt.length < 100) {
    score -= 5;
    issues.push('Extrait manquant ou trop court');
    recommendations.push('Ajouter un extrait d\'au moins 150 caractères');
  }

  // 6. Vérification de l\'image mise en avant
  if (!post.featured_image_url) {
    score -= 10;
    issues.push('Image mise en avant manquante');
    recommendations.push('Ajouter une image mise en avant pour améliorer l\'engagement');
  }

  // 7. Détection de contenu suspect (patterns basiques)
  const suspiciousPatterns = [
    /viagra|cialis|casino|lottery|winner/i,
    /click here|buy now|limited offer/i,
    /\$\$\$|!!!{3,}/,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(post.content) || pattern.test(post.title)) {
      score -= 30;
      issues.push('Contenu suspect détecté (spam/commercial)');
      recommendations.push('Revoir le contenu pour supprimer les éléments commerciaux agressifs');
      break;
    }
  }

  // 8. Vérification de la structure du contenu
  const hasHeadings = /#{1,3}\s/.test(post.content);
  if (!hasHeadings) {
    score -= 5;
    recommendations.push('Ajouter des sous-titres (##) pour structurer le contenu');
  }

  const hasParagraphs = post.content.split('\n\n').length >= 3;
  if (!hasParagraphs) {
    score -= 5;
    recommendations.push('Diviser le contenu en plusieurs paragraphes pour améliorer la lisibilité');
  }

  // Déterminer le statut final
  let status: 'approved' | 'needs_review' | 'rejected';
  if (score >= 80 && issues.length === 0) {
    status = 'approved';
  } else if (score >= 60) {
    status = 'needs_review';
  } else {
    status = 'rejected';
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
    status
  };
}
