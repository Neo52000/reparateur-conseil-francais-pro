import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'illustration' | 'minimalist' | 'corporate' | 'modern' | 'digital-art';
  size?: string;
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

    // Créer un client Supabase avec le token utilisateur
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Vérifier que l'utilisateur est authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Token invalide:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SÉCURITÉ: Vérification du rôle admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single();

    if (roleError || !roleData) {
      console.error('❌ Accès refusé: utilisateur non-admin', { userId: user.id });
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required', success: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Accès autorisé pour l'admin: ${user.email}`);

    const { prompt, style = 'modern' }: ImageGenerationRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Styles prédéfinis pour améliorer la qualité des images
    const stylePrompts = {
      realistic: 'photorealistic, high quality photography, professional lighting, 8K resolution',
      illustration: 'digital illustration, vibrant colors, modern design, vector style',
      minimalist: 'minimalist design, clean lines, simple composition, professional',
      corporate: 'corporate style, business professional, clean and modern, high quality',
      modern: 'modern design, trendy, contemporary style, professional photography'
    };

    const enhancedPrompt = `Create a professional blog header image: ${prompt}. 
Style: ${stylePrompts[style]}. 
The image should be suitable for a smartphone repair industry blog, 
horizontal format 16:9, high quality, attention-grabbing but professional.`;

    console.log('Generating image with prompt:', enhancedPrompt);

    // Utiliser Lovable AI (Gemini 2.5 Flash Image Preview) pour générer l'image
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { 
            role: 'user', 
            content: enhancedPrompt
          }
        ],
        max_tokens: 1024
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error('Image generation failed');
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    // Extraire l'image générée (base64 data URL)
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image URL in AI response');
    }

    return new Response(
      JSON.stringify({
        success: true,
        image_url: imageUrl,
        model: 'google/gemini-2.5-flash-image-preview',
        style
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blog-image-generator:', error);
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
